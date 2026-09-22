import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const tables = ['orders', 'order_items', 'notifications', 'inventory_movements', 'product_images', 'products', 'profiles', 'shipping_settings'];
    const results = {};

    for (const table of tables) {
      const res = await sql`
        SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${table}
      `;
      results[table] = res;
    }

    return res.status(200).json({
      success: true,
      message: 'Schema checked',
      tables: results
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
