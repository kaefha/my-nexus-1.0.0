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
      const code = item['Code'];
      const name = item['Name'];
      const location = item['Location'] || '';
      const coordinates = item['Coordinates'] || '';
      const type = item['Type'] || 'MAIN';
      const capacity = parseInt(item['Capacity'] as string) || 0;
      const status = item['Status'] || 'ACTIVE';

      if (!code || !name) continue;

      const existing = await pool.query('SELECT id FROM warehouses WHERE code = $1', [code]);
      if (existing.rowCount === 0) {
        const id = generateId();
        await pool.query(`
          INSERT INTO warehouses (id, code, name, location, coordinates, type, capacity, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, code, name, location, coordinates, type, capacity, status]);
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
      const res = await pool.query('SELECT * FROM warehouses ORDER BY code ASC');
      wsData = res.rows.map(row => ({
        'Code': row.code,
        'Name': row.name,
        'Location': row.location,
        'Coordinates': row.coordinates,
        'Type': row.type,
        'Capacity': row.capacity,
        'Status': row.status
      }));
    } else {
      wsData = [{
        'Code': 'WH-JKT-01',
        'Name': 'Jakarta Main Warehouse',
        'Location': 'Jl. Sudirman No. 123',
        'Coordinates': '-6.2234, 106.8463',
        'Type': 'MAIN',
        'Capacity': 5000,
        'Status': 'ACTIVE'
      }];
    }

    const ws = xlsx.utils.json_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, 'Warehouses');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = action === 'template' ? 'Warehouses_Template.xlsx' : 'Warehouses_Export.xlsx';

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
