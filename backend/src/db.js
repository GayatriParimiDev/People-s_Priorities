import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection Pool Configuration
// Neon DB requires SSL connections. In node-postgres, we pass an ssl object.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // rejectUnauthorized is set to false to accommodate environments 
    // that don't have the certificate authority locally, but you can configure
    // this with certificates in production if needed.
    rejectUnauthorized: false
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
