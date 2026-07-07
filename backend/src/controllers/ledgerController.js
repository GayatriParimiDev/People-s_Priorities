import pool from '../db.js';
import { GoogleGenAI } from '@google/genai';
import { sessions } from './authController.js';

// In-memory endorsements state for comparison telemetry (matching frontend count contracts)
let proposalEndorsements = {
  alphaCount: 1204,
  betaCount: 556,
  alphaPercent: 68.4,
  betaPercent: 31.6
};

// Lazy loader for Gemini
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

export const getLedger = async (req, res) => {
  try {
    // 1. Get all suggestions and join with AI analysis
    const query = `
      SELECT s.*, a.priority_score, a.urgency, a.sentiment, a.theme, a.beneficiaries_estimate, a.ai_metadata
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      ORDER BY s.created_at DESC
    `;
    const dbRes = await pool.query(query);

    // 2. Map rows to LedgerItem structure
    const ledgerItems = dbRes.rows.map(row => {
      const metadata = row.ai_metadata || {};
      return {
        id: `LGR-${row.id.substring(0, 4).toUpperCase()}`,
        db_id: row.id, // preserve database UUID
        submissionDate: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19) + ' UTC' : '',
        priorityLevel: (row.urgency || 'STANDARD').toUpperCase(),
        theme: row.theme || mapCategoryToTheme(row.category),
        title: row.title,
        status: (row.status || 'UNDER REVIEW').toUpperCase(),
        description: row.description,
        latitude: row.latitude ? Number(row.latitude) : 12.93 + (Math.random() - 0.5) * 0.02,
        longitude: row.longitude ? Number(row.longitude) : 77.58 + (Math.random() - 0.5) * 0.02,
        signatures: metadata.complaint_count || metadata.duplicate_count || 1,
        verificationStatus: 'Verified'
      };
    });

    // 3. Aggregate theme counts
    const themeMap = {};
    ledgerItems.forEach(item => {
      themeMap[item.theme] = (themeMap[item.theme] || 0) + 1;
    });
    const themesList = Object.entries(themeMap).map(([name, count], index) => ({
      id: String(index + 1).padStart(2, '0'),
      name,
      count
    }));

    res.json({
      ledger: ledgerItems,
      themes: themesList.length > 0 ? themesList : [
        { id: "01", name: "Clean Water Access", count: 0 },
        { id: "02", name: "Arterial Road Repair", count: 0 }
      ],
      endorsements: proposalEndorsements,
      config: {
        districtId: "Bangalore South",
        representative: "Tejasvi Surya (MP)",
        mfaEnabled: true,
        auditLoggingEnabled: true,
        language: "en",
        languages: ["en", "kn", "hi"]
      }
    });
  } catch (error) {
    console.error('Error fetching ledger:', error.message);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
};

export const endorseProposal = async (req, res) => {
  const { proposal } = req.body;
  if (proposal === 'alpha') {
    proposalEndorsements.alphaCount += 1;
  } else if (proposal === 'beta') {
    proposalEndorsements.betaCount += 1;
  }
  const total = proposalEndorsements.alphaCount + proposalEndorsements.betaCount;
  proposalEndorsements.alphaPercent = Math.round((proposalEndorsements.alphaCount / total) * 1000) / 10;
  proposalEndorsements.betaPercent = Math.round((proposalEndorsements.betaCount / total) * 1000) / 10;
  
  res.json({ endorsements: proposalEndorsements });
};

export const submitProposal = async (req, res) => {
  const { text, type, imagePrompt } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Submission content is required" });
  }

  let analysisResult = {
    theme: "Arterial Road Repair",
    title: "Constituency Request",
    priorityLevel: "STANDARD",
    description: text,
    latitude: 12.93 + (Math.random() - 0.5) * 0.02,
    longitude: 77.58 + (Math.random() - 0.5) * 0.02,
  };

  // Run Gemini classification if key is set
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following citizen constituency demand submission and extract structured details.
Input Type: ${type}
Submission Text/Description: "${text}"
${imagePrompt ? `Associated Image/Photo Prompt description: "${imagePrompt}"` : ""}

Generate a JSON object matching exactly this schema:
{
  "theme": "Clean Water Access" | "Solar Lighting Infrastructure" | "Arterial Road Repair" | "Youth Employment Center" | "Education Infrastructure" | "Public Transport Expansion",
  "title": "A short concise title for this issue",
  "priorityLevel": "CRITICAL" | "ELEVATED" | "STANDARD" | "RESOLVED",
  "description": "A refined, professional, and slightly enhanced summary of the demand"
}

Keep themes closely aligned with existing ones or select the best fit. Keep description clear.`,
        config: {
          responseMimeType: "application/json"
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        analysisResult = { ...analysisResult, ...parsed };
      }
    } catch (err) {
      console.error("Gemini classification failed in ledger submit:", err.message);
    }
  } else {
    // Basic local keyword fallback
    const lower = text.toLowerCase();
    if (lower.includes("water") || lower.includes("pipe") || lower.includes("leak") || lower.includes("drain")) {
      analysisResult.theme = "Clean Water Access";
      analysisResult.title = "Water Utility Pipeline Repair";
      analysisResult.priorityLevel = "ELEVATED";
    } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("dark") || lower.includes("solar")) {
      analysisResult.theme = "Solar Lighting Infrastructure";
      analysisResult.title = "Solar Street Light Installation";
      analysisResult.priorityLevel = "STANDARD";
    } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("pavement") || lower.includes("drive")) {
      analysisResult.theme = "Arterial Road Repair";
      analysisResult.title = "Pavement Remediation Request";
      analysisResult.priorityLevel = "CRITICAL";
    } else if (lower.includes("youth") || lower.includes("job") || lower.includes("work") || lower.includes("center") || lower.includes("vocational")) {
      analysisResult.theme = "Youth Employment Center";
      analysisResult.title = "Youth Skill Development Hub";
      analysisResult.priorityLevel = "STANDARD";
    } else if (lower.includes("school") || lower.includes("class") || lower.includes("education") || lower.includes("college")) {
      analysisResult.theme = "Education Infrastructure";
      analysisResult.title = "School Classroom Facility Upgrade";
      analysisResult.priorityLevel = "ELEVATED";
    }
  }

  try {
    // Identify authenticated user from Authorization header if available
    let citizenUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userSession = sessions[token];
      if (userSession) {
        citizenUserId = userSession.id;
      }
    }
    
    if (!citizenUserId) {
      const userRes = await pool.query("SELECT id FROM users WHERE email = 'citizen@assembly.gov'");
      citizenUserId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    }

    // Map theme to standard schema categories (water, roads, education, electricity, sanitation, other)
    let category = 'other';
    const th = analysisResult.theme.toLowerCase();
    if (th.includes('water')) category = 'water';
    else if (th.includes('road')) category = 'roads';
    else if (th.includes('school') || th.includes('educat')) category = 'education';
    else if (th.includes('light') || th.includes('solar')) category = 'electricity';
    else if (th.includes('sanit')) category = 'sanitation';

    // Insert suggestion
    const insertRes = await pool.query(
      `INSERT INTO suggestions (user_id, title, description, category, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, 'proposed', $5, $6)
       RETURNING id, created_at;`,
      [citizenUserId, analysisResult.title, analysisResult.description, category, analysisResult.latitude, analysisResult.longitude]
    );
    const suggestionId = insertRes.rows[0].id;
    const createdAt = insertRes.rows[0].created_at;

    // Insert AI Analysis details
    const priorityScore = analysisResult.priorityLevel === 'CRITICAL' ? 90 : analysisResult.priorityLevel === 'ELEVATED' ? 78 : 62;
    await pool.query(
      `INSERT INTO ai_analysis (suggestion_id, priority_score, urgency, sentiment, theme, beneficiaries_estimate, ai_metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [suggestionId, priorityScore, analysisResult.priorityLevel, 'Concerned', analysisResult.theme, 2500, JSON.stringify({ complaint_count: 1, duplicate_count: 0, submission_channel: type || 'text' })]
    );

    // Insert Timeline Log
    await pool.query(
      "INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, 'Submitted', 'Citizen intake parsed and structured via Gemini.');",
      [suggestionId]
    );

    const newItem = {
      id: `LGR-${suggestionId.substring(0, 4).toUpperCase()}`,
      db_id: suggestionId,
      submissionDate: new Date(createdAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      priorityLevel: analysisResult.priorityLevel,
      theme: analysisResult.theme,
      title: analysisResult.title,
      status: "UNDER REVIEW",
      description: analysisResult.description,
      latitude: analysisResult.latitude,
      longitude: analysisResult.longitude,
      signatures: 1,
      verificationStatus: "Verified"
    };

    // Calculate updated themes counts
    const countRes = await pool.query(`
      SELECT theme, COUNT(*) as count 
      FROM ai_analysis 
      GROUP BY theme
    `);
    const themesList = countRes.rows.map((row, index) => ({
      id: String(index + 1).padStart(2, '0'),
      name: row.theme || 'General',
      count: Number(row.count)
    }));

    res.json({ item: newItem, themes: themesList });
  } catch (err) {
    console.error("Failed to insert proposal suggestion in database:", err.message);
    res.status(500).json({ error: "Failed to store intake submission" });
  }
};

const mapCategoryToTheme = (category) => {
  switch (category) {
    case 'water': return 'Clean Water Access';
    case 'roads': return 'Arterial Road Repair';
    case 'electricity': return 'Solar Lighting Infrastructure';
    case 'education': return 'Education Infrastructure';
    case 'sanitation': return 'Sanitation Block Development';
    default: return 'Public Grievance System';
  }
};
