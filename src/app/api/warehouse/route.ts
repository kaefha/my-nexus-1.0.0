import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    
    let queryStr = 'SELECT * FROM warehouses';
    const queryParams: any[] = [];

    if (search) {
      queryStr += ` WHERE LOWER(code) LIKE $1 OR LOWER(name) LIKE $1 OR LOWER(location) LIKE $1`;
      queryParams.push(`%${search}%`);
    }

    queryStr += ' ORDER BY name ASC';
    
    const res = await pool.query(queryStr, queryParams);
    
    const warehouses = res.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      location: row.location,
      coordinates: row.coordinates,
      evidence: row.evidence,
      type: row.type,
      capacity: row.capacity,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ data: warehouses }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, location, coordinates, evidence, type, capacity } = body;

    if (!code || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();

    const res = await pool.query(`
      INSERT INTO warehouses (id, code, name, location, coordinates, evidence, type, capacity, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, code, name, location || '', coordinates || '', evidence || null, type || 'MAIN', capacity || '', 'ACTIVE']);

    const row = res.rows[0];
    const warehouse = {
      id: row.id,
      code: row.code,
      name: row.name,
      location: row.location,
      coordinates: row.coordinates,
      evidence: row.evidence,
      type: row.type,
      capacity: row.capacity,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({ data: warehouse, message: 'Warehouse created' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, location, coordinates, evidence, type, capacity, status } = body;

    if (!id || !code || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const res = await pool.query(`
      UPDATE warehouses 
      SET code = $1, name = $2, location = $3, coordinates = $4, evidence = $5, type = $6, 
          capacity = $7, status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [code, name, location || '', coordinates || '', evidence || null, type || 'MAIN', capacity || '', status || 'ACTIVE', id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ data: res.rows[0], message: 'Warehouse updated' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing warehouse ID' }, { status: 400 });
    }

    const res = await pool.query(`DELETE FROM warehouses WHERE id = $1 RETURNING id`, [id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Warehouse deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
