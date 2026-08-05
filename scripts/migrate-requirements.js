const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_requirements (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        material_id UUID REFERENCES material_masters(id) ON DELETE CASCADE,
        estimated_qty INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query('COMMIT');
    console.log('project_requirements table created successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating table:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
