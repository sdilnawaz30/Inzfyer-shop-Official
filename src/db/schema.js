import { pgTable, text, timestamp, integer, boolean, numeric, jsonb } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  image: text('image').notNull(),
  hoverImage: text('hover_image').notNull(),
  description: text('description').notNull(),
  stock: integer('stock').notNull(),
  features: jsonb('features').notNull(),
  category: text('category').notNull(),
  isNew: boolean('is_new').default(false),
  bestseller: boolean('bestseller').default(false),
});

export const orders = pgTable('orders', {
  orderId: text('order_id').primaryKey(),
  transactionId: text('transaction_id'),
  timestamp: timestamp('timestamp').defaultNow(),
  customer: jsonb('customer').notNull(),
  items: jsonb('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0),
  shippingFee: integer('shipping_fee').default(0),
  tax: integer('tax').default(0),
  total: integer('total').notNull(),
  paymentStatus: text('payment_status').default('Pending'), // Pending, Paid, Failed
  orderStatus: text('order_status').default('Pending'),
  paymentMethod: text('payment_method').default('UPI'),
  paymentSessionId: text('payment_session_id'),
});
