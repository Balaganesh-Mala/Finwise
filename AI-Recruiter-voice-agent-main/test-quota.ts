import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function testQuota() {
    console.log("Attempting a very small Gemini request to test quota limits...");
    try {
        const result = await model.generateContent("Reply with specifically the text: 'Quota OK'");
        console.log("SUCCESS:", result.response.text());
        console.log("Your daily/minute quota is NOT exhausted globally.");
    } catch (e: any) {
        console.log("FAILED WITH ERROR:");
        console.log("Status:", e.status);
        console.log("Message:", e.message);
        console.dir(e, { depth: null });
    }
}

testQuota();
