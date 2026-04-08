const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Deep Testing Multi-Tenant Structure...");
  
  // Test 1: Column existence
  const { data, error } = await supabase.from("products").select("tenant_id").limit(1);
  
  if (error) {
    if (error.message.includes("column") || error.code === '42703') {
      console.error("🚨 CRITICAL ERROR: The 'tenant_id' column is MISSING from the 'products' table.");
      console.error("This is likely why the Chatbot is failing with 500 Internal Server Error.");
      console.log("\n👉 Fix: Go to your Supabase SQL Editor and run the code in 'database/schema.sql'.");
    } else {
      console.error("❌ Supabase connection error:", error.message);
    }
  } else {
    console.log("✅ 'tenant_id' column verified in 'products' table.");
  }

  // Test 2: Required tables
  const tables = ['stores', 'messages'];
  for (const table of tables) {
    const { error: tErr } = await supabase.from(table).select("*").limit(1);
    if (tErr) {
      console.warn(`🚨 WARNING: Table '${table}' check failed: ${tErr.message}`);
    } else {
      console.log(`✅ Table '${table}' verified.`);
    }
  }
}
check();
