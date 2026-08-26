import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('No DATABASE_URL found in .env');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const productsInfo = await sql`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `;
    console.log('PRODUCTS TABLE:', productsInfo);

    const imagesInfo = await sql`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'product_images';
    `;
    console.log('PRODUCT_IMAGES TABLE:', imagesInfo);

  } catch (e) {
    console.error('Error fetching schema:', e);
  }
}

run();
