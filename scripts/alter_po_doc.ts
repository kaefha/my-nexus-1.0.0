import { pool } from '../src/lib/db';

async function main() {
  try {
    await pool.query(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS transporter VARCHAR(255),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS deliver_to VARCHAR(255),
      ADD COLUMN IF NOT EXISTS signed_document_url TEXT;
    `);
    console.log("Columns added successfully to purchase_orders");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    process.exit(0);
  }
}

main();
