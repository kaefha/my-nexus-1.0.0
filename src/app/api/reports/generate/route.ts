import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof val === 'string') {
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return val !== null && val !== undefined ? val : '';
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let queryStr = '';
    let filename = 'report.csv';

    switch(type) {
      case 'inventory':
        queryStr = `
          SELECT material_code as "Material Code", material_name as "Material Name", category as "Category", 
                 unit as "Unit", minimum_stock as "Min Stock", is_active as "Status"
          FROM material_masters
          ORDER BY material_code ASC
        `;
        filename = 'Inventory_Report.csv';
        break;
      case 'rfc':
        queryStr = `
          SELECT r.rfc_number as "RFC Number", p.project_name as "Project", 
                 u.name as "Requestor", r.location as "Location", r.status as "Status", 
                 r.created_at as "Request Date"
          FROM rfcs r
          LEFT JOIN projects p ON r.project_id = p.id
          LEFT JOIN users u ON r.requestor_id = u.id
          ORDER BY r.created_at DESC
        `;
        filename = 'RFC_Report.csv';
        break;
      case 'procurement':
        queryStr = `
          SELECT po_number as "PO Number", vendor as "Vendor", 
                 expected_date as "Expected Date", status as "Status", items_count as "Total Items"
          FROM purchase_orders
          ORDER BY created_at DESC
        `;
        filename = 'Procurement_Report.csv';
        break;
      case 'warehouse':
        queryStr = `
          SELECT code as "Warehouse Code", name as "Warehouse Name", location as "Location", 
                 type as "Type", capacity as "Capacity", status as "Status"
          FROM warehouses
          ORDER BY code ASC
        `;
        filename = 'Warehouse_Report.csv';
        break;
      case 'project_consumption':
        queryStr = `
          SELECT p.project_name as "Project Name", m.material_name as "Material", 
                 req.estimated_qty as "Estimated Qty", m.unit as "Unit", 
                 req.notes as "Notes", p.status as "Project Status"
          FROM project_requirements req
          JOIN projects p ON req.project_id = p.id
          JOIN material_masters m ON req.material_id = m.id
          ORDER BY p.project_name ASC, m.material_name ASC
        `;
        filename = 'Project_Consumption_Report.csv';
        break;
      default:
        return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
    }

    const res = await pool.query(queryStr);
    
    if (res.rows.length === 0) {
      // Return empty CSV with headers if possible, but we don't have headers without rows
      // So we'll just return a single line indicating no data
      const emptyCsv = "No data available for this report.";
      return new NextResponse(emptyCsv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    const csvContent = convertToCSV(res.rows);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
