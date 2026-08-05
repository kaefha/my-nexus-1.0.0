const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const seedDb = async () => {
  console.log('Connecting to PostgreSQL to seed data from db.json...');
  
  const client = await pool.connect();
  const dbPath = path.join(__dirname, '..', 'data', 'db.json');
  
  try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(rawData);

    await client.query('BEGIN');

    // Users
    if (db.users) {
      for (const u of db.users) {
        // use uuid for id if it is not valid uuid, but here we just pass it
        // since db.json uses string "1" for Admin User, we need to convert it to UUID or just handle it.
        // For simplicity, we will generate new UUIDs if the current ID is not a valid UUID format.
        const id = u.id.length === 36 ? u.id : '00000000-0000-0000-0000-000000000001';
        await client.query(`
          INSERT INTO users (id, name, email, role, is_active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
        `, [id, u.name, u.email, u.role, u.isActive]);
      }
      console.log('Seeded users.');
    }

    // Projects
    if (db.projects) {
      for (const p of db.projects) {
        await client.query(`
          INSERT INTO projects (id, project_name, customer, region, start_date, end_date, pic, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [p.id, p.projectName, p.customer, p.region, p.startDate, p.endDate, p.pic, p.status, p.createdAt, p.updatedAt]);
      }
      console.log('Seeded projects.');
    }

    // Material Masters
    if (db.materialMasters) {
      for (const m of db.materialMasters) {
        await client.query(`
          INSERT INTO material_masters (id, material_code, material_name, category, specification, unit, minimum_stock, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [m.id, m.materialCode, m.materialName, m.category, m.specification, m.unit, m.minimumStock, m.isActive, m.createdAt, m.updatedAt]);
      }
      console.log('Seeded material masters.');
    }

    // Purchase Orders
    if (db.purchaseOrders) {
      for (const po of db.purchaseOrders) {
        await client.query(`
          INSERT INTO purchase_orders (id, po_number, vendor, expected_date, notes, status, items_count, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [po.id, po.poNumber, po.vendor, po.expectedDate || null, po.notes, po.status, po.itemsCount, po.createdAt, po.updatedAt]);
      }
      console.log('Seeded purchase orders.');
    }

    // Delivery Orders
    if (db.deliveryOrders) {
      for (const d of db.deliveryOrders) {
        await client.query(`
          INSERT INTO delivery_orders (id, do_number, origin, destination, shipping_date, notes, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [d.id, d.doNumber, d.origin, d.destination, d.shippingDate || null, d.notes, d.status, d.createdAt, d.updatedAt]);
      }
      console.log('Seeded delivery orders.');
    }

    // Warehouses
    if (db.warehouses) {
      for (const w of db.warehouses) {
        await client.query(`
          INSERT INTO warehouses (id, code, name, location, type, capacity, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [w.id, w.code, w.name, w.location, w.type, w.capacity, w.status, w.createdAt, w.updatedAt]);
      }
      console.log('Seeded warehouses.');
    }

    // Transfers
    if (db.transfers) {
      for (const t of db.transfers) {
        await client.query(`
          INSERT INTO transfers (id, transfer_number, from_location, to_location, transfer_date, reason, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [t.id, t.transferNumber, t.fromLocation, t.toLocation, t.transferDate || null, t.reason, t.status, t.createdAt, t.updatedAt]);
      }
      console.log('Seeded transfers.');
    }

    await client.query('COMMIT');
    console.log('Successfully seeded database from db.json');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed database:', error);
  } finally {
    client.release();
    pool.end();
  }
};

seedDb();
