import pool from '../src/db.js';

async function addStaffColumns() {
  console.log('Adding staff columns to suggestions table...');
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE suggestions 
      ADD COLUMN IF NOT EXISTS staff_recommendation TEXT,
      ADD COLUMN IF NOT EXISTS staff_notes TEXT;
    `);
    console.log('✅ Staff columns added successfully!');
  } catch (error) {
    console.error('❌ Failed to add staff columns:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addStaffColumns();
