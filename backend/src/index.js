import './env.js'; // MUST be first — loads dotenv before any route module reads process.env
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import authRouter from './routes/auth.js';
import suggestionsRouter from './routes/suggestions.js';
import aiRouter from './routes/ai.js';
import dataIntegrationRouter from './routes/dataIntegration.js';
import rankingRouter from './routes/ranking.js';
import proposalsRouter from './routes/proposals.js';
import ledgerRouter from './routes/ledger.js';
import userRouter from './routes/user.js';
import transcribeRouter from './routes/transcribe.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());

// Security Headers Middleware (SAST compliance for hackathon scanners)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:");
  // Remove Express signature to prevent signature identification
  res.removeHeader('X-Powered-By');
  next();
});

app.use(express.json());

// Mount Modular Routers
app.use('/api/auth', authRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/data-integration', dataIntegrationRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/user', userRouter);
app.use('/api/transcribe', transcribeRouter);

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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the existing process or change the PORT environment variable.`);
    process.exit(1);
  }
});
