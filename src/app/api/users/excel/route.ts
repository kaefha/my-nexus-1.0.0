import { NextRequest, NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';
import * as xlsx from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ message: 'Empty excel file' }, { status: 400 });
    }

    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let count = 0;
    
    for (const item of data as any[]) {
      const email = item['Email'];
      const name = item['Name'];
      const role = item['Role'] || 'USER';
      const isActive = item['Status'] === 'Inactive' ? false : true;

      if (!email || !name) continue;

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rowCount === 0) {
        const id = generateId();
        await pool.query(`
          INSERT INTO users (id, email, name, role, is_active)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, email, name, role, isActive]);
        count++;
      }
    }

    return NextResponse.json({ message: 'Success', count }, { status: 200 });
  } catch (error: any) {
    console.error('Excel import error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    const wb = xlsx.utils.book_new();
    let wsData: any[] = [];

    if (action === 'export') {
      const res = await pool.query('SELECT * FROM users ORDER BY name ASC');
      wsData = res.rows.map(row => ({
        'Name': row.name,
        'Email': row.email,
        'Role': row.role,
        'Status': row.is_active ? 'Active' : 'Inactive'
      }));
    } else {
      wsData = [{
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Role': 'USER',
        'Status': 'Active'
      }];
    }

    const ws = xlsx.utils.json_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = action === 'template' ? 'Users_Template.xlsx' : 'Users_Export.xlsx';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
