import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Fetch PO data
    const poRes = await pool.query(`
      SELECT 
        po.id, 
        po.po_number as "poNumber", 
        po.vendor, 
        po.rfc_id as "rfcId", 
        po.expected_date as "expectedDate", 
        po.notes, 
        po.status, 
        po.items_count as "itemsCount", 
        po.created_at as "createdAt",
        u.name as "approverName",
        u.role as "approverRole"
      FROM purchase_orders po
      LEFT JOIN users u ON po.approver_id = u.id
      WHERE po.id = $1
    `, [id]);
    if (poRes.rows.length === 0) {
      return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
    }
    
    // Fetch PO Items along with material names
    const itemsRes = await pool.query(`
      SELECT 
        poi.id, 
        poi.material_id as "materialId", 
        poi.quantity, 
        poi.unit_price as "unitPrice",
        poi.total_price as "totalPrice",
        poi.notes, 
        m.material_name as "materialName"
      FROM purchase_order_items poi
      LEFT JOIN material_masters m ON poi.material_id = m.id
      WHERE poi.purchase_order_id = $1
    `, [id]);
    
    return NextResponse.json({ 
      data: { 
        ...poRes.rows[0], 
        items: itemsRes.rows 
      } 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching PO details:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
