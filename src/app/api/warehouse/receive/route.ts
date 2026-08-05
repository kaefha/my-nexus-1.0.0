import { NextResponse } from 'next/server';
import { pool, generateId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { poId, warehouseId, items } = body;

    if (!poId || !warehouseId || !items || !items.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Verify PO exists
    const poRes = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [poId]);
    if (poRes.rows.length === 0) {
      throw new Error('Purchase Order not found');
    }

    // 2. Process each received item
    for (const item of items) {
      if (!item.materialId || !item.receivedQty || item.receivedQty <= 0) continue;
      
      const qty = parseInt(item.receivedQty, 10);

      // Check if stock exists in warehouse for this material
      const stockRes = await client.query(`
        SELECT id, quantity FROM inventory_stocks 
        WHERE warehouse_id = $1 AND material_id = $2
      `, [warehouseId, item.materialId]);

      if (stockRes.rows.length > 0) {
        // Update existing stock
        await client.query(`
          UPDATE inventory_stocks 
          SET quantity = quantity + $1, last_updated = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [qty, stockRes.rows[0].id]);
      } else {
        // Create new stock entry
        const stockId = generateId();
        await client.query(`
          INSERT INTO inventory_stocks (id, warehouse_id, material_id, quantity)
          VALUES ($1, $2, $3, $4)
        `, [stockId, warehouseId, item.materialId, qty]);
      }

      // Record the transaction history
      const txId = generateId();
      await client.query(`
        INSERT INTO inventory_transactions 
        (id, warehouse_id, material_id, transaction_type, quantity, reference_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [txId, warehouseId, item.materialId, 'PO_RECEIPT', qty, poId, 'Received from PO']);
    }

    // 3. Update PO status to COMPLETED
    await client.query(`
      UPDATE purchase_orders 
      SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [poId]);

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Goods received successfully' }, { status: 200 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error in goods receipt:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
