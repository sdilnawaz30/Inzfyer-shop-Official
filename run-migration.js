import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { neon } from '@neondatabase/serverless';

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('No DATABASE_URL found in .env');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Running migrations...');
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS sgst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS igst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS base_subtotal numeric(10,2) DEFAULT '0'`;
    
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cgst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sgst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS igst_amount numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS base_price numeric(10,2) DEFAULT '0'`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2) DEFAULT '18.00'`;

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2) DEFAULT '18.00'`;

    console.log('Done!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

run();
