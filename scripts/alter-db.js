const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('Adding coordinates column to warehouses...');
    await pool.query('ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS coordinates VARCHAR(255);');
    console.log('Success!');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await pool.end();
  }
}

main();
