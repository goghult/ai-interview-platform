import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let ai;
try {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("API Key loaded:", apiKey ? "Yes (length: " + apiKey.length + ")" : "No");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not found in environment variables");
  }
  ai = new Groq({ apiKey });
  console.log("Groq initialized successfully");
} catch (error) {
  console.error("Could not initialize Groq:", error.message);
  console.error("Make sure GROQ_API_KEY is set in your .env file");
}

export default ai;
