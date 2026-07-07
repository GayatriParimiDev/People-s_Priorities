import pool from '../db.js';

export const getSuggestions = async (req, res) => {
  try {
    const { category, status, constituency_id } = req.query;
    let query = `
      SELECT s.*, a.urgency, a.priority_score 
      FROM suggestions s
      LEFT JOIN ai_analysis a ON s.id = a.suggestion_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND s.category = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }
    if (constituency_id) {
      params.push(constituency_id);
      query += ` AND s.user_id IN (
        SELECT id FROM users WHERE constituency_id IN (
          SELECT id FROM constituencies WHERE id::text = $${params.length} OR name = $${params.length} OR district = $${params.length}
        )
      )`;
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
    res.status(500).json({ error: 'Failed to retrieve suggestions' });
  }
};

export const getSuggestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM suggestions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching suggestion:', error.message);
    res.status(500).json({ error: 'Failed to retrieve suggestion' });
  }
};

export const updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    await pool.query('UPDATE suggestions SET status = $1 WHERE id = $2', [status, id]);
    await pool.query('INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, $2, $3)', [id, status, notes]);
    
    res.json({ message: 'Suggestion status updated successfully' });
  } catch (error) {
    console.error('Error updating suggestion:', error.message);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
};
