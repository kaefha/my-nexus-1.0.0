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
    
    // Process items
    for (const item of data as any[]) {
      // Map columns based on template
      const code = item['Material Code'] || item['Code'];
      const name = item['Material Name'] || item['Name'];
      const category = item['Category'] || item['Group'] || 'STANDARD';
      const uom = item['UOM'] || item['Unit'] || 'Pcs';
      const desc = item['Description'] || item['Specification'] || '';

      if (!code || !name) continue; // Skip invalid rows

      // Check if code exists
      const existing = await pool.query('SELECT id FROM material_masters WHERE material_code = $1', [code]);
      if (existing.rowCount === 0) {
        const id = generateId();
        await pool.query(`
          INSERT INTO material_masters (id, material_code, material_name, category, specification, unit, minimum_stock, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, code, name, category, desc, uom, 0, true]);
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
      const res = await pool.query('SELECT * FROM material_masters ORDER BY material_code ASC');
      wsData = res.rows.map(row => ({
        'Material Code': row.material_code,
        'Material Name': row.material_name,
        'Category': row.category,
        'UOM': row.unit,
        'Description': row.specification
      }));
    } else {
      // Template
      wsData = [{
        'Material Code': 'EXAMPLE-001',
        'Material Name': 'Example Item',
        'Category': 'CABLE',
        'UOM': 'Meter',
        'Description': 'Example description'
      }];
    }

    const ws = xlsx.utils.json_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, 'Materials');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = action === 'template' ? 'Materials_Template.xlsx' : 'Materials_Export.xlsx';

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
