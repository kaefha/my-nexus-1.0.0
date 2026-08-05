import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Basic logic for low stock: we assume minimum_stock > 0 and current_stock (if any) is below it
    // For now we just get materials where minimum_stock > 0 as mock
    const res = await pool.query(`
      SELECT * FROM material_masters 
      WHERE minimum_stock > 0 OR category = 'CRITICAL'
      LIMIT 5
    `);

    const lowStockMaterials = res.rows.map(row => ({
      id: row.id,
      code: row.material_code,
      name: row.material_name,
      currentStock: 0, // Mock
      minimumStock: row.minimum_stock,
      status: 'CRITICAL'
    }));

    return NextResponse.json({
      lowStockMaterials
    });
  } catch (error) {
    console.error('Error fetching low stock:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
