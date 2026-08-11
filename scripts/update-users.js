const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const updateUsers = async () => {
  console.log('Connecting to PostgreSQL to update users...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add password column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'password123';
    `);

    // We will clear existing users and any dependent data via CASCADE
    await client.query(`TRUNCATE TABLE users CASCADE;`);

    const usersToInsert = [
      { name: 'Admin', email: 'admin@mai.co.id', role: 'ADMIN' },
      { name: 'Site Manager', email: 'sitemanager@mai.co.id', role: 'SITE_MANAGER' },
      { name: 'Finance', email: 'finance@mai.co.id', role: 'FINANCE' },
      { name: 'Logistics', email: 'logistic@mai.co.id', role: 'LOGISTICS' },
      { name: 'Procurement', email: 'procurement@mai.co.id', role: 'PROCUREMENT' },
      { name: 'Project Manager', email: 'projectmanager@mai.co.id', role: 'PROJECT_MANAGER' }
    ];

    for (const u of usersToInsert) {
      await client.query(
        'INSERT INTO users (id, name, email, role, password, is_active) VALUES ($1, $2, $3, $4, $5, true)',
        [uuidv4(), u.name, u.email, u.role, 'password123']
      );
    }

    await client.query('COMMIT');
    console.log('Users updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to update users', err);
  } finally {
    client.release();
    pool.end();
  }
};

updateUsers();
