import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';
import { initialProducts } from '../src/data/initialProducts.js';
import 'dotenv/config';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Seeding initial products into the database...');

  try {
    for (const product of initialProducts) {
      await db.insert(schema.products).values({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image: product.image,
        hoverImage: product.hoverImage,
        description: product.description,
        stock: product.stock,
        features: product.features,
        category: product.category,
        isNew: product.isNew || false,
        bestseller: product.bestseller || false
      }).onConflictDoUpdate({
        target: schema.products.id,
        set: {
          price: product.price,
          stock: product.stock
        }
      });
      console.log(`Inserted/Updated ${product.name}`);
    }
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

main();
