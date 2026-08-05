const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function run() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
  console.log(res.rows);
  pool.end();
}
run();
