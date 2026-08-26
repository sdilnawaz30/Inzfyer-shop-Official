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
    console.log('Adding gst_rate to products...');
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 18.00;`;
    
    console.log('Adding tax_amount to orders...');
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;`;
    
    console.log('Adding tax_amount and gst_rate to order_items...');
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 18.00;`;
    
    console.log('Migrations complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

run();
