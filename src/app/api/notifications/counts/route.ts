import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // 1. Count pending RFC approvals
    const rfcRes = await client.query(`
      SELECT COUNT(*) as count 
      FROM rfcs 
      WHERE status IN ('WAITING_SITE_APPROVAL', 'WAITING_FINANCE_APPROVAL')
    `);
    const rfcApprovals = parseInt(rfcRes.rows[0].count, 10);

    // 2. Count pending POs (draft or waiting approval)
    // Assuming active POs are anything not COMPLETED, but for notifications let's just count 'WAITING_APPROVAL' or 'DRAFT'
    // Actually, 'WAITING_APPROVAL' is the most accurate actionable item
    const poRes = await client.query(`
      SELECT COUNT(*) as count 
      FROM purchase_orders 
      WHERE status = 'WAITING_APPROVAL'
    `);
    const poApprovals = parseInt(poRes.rows[0].count, 10);

    // 3. Count ready Material Receives (DOs that are delivered)
    const doRes = await client.query(`
      SELECT COUNT(*) as count 
      FROM delivery_orders 
      WHERE status IN ('DELIVERED', 'SELESAI')
    `);
    const materialReceives = parseInt(doRes.rows[0].count, 10);

    client.release();

    return NextResponse.json({
      data: {
        rfcApprovals,
        poApprovals,
        materialReceives
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
