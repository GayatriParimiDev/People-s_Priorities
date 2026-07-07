import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection Pool Configuration
// Neon DB requires SSL connections. In node-postgres, we pass an ssl object.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: {
    rejectUnauthorized: true
  }
});

// Test DB Connection immediately on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('⚠️  Database Connection Error:', err.message);
  } else {
    console.log('✅ Connected to Neon PostgreSQL DB at:', res.rows[0].now);
  }
});

export default pool;
