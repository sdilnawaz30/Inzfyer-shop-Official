import * as schema from '../../src/db/schema.js';

/**
 * Enqueues a notification to be sent asynchronously by inserting it into the notifications table.
 * @param {import('drizzle-orm').Transaction} tx - The active database transaction to ensure atomicity.
 * @param {string} orderId - The UUID of the order in the database.
 * @param {string} customerContact - The email or phone number to notify.
 * @param {string} type - The notification event type (e.g. ORDER_CREATED, ORDER_SHIPPED)
 */
export async function enqueueNotification(tx, orderId, customerContact, type) {
  if (!orderId || !customerContact) {
    console.warn(`Skipping notification ${type} due to missing orderId or contact info`);
    return;
  }
  
  await tx.insert(schema.notifications).values({
    orderId,
    customerContact,
    notificationType: type,
    status: 'PENDING'
  });
}
