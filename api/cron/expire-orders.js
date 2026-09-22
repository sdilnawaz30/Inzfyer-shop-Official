import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, lt, and, sql } from 'drizzle-orm';

export default async function handler(req, res) {
  // Allow GET and POST for crons and internal triggers
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const db = getDb();
    const expiryTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    // Find all PENDING orders older than 5 minutes
    const expiredOrders = await db.select().from(schema.orders).where(
      and(
        eq(schema.orders.paymentStatus, 'PENDING'),
        lt(schema.orders.createdAt, expiryTime)
      )
    );

    if (expiredOrders.length === 0) {
      return res.status(200).json({ success: true, message: 'No orders to expire', expiredCount: 0 });
    }

    let successCount = 0;

    for (const order of expiredOrders) {
      // Use transaction per order to ensure race condition safety
      try {
        await db.transaction(async (tx) => {
          // Double check it's still PENDING inside the transaction
          const [checkOrder] = await tx.select().from(schema.orders)
            .where(eq(schema.orders.id, order.id))
            .limit(1);

          if (!checkOrder || checkOrder.paymentStatus !== 'PENDING') {
            return; // Already processed by Cashfree webhook or another process
          }

          // Mark as expired
          await tx.update(schema.orders)
            .set({ orderStatus: 'EXPIRED', paymentStatus: 'EXPIRED' })
            .where(eq(schema.orders.id, order.id));

          // Fetch items for this order
          const items = await tx.select().from(schema.orderItems)
            .where(eq(schema.orderItems.orderId, order.id));

          if (items.length > 0) {
            // Restore stock for each item
            for (const item of items) {
              await tx.update(schema.products)
                .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
                .where(eq(schema.products.id, item.productId));
            }

            // Insert inventory movements for restock
            const inventoryMovementsToInsert = items.map(item => ({
              productId: item.productId,
              movementType: 'RESTOCK',
              quantity: item.quantity,
              referenceId: order.orderNumber,
              notes: 'Order payment expired after 5 minutes, stock restored automatically.'
            }));
            await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
          }
        });
        successCount++;
        console.log(`[EXPIRE_CRON] Successfully expired order ${order.orderNumber} and restored stock.`);
      } catch (err) {
        console.error(`[EXPIRE_CRON] Failed to expire order ${order.orderNumber}:`, err);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Expiry process completed',
      expiredCount: successCount
    });

  } catch (error) {
    console.error('[EXPIRE_CRON] Global error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
