import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    
    let queryStr = 'SELECT * FROM transfers';
    const queryParams: any[] = [];

    if (search) {
      queryStr += ` WHERE LOWER(transfer_number) LIKE $1 OR LOWER(from_location) LIKE $1 OR LOWER(to_location) LIKE $1`;
      queryParams.push(`%${search}%`);
    }

    queryStr += ' ORDER BY created_at DESC';
    
    const res = await pool.query(queryStr, queryParams);
    
    const transfers = res.rows.map((row: any) => ({
      id: row.id,
      transferNumber: row.transfer_number,
      fromLocation: row.from_location,
      toLocation: row.to_location,
      transferDate: row.transfer_date,
      reason: row.reason,
      status: row.status,
      pic: row.pic,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ data: transfers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transferNumber, fromLocation, toLocation, transferDate, reason, pic } = body;

    if (!transferNumber || !fromLocation || !toLocation) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();

    const res = await pool.query(`
      INSERT INTO transfers (id, transfer_number, from_location, to_location, transfer_date, reason, status, pic)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, transferNumber, fromLocation, toLocation, transferDate || null, reason || '', 'PENDING', pic || '']);

    const row = res.rows[0];
    const transfer = {
      id: row.id,
      transferNumber: row.transfer_number,
      fromLocation: row.from_location,
      toLocation: row.to_location,
      transferDate: row.transfer_date,
      reason: row.reason,
      status: row.status,
      pic: row.pic,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({ data: transfer, message: 'Transfer created' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transfer:', error);
    if (error.code === '23505') { // Postgres unique_violation
      return NextResponse.json({ message: 'Transfer number already exists. Please use a unique number.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE transfers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Transfer not found' }, { status: 404 });
    }

    return NextResponse.json({ data: res.rows[0], message: 'Status updated' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating transfer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
