import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        w.id,
        w.name,
        w.location,
        COUNT(DISTINCT s.material_id) as total_items,
        COALESCE(SUM(s.quantity), 0) as total_stock
      FROM warehouses w
      LEFT JOIN inventory_stocks s ON w.id = s.warehouse_id
      WHERE w.status = 'ACTIVE'
      GROUP BY w.id, w.name, w.location
      ORDER BY total_stock DESC, w.name ASC
      LIMIT 5
    `);

    const data = res.rows.map(row => ({
      id: row.id,
      name: row.name,
      location: row.location,
      totalItems: parseInt(row.total_items, 10) || 0,
      totalStock: parseInt(row.total_stock, 10) || 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard warehouses:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    client.release();
  }
}
