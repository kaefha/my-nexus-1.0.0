const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const listUsers = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT name, email, role, password FROM users ORDER BY name');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
};

listUsers();
