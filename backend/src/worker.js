import pool from './db.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Initialize Gemini Client
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

// 1. Autonomous Pre-Triage Agent
async function runPreTriageAgent() {
  console.log('🤖 Running Pre-Triage Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      console.warn('⚠️ Gemini API key not configured for Pre-Triage Agent.');
      return;
    }

    // Query suggestions that don't have recommendations
    const query = `
      SELECT id, title, description, category, status 
      FROM suggestions 
      WHERE id NOT IN (SELECT proposal_id FROM agent_recommendations)
    `;
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} suggestions needing pre-triage.`);

    if (result.rows.length === 0) return;

    // Fetch some past decisions from audit log for in-context learning
    const pastDecisionsQuery = `
      SELECT s.title, s.category, al.action, al.comment 
      FROM audit_log al
      JOIN suggestions s ON al.proposal_id = s.id
      ORDER BY al.created_at DESC LIMIT 5
    `;
    const pastDecisions = await pool.query(pastDecisionsQuery);
    const contextStr = pastDecisions.rows.map(d => 
      `Proposal Title: ${d.title}\nCategory: ${d.category}\nDecision: ${d.action.toUpperCase()}\nReason: ${d.comment}`
    ).join('\n---\n');

    for (const proposal of result.rows) {
      const prompt = `
You are an expert Pre-Triage AI Agent assisting a Member of Parliament (MP). 
Your task is to analyze the following citizen proposal and recommend a triage action: either "approve", "reject", or "defer".

CURRENT PROPOSAL:
Title: ${proposal.title}
Description: ${proposal.description}
Category: ${proposal.category}

HISTORICAL DECISIONS CONTEXT (use as reference for consistency):
${contextStr || 'No historical decisions available.'}

Analyze the urgency, benefit to the community, and category. Provide your output in JSON format with exactly two keys:
1. "recommendation": must be one of "approve", "reject", "defer".
2. "reason": a short, professional justification (2-3 sentences) detailing why this action is suggested.

Example Output:
{
  "recommendation": "approve",
  "reason": "This water leakage issue directly affects public health in Ward 7. The request aligns with past approved sanitation initiatives and has high community support."
}

Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '{}';
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);
        
        if (data.recommendation && data.reason) {
          await pool.query(
            `INSERT INTO agent_recommendations (proposal_id, recommendation, reason) VALUES ($1, $2, $3)`,
            [proposal.id, data.recommendation, data.reason]
          );
          console.log(`✅ Pre-triaged proposal "${proposal.title}" as: ${data.recommendation}`);
        }
      } catch (err) {
        console.error(`Error parsing Pre-Triage AI response for suggestion ${proposal.id}:`, err.message, text);
      }
    }
  } catch (error) {
    console.error('❌ Pre-Triage Agent error:', error.message);
  }
}

// 2. Scheme Cross-Reference Agent
async function runSchemeCrossReferenceAgent() {
  console.log('🤖 Running Scheme Cross-Reference Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) return;

    // Find suggestions without scheme matches
    const query = `
      SELECT id, title, description, category 
      FROM suggestions 
      WHERE id NOT IN (SELECT proposal_id FROM scheme_matches)
    `;
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} suggestions needing scheme cross-referencing.`);

    if (result.rows.length === 0) return;

    // Static Government Schemes database
    const schemes = [
      { name: "Pradhan Mantri Gram Sadak Yojana (PMGSY)", category: "roads", eligibility: "Rural areas lacking all-weather road connectivity, pothole repairs, street upgrades." },
      { name: "Jal Jeevan Mission (JJM)", category: "water", eligibility: "Providing functional household tap connections, resolving drinking water contamination/pipeline breaks." },
      { name: "Deendayal Upadhyaya Gram Jyoti Yojana (DUGJY)", category: "electricity", eligibility: "Rural electrification, upgrading transformers, installing solar streetlights." },
      { name: "PM-SHRI Schools Scheme", category: "education", eligibility: "Upgrading government classrooms, digital lab installations, basic educational infrastructure." },
      { name: "Swachh Bharat Mission (SBM)", category: "sanitation", eligibility: "Building public community toilets, garbage processing plants, general public hygiene improvements." },
      { name: "Urban Infra Development Fund (UIDF)", category: "general", eligibility: "Urban bridge constructions, park redevelopment, drainage systems." }
    ];

    const schemesStr = JSON.stringify(schemes, null, 2);

    for (const proposal of result.rows) {
      const prompt = `
You are a Scheme Matching AI Agent. You match citizen complaints and infrastructure proposals to official government development schemes.

PROPOSAL DETAILS:
Title: ${proposal.title}
Description: ${proposal.description}
Category: ${proposal.category}

AVAILABLE GOVERNMENT SCHEMES:
${schemesStr}

Analyze the proposal details. Your job is to select the closest matching scheme. If the category fits exactly, it's an "exact" match. If it is somewhat related or is a general fallback, it is a "partial" match.
Provide your response in JSON format with exactly four keys:
1. "scheme_name": The name of the selected scheme.
2. "fit_type": Either "exact" or "partial".
3. "eligibility_criteria": A brief summary of why it fits the criteria.
4. "reasoning": 2 sentences explaining the match.

Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '{}';
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);
        
        if (data.scheme_name) {
          await pool.query(
            `INSERT INTO scheme_matches (proposal_id, scheme_name, fit_type, eligibility_criteria, reasoning) VALUES ($1, $2, $3, $4, $5)`,
            [proposal.id, data.scheme_name, data.fit_type || 'partial', data.eligibility_criteria || '', data.reasoning || '']
          );
          console.log(`✅ Matched scheme "${data.scheme_name}" (${data.fit_type}) for proposal "${proposal.title}"`);
        }
      } catch (err) {
        console.error(`Error parsing Scheme Match AI response for suggestion ${proposal.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Scheme Cross-Reference Agent error:', error.message);
  }
}

// 3. Anomaly & Manipulation Watch Agent
async function runAnomalyWatchAgent() {
  console.log('🤖 Running Anomaly & Manipulation Watch Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) return;

    // Get recent suggestions
    const query = `
      SELECT id, title, description, category, created_at 
      FROM suggestions 
      ORDER BY created_at DESC LIMIT 50
    `;
    const result = await pool.query(query);
    if (result.rows.length === 0) return;

    const suggestionsList = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      created_at: r.created_at
    }));

    const prompt = `
You are a Security Audit AI Agent monitoring civic submissions for manipulation, coordination, astroturfing, or spam campaigns.
You are given a list of the 50 most recent citizen submissions. Inspect them for coordinated behavior, such as:
- Sudden surges of identical or nearly-identical wording from different report entries.
- Bot-like repetitive patterns or spam descriptions.
- Suspicious complaint clustering (multiple posts on the same minor issue to artificially boost demand score).

SUBMISSIONS:
${JSON.stringify(suggestionsList, null, 2)}

Analyze the submissions. If you find any coordinated or highly suspicious submissions, report them.
Provide your response in JSON format. The output should be a JSON array of flagged items:
[
  {
    "proposal_id": "UUID-of-the-flagged-proposal",
    "flag_reason": "e.g., Coordinated Duplicate Text Campaign",
    "evidence": {
      "matched_ids": ["other-matching-proposal-ids"],
      "details": "A detailed explanation of the suspicious pattern found."
    }
  }
]

If no anomalies are found, return an empty array: [].
Return ONLY the JSON array. Do not include markdown formatting or backticks.
`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });

    const text = response.text?.trim() || '[]';
    try {
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const anomalies = JSON.parse(cleanedText);
      
      if (Array.isArray(anomalies)) {
        for (const flag of anomalies) {
          // Check if already flagged to avoid duplicates
          const existCheck = await pool.query(
            'SELECT id FROM anomaly_flags WHERE proposal_id = $1 AND flag_reason = $2',
            [flag.proposal_id, flag.flag_reason]
          );
          if (existCheck.rows.length === 0) {
            await pool.query(
              `INSERT INTO anomaly_flags (proposal_id, flag_reason, evidence) VALUES ($1, $2, $3)`,
              [flag.proposal_id, flag.flag_reason, JSON.stringify(flag.evidence)]
            );
            console.log(`⚠️ Flagged Anomaly on proposal ID ${flag.proposal_id}: ${flag.flag_reason}`);
          }
        }
      }
    } catch (err) {
      console.error('Error parsing Anomaly Watch response:', err.message, text);
    }
  } catch (error) {
    console.error('❌ Anomaly Watch Agent error:', error.message);
  }
}

// 4. Budget Allocation Optimizer Agent
async function runBudgetOptimizerAgent() {
  console.log('🤖 Running Budget Allocation Optimizer Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) return;

    // Fetch constituencies
    const constituencies = await pool.query('SELECT id, name FROM constituencies');

    for (const c of constituencies.rows) {
      // Fetch fund ledger
      const ledgerRes = await pool.query(
        'SELECT remaining, total_fund FROM fund_ledger WHERE constituency_id = $1 ORDER BY created_at DESC LIMIT 1',
        [c.id]
      );
      if (ledgerRes.rows.length === 0) continue;

      const remainingBudget = Number(ledgerRes.rows[0].remaining);
      const totalBudget = Number(ledgerRes.rows[0].total_fund);

      // Fetch all open suggestions in this constituency
      const proposalsQuery = `
        SELECT s.id, s.title, s.category, s.cost_estimate, s.beneficiary_count, a.priority_score 
        FROM suggestions s
        LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
        WHERE s.status IN ('Submitted', 'proposed', 'under_review')
          AND s.user_id IN (SELECT id FROM users WHERE constituency_id = $1)
      `;
      const proposals = await pool.query(proposalsQuery, [c.id]);
      if (proposals.rows.length === 0) continue;

      const openProjects = proposals.rows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        cost: Number(r.cost_estimate || 100000), // Default mock cost if 0
        beneficiaries: Number(r.beneficiary_count || 100),
        score: Number(r.priority_score || 50)
      }));

      const prompt = `
You are a Constrained Budget Allocation Optimizer AI Agent.
Your job is to recommend which infrastructure projects should be funded from the remaining constituency budget to maximize:
1. Total priority score (demand_score)
2. Total beneficiary coverage (people benefited)
Within the constraint of the remaining budget.

CONSTITUENCY: ${c.name}
REMAINING BUDGET: ${remainingBudget} INR
TOTAL CONSTITUENCY BUDGET: ${totalBudget} INR

PROPOSED PROJECTS LIST:
${JSON.stringify(openProjects, null, 2)}

Run a multi-step optimization (e.g. knapsack-like analysis). Output a JSON object containing:
1. "allocated_amount": total cost of selected projects.
2. "coverage_percentage": percent of total potential beneficiaries reached by funded projects.
3. "recommended_split": an array of objects for the SELECTED projects:
   [
     { "proposal_id": "UUID", "allocated_funds": cost_amount, "justification": "Why this project is selected" }
   ]
4. "reasoning": A 3-sentence summary of the optimization logic and trade-offs.

Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '{}';
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);
        
        if (data.recommended_split) {
          // Clear previous optimization result for this constituency to keep it fresh
          await pool.query('DELETE FROM budget_optimizations WHERE constituency_id = $1', [c.id]);

          await pool.query(
            `INSERT INTO budget_optimizations 
             (constituency_id, total_budget, allocated_amount, coverage_percentage, recommended_split, reasoning)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [c.id, remainingBudget, Number(data.allocated_amount || 0), Number(data.coverage_percentage || 0), JSON.stringify(data.recommended_split), data.reasoning || '']
          );
          console.log(`✅ Budget optimization computed for constituency: ${c.name}`);
        }
      } catch (err) {
        console.error(`Error parsing Budget Optimizer AI response for constituency ${c.name}:`, err.message, text);
      }
    }
  } catch (error) {
    console.error('❌ Budget Optimizer Agent error:', error.message);
  }
}

// 5. Meeting-Prep Agent
async function runMeetingPrepAgent() {
  console.log('🤖 Running Meeting-Prep Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) return;

    const constituencies = await pool.query('SELECT id, name FROM constituencies');

    for (const c of constituencies.rows) {
      // Get top 5 unresolved proposals, and overall sentiment metrics
      const topProposalsQuery = `
        SELECT s.id, s.title, s.description, s.category, a.priority_score, a.sentiment, s.created_at
        FROM suggestions s
        LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
        WHERE s.status IN ('Submitted', 'proposed', 'under_review')
          AND s.user_id IN (SELECT id FROM users WHERE constituency_id = $1)
        ORDER BY a.priority_score DESC NULLS LAST LIMIT 5
      `;
      const topProposals = await pool.query(topProposalsQuery, [c.id]);
      if (topProposals.rows.length === 0) continue;

      const proposalsData = topProposals.rows.map(p => ({
        title: p.title,
        description: p.description,
        category: p.category,
        priority_score: p.priority_score,
        sentiment: p.sentiment
      }));

      const prompt = `
You are a Legislative Meeting Preparation AI Agent. You prepare briefings for Members of Parliament (MPs) before public town-halls or constituent interactions.

CONSTITUENCY: ${c.name}

TOP 5 UNRESOLVED HIGH-DEMAND PROPOSALS:
${JSON.stringify(proposalsData, null, 2)}

Compile a structured brief. Outline:
1. Top unresolved demands.
2. Citizen sentiment summary (e.g. general frustration over roads, school infrastructure anxieties).
3. Draft talking points / suggested responses for the MP to stay transparent and accountable.

Return your response in a clear markdown format.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const markdown = response.text || '';
      if (markdown) {
        // Delete older briefs to save space and keep it active
        await pool.query('DELETE FROM meeting_briefs WHERE constituency_id = $1', [c.id]);

        await pool.query(
          `INSERT INTO meeting_briefs (constituency_id, meeting_title, scheduled_time, briefing) VALUES ($1, $2, now(), $3)`,
          [c.id, `${c.name} Public Briefing`, markdown]
        );
        console.log(`✅ Generated Meeting Brief for constituency: ${c.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Meeting Prep Agent error:', error.message);
  }
}

// 6. Autonomous Quarterly Report Agent
async function runQuarterlyReportAgent() {
  console.log('🤖 Running Quarterly Report Agent...');
  try {
    const gemini = getGeminiClient();
    if (!gemini) return;

    const constituencies = await pool.query('SELECT id, name FROM constituencies');

    for (const c of constituencies.rows) {
      // Fetch manifesto priorities
      const mpRes = await pool.query(
        'SELECT category, stated_weight_percent FROM manifesto_priorities WHERE mp_id IN (SELECT id FROM users WHERE constituency_id = $1 AND role = \'MP\')',
        [c.id]
      );
      const manifesto = mpRes.rows;

      // Fetch approvals / rejections / categories of suggestions in this constituency
      const suggestionsQuery = `
        SELECT s.id, s.category, s.status, s.cost_estimate
        FROM suggestions s
        WHERE s.user_id IN (SELECT id FROM users WHERE constituency_id = $1)
      `;
      const suggestionsRes = await pool.query(suggestionsQuery, [c.id]);
      if (suggestionsRes.rows.length === 0) continue;

      const suggestions = suggestionsRes.rows.map(s => ({
        id: s.id,
        category: s.category,
        status: s.status,
        cost: Number(s.cost_estimate || 0)
      }));

      const prompt = `
You are a Legislative Auditing AI Agent. You compile the MP's Quarterly Performance Report and check for alignment with manifesto commitments.

CONSTITUENCY: ${c.name}
MANIFESTO PRIORITIES (Stated weights):
${JSON.stringify(manifesto, null, 2)}

ACTUAL DECIDED & FILED CIVIC PROPOSALS:
${JSON.stringify(suggestions, null, 2)}

Synthesize this data. Perform a budget and category count breakdown. Compare it to the manifesto weights.
Identify category imbalances (e.g. MP promised 40% on education but spent 90% on roads).
Output a JSON object with:
1. "summary": A brief description of the quarter's achievements (total projects approved, cost committed).
2. "imbalances": An array of strings describing manifesto misalignments.
3. "manifesto_alignment_score": An integer from 0 to 100 indicating how well the actual allocations match manifesto weights.
4. "recommmended_adjustments": 2 bullet points on how to restore balance in the next quarter.

Return ONLY the JSON object. Do not include markdown formatting or backticks.
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '{}';
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const report = JSON.parse(cleanedText);

        if (report.summary) {
          await pool.query('DELETE FROM quarterly_reports WHERE constituency_id = $1', [c.id]);

          await pool.query(
            `INSERT INTO quarterly_reports (constituency_id, quarter_name, report_content) VALUES ($1, $2, $3)`,
            [c.id, '2026-Q2', JSON.stringify(report)]
          );
          console.log(`✅ Generated Quarterly Report for constituency: ${c.name}`);
        }
      } catch (err) {
        console.error(`Error parsing Quarterly Report AI response for constituency ${c.name}:`, err.message, text);
      }
    }
  } catch (error) {
    console.error('❌ Quarterly Report Agent error:', error.message);
  }
}

// 7. Continuous Re-Scoring Agent
async function runContinuousReScoringAgent() {
  console.log('🤖 Running Continuous Re-Scoring Agent...');
  try {
    // We re-evaluate demand score for suggestions.
    // demand_score = severity_weighted_score + upvotes (supporters) * 3 + duplicate_cluster_size * 5 + historical_neglect_factor.
    // Let's run a bulk SQL recalculation
    await pool.query(`
      UPDATE ai_analysis a
      SET priority_score = GREATEST(10, LEAST(100, 
        COALESCE((a.ai_metadata->>'severity_weighted_score')::int, 50) + 
        (SELECT COUNT(*)::int * 3 FROM suggestion_supporters ss WHERE ss.suggestion_id = a.suggestion_id) +
        COALESCE((a.ai_metadata->>'duplicate_count')::int, 0) * 5 +
        COALESCE((a.ai_metadata->>'historical_neglect_factor')::int, 20)
      ))
    `);
    console.log('✅ Recalculated demand_score / priority_score for all proposals in database.');
  } catch (error) {
    console.error('❌ Re-Scoring Agent error:', error.message);
  }
}

// 8. Escalation Watchdog Agent
async function runEscalationWatchdogAgent() {
  console.log('🤖 Running Escalation Watchdog Agent...');
  try {
    // Monitor proposals in 'Submitted' or 'proposed' status older than 7 days, and escalate
    // (We also check if they are already escalated)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 7);

    // Let's retrieve candidates
    const query = `
      SELECT id, title, status FROM suggestions
      WHERE status IN ('Submitted', 'proposed') AND created_at < $1
    `;
    const res = await pool.query(query, [thresholdDate]);
    console.log(`Found ${res.rows.length} suggestions older than 7 days needing escalation.`);

    for (const proposal of res.rows) {
      await pool.query(
        "UPDATE suggestions SET status = 'escalated' WHERE id = $1",
        [proposal.id]
      );
      await pool.query(
        "INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, 'ESCALATED', 'System watchdog auto-escalated this proposal due to inaction past 7 days.')",
        [proposal.id]
      );
      
      // Let's add a notification for the MP
      const mpUser = await pool.query("SELECT id FROM users WHERE role = 'MP' LIMIT 1");
      if (mpUser.rows.length > 0) {
        await pool.query(
          "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
          [
            mpUser.rows[0].id,
            `⚠️ SLA Breach Escalation`,
            `Proposal "${proposal.title}" has breached the 7-day review threshold and has been escalated.`
          ]
        );
      }
      console.log(`🚨 Auto-escalated proposal "${proposal.title}"`);
    }
  } catch (error) {
    console.error('❌ Escalation Watchdog Agent error:', error.message);
  }
}

// Main execution function that runs all agents
export async function runAllAgents() {
  console.log('🚀 Starting Agentic AI execution cycle...');
  await runContinuousReScoringAgent();
  await runPreTriageAgent();
  await runSchemeCrossReferenceAgent();
  await runAnomalyWatchAgent();
  await runBudgetOptimizerAgent();
  await runMeetingPrepAgent();
  await runQuarterlyReportAgent();
  await runEscalationWatchdogAgent();
  console.log('🎉 Completed Agentic AI execution cycle.');
}

// If run directly (e.g. node src/worker.js)
const isMain = process.argv[1] && (process.argv[1].endsWith('worker.js') || process.argv[1].endsWith('worker'));
if (isMain) {
  console.log('⚙️ Background Worker process started.');
  // Run immediately on boot
  runAllAgents().then(() => {
    // Then set interval (e.g., every 3 minutes for development demonstration, so it runs frequently enough)
    const intervalMs = 3 * 60 * 1000;
    setInterval(runAllAgents, intervalMs);
    console.log(`⚙️ Worker running on interval: every 3 minutes.`);
  }).catch(err => {
    console.error('Fatal worker crash:', err);
    process.exit(1);
  });
}
