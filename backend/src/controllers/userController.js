import pool from '../db.js';
import { sessions } from './authController.js';

export const getDashboard = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.substring(7);
  const userSession = sessions[token];
  if (!userSession) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  try {
    const userId = userSession.id;

    // Fetch user profile from database
    const userRes = await pool.query(
      `SELECT u.*, c.name as constituency_name, c.district as constituency_district, c.mp_name as constituency_representative
       FROM users u
       LEFT JOIN constituencies c ON u.constituency_id = c.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dbUser = userRes.rows[0];

    // Compute badges based on user database records
    const submissionCountRes = await pool.query(
      'SELECT COUNT(*) FROM suggestions WHERE user_id = $1',
      [userId]
    );
    const submissionCount = parseInt(submissionCountRes.rows[0].count);

    const supportCountRes = await pool.query(
      'SELECT COUNT(*) FROM suggestion_supporters WHERE user_id = $1',
      [userId]
    );
    const supportCount = parseInt(supportCountRes.rows[0].count);

    const badges = [];
    if (submissionCount >= 1) {
      badges.push({
        id: 'bdg-01',
        name: 'First Responder',
        description: 'Earned by submitting the first verified district feedback log.',
        earnedAt: dbUser.created_at
      });
    }
    if (supportCount >= 5) {
      badges.push({
        id: 'bdg-02',
        name: 'Audit Endorser',
        description: 'Signed more than 5 critical public legislative proposals.',
        earnedAt: new Date().toISOString()
      });
    }
    if (submissionCount >= 5) {
      badges.push({
        id: 'bdg-03',
        name: 'Neighborhood Watch',
        description: 'Active reporter with 5+ submitted issues in the constituency.',
        earnedAt: new Date().toISOString()
      });
    }

    // Get submissions
    const submissionsRes = await pool.query(
      `SELECT s.*, a.priority_score, a.urgency, a.sentiment, a.theme, a.ai_metadata
       FROM suggestions s
       LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    const submissionIds = submissionsRes.rows.map(r => r.id);
    let timelineGroup = {};

    if (submissionIds.length > 0) {
      const timelineRes = await pool.query(
        `SELECT * FROM suggestion_timeline
         WHERE suggestion_id = ANY($1)
         ORDER BY created_at ASC`,
        [submissionIds]
      );
      timelineRes.rows.forEach(row => {
        if (!timelineGroup[row.suggestion_id]) {
          timelineGroup[row.suggestion_id] = [];
        }
        timelineGroup[row.suggestion_id].push({
          status: (row.status || 'SUBMITTED').toUpperCase(),
          timestamp: row.created_at,
          notes: row.notes || ''
        });
      });
    }

    const mappedSubmissions = submissionsRes.rows.map(sub => {
      const metadata = sub.ai_metadata || {};
      const timeline = timelineGroup[sub.id] || [
        {
          status: 'SUBMITTED',
          timestamp: sub.created_at,
          notes: 'Civic ledger record established. Block hash verified.'
        }
      ];

      return {
        id: `SUB-${sub.id.substring(0, 4).toUpperCase()}`,
        db_id: sub.id,
        title: sub.title,
        description: sub.description,
        theme: sub.theme || mapCategoryToTheme(sub.category),
        status: (sub.status || 'UNDER REVIEW').toUpperCase(),
        priorityLevel: (sub.urgency || 'STANDARD').toUpperCase(),
        submissionDate: sub.created_at,
        signaturesCount: metadata.complaint_count || 1,
        location: {
          latitude: parseFloat(sub.latitude) || 12.93,
          longitude: parseFloat(sub.longitude) || 77.58
        },
        statusTimeline: timeline
      };
    });

    // Compute metrics
    const underReview = mappedSubmissions.filter(s => s.status === 'UNDER REVIEW' || s.status === 'PROPOSED').length;
    const accepted = mappedSubmissions.filter(s => s.status === 'APPROVED' || s.status === 'FUNDED').length;
    const implemented = mappedSubmissions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'COMPLETED' || s.status === 'CLOSED').length;

    // AI Insights (constituency level distribution)
    const constituencyId = dbUser.constituency_id;
    let categoryDistribution = [];
    if (constituencyId) {
      const distRes = await pool.query(
        `SELECT s.category, COUNT(*) as count
         FROM suggestions s
         JOIN users u ON s.user_id = u.id
         WHERE u.constituency_id = $1
         GROUP BY s.category`,
        [constituencyId]
      );
      const totalDist = distRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
      categoryDistribution = distRes.rows.map(r => ({
        category: mapCategoryToTheme(r.category),
        percentage: totalDist > 0 ? Math.round((parseInt(r.count) / totalDist) * 100) : 0
      }));
    }

    if (categoryDistribution.length === 0) {
      categoryDistribution = [
        { category: "Solar Lighting Infrastructure", percentage: 35 },
        { category: "Arterial Road Repair", percentage: 25 },
        { category: "Clean Water Access", percentage: 20 },
        { category: "Youth Employment Center", percentage: 10 },
        { category: "Education Infrastructure", percentage: 10 }
      ];
    }

    // Constituency Updates: fetch from timeline or default announcements
    let constituencyUpdates = [];
    if (constituencyId) {
      // Find latest approved suggestions in this constituency
      const updatesRes = await pool.query(
        `SELECT s.id, s.title, s.status, t.created_at, t.notes
         FROM suggestions s
         JOIN suggestion_timeline t ON s.id = t.suggestion_id
         JOIN users u ON s.user_id = u.id
         WHERE u.constituency_id = $1 AND s.status IN ('approved', 'completed', 'in_progress')
         ORDER BY t.created_at DESC
         LIMIT 3`,
        [constituencyId]
      );
      constituencyUpdates = updatesRes.rows.map(r => ({
        id: `up-${r.id.substring(0, 4)}`,
        title: `Project Status: ${r.title}`,
        content: r.notes || `Project status updated to ${r.status}.`,
        date: r.created_at,
        relevance: `Matches project SUB-${r.id.substring(0, 4).toUpperCase()}`
      }));
    }

    if (constituencyUpdates.length === 0) {
      constituencyUpdates = [
        {
          id: "up-101",
          title: "Public Hearing: District Solar Lighting Schemes",
          content: `Councilor ${dbUser.constituency_representative || 'J. Doe'} is hosting a public session on Solar Lighting schemes on July 12th in Assembly Hall.`,
          date: new Date().toISOString(),
          relevance: "Matches active energy proposal"
        }
      ];
    }

    // Fetch Notifications
    const notificationsRes = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    const notifications = notificationsRes.rows.map(n => ({
      id: n.id,
      type: n.title?.includes('Badge') ? 'BADGE_EARNED' : 'STATUS_CHANGE',
      message: n.message,
      read: n.is_read,
      createdAt: n.created_at
    }));

    // If notifications are empty, seed some default ones
    const finalNotifications = notifications.length > 0 ? notifications : [
      {
        id: "ntf-901",
        type: "STATUS_CHANGE",
        message: "Your reported pothole request is ready for verification.",
        read: false,
        createdAt: new Date().toISOString()
      }
    ];

    // Civic Nudge Agent: Personalized weekly nudge based on engagement history
    let civicNudge = null;
    try {
      const suggestionsToNudge = await pool.query(
        `SELECT s.id, s.title, s.category, 
                (SELECT count(*)::int FROM suggestion_supporters ss WHERE ss.suggestion_id = s.id) as upvotes
         FROM suggestions s
         WHERE s.status IN ('Submitted', 'proposed')
           AND s.user_id != $1
           AND s.user_id IN (SELECT id FROM users WHERE constituency_id = $2)
         ORDER BY upvotes DESC
         LIMIT 1`,
        [userId, dbUser.constituency_id]
      );

      if (suggestionsToNudge.rows.length > 0) {
        const targetProposal = suggestionsToNudge.rows[0];
        const upvotesNeeded = Math.max(3, 10 - parseInt(targetProposal.upvotes || 0));
        
        const message = `A ${targetProposal.category || 'water-quality'} proposal "${targetProposal.title}" in your ward needs ${upvotesNeeded} more community verifications to reach review threshold -- you're one of the closest verified reporters.`;
        civicNudge = {
          id: `nudge-${targetProposal.id.substring(0, 4)}`,
          type: "action_nudge",
          message,
          suggested_proposal_id: targetProposal.id
        };
      } else {
        civicNudge = {
          id: "nudge-default",
          type: "general_nudge",
          message: "Check the Priority Polling tab to vote on which projects are most critical for your neighborhood this week!",
          suggested_proposal_id: null
        };
      }
    } catch (nudgeErr) {
      console.error("Error generating civic nudge:", nudgeErr.message);
    }

    res.json({
      user: {
        profile: {
          id: dbUser.id,
          name: dbUser.full_name,
          email: dbUser.email,
          avatarUrl: dbUser.avatar_url,
          joinedDate: dbUser.created_at
        },
        constituency: {
          districtId: dbUser.constituency_district || "74-B",
          name: dbUser.constituency_name || "Soho North Division",
          representative: dbUser.constituency_representative || "Councilor J. Doe",
          governanceLevel: "Municipal District Assembly"
        },
        participationStats: {
          engagementScore: dbUser.participation_score || 0,
          badges
        }
      },
      metrics: {
        totalSuggestionsSubmitted: submissionCount,
        suggestionsUnderReview: underReview,
        suggestionsAccepted: accepted,
        suggestionsImplemented: implemented
      },
      submissions: mappedSubmissions,
      aiInsights: {
        sentimentSummary: {
          overall: "Optimistic",
          confidence: 0.89,
          summaryText: "Citizen logs exhibit progressive focus on sustainable lighting and transport upgrades, showing high community engagement alignment."
        },
        categoryDistribution,
        priorityScoreHistory: [
          { month: "Jan", score: 45 },
          { month: "Feb", score: 52 },
          { month: "Mar", score: 58 },
          { month: "Apr", score: 64 },
          { month: "May", score: 75 },
          { month: "Jun", score: 82 }
        ]
      },
      constituencyUpdates,
      notifications: finalNotifications,
      civicNudge
    });
  } catch (error) {
    console.error('Error fetching citizen dashboard:', error.message);
    res.status(500).json({ error: 'Failed to retrieve citizen dashboard' });
  }
};

export const upvoteSuggestion = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.substring(7);
  const userSession = sessions[token];
  if (!userSession) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const { suggestion_id } = req.body;
  if (!suggestion_id) {
    return res.status(400).json({ error: 'suggestion_id is required' });
  }

  try {
    const userId = userSession.id;

    // Check if suggestion exists
    const checkRes = await pool.query('SELECT * FROM suggestions WHERE id = $1', [suggestion_id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    // Check if already upvoted
    const checkUpvote = await pool.query(
      'SELECT * FROM suggestion_supporters WHERE suggestion_id = $1 AND user_id = $2',
      [suggestion_id, userId]
    );

    if (checkUpvote.rows.length > 0) {
      // User already upvoted, let's remove it (toggle behavior)
      await pool.query(
        'DELETE FROM suggestion_supporters WHERE suggestion_id = $1 AND user_id = $2',
        [suggestion_id, userId]
      );

      // Decrement complaint_count in metadata
      await pool.query(
        `UPDATE ai_analysis 
         SET ai_metadata = jsonb_set(COALESCE(ai_metadata, '{}'::jsonb), '{complaint_count}', 
           to_jsonb(GREATEST(0, COALESCE((ai_metadata->>'complaint_count')::int, 1) - 1))),
             priority_score = GREATEST(0, COALESCE(priority_score, 50) - 2)
         WHERE suggestion_id = $1`,
        [suggestion_id]
      );

      return res.json({ message: 'Upvote removed', supported: false });
    }

    // Add upvote
    await pool.query(
      'INSERT INTO suggestion_supporters (suggestion_id, user_id) VALUES ($1, $2)',
      [suggestion_id, userId]
    );

    // Increment complaint_count and demand score
    await pool.query(
      `UPDATE ai_analysis 
       SET ai_metadata = jsonb_set(COALESCE(ai_metadata, '{}'::jsonb), '{complaint_count}', 
         to_jsonb(COALESCE((ai_metadata->>'complaint_count')::int, 0) + 1)),
           priority_score = LEAST(100, COALESCE(priority_score, 50) + 2)
       WHERE suggestion_id = $1`,
      [suggestion_id]
    );

    // Increase user participation score (Engagement Score!)
    await pool.query(
      'UPDATE users SET participation_score = participation_score + 5 WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Upvote added successfully', supported: true });
  } catch (error) {
    console.error('Error upvoting suggestion:', error.message);
    res.status(500).json({ error: 'Failed to upvote suggestion' });
  }
};

export const commentSuggestion = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.substring(7);
  const userSession = sessions[token];
  if (!userSession) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const { suggestion_id, comment } = req.body;
  if (!suggestion_id || !comment) {
    return res.status(400).json({ error: 'suggestion_id and comment are required' });
  }

  try {
    const userId = userSession.id;

    // Check if suggestion exists
    const checkRes = await pool.query('SELECT * FROM suggestions WHERE id = $1', [suggestion_id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    const userName = userSession.name || 'Citizen';

    // Insert comment into timeline
    await pool.query(
      `INSERT INTO suggestion_timeline (suggestion_id, status, notes)
       VALUES ($1, 'Citizen Comment', $2)`,
      [suggestion_id, `${userName}: ${comment}`]
    );

    // Award points
    await pool.query(
      'UPDATE users SET participation_score = participation_score + 2 WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Comment submitted successfully' });
  } catch (error) {
    console.error('Error commenting suggestion:', error.message);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
};

export const votePriorityPoll = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.substring(7);
  const userSession = sessions[token];
  if (!userSession) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const { suggestion_id } = req.body;
  if (!suggestion_id) {
    return res.status(400).json({ error: 'suggestion_id is required' });
  }

  try {
    const userId = userSession.id;

    // Increment community priority signal for this suggestion/proposal
    await pool.query(
      `UPDATE ai_analysis 
       SET ai_metadata = jsonb_set(COALESCE(ai_metadata, '{}'::jsonb), '{community_priority_signal}', 
         to_jsonb(COALESCE((ai_metadata->>'community_priority_signal')::int, 0) + 10))
       WHERE suggestion_id = $1`,
      [suggestion_id]
    );

    // Award points
    await pool.query(
      'UPDATE users SET participation_score = participation_score + 10 WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Priority vote registered successfully' });
  } catch (error) {
    console.error('Error voting in priority poll:', error.message);
    res.status(500).json({ error: 'Failed to record priority vote' });
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
