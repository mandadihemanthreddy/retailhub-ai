require("dotenv").config();
async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`; // Loaded from .env
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
        console.log("AVAILABLE MODELS:");
        console.log(data.models.map(m => m.name));
    } else {
        console.log("ERROR OUTPUT:");
        console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
}
listModels();
