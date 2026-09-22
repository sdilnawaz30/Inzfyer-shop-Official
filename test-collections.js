import { getDb } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq } from 'drizzle-orm';
import axios from 'axios';

async function runTest() {
  const db = getDb();

  console.log("Waiting for Vercel deployment to finish (30s)...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  console.log("Checking live homepage for old static categories vs new dynamic...");
  let res = await axios.get('https://inzfyer.in/');
  if (res.data.includes('Plushies &amp; Toys') || res.data.includes('Plushies & Toys')) {
      console.log("Still showing old static categories. Let's wait another 15s...");
      await new Promise(resolve => setTimeout(resolve, 15000));
      res = await axios.get('https://inzfyer.in/');
  }
  
  if (res.data.includes('Plushies &amp; Toys') || res.data.includes('Plushies & Toys')) {
      console.error("FAIL: Homepage is still rendering static categories.");
      process.exit(1);
  } else {
      console.log("SUCCESS: Homepage no longer renders static categories.");
  }

  console.log("Testing API endpoint...");
  const apiRes = await axios.get('https://inzfyer.in/api/products?resource=categories');
  console.log("Categories returned:", apiRes.data.data.map(c => c.name));
  if (!apiRes.data.data.find(c => c.name === 'Keychain')) {
      console.error("FAIL: Keychain not found in API response.");
  }

  console.log("Inserting temporary category 'Gift Sets'...");
  const [newCat] = await db.insert(schema.categories).values({
    name: 'Gift Sets',
    slug: 'gift-sets-temp',
    isActive: true
  }).returning();

  console.log("Fetching API again immediately...");
  const apiRes2 = await axios.get('https://inzfyer.in/api/products?resource=categories', {
    headers: { 'Cache-Control': 'no-cache' }
  });
  console.log("Categories after insert:", apiRes2.data.data.map(c => c.name));
  
  if (!apiRes2.data.data.find(c => c.name === 'Gift Sets')) {
      console.log("WARNING: CDN cached the response. In real usage, Admin should invalidate cache on change or we can't expect immediate update.");
  } else {
      console.log("SUCCESS: Gift Sets appeared immediately.");
  }

  console.log("Deleting temporary category...");
  await db.delete(schema.categories).where(eq(schema.categories.id, newCat.id));

  console.log("Done.");
  process.exit(0);
}

runTest().catch(console.error);
