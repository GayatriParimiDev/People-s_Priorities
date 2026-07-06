import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Mount Modular Authentication Router
app.use('/api/auth', authRouter);

// Base Route
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to the People's Priorities API!",
    status: "Healthy"
  });
});

// Health check endpoint that verifies DB connection status
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'UP',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Example route: Get list of suggestions (referencing schema.sql)
app.get('/api/suggestions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suggestions ORDER BY created_at DESC LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
    res.status(500).json({ error: 'Failed to retrieve suggestions' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
