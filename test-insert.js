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
        name: "test",
        slug: "test",
        sku: "INZ-3499",
        description: "test",
        categoryId: "c144d398-55d3-4137-8f01-47158a772bc1",
        price: "1",
        salePrice: null,
        gstRate: "0",
        stock: 1,
        featured: false,
        newArrival: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    console.log("Inserting...", productData);
    await db.insert(schema.products).values(productData).returning({ id: schema.products.id });
    console.log("Success!");
  } catch (error) {
    console.error("ERROR OBJ:", error);
    console.error("KEYS:", Object.keys(error));
    if (error.code) console.error("CODE:", error.code);
  } finally {
    pool.end();
  }
}
main();
