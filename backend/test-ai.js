const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Use the prioritized Gemini key from our modern failover structure
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  try {
    const result = await model.generateContent("What is the stock level of products?");
    console.log("AI Test Success! Response:\n", result.response.text());
  } catch (e) {
    console.error("AI Test Failed:", e.message);
  }
}
test();
