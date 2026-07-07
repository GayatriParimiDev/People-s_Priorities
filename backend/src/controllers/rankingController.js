import pool from '../db.js';

/**
 * Ranking Algorithm:
 * Weighs citizen demand (count of suggestions) against infrastructure gaps.
 * 
 * Formula (Simplified):
 * Score = (DemandCount * 0.6) + (GapSeverityWeight * 0.4)
 * 
 * GapSeverityWeight:
 * - High: 10
 * - Medium: 5
 * - Low: 2
 */
export const getPriorityProjects = async (req, res) => {
  try {
    const { constituency_id } = req.query;

    if (!constituency_id) {
      return res.status(400).json({ error: 'constituency_id is required' });
    }

    // 1. Fetch citizen demand (counts per category)
    const demandQuery = `
      SELECT category, COUNT(*) as demand_count 
      FROM suggestions 
      WHERE user_id IN (
        SELECT id FROM users WHERE constituency_id IN (
          SELECT id FROM constituencies WHERE id::text = $1 OR name = $1 OR district = $1
        )
      )
      GROUP BY category
    `;
    const demandResult = await pool.query(demandQuery, [constituency_id]);
    const demands = demandResult.rows;

    // 2. Mock public infrastructure gaps (In real app, this comes from a DB or API)
    const mockGaps = [
      { category: 'road repair', severity: 'high' },
      { category: 'water supply', severity: 'medium' },
      { category: 'school upgrade', severity: 'low' },
      { category: 'healthcare', severity: 'high' },
    ];

    const severityWeights = {
      high: 10,
      medium: 5,
      low: 2,
    };

    // 3. Calculate scores
    const priorities = demands.map(demand => {
      const gap = mockGaps.find(g => g.category.toLowerCase() === demand.category?.toLowerCase());
      const severityWeight = gap ? severityWeights[gap.severity] : 0;
      
      // Simple weighted score
      const score = (parseInt(demand.demand_count) * 0.6) + (severityWeight * 0.4);
      
      return {
        category: demand.category,
        demand_count: demand.demand_count,
        severity: gap ? gap.severity : 'unknown',
        score: parseFloat(score.toFixed(2)),
        priority_level: score > 7 ? 'CRITICAL' : score > 4 ? 'ELEVATED' : 'STANDARD'
      };
    });

    // Sort by score descending
    priorities.sort((a, b) => b.score - a.score);

    res.json(priorities);
  } catch (error) {
    console.error('Error calculating priority projects:', error.message);
    res.status(500).json({ error: 'Failed to calculate priority projects' });
  }
};
