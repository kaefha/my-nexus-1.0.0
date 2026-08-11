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
      const vendorCode = item['Vendor Code'] || item['Code'];
      const name = item['Vendor Name'] || item['Name'];
      const contactPerson = item['Contact Person'] || '';
      const email = item['Email'] || '';
      const phone = item['Phone'] || '';
      const address = item['Address'] || '';
      const isActive = item['Status'] === 'Inactive' ? false : true;

      if (!vendorCode || !name) continue;

      const existing = await pool.query('SELECT id FROM vendors WHERE vendor_code = $1', [vendorCode]);
      if (existing.rowCount === 0) {
        const id = generateId();
        await pool.query(`
          INSERT INTO vendors (id, vendor_code, name, contact_person, email, phone, address, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, vendorCode, name, contactPerson, email, phone, address, isActive]);
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
      const res = await pool.query('SELECT * FROM vendors ORDER BY vendor_code ASC');
      wsData = res.rows.map(row => ({
        'Vendor Code': row.vendor_code,
        'Vendor Name': row.name,
        'Contact Person': row.contact_person,
        'Email': row.email,
        'Phone': row.phone,
        'Address': row.address,
        'Status': row.is_active ? 'Active' : 'Inactive'
      }));
    } else {
      wsData = [{
        'Vendor Code': 'VND-001',
        'Vendor Name': 'PT Example Vendor',
        'Contact Person': 'Budi Santoso',
        'Email': 'contact@example.com',
        'Phone': '021-1234567',
        'Address': 'Jl. Example No. 123',
        'Status': 'Active'
      }];
    }

    const ws = xlsx.utils.json_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, 'Vendors');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = action === 'template' ? 'Vendors_Template.xlsx' : 'Vendors_Export.xlsx';

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
