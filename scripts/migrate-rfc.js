const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE rfcs ALTER COLUMN location TYPE TEXT;');
    await client.query('ALTER TABLE rfcs ADD COLUMN IF NOT EXISTS request_date TIMESTAMP;');
    await client.query('COMMIT');
    console.log('Migration successful');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed', e);
  } finally {
    client.release();
    pool.end();
  }
}

run();
