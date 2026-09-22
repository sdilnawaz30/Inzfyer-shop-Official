import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. Create inventory_movements
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_movements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          movement_type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reference_id TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);`;

    // 2. Create notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          customer_contact TEXT NOT NULL,
          notification_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          error_information TEXT,
          sent_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);`;

    // 3. Create shipping_settings
    await sql`
      CREATE TABLE IF NOT EXISTS shipping_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tn_rate NUMERIC(10, 2) NOT NULL DEFAULT '55.00',
          other_rate NUMERIC(10, 2) NOT NULL DEFAULT '85.00',
          free_threshold NUMERIC(10, 2) NOT NULL DEFAULT '1000.00',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({ success: true, message: 'Missing tables created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
}
