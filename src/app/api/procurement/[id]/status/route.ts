import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approverId, signedDocumentUrl } = body;

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    // Verify PO exists
    const poCheck = await pool.query('SELECT id FROM purchase_orders WHERE id = $1', [id]);
    if (poCheck.rowCount === 0) {
      return NextResponse.json({ message: 'Purchase Order not found' }, { status: 404 });
    }

    // Build update query dynamically
    let queryStr = 'UPDATE purchase_orders SET status = $1, updated_at = NOW()';
    const sqlParams: any[] = [status];
    let paramIndex = 2;

    if (approverId) {
      queryStr += `, approver_id = $${paramIndex}`;
      sqlParams.push(approverId);
      paramIndex++;
    }

    if (signedDocumentUrl) {
      queryStr += `, signed_document_url = $${paramIndex}`;
      sqlParams.push(signedDocumentUrl);
      paramIndex++;
    }

    queryStr += ` WHERE id = $${paramIndex}`;
    sqlParams.push(id);

    await pool.query(queryStr, sqlParams);

    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating PO status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
