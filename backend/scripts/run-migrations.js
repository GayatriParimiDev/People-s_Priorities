import pool from '../src/db.js';

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Alter users table
    console.log('Altering users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS constituency_type TEXT CHECK (constituency_type IN ('mp', 'mla')),
      ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CITIZEN';
    `);
    
    // 2. Alter constituencies table
    console.log('Altering constituencies table...');
    await client.query(`
      ALTER TABLE constituencies 
      ADD COLUMN IF NOT EXISTS constituency_type TEXT CHECK (constituency_type IN ('mp', 'mla')) DEFAULT 'mla';
    `);

    // 3. Alter suggestions table
    console.log('Altering suggestions table...');
    await client.query(`
      ALTER TABLE suggestions 
      ADD COLUMN IF NOT EXISTS ward_id TEXT,
      ADD COLUMN IF NOT EXISTS cost_estimate NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS beneficiary_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cross_boundary BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS linked_ward_ids TEXT[],
      ADD COLUMN IF NOT EXISTS co_sponsors UUID[];
    `);

    // 4. Create audit_log table
    console.log('Creating audit_log table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
        actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL CHECK (action IN ('approve','reject','request_info','defer','escalate','comment')),
        comment TEXT NOT NULL,
        status_before TEXT,
        status_after TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 5. Create fund_ledger table
    console.log('Creating fund_ledger table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
        total_fund NUMERIC NOT NULL DEFAULT 50000000,
        committed NUMERIC NOT NULL DEFAULT 0,
        remaining NUMERIC NOT NULL DEFAULT 50000000,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 6. Create manifesto_priorities table
    console.log('Creating manifesto_priorities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS manifesto_priorities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mp_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        stated_weight_percent NUMERIC NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 7. Create constituency_hierarchy table
    console.log('Creating constituency_hierarchy table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS constituency_hierarchy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lok_sabha_constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
        assembly_segment_id UUID REFERENCES constituencies(id) ON DELETE CASCADE
      );
    `);

    await client.query('COMMIT');
    console.log('🎉 Migrations successfully completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
