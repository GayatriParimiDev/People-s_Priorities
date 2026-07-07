import pool from '../db.js';

/**
 * Fetches and merges public datasets (demographics, infrastructure gaps)
 * with the categorized citizen feedback.
 * 
 * This is a placeholder for integrating with external APIs (e.g., Census, OpenStreetMap)
 * or local datasets.
 */
export const getIntegratedData = async (req, res) => {
  try {
    const { constituency_id } = req.query;

    if (!constituency_id) {
      return res.status(400).json({ error: 'constituency_id is required' });
    }

    // 1. Fetch categorized suggestions for the constituency
    const suggestionsQuery = `
      SELECT category, COUNT(*) as count 
      FROM suggestions 
      WHERE user_id IN (
        SELECT id FROM users WHERE constituency_id IN (
          SELECT id FROM constituencies WHERE id::text = $1 OR name = $1 OR district = $1
        )
      )
      GROUP BY category
    `;
    const suggestionsResult = await pool.query(suggestionsQuery, [constituency_id]);

    // 2. Mock public dataset integration (e.g., infrastructure gaps)
    // In a real scenario, this would fetch from an external API or a separate table
    const mockPublicData = {
      constituency_id,
      infrastructure_gaps: [
        { type: 'road repair', severity: 'high' },
        { type: 'water supply', severity: 'medium' }
      ],
      demographics: {
        population_density: 'high',
        primary_occupation: 'agriculture'
      }
    };

    res.json({
      suggestions: suggestionsResult.rows,
      public_data: mockPublicData
    });
  } catch (error) {
    console.error('Error fetching integrated data:', error.message);
    res.status(500).json({ error: 'Failed to retrieve integrated data' });
  }
};
