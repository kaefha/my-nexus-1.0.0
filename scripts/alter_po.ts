import { pool } from '../src/lib/db';

async function main() {
  try {
    await pool.query(`
      ALTER TABLE purchase_orders 
      ADD COLUMN approver_id UUID REFERENCES users(id);
    `);
    console.log("Column added successfully");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    process.exit(0);
  }
}

main();
