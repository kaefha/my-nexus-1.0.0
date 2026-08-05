import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rfcsRes = await pool.query(`
      SELECT r.*, p.project_name
      FROM rfcs r
      LEFT JOIN projects p ON r.project_id = p.id
      ORDER BY r.updated_at DESC
      LIMIT 5
    `);

    const movementsRes = await pool.query(`
      SELECT t.* 
      FROM transfers t
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    const recentRfcs = rfcsRes.rows.map(row => ({
      id: row.id,
      rfcNumber: row.rfc_number,
      status: row.status,
      updatedAt: row.updated_at,
      project: { projectName: row.project_name }
    }));

    const recentMovements = movementsRes.rows.map(row => ({
      id: row.id,
      transferNumber: row.transfer_number,
      fromLocation: row.from_location,
      toLocation: row.to_location,
      status: row.status,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    }));

    return NextResponse.json({
      recentRfcs,
      recentMovements
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
