const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Loaded from .env
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function test() {
  try {
    const result = await model.generateContent("hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error with gemini-pro:", e.message);
  }
}
test();
