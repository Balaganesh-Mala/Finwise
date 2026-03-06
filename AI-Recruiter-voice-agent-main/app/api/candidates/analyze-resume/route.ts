import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ResumeAnalysis = {
    name: string;
    email: string;
    phone: string;
    location: string;
    currentTitle: string;
    currentCompany: string;
    linkedinUrl: string;
    portfolioUrl: string;
    skills: string[];
    experienceYears: string;
    strengths: string[];
    weaknesses: string[];
    aiSummary: string;
};

function normalizeText(raw: string) {
    return raw
        .replace(/\u0000/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildFallbackAnalysis(fileName: string, resumeText: string): ResumeAnalysis {
    const words = resumeText.split(/\s+/).filter(Boolean);
    const firstLineGuess = resumeText
        .split(/\n|\r/)
        .map((line) => line.trim())
        .find((line) => line.length > 3 && line.length < 50 && /^[a-zA-Z][a-zA-Z\s.'-]+$/.test(line));

    const emailMatch = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = resumeText.match(/(\+?\d[\d\s().-]{8,}\d)/);
    const linkedinMatch = resumeText.match(/https?:\/\/(www\.)?linkedin\.com\/[\w\-/?=&%.]+/i);
    const allUrls = [...resumeText.matchAll(/https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi)].map((m) => m[0]);
    const portfolioUrl = allUrls.find((url) => !url.toLowerCase().includes("linkedin.com")) ?? "";
    const experienceMatch = resumeText.match(/(\d{1,2})\+?\s+years?/i);

    const knownSkills = [
        "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go",
        "PostgreSQL", "MySQL", "MongoDB", "AWS", "Docker", "Kubernetes", "GraphQL", "REST",
        "Tailwind", "Redux", "Express", "Django", "Flask", "DevOps", "CI/CD",
    ];

    const skills = knownSkills.filter((skill) => resumeText.toLowerCase().includes(skill.toLowerCase()));

    return {
        name: firstLineGuess ?? fileName.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
        email: emailMatch?.[0] ?? "",
        phone: phoneMatch?.[0] ?? "",
        location: "",
        currentTitle: "",
        currentCompany: "",
        linkedinUrl: linkedinMatch?.[0] ?? "",
        portfolioUrl,
        skills,
        experienceYears: experienceMatch?.[1] ?? "",
        strengths: [
            "Relevant experience appears in resume",
            "Profile contains technical skills",
        ],
        weaknesses: words.length < 120 ? ["Limited readable resume content extracted"] : [],
        aiSummary: words.length
            ? "Candidate resume was uploaded successfully. Please review and adjust fields before saving."
            : "Resume uploaded but text extraction is limited. Please fill details manually.",
    };
}

async function analyzeWithGemini(fileName: string, resumeText: string, fallback: ResumeAnalysis) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        return fallback;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a resume parser for a recruiting dashboard.
Extract candidate details from the resume text below and respond with ONLY valid JSON.

Return this exact schema:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "currentTitle": "",
  "currentCompany": "",
  "linkedinUrl": "",
  "portfolioUrl": "",
  "skills": [""],
  "experienceYears": "",
  "strengths": [""],
  "weaknesses": [""],
  "aiSummary": ""
}

Rules:
- If data is unavailable use empty string or empty array.
- skills, strengths, weaknesses should each have max 8 concise items.
- Keep aiSummary under 70 words.

File name: ${fileName}
Resume text:
${resumeText.slice(0, 14000)}`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean) as Partial<ResumeAnalysis>;

        return {
            ...fallback,
            ...parsed,
            skills: Array.isArray(parsed.skills) ? parsed.skills : fallback.skills,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : fallback.strengths,
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : fallback.weaknesses,
        };
    } catch (error) {
        console.warn("Gemini resume analysis failed. Using fallback.", error);
        return fallback;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const textDecoder = new TextDecoder("utf-8", { fatal: false });
        const extractedText = normalizeText(textDecoder.decode(arrayBuffer));
        const fallback = buildFallbackAnalysis(file.name, extractedText);
        const analysis = await analyzeWithGemini(file.name, extractedText, fallback);

        return NextResponse.json({
            analysis: {
                ...analysis,
                resumeText: extractedText.slice(0, 20000),
                resumeFileName: file.name,
                resumeUrl: null,
            },
        });
    } catch (error) {
        console.error("Analyze resume error:", error);
        return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
    }
}
