import { pgTable, text, timestamp, integer, boolean, numeric, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').default('customer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  gstRate: numeric('gst_rate', { precision: 5, scale: 2 }).default('18.00'),
  stock: integer('stock').default(0).notNull(),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'),
  featured: boolean('featured').default(false),
  newArrival: boolean('new_arrival').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    slugIdx: index('idx_products_slug').on(table.slug),
    skuIdx: index('idx_products_sku').on(table.sku),
    categoryIdx: index('idx_products_category_id').on(table.categoryId),
    isActiveIdx: index('idx_products_is_active').on(table.isActive),
  };
});

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    productIdx: index('idx_product_images_product_id').on(table.productId),
  };
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
  shippingCharge: numeric('shipping_charge', { precision: 10, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  cgstAmount: numeric('cgst_amount', { precision: 10, scale: 2 }).default('0'),
  sgstAmount: numeric('sgst_amount', { precision: 10, scale: 2 }).default('0'),
  igstAmount: numeric('igst_amount', { precision: 10, scale: 2 }).default('0'),
  baseSubtotal: numeric('base_subtotal', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').default('PENDING'),
  orderStatus: text('order_status').default('PENDING_PAYMENT'),
  idempotencyKey: text('idempotency_key').unique(),
  gatewayOrderId: text('gateway_order_id'),
  gatewayPaymentId: text('gateway_payment_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    orderNumberIdx: index('idx_orders_order_number').on(table.orderNumber),
    paymentStatusIdx: index('idx_orders_payment_status').on(table.paymentStatus),
    createdAtIdx: index('idx_orders_created_at').on(table.createdAt),
  };
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  cgstAmount: numeric('cgst_amount', { precision: 10, scale: 2 }).default('0'),
  sgstAmount: numeric('sgst_amount', { precision: 10, scale: 2 }).default('0'),
  igstAmount: numeric('igst_amount', { precision: 10, scale: 2 }).default('0'),
  gstRate: numeric('gst_rate', { precision: 5, scale: 2 }).default('18.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  movementType: text('movement_type').notNull(),
  quantity: integer('quantity').notNull(),
  referenceId: text('reference_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    productIdx: index('idx_inventory_movements_product_id').on(table.productId),
  };
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  customerContact: text('customer_contact').notNull(),
  notificationType: text('notification_type').notNull(),
  status: text('status').default('PENDING').notNull(),
  errorInformation: text('error_information'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    orderIdx: index('idx_notifications_order_id').on(table.orderId),
    statusIdx: index('idx_notifications_status').on(table.status),
  };
});

export const shippingSettings = pgTable('shipping_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tnRate: numeric('tn_rate', { precision: 10, scale: 2 }).default('55.00').notNull(),
  otherRate: numeric('other_rate', { precision: 10, scale: 2 }).default('85.00').notNull(),
  freeThreshold: numeric('free_threshold', { precision: 10, scale: 2 }).default('1000.00').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
