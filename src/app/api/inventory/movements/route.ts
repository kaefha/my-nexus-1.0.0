import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    let queryStr = `
      SELECT t.id, t.transaction_type, t.quantity, t.reference_id, t.notes, t.created_at,
             m.material_name, m.material_code, m.unit,
             w.name as warehouse_name
      FROM inventory_transactions t
      JOIN material_masters m ON t.material_id = m.id
      JOIN warehouses w ON t.warehouse_id = w.id
    `;
    const queryParams: any[] = [];

    if (search) {
      queryStr += ` WHERE m.material_name ILIKE $1 OR m.material_code ILIKE $1 OR t.transaction_type ILIKE $1`;
      queryParams.push(`%${search}%`);
    }

    queryStr += ` ORDER BY t.created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const res = await pool.query(queryStr, queryParams);

    // Map fields
    const data = res.rows.map(row => ({
      id: row.id,
      transactionType: row.transaction_type,
      quantity: row.quantity,
      referenceId: row.reference_id,
      notes: row.notes,
      createdAt: row.created_at,
      material: {
        materialName: row.material_name,
        materialCode: row.material_code,
        unit: row.unit
      },
      warehouse: {
        warehouseName: row.warehouse_name
      }
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
