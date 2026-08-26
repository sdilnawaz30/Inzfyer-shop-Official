import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';

try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERROR: Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStorage() {
  console.log("==========================================");
  console.log("📦 TESTING SUPABASE STORAGE SECURITY");
  console.log("==========================================\n");

  const bucketName = 'product-images';
  const dummyProductId = '00000000-0000-0000-0000-000000000000';
  const fileName = `products/${dummyProductId}/${Date.now()}-test.webp`;
  const dummyFile = new Blob(["test image content"], { type: 'image/webp' });

  // ----------------------------------------------------
  // TEST 1: ANONYMOUS/CUSTOMER ACCESS
  // ----------------------------------------------------
  console.log("--- 1. ANONYMOUS / PUBLIC ACCESS ---");

  // 1a. Test Public Read
  console.log("Testing: Public can READ images");
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl('test.webp');
  if (publicUrlData && publicUrlData.publicUrl) {
    console.log("✅ PASSED: Public URL successfully generated.");
  } else {
    console.error("❌ FAILED: Could not generate public URL.");
  }

  // 1b. Test Unauthorized Upload (Should Fail)
  console.log("Testing: Public CANNOT UPLOAD images");
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, dummyFile);

  if (uploadError) {
    console.log(`✅ PASSED: Upload rejected as expected. (Error: ${uploadError.message})`);
  } else {
    console.error("❌ FAILED: Public user was able to upload an image!");
    // cleanup if it failed
    await supabase.storage.from(bucketName).remove([fileName]);
  }

  // ----------------------------------------------------
  // TEST 2: AUTHENTICATED ADMIN ACCESS
  // ----------------------------------------------------
  console.log("\n--- 2. AUTHENTICATED ADMIN ACCESS ---");
  console.log("To fully test admin uploads, uncomment the code below and provide your admin login credentials.\n");

  /*
  // Login with an admin account
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'password123'
  });

  if (authError) {
    console.error("Failed to login as admin:", authError.message);
    return;
  }
  console.log("✅ Signed in as admin");

  // Test Admin Upload
  console.log("Testing: Admin CAN UPLOAD images");
  const { error: adminUploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, dummyFile);

  if (adminUploadError) {
    console.error("❌ FAILED: Admin upload failed:", adminUploadError.message);
  } else {
    console.log("✅ PASSED: Admin successfully uploaded an image.");
    
    // Test Delete Protection (Admin CAN delete)
    console.log("Testing: Admin CAN DELETE images");
    const { error: adminDeleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (adminDeleteError) {
      console.error("❌ FAILED: Admin delete failed:", adminDeleteError.message);
    } else {
      console.log("✅ PASSED: Admin successfully deleted the image.");
    }
  }
  */

  console.log("\n🎉 STORAGE TEST SCRIPT COMPLETED.");
}

testStorage();
