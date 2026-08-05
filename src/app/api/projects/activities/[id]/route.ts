import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const { id } = params;

    const res = await pool.query(`
      SELECT 
        id, 
        project_id as "projectId", 
        action, 
        details, 
        created_at as "createdAt"
      FROM project_activities
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [id]);

    return NextResponse.json({ data: res.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching project activities:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
