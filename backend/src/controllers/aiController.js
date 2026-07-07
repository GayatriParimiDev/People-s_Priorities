import pool from '../db.js';
import { GoogleGenAI } from '@google/genai';
import { runAllAgents } from '../worker.js';
import { GEMINI_MODEL } from '../config.js';

let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// POST /api/ai/categorize (original endpoint)
export const categorizeSuggestions = async (req, res) => {
  try {
    const suggestions = await pool.query('SELECT id, title, description FROM suggestions WHERE category IS NULL');
    
    for (const suggestion of suggestions.rows) {
      let category = 'General';
      const text = (suggestion.title + ' ' + suggestion.description).toLowerCase();
      
      if (text.includes('road') || text.includes('pothole')) category = 'Road Repair';
      else if (text.includes('school') || text.includes('education')) category = 'School Upgrade';
      else if (text.includes('water') || text.includes('pipe')) category = 'Water Supply';
      
      await pool.query('UPDATE suggestions SET category = $1 WHERE id = $2', [category, suggestion.id]);
    }
    
    res.json({ message: 'Categorization complete' });
  } catch (error) {
    console.error('Error categorizing suggestions:', error.message);
    res.status(500).json({ error: 'Failed to categorize suggestions' });
  }
};

// GET /api/ai/trigger - manually trigger background worker tasks
export const triggerWorker = async (req, res) => {
  try {
    await runAllAgents();
    res.json({ success: true, message: 'All autonomous AI agents executed successfully.' });
  } catch (error) {
    console.error('Error running worker agents:', error.message);
    res.status(500).json({ error: 'Failed to trigger worker agents', details: error.message });
  }
};

// GET /api/ai/recommendations/:proposal_id - retrieve triage suggestion
export const getRecommendation = async (req, res) => {
  const { proposal_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM agent_recommendations WHERE proposal_id = $1 ORDER BY created_at DESC LIMIT 1',
      [proposal_id]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching recommendation:', error.message);
    res.status(500).json({ error: 'Failed to retrieve recommendation' });
  }
};

// GET /api/ai/schemes/:proposal_id - retrieve matching government scheme
export const getSchemes = async (req, res) => {
  const { proposal_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM scheme_matches WHERE proposal_id = $1 ORDER BY created_at DESC LIMIT 1',
      [proposal_id]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching scheme matches:', error.message);
    res.status(500).json({ error: 'Failed to retrieve scheme matches' });
  }
};

// GET /api/ai/anomalies - retrieve flagged anomalies
export const getAnomalies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, s.title, s.description, s.status 
       FROM anomaly_flags f
       JOIN suggestions s ON f.proposal_id = s.id
       WHERE f.is_dismissed = FALSE
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching anomalies:', error.message);
    res.status(500).json({ error: 'Failed to retrieve anomalies' });
  }
};

// GET /api/ai/budget-optimization/:constituency_id - retrieve budget allocation optimization
export const getBudgetOptimization = async (req, res) => {
  const { constituency_id } = req.params;
  try {
    // If constituency_id is not a valid UUID (e.g. '74-B'), fetch constituency by name/district
    let cId = constituency_id;
    if (constituency_id.length !== 36) {
      const cRes = await pool.query('SELECT id FROM constituencies WHERE name = $1 OR district = $1 OR id::text = $1 LIMIT 1', [constituency_id]);
      if (cRes.rows.length > 0) {
        cId = cRes.rows[0].id;
      } else {
        // Fallback: use first constituency in db
        const cFallback = await pool.query('SELECT id FROM constituencies LIMIT 1');
        if (cFallback.rows.length > 0) cId = cFallback.rows[0].id;
      }
    }

    const result = await pool.query(
      'SELECT * FROM budget_optimizations WHERE constituency_id = $1 ORDER BY created_at DESC LIMIT 1',
      [cId]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching budget optimization:', error.message);
    res.status(500).json({ error: 'Failed to retrieve budget optimization' });
  }
};

// GET /api/ai/meetings/:constituency_id/briefs - retrieve meeting briefing
export const getMeetingBriefs = async (req, res) => {
  const { constituency_id } = req.params;
  try {
    let cId = constituency_id;
    if (constituency_id.length !== 36) {
      const cRes = await pool.query('SELECT id FROM constituencies WHERE name = $1 OR district = $1 OR id::text = $1 LIMIT 1', [constituency_id]);
      if (cRes.rows.length > 0) {
        cId = cRes.rows[0].id;
      } else {
        const cFallback = await pool.query('SELECT id FROM constituencies LIMIT 1');
        if (cFallback.rows.length > 0) cId = cFallback.rows[0].id;
      }
    }

    const result = await pool.query(
      'SELECT * FROM meeting_briefs WHERE constituency_id = $1 ORDER BY created_at DESC LIMIT 1',
      [cId]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching meeting briefs:', error.message);
    res.status(500).json({ error: 'Failed to retrieve meeting briefs' });
  }
};

// GET /api/ai/reports/:constituency_id/quarterly - retrieve quarterly performance audit
export const getQuarterlyReport = async (req, res) => {
  const { constituency_id } = req.params;
  try {
    let cId = constituency_id;
    if (constituency_id.length !== 36) {
      const cRes = await pool.query('SELECT id FROM constituencies WHERE name = $1 OR district = $1 OR id::text = $1 LIMIT 1', [constituency_id]);
      if (cRes.rows.length > 0) {
        cId = cRes.rows[0].id;
      } else {
        const cFallback = await pool.query('SELECT id FROM constituencies LIMIT 1');
        if (cFallback.rows.length > 0) cId = cFallback.rows[0].id;
      }
    }

    const result = await pool.query(
      "SELECT * FROM quarterly_reports WHERE constituency_id = $1 AND quarter_name = '2026-Q2' ORDER BY created_at DESC LIMIT 1",
      [cId]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching quarterly report:', error.message);
    res.status(500).json({ error: 'Failed to retrieve quarterly report' });
  }
};

// POST /api/ai/status-chat - Natural Language Status Agent
export const statusChat = async (req, res) => {
  const { query, proposal_id } = req.body;
  if (!proposal_id) {
    return res.status(400).json({ error: 'proposal_id is required' });
  }

  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(500).json({ error: 'Gemini client not configured' });
    }

    // Query suggestion details
    const sugRes = await pool.query(
      `SELECT s.*, a.priority_score, a.urgency
       FROM suggestions s
       LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
       WHERE s.id = $1`,
      [proposal_id]
    );
    if (sugRes.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const proposal = sugRes.rows[0];

    // Query status timeline / audit logs
    const timelineRes = await pool.query(
      `SELECT status, notes, created_at FROM suggestion_timeline
       WHERE suggestion_id = $1
       ORDER BY created_at ASC`,
      [proposal_id]
    );
    const logs = timelineRes.rows;

    const timelineStr = logs.map(l => 
      `Status: ${l.status}\nDate: ${l.created_at}\nNotes: ${l.notes || 'None'}`
    ).join('\n---\n');

    const prompt = `
You are the Natural-Language Status Agent for the People's Priorities Platform.
A citizen is asking about the status of their reported issue: "${query}"

PROPOSAL INFORMATION:
Title: ${proposal.title}
Description: ${proposal.description}
Current Status: ${proposal.status}
Category: ${proposal.category}
Demand Score: ${proposal.priority_score || 50}

AUDIT LOG / TIMELINE HISTORY:
${timelineStr || 'Submitted on ' + proposal.created_at}

Provide a friendly, plain-language response addressing their query.
Highlight:
- Exactly what has happened so far based on the timeline.
- How long it has been pending at the current status.
- Next steps (e.g. "It has been pending review by the MP for 20 days, which exceeds our 7-day target. You can click 'Escalate Publicly' to draw more attention to this.").

Keep the tone encouraging, transparent, and direct. Keep the length under 4 sentences.
`;

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    res.json({ response: response.text || "I apologize, I'm currently unable to retrieve the status details." });
  } catch (error) {
    console.error('Error in status chat:', error.message);
    res.status(500).json({ error: 'Failed to process status query' });
  }
};

// POST /api/ai/conversational-submission - Conversational Submission Agent
export const conversationalSubmission = async (req, res) => {
  const { chat_history, user_message } = req.body;
  if (!chat_history) {
    return res.status(400).json({ error: 'chat_history is required' });
  }

  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(500).json({ error: 'Gemini client not configured' });
    }

    const prompt = `
You are the Conversational Submission Agent for the People's Priorities platform.
Instead of a rigid static form, you guide the citizen in a short, friendly conversation to gather details about the local issue they want to report.

YOUR GOALS:
1. Gather details about the issue:
   - What is the issue? (Description)
   - Where is it located? (Ward/Location)
   - What category is it? (Roads/Potholes, Water Supply, Electricity/Lighting, School Upgrades, Sanitation, or General)
   - Clarifying details (e.g., "Is this happening only after rain, or all the time?") to estimate severity.
2. Maintain a warm, encouraging, conversational tone.
3. Keep it brief. Ask only one question at a time.
4. Once you have enough information to form a Title, Description, and Category, mark the session as complete.

CHAT HISTORY SO FAR:
${chat_history.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}
CITIZEN: ${user_message}

Analyze the history. If you now have enough information to submit, output a JSON object:
{
  "is_complete": true,
  "response_text": "Thank you! I have compiled all the details. I am now checking for duplicate reports...",
  "extracted_data": {
    "title": "A short 5-8 word summary of the issue",
    "description": "The detailed description compiled from their responses, including severity and timing.",
    "category": "roads" | "water" | "electricity" | "education" | "sanitation" | "general"
  }
}

If you need more details (e.g. you don't know the exact issue, location, or severity parameters), output:
{
  "is_complete": false,
  "response_text": "Your next follow-up question or clarification request."
}

Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    const text = response.text?.trim() || '{}';
    try {
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanedText);
      res.json(result);
    } catch (err) {
      console.error('Error parsing Conversational Submission AI response:', err.message, text);
      res.json({
        is_complete: false,
        response_text: "Could you tell me a little more about this issue, such as where it is located?"
      });
    }
  } catch (error) {
    console.error('Error in conversational submission:', error.message);
    res.status(500).json({ error: 'Failed to process conversation step' });
  }
};

// POST /api/ai/duplicate-check - Proactive Duplicate-Check Agent
export const duplicateCheck = async (req, res) => {
  const { title, description, category, latitude, longitude } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(500).json({ error: 'Gemini client not configured' });
    }

    // Query nearby existing reports (suggestions within close proximity, e.g. same ward or small lat/lng difference)
    const latNum = parseFloat(latitude) || 12.97;
    const lngNum = parseFloat(longitude) || 77.59;
    const query = `
      SELECT id, title, description, category, created_at, status
      FROM suggestions
      WHERE ABS(latitude - $1) < 0.03 AND ABS(longitude - $2) < 0.03
        AND status IN ('Submitted', 'proposed', 'under_review', 'approved')
      LIMIT 5
    `;
    const result = await pool.query(query, [latNum, lngNum]);

    if (result.rows.length === 0) {
      return res.json({ has_duplicates: false, duplicates: [] });
    }

    const candidateDuplicates = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      created_at: r.created_at,
      status: r.status
    }));

    const prompt = `
You are the Proactive Duplicate-Check Agent.
A citizen is about to submit a new report. Before it is finalized, you must compare it with nearby existing reports to see if it is a duplicate.

NEW SUBMISSION DRAFT:
Title: ${title || ''}
Description: ${description}
Category: ${category || 'general'}

EXISTING NEARBY REPORTS:
${JSON.stringify(candidateDuplicates, null, 2)}

Analyze the details. Is the new submission reporting the exact same issue as one of the existing ones (e.g. water pipe leak at same street, same pothole cluster)?
Provide your response in JSON format:
{
  "has_duplicates": true, // or false
  "reason": "Short message to display to the user explaining why they might be the same (e.g., 'We found a similar water pipeline leakage reported 2 days ago in Soho Ward. Is this the same issue?')",
  "duplicate_suggestion_id": "UUID-of-the-matching-report-if-any"
}

If no matches are close enough to be duplicates, set "has_duplicates" to false.
Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    const text = response.text?.trim() || '{}';
    try {
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanedText);
      res.json(data);
    } catch (err) {
      console.error('Error parsing duplicate check response:', err.message, text);
      res.json({ has_duplicates: false, duplicates: [] });
    }
  } catch (error) {
    console.error('Error in duplicate check:', error.message);
    res.status(500).json({ error: 'Failed to run duplicate check' });
  }
};
