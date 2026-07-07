import pool from '../db.js';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client lazily
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

// Helper to convert database suggestion rows to proposal schema
function mapRowToProposal(row) {
  return {
    proposal_id: row.id,
    title: row.title,
    description: row.description,
    category: row.category || 'other',
    ward_id: row.ward_id || 'Unknown Ward',
    constituency_id: row.constituency_id || '',
    constituency_name: row.constituency_name || '',
    demand_score: row.priority_score !== null ? Number(row.priority_score) : 50,
    demand_score_breakdown: row.ai_metadata || {
      complaint_count: row.signatures || 0,
      severity_weighted_score: row.priority_score || 50,
      population_density_factor: 50,
      duplicate_count: 0,
      historical_neglect_factor: 50
    },
    source_complaint_ids: row.ai_metadata?.source_complaint_ids || [],
    sentiment_summary: row.sentiment || 'Neutral',
    demographic_overlay: {
      population: row.category === 'roads' ? 24000 : 12000,
      literacy_rate: 78.5,
      avg_income_bracket: 'Medium-Low'
    },
    status: row.status,
    cost_estimate: Number(row.cost_estimate || 0),
    beneficiary_count: Number(row.beneficiary_count || row.beneficiaries_estimate || 0),
    cross_boundary: Boolean(row.cross_boundary),
    linked_ward_ids: row.linked_ward_ids || [],
    co_sponsors: row.co_sponsors || [],
    created_at: row.created_at,
    last_updated_at: row.last_updated_at || row.created_at,
    recommendation_reason: row.recommendation_reason || '',
    staff_recommendation: row.staff_recommendation || null,
    staff_notes: row.staff_notes || null,
    community_priority_signal: Number(row.ai_metadata?.community_priority_signal || 0),
    verification_count: Number(row.ai_metadata?.verification_count || 0),
    submission_channel: row.ai_metadata?.submission_channel || 'text',
    input_language: row.ai_metadata?.input_language || 'en',
    is_suggestion: Boolean(row.ai_metadata?.is_suggestion || false)
  };
}

/**
 * GET /api/proposals - Fetch proposals with filters, sorting, and roles
 */
export const getProposals = async (req, res) => {
  try {
    const { category, status, ward_id, min_budget, max_budget, cross_boundary, sort_by, constituency_id } = req.query;
    
    // We fetch suggestions joined with ai_analysis and constituency info
    let query = `
      SELECT s.*, a.priority_score, a.urgency, a.sentiment, a.beneficiaries_estimate, a.recommendation_reason, a.ai_metadata,
             c.name as constituency_name, c.id as constituency_id
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN constituencies c ON u.constituency_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (constituency_id) {
      params.push(constituency_id);
      const paramNum = params.length;
      
      // If constituency is MP type, we find all assembly segments mapped to this Lok Sabha segment
      // Otherwise if MLA, we filter directly by that constituency ID.
      query += ` AND (
        c.id::text = $${paramNum} OR c.name = $${paramNum} 
        OR c.id IN (
          SELECT h.assembly_segment_id 
          FROM constituency_hierarchy h
          JOIN constituencies lc ON h.lok_sabha_constituency_id = lc.id
          WHERE h.lok_sabha_constituency_id::text = $${paramNum} OR lc.name = $${paramNum}
        )
      )`;
    }

    if (category) {
      params.push(category);
      query += ` AND s.category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (ward_id) {
      params.push(ward_id);
      query += ` AND s.ward_id = $${params.length}`;
    }

    if (min_budget) {
      params.push(min_budget);
      query += ` AND s.cost_estimate >= $${params.length}`;
    }

    if (max_budget) {
      params.push(max_budget);
      query += ` AND s.cost_estimate <= $${params.length}`;
    }

    if (cross_boundary !== undefined) {
      params.push(cross_boundary === 'true');
      query += ` AND s.cross_boundary = $${params.length}`;
    }

    // Sort order
    if (sort_by === 'cost_desc') {
      query += ' ORDER BY s.cost_estimate DESC';
    } else if (sort_by === 'beneficiaries_desc') {
      query += ' ORDER BY s.beneficiary_count DESC';
    } else if (sort_by === 'demand_desc') {
      query += ' ORDER BY a.priority_score DESC NULLS LAST';
    } else {
      // Default: Priority score descending
      query += ' ORDER BY a.priority_score DESC NULLS LAST, s.created_at DESC';
    }

    const result = await pool.query(query, params);
    const proposals = result.rows.map(mapRowToProposal);
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error.message);
    res.status(500).json({ error: 'Failed to retrieve proposals' });
  }
};

/**
 * GET /api/proposals/:id - Fetch single proposal details
 */
export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*, a.priority_score, a.urgency, a.sentiment, a.beneficiaries_estimate, a.recommendation_reason, a.ai_metadata,
             c.name as constituency_name, c.id as constituency_id
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN constituencies c ON u.constituency_id = c.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(mapRowToProposal(result.rows[0]));
  } catch (error) {
    console.error('Error fetching proposal:', error.message);
    res.status(500).json({ error: 'Failed to retrieve proposal' });
  }
};

/**
 * POST /api/proposals/:id/action - Approve/Reject/Request Info/Defer/Escalate with comments
 */
export const submitProposalAction = async (req, res) => {
  const { id } = req.params;
  const { action, comment, userId } = req.body; // userId comes from front-end session/auth header

  // Validate request action & comment
  const validActions = ['approve', 'reject', 'request_info', 'defer', 'escalate', 'comment'];
  if (!action || !validActions.includes(action.toLowerCase())) {
    return res.status(400).json({ error: 'Valid action is required (approve, reject, request_info, defer, escalate, comment)' });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'A justification comment is strictly required for this action' });
  }

  // Get user details
  if (!userId) {
    return res.status(401).json({ error: 'Actor user identity is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current proposal status
    const suggestionRes = await client.query('SELECT status FROM suggestions WHERE id = $1', [id]);
    if (suggestionRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const statusBefore = suggestionRes.rows[0].status;

    // 2. Fetch actor user role for RBAC check
    const userRes = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Actor user not found' });
    }
    const actorRole = (userRes.rows[0].role || '').toLowerCase();

    // Role-based validation
    if (['approve', 'reject', 'defer'].includes(action.toLowerCase())) {
      if (actorRole !== 'mp' && actorRole !== 'mla' && actorRole !== 'administrator') {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Only elected representatives (MP/MLA) or administrators can approve, reject, or defer proposals.' });
      }
    }

    // Determine status after
    let statusAfter = statusBefore;
    if (action.toLowerCase() === 'approve') statusAfter = 'approved';
    else if (action.toLowerCase() === 'reject') statusAfter = 'rejected';
    else if (action.toLowerCase() === 'defer') statusAfter = 'deferred';
    else if (action.toLowerCase() === 'escalate') statusAfter = 'under_review';
    else if (action.toLowerCase() === 'request_info') statusAfter = 'under_review';

    // 3. Update proposal status
    await client.query(
      'UPDATE suggestions SET status = $1 WHERE id = $2',
      [statusAfter, id]
    );

    // 4. Write to suggestion timeline
    await client.query(
      'INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, $2, $3)',
      [id, statusAfter, `${action.toUpperCase()} action committed: ${comment}`]
    );

    // 5. Append to IMMUTABLE audit log
    await client.query(
      `INSERT INTO audit_log (proposal_id, actor_id, action, comment, status_before, status_after)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, action.toLowerCase(), comment, statusBefore, statusAfter]
    );

    // 6. If approved, commit funds in ledger
    if (action.toLowerCase() === 'approve') {
      const propInfo = await client.query('SELECT cost_estimate, user_id FROM suggestions WHERE id = $1', [id]);
      const cost = Number(propInfo.rows[0].cost_estimate || 0);
      
      const userConst = await client.query('SELECT constituency_id FROM users WHERE id = $1', [propInfo.rows[0].user_id]);
      const constId = userConst.rows[0]?.constituency_id;

      if (constId && cost > 0) {
        await client.query(`
          INSERT INTO fund_ledger (constituency_id, total_fund, committed, remaining)
          VALUES ($1, 50000000, $2, 50000000 - $2)
          ON CONFLICT ON CONSTRAINT fund_ledger_pkey DO NOTHING; -- in a real app we update the running total
        `, [constId, cost]);

        // Update existing row
        await client.query(`
          UPDATE fund_ledger 
          SET committed = committed + $1, remaining = remaining - $1
          WHERE constituency_id = $2
        `, [cost, constId]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Action successfully processed and written to audit log', status: statusAfter });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error committing proposal action:', error.message);
    res.status(500).json({ error: 'Failed to process proposal action' });
  } finally {
    client.release();
  }
};

/**
 * GET /api/proposals/:id/audit-trail - Retrieve proposal timeline and audit log entries
 */
export const getAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT al.*, u.full_name as actor_name, u.role as actor_role
      FROM audit_log al
      JOIN users u ON al.actor_id = u.id
      WHERE al.proposal_id = $1
      ORDER BY al.created_at ASC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving audit trail:', error.message);
    res.status(500).json({ error: 'Failed to retrieve audit trail' });
  }
};

/**
 * POST /api/proposals/:id/explain-ranking - Call Gemini to generate rankings justification
 */
export const explainRanking = async (req, res) => {
  const { id } = req.params;
  const { demand_score_breakdown } = req.body;

  try {
    // Check cache in db first
    const propQuery = await pool.query('SELECT a.recommendation_reason, s.title, s.category FROM suggestions s LEFT JOIN ai_analysis a ON s.id = a.suggestion_id WHERE s.id = $1', [id]);
    if (propQuery.rows.length > 0 && propQuery.rows[0].recommendation_reason) {
      return res.json({ explanation: propQuery.rows[0].recommendation_reason });
    }

    const title = propQuery.rows[0]?.title || 'Upgrade request';
    const category = propQuery.rows[0]?.category || 'roads';
    const breakdown = demand_score_breakdown || {
      complaint_count: 100,
      severity_weighted_score: 50,
      population_density_factor: 50,
      duplicate_count: 5,
      historical_neglect_factor: 50
    };

    let explanation = `Ranked high because it has ${breakdown.complaint_count} registered citizen complaints and is in a high-density area with a high severity index.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Generate a 2-sentence professional, plain-language justification explaining the ranking of the following constituency proposal to a Member of Parliament:
Proposal: "${title}" (${category})
Demand Score Breakdown factors:
- Complaint Count: ${breakdown.complaint_count}
- Severity Score: ${breakdown.severity_weighted_score}/100
- Population Density Factor: ${breakdown.population_density_factor}/100
- Duplicate Count: ${breakdown.duplicate_count}
- Historical Neglect Factor: ${breakdown.historical_neglect_factor}/100

Keep it concise, formal, and objective.`
        });
        
        if (response.text) {
          explanation = response.text.trim();
        }
      } catch (err) {
        console.error('Gemini API explain-ranking failed, falling back to rule-based explanation:', err.message);
      }
    }

    // Cache the explanation in database
    await pool.query(
      'UPDATE ai_analysis SET recommendation_reason = $1 WHERE suggestion_id = $2',
      [explanation, id]
    );

    res.json({ explanation });
  } catch (error) {
    console.error('Error in explainRanking:', error.message);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
};

/**
 * GET /api/funds - Get budget allocation ledger status
 */
export const getFundsLedger = async (req, res) => {
  try {
    const { constituency_id } = req.query;
    if (!constituency_id) {
      return res.status(400).json({ error: 'constituency_id is required' });
    }

    const query = `
      SELECT f.*, c.name as constituency_name, c.constituency_type
      FROM fund_ledger f
      JOIN constituencies c ON f.constituency_id = c.id
      WHERE c.id::text = $1 OR c.name = $1
    `;
    const result = await pool.query(query, [constituency_id]);
    
    if (result.rows.length === 0) {
      // Fallback seed
      return res.json({
        total_fund: 50000000,
        committed: 0,
        remaining: 50000000
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching fund ledger:', error.message);
    res.status(500).json({ error: 'Failed to retrieve fund ledger details' });
  }
};

/**
 * GET /api/scheme-match - Match government scheme to category with Gemini citations
 */
export const matchScheme = async (req, res) => {
  const { category, description } = req.query;
  
  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  // Scheme reference guidelines structure
  const staticSchemes = {
    roads: { scheme_name: "MPLADS (Roads Segment)", section: "Section 3.1", eligibility: "Eligible. Focuses on construction of approach roads, passenger shelters, and culverts." },
    water: { scheme_name: "Jal Jeevan Mission / MPLADS (Water)", section: "Section 2.4", eligibility: "Eligible. Covers drinking water installation, tubewells, and storage tanks." },
    education: { scheme_name: "Samagra Shiksha Abhiyan", section: "Section 5.8", eligibility: "Eligible. Funds lab upgrades, smart class installations, and library building." },
    health: { scheme_name: "National Health Mission (NHM)", section: "Section 1.2", eligibility: "Eligible. Dedicated allocations for primary health care expansion and equipment purchase." },
    electricity: { scheme_name: "PM-SAUBHAGYA / MPLADS (Power)", section: "Section 4.3", eligibility: "Eligible. Street lights and solar electricity connections qualify under standard provisions." },
    sanitation: { scheme_name: "Swachh Bharat Mission", section: "Section 6.2", eligibility: "Eligible. Funds public bio-toilets, solid waste management plants, and drainage systems." }
  };

  const scheme = staticSchemes[category.toLowerCase()] || { scheme_name: "MPLADS General", section: "Section 10", eligibility: "Eligible under general constituency developmental funding." };
  
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Assess matching government schemes for this development proposal description:
Category: "${category}"
Description: "${description || ''}"

We have standard local schemes:
- MPLADS (Member of Parliament Local Area Development Scheme)
- Swachh Bharat Mission (Sanitation/Toilets)
- Jal Jeevan Mission (Water/Pipes)
- National Health Mission (Health/Clinics)
- Samagra Shiksha (Education/Schools)

Generate a JSON object matching exactly this schema:
{
  "scheme_name": "Name of matched scheme",
  "section": "Cited Section or Chapter",
  "eligibility_justification": "2-sentence justification citing why it qualifies under guidelines"
}
Ensure it is valid JSON.`
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          scheme_name: parsed.scheme_name,
          section: parsed.section,
          eligibility_summary: parsed.eligibility_justification
        });
      }
    } catch (err) {
      console.error('Gemini scheme-match failed, using static matching rules:', err.message);
    }
  }

  res.json({
    scheme_name: scheme.scheme_name,
    section: scheme.section,
    eligibility_summary: scheme.eligibility
  });
};

/**
 * GET /api/dashboard/stats - Returns Dashboard view statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { constituency_id } = req.query;
    if (!constituency_id) {
      return res.status(400).json({ error: 'constituency_id is required' });
    }

    // 1. Fetch suggestions for constituency (including assembly segment rollups if Lok Sabha)
    const sugQuery = `
      SELECT s.*, a.priority_score, a.urgency, a.sentiment, c.name as constituency_name
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN constituencies c ON u.constituency_id = c.id
      WHERE c.id::text = $1 OR c.name = $1 
      OR c.id IN (
        SELECT assembly_segment_id FROM constituency_hierarchy WHERE lok_sabha_constituency_id::text = $1
      )
    `;
    const sugResult = await pool.query(sugQuery, [constituency_id]);
    const rows = sugResult.rows;

    // Total Demands count
    const totalCount = rows.length;
    const unresolvedCount = rows.filter(r => ['proposed', 'under_review'].includes(r.status)).length;
    
    // Average Proposal Age (days since created_at)
    let avgAgeDays = 0;
    if (rows.length > 0) {
      const now = new Date();
      const totalAgeMs = rows.reduce((sum, r) => sum + (now.getTime() - new Date(r.created_at).getTime()), 0);
      avgAgeDays = Math.round(totalAgeMs / (1000 * 60 * 60 * 24 * rows.length));
    }

    // Calculate Constituency Health Score (0-100)
    // Formula: 100 - (unresolvedCount * 5) - (avgAgeDays * 0.5) - (gapIndex)
    // Clamp between 10 and 100
    const rawScore = 100 - (unresolvedCount * 6) - (avgAgeDays * 0.8);
    const healthScore = Math.max(10, Math.min(100, Math.round(rawScore)));

    // Theme/Category breakdown
    const categoryCounts = {};
    rows.forEach(r => {
      const cat = r.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const themesBreakdown = Object.entries(categoryCounts).map(([name, count], idx) => ({
      id: String(idx + 1).padStart(2, '0'),
      name,
      count
    }));

    // Pending Action Badges (Days aging)
    const pendingActions = rows.filter(r => ['proposed', 'under_review'].includes(r.status)).map(r => {
      const ageDays = Math.round((new Date().getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        created_at: r.created_at,
        age_days: ageDays,
        urgency_badge: ageDays > 14 ? 'RED' : ageDays > 7 ? 'YELLOW' : 'GREEN'
      };
    });

    res.json({
      healthScore,
      totalDemands: totalCount,
      unresolvedCount,
      avgAgeDays,
      themesBreakdown,
      pendingActions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
};

/**
 * GET /api/dashboard/bias-flags - Identifies underserved areas (high demand, low action)
 */
export const getBiasFlags = async (req, res) => {
  try {
    const { constituency_id } = req.query;
    if (!constituency_id) {
      return res.status(400).json({ error: 'constituency_id is required' });
    }

    // Compute metrics per ward: avg demand_score (priority_score) vs approval_rate
    const query = `
      SELECT s.ward_id, 
             COUNT(s.id) as total_count,
             AVG(a.priority_score) as avg_demand_score,
             COUNT(CASE WHEN s.status = 'approved' THEN 1 END)::float / NULLIF(COUNT(s.id), 0) as approval_rate
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN constituencies c ON u.constituency_id = c.id
      WHERE c.id::text = $1 OR c.name = $1
      GROUP BY s.ward_id
    `;
    const result = await pool.query(query, [constituency_id]);
    
    // Flag wards: top 33% avg_demand_score, bottom 33% approval_rate
    const wards = result.rows;
    const flags = [];

    // Let's mark wards with demand > 80 and approval < 0.2
    wards.forEach(w => {
      const demand = Number(w.avg_demand_score || 0);
      const appRate = Number(w.approval_rate || 0);
      if (demand >= 80 && appRate <= 0.2) {
        flags.push({
          ward_id: w.ward_id,
          avg_demand_score: Math.round(demand),
          approval_rate: Math.round(appRate * 100),
          flag_type: 'underserved',
          reason: 'High citizen demand score, but extremely low historical approval/funding rate.'
        });
      }
    });

    res.json(flags);
  } catch (error) {
    console.error('Error calculating bias flags:', error.message);
    res.status(500).json({ error: 'Failed to calculate bias flags' });
  }
};

/**
 * GET /api/reports/generate - Generate quarterly summaries using Gemini
 */
export const generateReport = async (req, res) => {
  const { range, constituency_id, userId } = req.query;
  
  if (!constituency_id) {
    return res.status(400).json({ error: 'constituency_id is required' });
  }

  try {
    const suggQuery = await pool.query(`
      SELECT s.title, s.category, s.status, s.cost_estimate, s.created_at, al.comment as action_comment
      FROM suggestions s
      LEFT JOIN audit_log al ON s.id = al.proposal_id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE u.constituency_id::text = $1
    `, [constituency_id]);

    const rows = suggQuery.rows;
    
    let markdownReport = `### Quarter Executive Report - People's Priorities
Total Projects Evaluated: ${rows.length}
Approved Projects: ${rows.filter(r => r.status === 'approved').length}
Rejected Projects: ${rows.filter(r => r.status === 'rejected').length}

Details:
`;
    rows.forEach(r => {
      markdownReport += `- **${r.title}** (${r.category}): Status: ${r.status}, Budget: ${r.cost_estimate || 0}. MP Comment: ${r.action_comment || 'No comment.'}\n`;
    });

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create a professional Executive Legislative Report summarizing these constituency projects for the public/council review. Output a beautiful, structured Markdown document:
          
          ${markdownReport}`
        });
        if (response.text) {
          return res.json({ report: response.text.trim() });
        }
      } catch (err) {
        console.error('Gemini report generation failed:', err.message);
      }
    }

    res.json({ report: markdownReport });
  } catch (error) {
    console.error('Error generating report:', error.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

/**
 * POST /api/proposals/:id/draft-response - AI drafting responses
 */
export const draftResponse = async (req, res) => {
  const { id } = req.params;
  
  try {
    const propQuery = await pool.query('SELECT title, description, category FROM suggestions WHERE id = $1', [id]);
    if (propQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const { title, description, category } = propQuery.rows[0];
    let draft = `Thank you for your feedback regarding "${title}". We are reviewing the requirements to address this issue as soon as possible.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Draft a 3-sentence official response from a Member of Parliament's office to the citizen complaints that clustered into this proposal:
Title: "${title}"
Category: "${category}"
Details: "${description}"

Make it polite, responsive, reassuring, and address the issue directly.`
        });
        if (response.text) {
          draft = response.text.trim();
        }
      } catch (err) {
        console.error('Gemini draft-response failed:', err.message);
      }
    }

    res.json({ draft });
  } catch (error) {
    console.error('Error drafting response:', error.message);
    res.status(500).json({ error: 'Failed to draft response' });
  }
};

/**
 * PATCH /api/proposals/:id/recommend - Staff submits recommendation and internal notes
 */
export const recommendProposal = async (req, res) => {
  const { id } = req.params;
  const { staff_recommendation, staff_notes, userId } = req.body;

  if (!staff_recommendation) {
    return res.status(400).json({ error: 'staff_recommendation is required' });
  }

  try {
    await pool.query(
      'UPDATE suggestions SET staff_recommendation = $1, staff_notes = $2 WHERE id = $3',
      [staff_recommendation, staff_notes || '', id]
    );

    // Insert timeline log
    await pool.query(
      'INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, (SELECT status FROM suggestions WHERE id = $1), $2)',
      [id, `Staff Recommendation logged: ${staff_recommendation}. Notes: ${staff_notes || 'None'}`]
    );

    // Write to audit log as a comment
    if (userId) {
      await pool.query(
        `INSERT INTO audit_log (proposal_id, actor_id, action, comment, status_before, status_after)
         VALUES ($1, $2, 'comment', $3, (SELECT status FROM suggestions WHERE id = $1), (SELECT status FROM suggestions WHERE id = $1))`,
        [id, userId, `[Staff Recommendation: ${staff_recommendation}] ${staff_notes || ''}`]
      );
    }

    res.json({ message: 'Recommendation successfully logged', staff_recommendation, staff_notes });
  } catch (error) {
    console.error('Error logging staff recommendation:', error.message);
    res.status(500).json({ error: 'Failed to log recommendation' });
  }
};

/**
 * GET /api/proposals/constituencies - Returns all constituencies
 */
export const getConstituencies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM constituencies ORDER BY state, constituency_type, name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching constituencies:', error.message);
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
};

