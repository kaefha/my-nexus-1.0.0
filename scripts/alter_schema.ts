import { pool } from '../src/lib/db';

async function main() {
  try {
    // Inventory Transactions
    await pool.query(`ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS do_number VARCHAR(100);`);
    await pool.query(`ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS evidence_photo_url TEXT;`);
    
    // RFCs
    await pool.query(`ALTER TABLE rfcs ADD COLUMN IF NOT EXISTS site_approver_id UUID REFERENCES users(id);`);
    await pool.query(`ALTER TABLE rfcs ADD COLUMN IF NOT EXISTS finance_approver_id UUID REFERENCES users(id);`);
    
    console.log("Schema changes applied successfully");
  } catch (error) {
    console.error("Error altering tables:", error);
  } finally {
    process.exit(0);
  }
}

main();
