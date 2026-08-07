import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const res = await pool.query(`
      SELECT d.*, 
             p.project_name, p.customer, p.pic, p.phone_number,
             r.rfc_number, po.po_number, po.vendor
      FROM delivery_orders d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN rfcs r ON d.rfc_id = r.id
      LEFT JOIN purchase_orders po ON d.po_id = po.id
      WHERE d.id = $1
    `, [params.id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ message: 'DO not found' }, { status: 404 });
    }

    const doData = res.rows[0];
    
    const itemsRes = await pool.query(`
      SELECT i.*, m.material_code, m.material_name, m.unit
      FROM delivery_order_items i
      LEFT JOIN materials m ON i.material_id = m.id
      WHERE i.delivery_order_id = $1
    `, [params.id]);

    return NextResponse.json({
      data: {
        id: doData.id,
        doNumber: doData.do_number,
        origin: doData.origin,
        destination: doData.destination,
        shippingDate: doData.shipping_date,
        notes: doData.notes,
        status: doData.status,
        evidence: doData.evidence,
        project: doData.project_name ? { projectName: doData.project_name, customer: doData.customer, pic: doData.pic, phoneNumber: doData.phone_number } : null,
        rfc: doData.rfc_number ? { rfcNumber: doData.rfc_number } : null,
        po: doData.po_number ? { poNumber: doData.po_number, vendor: doData.vendor } : null,
        items: itemsRes.rows.map(item => ({
          id: item.id,
          materialId: item.material_id,
          quantity: item.quantity,
          materialCode: item.material_code,
          materialName: item.material_name,
          unit: item.unit
        }))
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching DO details:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { status, evidence } = body;

    if (evidence) {
      await pool.query('UPDATE delivery_orders SET status = $1, evidence = $2 WHERE id = $3', [status || 'DELIVERED', evidence, params.id]);
    } else if (status) {
      await pool.query('UPDATE delivery_orders SET status = $1 WHERE id = $2', [status, params.id]);
    } else {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    return NextResponse.json({ message: 'DO updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating DO:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await pool.query('BEGIN');
    await pool.query('DELETE FROM delivery_order_items WHERE delivery_order_id = $1', [params.id]);
    await pool.query('DELETE FROM delivery_tracking_logs WHERE delivery_order_id = $1', [params.id]);
    await pool.query('DELETE FROM delivery_orders WHERE id = $1', [params.id]);
    await pool.query('COMMIT');
    return NextResponse.json({ message: 'DO deleted' }, { status: 200 });
  } catch (error) {
    try { await pool.query('ROLLBACK'); } catch (e) {}
    console.error('Error deleting DO:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
