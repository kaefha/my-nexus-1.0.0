const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const setPasswords = async () => {
  console.log('Connecting to PostgreSQL to update passwords...');
  const client = await pool.connect();
  
  try {
    await client.query("UPDATE users SET password = '123'");
    console.log('Passwords updated successfully to 123.');
  } catch (err) {
    console.error('Failed to update passwords', err);
  } finally {
    client.release();
    pool.end();
  }
};

setPasswords();
