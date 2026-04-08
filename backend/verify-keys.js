require("dotenv").config();

async function verifyKeys() {
  const gKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2].filter(Boolean);
  const oKeys = [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_KEY_2].filter(Boolean);

  console.log("--- GOOGLE GEMINI KEYS ---");
  for (const key of gKeys) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      if (data.models) {
        console.log(`✅ Key ${key.substring(0, 8)}... is VALID. Found ${data.models.length} models.`);
      } else {
        console.warn(`❌ Key ${key.substring(0, 8)}... is INVALID:`, data.error?.message || "Unknown error");
      }
    } catch (e) {
      console.error(`❌ Key ${key.substring(0, 8)}... connection error:`, e.message);
    }
  }

  console.log("\n--- OPENROUTER KEYS ---");
  for (const key of oKeys) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { "Authorization": `Bearer ${key}` }
      });
      const data = await res.json();
      if (data.data) {
        console.log(`✅ Key ${key.substring(0, 8)}... is VALID. Limit: ${data.data.limit || 'none'}`);
      } else {
        console.warn(`❌ Key ${key.substring(0, 8)}... is INVALID:`, data.error?.message || "Unknown error");
      }
    } catch (e) {
      console.error(`❌ Key ${key.substring(0, 8)}... connection error:`, e.message);
    }
  }
}

verifyKeys();
