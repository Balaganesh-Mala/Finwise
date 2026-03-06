import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AIWriterPayload = {
    jobTitle: string;
};

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as AIWriterPayload;

        if (!body.jobTitle?.trim()) {
            return NextResponse.json(
                { error: "Job title is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return NextResponse.json(
                { error: "AI API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert HR recruiter.
Create a detailed job posting for the position of "${body.jobTitle}".
Respond with ONLY valid JSON.

Return this exact schema:
{
  "description": "Short engaging overview (max 3 sentences)",
  "responsibilities": "List of key responsibilities (bullet points)",
  "requirements": "List of key requirements (bullet points)",
  "skills": ["Array of top 5-8 technical/soft skills"],
  "experienceLevel": "One of: entry, junior, mid, senior, lead, executive",
  "type": "One of: full-time, part-time, contract, internship, remote",
  "salaryMin": "Numeric string (e.g. 80000)",
  "salaryMax": "Numeric string (e.g. 120000)",
  "salaryCurrency": "USD"
}

Ensure the content is professional, attractive to candidates, and uses standard industry terminology.`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        try {
            const parsed = JSON.parse(clean);
            return NextResponse.json({ jobDetails: parsed });
        } catch (parseError) {
            console.error("Failed to parse AI response:", raw);
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("AI Writer error:", error);
        return NextResponse.json({ error: "Failed to generate job details" }, { status: 500 });
    }
}
