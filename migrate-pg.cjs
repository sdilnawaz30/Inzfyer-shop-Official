const { Client } = require('D:\\temp_db\\node_modules\\pg');
const fs = require('fs');

async function run() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/^DATABASE_URL=\"?([^\r\n\"]+)\"?/m);
  if (!match) return console.error('No DATABASE_URL found in .env');
  
  const connectionString = match[1].replace(/['\"]/g, '').trim();

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB via pg');

    const query = `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cgst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS sgst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS igst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS base_subtotal numeric(10,2) DEFAULT '0';
      
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cgst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sgst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS igst_amount numeric(10,2) DEFAULT '0';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS base_price numeric(10,2) DEFAULT '0';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2) DEFAULT '18.00';

      ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2) DEFAULT '18.00';
    `;

    await client.query(query);
    console.log('Migrations applied successfully!');

  } catch (err) {
    console.error('Error applying migrations:', err);
  } finally {
    await client.end();
  }
}

run();
