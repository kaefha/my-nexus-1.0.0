import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const type = searchParams.get('type');
    
    let queryStr = `
      SELECT d.*, 
             p.project_name,
             r.rfc_number,
             po.po_number,
             (SELECT COUNT(*) FROM delivery_order_items i WHERE i.delivery_order_id = d.id) as items_count
      FROM delivery_orders d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN rfcs r ON d.rfc_id = r.id
      LEFT JOIN purchase_orders po ON d.po_id = po.id
    `;
    const queryParams: any[] = [];
    const conditions = [];

    if (search) {
      conditions.push(`(LOWER(d.do_number) LIKE $1 OR LOWER(p.project_name) LIKE $1 OR LOWER(r.rfc_number) LIKE $1 OR LOWER(po.po_number) LIKE $1)`);
      queryParams.push(`%${search}%`);
    }

    if (type === 'history') {
      conditions.push(`d.status IN ('DELIVERED', 'SELESAI', 'COMPLETED')`);
    } else if (type === 'active') {
      conditions.push(`d.status NOT IN ('DELIVERED', 'SELESAI', 'COMPLETED')`);
    }

    if (conditions.length > 0) {
      queryStr += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryStr += ' ORDER BY d.created_at DESC';
    
    const res = await pool.query(queryStr, queryParams);
    
    const dos = res.rows.map((row: any) => ({
      id: row.id,
      doNumber: row.do_number,
      origin: row.origin,
      destination: row.destination,
      shippingDate: row.shipping_date,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      project: row.project_name ? { projectName: row.project_name } : null,
      rfc: row.rfc_number ? { rfcNumber: row.rfc_number } : null,
      po: row.po_number ? { poNumber: row.po_number } : null,
      evidence: row.evidence,
      _count: {
        items: parseInt(row.items_count || '0', 10)
      }
    }));

    return NextResponse.json({ data: dos }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching DOs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doNumber, origin, destination, poId, shippingDate, notes } = body;

    if (!doNumber || !origin || !destination || !poId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Fetch the PO to get the rfc_id
      const poRes = await client.query('SELECT rfc_id FROM purchase_orders WHERE id = $1', [poId]);
      if (poRes.rows.length === 0) {
        throw new Error('Purchase Order not found');
      }
      const rfcId = poRes.rows[0].rfc_id;
      let projectId = null;

      if (rfcId) {
        // Fetch the RFC to get the project
        const rfcRes = await client.query('SELECT project_id FROM rfcs WHERE id = $1', [rfcId]);
        if (rfcRes.rows.length > 0) {
          projectId = rfcRes.rows[0].project_id;
        }
      }

      await client.query(`
        INSERT INTO delivery_orders (id, do_number, origin, destination, project_id, rfc_id, po_id, shipping_date, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [id, doNumber, origin, destination, projectId, rfcId, poId, shippingDate || null, notes || '', 'WAITING']);

      // Copy items from PO to DO
      const itemsRes = await client.query('SELECT material_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1', [poId]);
      
      for (const item of itemsRes.rows) {
        const itemId = generateId();
        await client.query(`
          INSERT INTO delivery_order_items (id, delivery_order_id, material_id, quantity)
          VALUES ($1, $2, $3, $4)
        `, [itemId, id, item.material_id, item.quantity]);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Fetch the inserted DO to return
    const res = await pool.query('SELECT * FROM delivery_orders WHERE id = $1', [id]);
    const row = res.rows[0];
    const deliveryOrder = {
      id: row.id,
      doNumber: row.do_number,
      origin: row.origin,
      destination: row.destination,
      shippingDate: row.shipping_date,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({ data: deliveryOrder, message: 'DO created' }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'DO Number already exists' }, { status: 400 });
    }
    console.error('Error creating DO:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
