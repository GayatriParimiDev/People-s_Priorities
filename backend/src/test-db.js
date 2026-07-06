import pool from './db.js';

async function testConnection() {
  console.log('🔍 Testing Neon DB Connection and Schema...\n');
  
  // List of tables expected from schema.sql analysis
  const expectedTables = [
    'users',
    'constituencies',
    'suggestions',
    'ai_analysis',
    'suggestion_timeline',
    'suggestion_supporters',
    'notifications',
    'constituency_insights',
    'impact_metrics'
  ];

  try {
    // 1. Test basic connectivity
    const timeRes = await pool.query('SELECT NOW() as current_time');
    console.log(`✅ Connection successful! Server time: ${timeRes.rows[0].current_time}`);

    // 2. Fetch existing tables in the public schema
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesRes.rows.map(row => row.table_name.toLowerCase());
    
    console.log('\n📊 Schema Table Verification:');
    let allFound = true;
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`   [✓] Table '${table}' exists`);
      } else {
        console.log(`   [✗] Table '${table}' is missing!`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log('\n🎉 Database connection and schema verification completed successfully!');
    } else {
      console.log('\n⚠️  Database connected, but some tables from schema.sql are missing.');
      console.log('   Please execute schema.sql in your Neon DB console to initialize them.');
    }

  } catch (error) {
    console.error('\n❌ Database Connection Failed:', error.message);
    console.error('   Please check that the DATABASE_URL in your backend/.env file is correct.');
  } finally {
    // Close pool connection to exit the process
    await pool.end();
  }
}

testConnection();
