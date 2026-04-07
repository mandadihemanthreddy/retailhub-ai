const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const supabaseUrl = process.env.SUPABASE_URL; // Loaded from .env
const supabaseKey = process.env.SUPABASE_KEY; // Loaded from .env
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from("products").select("*");
  console.log("Error checking Supabase:");
  if (error) console.error(error);
  console.log("Products Table Data:\n", data);
}
check();
