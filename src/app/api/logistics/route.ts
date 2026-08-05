import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    
    let queryStr = `
      SELECT d.*, 
             p.project_name,
             r.rfc_number,
             (SELECT COUNT(*) FROM delivery_order_items i WHERE i.delivery_order_id = d.id) as items_count
      FROM delivery_orders d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN rfcs r ON d.rfc_id = r.id
    `;
    const queryParams: any[] = [];

    if (search) {
      queryStr += ` WHERE LOWER(d.do_number) LIKE $1 OR LOWER(p.project_name) LIKE $1 OR LOWER(r.rfc_number) LIKE $1`;
      queryParams.push(`%${search}%`);
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
    const { doNumber, origin, rfcId, shippingDate, notes } = body;

    if (!doNumber || !origin || !rfcId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Fetch the RFC to get the project and items
      const rfcRes = await client.query('SELECT project_id FROM rfcs WHERE id = $1', [rfcId]);
      if (rfcRes.rows.length === 0) {
        throw new Error('RFC not found');
      }
      const projectId = rfcRes.rows[0].project_id;

      await client.query(`
        INSERT INTO delivery_orders (id, do_number, origin, destination, project_id, rfc_id, shipping_date, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, doNumber, origin, 'Project Site', projectId, rfcId, shippingDate || null, notes || '', 'SHIPPED']);

      // Copy items from RFC to DO
      const itemsRes = await client.query('SELECT material_id, request_qty FROM rfc_items WHERE rfc_id = $1', [rfcId]);
      
      for (const item of itemsRes.rows) {
        const itemId = generateId();
        await client.query(`
          INSERT INTO delivery_order_items (id, delivery_order_id, material_id, quantity)
          VALUES ($1, $2, $3, $4)
        `, [itemId, id, item.material_id, item.request_qty]);
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
    console.error('Error creating DO:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
