import handler from '../api/create-order.js';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const db = getDb();
  
  // Get an active product from DB to test with
  const activeProducts = await db.select().from(schema.products).where(eq(schema.products.isActive, true)).limit(1);
  if (activeProducts.length === 0) {
    console.error('No active products found');
    process.exit(1);
  }
  const product = activeProducts[0];
  console.log(`Testing with product: ${product.name} (Stock: ${product.stock})`);

  const req = {
    method: 'POST',
    body: {
      items: [
        { id: product.id, qty: 1 }
      ],
      customerDetails: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        address1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      }
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log(`Response [${this.statusCode}]:`, JSON.stringify(data, null, 2));
      return data;
    }
  };

  console.log('Sending request to handler...');
  await handler(req, res);
  
  // Verify stock was updated
  const updatedProducts = await db.select().from(schema.products).where(eq(schema.products.id, product.id)).limit(1);
  console.log(`Updated Stock: ${updatedProducts[0].stock}`);
  process.exit(0);
}

run().catch(console.error);
