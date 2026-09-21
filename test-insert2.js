import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './src/db/schema.js';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    const productData = {
        name: null,
        slug: "test-missing-1",
        sku: "INZ-9991",
        price: "1",
        stock: 1
    };
    await db.insert(schema.products).values(productData);
  } catch (error) {
    let pgError = error;
    while (pgError && (pgError.cause || pgError.originalError)) {
      pgError = pgError.cause || pgError.originalError;
    }
    console.log("pgError code:", pgError.code);
    console.log("pgError column:", pgError.column);
    console.log("pgError message:", pgError.message);
    console.log(pgError);
  } finally {
    pool.end();
  }
}
main();
