require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const queryStr = `
      SELECT 
        MIN(s.id) as id, 
        SUM(s.quantity) as quantity, 
        MAX(s.last_updated) as "lastUpdated",
        w.name as "warehouseName",
        w.code as "warehouseCode",
        m.material_code as "materialCode",
        m.material_name as "materialName",
        m.category
      FROM inventory_stocks s
      JOIN warehouses w ON s.warehouse_id = w.id
      JOIN material_masters m ON s.material_id = m.id
      WHERE 1=1
      GROUP BY w.name, w.code, m.material_code, m.material_name, m.category
      ORDER BY w.name ASC, m.material_name ASC
  `;

  try {
    const res = await pool.query(queryStr);
    console.log(`Success: ${res.rowCount} rows`);
  } catch (err) {
    console.error("SQL Error:", err.message);
  } finally {
    await pool.end();
  }
}

check();
