import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doId } = await params;
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!doId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Missing coordinates or ID' }, { status: 400 });
    }

    const id = generateId();

    // Verify DO exists
    const doCheck = await pool.query('SELECT id FROM delivery_orders WHERE id = $1', [doId]);
    if (doCheck.rowCount === 0) {
      return NextResponse.json({ message: 'Delivery Order not found' }, { status: 404 });
    }

    await pool.query(`
      INSERT INTO delivery_tracking_logs (id, delivery_order_id, latitude, longitude)
      VALUES ($1, $2, $3, $4)
    `, [id, doId, latitude, longitude]);

    return NextResponse.json({ message: 'Location recorded successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording location:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doId } = await params;
    
    // Fetch latest location
    const result = await pool.query(`
      SELECT latitude, longitude, created_at 
      FROM delivery_tracking_logs 
      WHERE delivery_order_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [doId]);

    if (result.rowCount === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
