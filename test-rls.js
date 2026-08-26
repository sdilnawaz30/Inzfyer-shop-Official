import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';

// Proper Node environment-variable loader (Node v20.6+)
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (e) {
  // Ignore if it fails, fallback to existing process.env
}

// Map the Vite variables internally
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERROR: Missing Supabase credentials.");
  console.error("Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log("==========================================");
  console.log("🧪 TESTING SUPABASE RLS POLICIES");
  console.log("==========================================\n");

  // ----------------------------------------------------
  // TEST 1: ANONYMOUS/CUSTOMER ACCESS
  // ----------------------------------------------------
  console.log("--- 1. ANONYMOUS / PUBLIC ACCESS ---");
  
  // 1a. Can SELECT active products
  console.log("Testing: Public can SELECT active products");
  const { data: products, error: getProductsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(1);
    
  if (getProductsError) console.error("❌ FAILED:", getProductsError.message);
  else console.log("✅ PASSED: Successfully queried active products.");

  // 1b. Cannot INSERT products
  console.log("Testing: Public CANNOT INSERT products");
  const { error: insertError } = await supabase
    .from('products')
    .insert({ name: 'Hacked Product', slug: 'hacked', sku: 'hck', price: 0 });
    
  if (insertError) console.log("✅ PASSED: Insert rejected as expected (RLS Enforced).");
  else console.error("❌ FAILED: Public user was able to insert a product!");

  // 1c. Cannot UPDATE products
  console.log("Testing: Public CANNOT UPDATE products");
  const { error: updateError } = await supabase
    .from('products')
    .update({ price: 1 })
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (updateError) console.log("✅ PASSED: Update rejected as expected.");
  else console.error("❌ FAILED: Public user was able to update a product!");

  // 1d. Cannot DELETE products
  console.log("Testing: Public CANNOT DELETE products");
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (deleteError) console.log("✅ PASSED: Delete rejected as expected.");
  else console.error("❌ FAILED: Public user was able to delete a product!");

  // ----------------------------------------------------
  // TEST 2: AUTHENTICATED ADMIN ACCESS
  // ----------------------------------------------------
  console.log("\n--- 2. AUTHENTICATED ADMIN ACCESS ---");
  console.log("To fully test this programmatically, you need to sign in as an admin user.");
  console.log("Please sign in manually with an admin account, and uncomment the code below to test:\n");
  
  /*
  // Login with an admin account (You need to create an admin account in your database first)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'password123'
  });

  if (authError) {
    console.error("Failed to login as admin:", authError.message);
    return;
  }
  console.log("✅ Signed in as admin");

  // Admin: Can INSERT products
  console.log("Testing: Admin can INSERT products");
  const { error: adminInsertError } = await supabase
    .from('products')
    .insert({ name: 'Admin Product', slug: 'admin-prod', sku: 'admin123', price: 99.99 });
    
  if (adminInsertError) console.error("❌ FAILED:", adminInsertError.message);
  else console.log("✅ PASSED: Admin successfully inserted a product.");
  
  // Clean up test data
  await supabase.from('products').delete().eq('slug', 'admin-prod');
  */

  console.log("\n🎉 TEST SCRIPT COMPLETED.");
}

runTests();
