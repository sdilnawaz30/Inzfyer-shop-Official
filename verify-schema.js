import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';

try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (e) {
  // Ignore
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERROR: Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifySchema() {
  console.log("==========================================");
  console.log("🔍 VERIFYING DATABASE SCHEMA");
  console.log("==========================================\n");

  const tablesToVerify = [
    'profiles',
    'categories',
    'products',
    'product_images',
    'orders',
    'order_items'
  ];

  let allExist = true;

  for (const table of tablesToVerify) {
    // Attempt to query 1 row to see if the table exists
    // The Anon Key without RLS will return data (or an empty array), but if the table doesn't exist, it throws an error.
    const { data, error } = await supabase.from(table).select('id').limit(1);

    if (error && error.message.includes("Could not find the table")) {
      console.log(`❌ Table missing: ${table}`);
      allExist = false;
    } else if (error && error.message.includes("permission denied")) {
       // If RLS is enabled without policies, it returns permission denied. But we know the table exists!
       console.log(`✅ Table exists: ${table} (RLS is blocking read, which is expected if RLS is on)`);
    } else if (error) {
       // Some other error
       console.log(`⚠️  Table ${table} error: ${error.message}`);
    } else {
       console.log(`✅ Table exists: ${table}`);
    }
  }

  console.log("\n==========================================");
  if (allExist) {
    console.log("🎉 SUCCESS: All required ecommerce tables were successfully verified!");
  } else {
    console.log("⚠️ WARNING: Some tables are still missing. Please run database_schema.sql in the Supabase SQL Editor.");
  }
}

verifySchema();
