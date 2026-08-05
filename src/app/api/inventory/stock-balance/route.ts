import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    
    let queryStr = `
      SELECT 
        s.id, 
        s.quantity as "availableStock", 
        0 as "reservedStock",
        m.minimum_stock as "minimumStock",
        m.material_name as "materialName",
        m.material_code as "materialCode",
        m.unit,
        w.name as "warehouseName"
      FROM inventory_stocks s
      JOIN material_masters m ON s.material_id = m.id
      JOIN warehouses w ON s.warehouse_id = w.id
    `;
    const queryParams: any[] = [];
    
    if (search) {
      queryStr += ` WHERE LOWER(m.material_name) LIKE $1 OR LOWER(m.material_code) LIKE $1`;
      queryParams.push(`%${search}%`);
    }
    
    queryStr += ' ORDER BY m.material_name ASC';
    
    const res = await pool.query(queryStr, queryParams);
    
    const data = res.rows.map((row: any) => ({
      id: row.id,
      availableStock: row.availableStock,
      reservedStock: row.reservedStock,
      minimumStock: row.minimumStock || 0,
      material: {
        materialName: row.materialName,
        materialCode: row.materialCode,
        unit: row.unit || 'pcs'
      },
      warehouse: {
        name: row.warehouseName
      }
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching stock balance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
