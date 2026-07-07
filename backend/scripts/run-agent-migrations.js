import pool from '../src/db.js';

async function runAgentMigrations() {
  console.log('🚀 Running Agentic AI Expansion database migrations...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create agent_recommendations table
    console.log('Creating agent_recommendations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
        recommendation TEXT NOT NULL, -- 'approve', 'reject', 'defer'
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // 2. Create meeting_briefs table
    console.log('Creating meeting_briefs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS meeting_briefs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
        meeting_title TEXT NOT NULL,
        scheduled_time TIMESTAMPTZ NOT NULL,
        briefing TEXT NOT NULL, -- JSON/Markdown string detailing top 5 unresolved, citizen Q&As, talking points
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 3. Create budget_optimizations table
    console.log('Creating budget_optimizations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS budget_optimizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
        recommended_split JSONB NOT NULL, -- Details of optimized proposal allocations
        total_budget NUMERIC NOT NULL,
        allocated_amount NUMERIC NOT NULL,
        coverage_percentage NUMERIC NOT NULL,
        reasoning TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 4. Create anomaly_flags table
    console.log('Creating anomaly_flags table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS anomaly_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
        flag_reason TEXT NOT NULL,
        evidence JSONB NOT NULL, -- Details of coordinated patterns
        is_dismissed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 5. Create scheme_matches table
    console.log('Creating scheme_matches table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheme_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
        scheme_name TEXT NOT NULL,
        fit_type TEXT NOT NULL, -- 'exact' or 'partial'
        eligibility_criteria TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 6. Create quarterly_reports table
    console.log('Creating quarterly_reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quarterly_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
        quarter_name TEXT NOT NULL, -- e.g. '2026-Q2'
        report_content JSONB NOT NULL, -- Draft report details, manifesto alignment checks, imbalances
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 7. Create civic_nudges table
    console.log('Creating civic_nudges table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS civic_nudges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nudge_type TEXT NOT NULL,
        message TEXT NOT NULL,
        suggested_proposal_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await client.query('COMMIT');
    console.log('🎉 Agentic migrations successfully completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Agentic migration failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runAgentMigrations();
