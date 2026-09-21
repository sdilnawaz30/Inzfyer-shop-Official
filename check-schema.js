import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query(`
      SELECT column_name, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'id';
    `);
    
    console.log("Products ID column info:");
    console.table(result.rows);
  } catch (err) {
    console.error("Error querying schema:", err);
  } finally {
    pool.end();
  }
}

main();
