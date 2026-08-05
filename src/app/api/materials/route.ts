import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    
    let queryStr = 'SELECT * FROM material_masters';
    const queryParams: any[] = [];

    if (search) {
      queryStr += ` WHERE LOWER(material_code) LIKE $1 OR LOWER(material_name) LIKE $1 OR LOWER(category) LIKE $1`;
      queryParams.push(`%${search}%`);
    }

    queryStr += ' ORDER BY material_name ASC';
    
    const res = await pool.query(queryStr, queryParams);
    
    // Convert snake_case back to camelCase for the frontend if needed
    const materials = res.rows.map((row: any) => ({
      id: row.id,
      materialCode: row.material_code,
      materialName: row.material_name,
      category: row.category,
      specification: row.specification,
      unit: row.unit,
      minimumStock: row.minimum_stock,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ data: materials }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, group, uom, description, category } = body;

    if (!code || !name || !uom) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();
    const materialCode = code;
    const materialName = name;
    const resolvedCategory = group || category || 'STANDARD';
    const specification = description || '';
    const unit = uom;

    const res = await pool.query(`
      INSERT INTO material_masters (id, material_code, material_name, category, specification, unit, minimum_stock, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, materialCode, materialName, resolvedCategory, specification, unit, 0, true]);

    const row = res.rows[0];
    const material = {
      id: row.id,
      materialCode: row.material_code,
      materialName: row.material_name,
      category: row.category,
      specification: row.specification,
      unit: row.unit,
      minimumStock: row.minimum_stock,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({ data: material, message: 'Material created' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating material:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, materialCode, materialName, category, specification, unit, minimumStock, isActive } = body;

    if (!id || !materialCode || !materialName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const res = await pool.query(`
      UPDATE material_masters 
      SET material_code = $1, material_name = $2, category = $3, specification = $4, 
          unit = $5, minimum_stock = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [materialCode, materialName, category || '', specification || '', unit || '', minimumStock || 0, isActive !== undefined ? isActive : true, id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ data: res.rows[0], message: 'Material updated' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing material ID' }, { status: 400 });
    }

    const res = await pool.query(`DELETE FROM material_masters WHERE id = $1 RETURNING id`, [id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Material deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
