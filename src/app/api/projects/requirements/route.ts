import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    let queryStr = `
      SELECT 
        r.id, r.project_id as "projectId", r.material_id as "materialId", 
        r.estimated_qty as "estimatedQty", r.notes,
        p.project_name as "projectName",
        m.material_code as "materialCode", m.material_name as "materialName", 
        m.unit, m.category
      FROM project_requirements r
      JOIN projects p ON r.project_id = p.id
      JOIN material_masters m ON r.material_id = m.id
    `;
    
    const queryParams: any[] = [];

    if (projectId) {
      queryStr += ` WHERE r.project_id = $1`;
      queryParams.push(projectId);
    }

    queryStr += ' ORDER BY r.created_at DESC';
    
    const res = await pool.query(queryStr, queryParams);

    return NextResponse.json({ data: res.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching project requirements:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, materialId, estimatedQty, notes } = body;

    if (!projectId || !materialId || !estimatedQty) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();

    const res = await pool.query(`
      INSERT INTO project_requirements (id, project_id, material_id, estimated_qty, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, projectId, materialId, parseInt(estimatedQty), notes || '']);

    return NextResponse.json({ data: res.rows[0], message: 'Requirement added' }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding project requirement:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, estimatedQty, notes } = body;

    if (!id || !estimatedQty) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const res = await pool.query(`
      UPDATE project_requirements 
      SET estimated_qty = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [parseInt(estimatedQty), notes || '', id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ data: res.rows[0], message: 'Requirement updated' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project requirement:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing requirement ID' }, { status: 400 });
    }

    const res = await pool.query(`DELETE FROM project_requirements WHERE id = $1 RETURNING id`, [id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Requirement deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting project requirement:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
