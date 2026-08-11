import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const res = await pool.query(`
      SELECT d.*, 
             p.project_name, p.customer, p.pic, p.whatsapp_number,
             r.rfc_number, po.po_number, po.vendor,
             w.name as warehouse_name,
             w.coordinates as warehouse_coords
      FROM delivery_orders d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN rfcs r ON d.rfc_id = r.id
      LEFT JOIN purchase_orders po ON d.po_id = po.id
      LEFT JOIN warehouses w ON d.destination = w.id::varchar
      WHERE d.id = $1
    `, [params.id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ message: 'DO not found' }, { status: 404 });
    }

    const doData = res.rows[0];
    
    const itemsRes = await pool.query(`
      SELECT i.*, m.material_code, m.material_name, m.unit
      FROM delivery_order_items i
      LEFT JOIN material_masters m ON i.material_id = m.id
      WHERE i.delivery_order_id = $1
    `, [params.id]);

    let destinationLat = null;
    let destinationLng = null;
    if (doData.warehouse_coords) {
      const parts = doData.warehouse_coords.split(',');
      if (parts.length === 2) {
        destinationLat = parseFloat(parts[0].trim());
        destinationLng = parseFloat(parts[1].trim());
      }
    }

    return NextResponse.json({
      data: {
        id: doData.id,
        doNumber: doData.do_number,
        origin: doData.origin,
        originLat: doData.origin_lat,
        originLng: doData.origin_lng,
        destination: doData.warehouse_name || doData.destination,
        destinationLat: destinationLat,
        destinationLng: destinationLng,
        shippingDate: doData.shipping_date,
        notes: doData.notes,
        status: doData.status,
        evidence: doData.evidence,
        project: doData.project_name ? { projectName: doData.project_name, customer: doData.customer, pic: doData.pic, phoneNumber: doData.whatsapp_number } : null,
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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { doNumber, origin, originLat, originLng, destination, poId, shippingDate, notes } = body;

    if (!doNumber || !origin || !destination || !poId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await pool.query(
      `UPDATE delivery_orders 
       SET do_number = $1, origin = $2, destination = $3, po_id = $4, shipping_date = $5, notes = $6, origin_lat = $7, origin_lng = $8, updated_at = NOW()
       WHERE id = $9`,
      [doNumber, origin, destination, poId, shippingDate || null, notes || '', originLat || null, originLng || null, params.id]
    );

    return NextResponse.json({ message: 'DO updated' }, { status: 200 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'DO Number already exists' }, { status: 400 });
    }
    console.error('Error updating DO:', error);
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
