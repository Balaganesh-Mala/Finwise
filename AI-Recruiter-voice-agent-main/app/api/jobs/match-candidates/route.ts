import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, candidates } from "@/lib/db/schema";

type MatchCandidatesPayload = {
    jobId: number;
};

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as MatchCandidatesPayload;

        if (!body.jobId) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            );
        }

        // Fetch Job
        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, body.jobId), eq(jobs.userId, userId)),
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Fetch Candidates
        const candidateList = await db
            .select()
            .from(candidates)
            .where(eq(candidates.userId, userId))
            .orderBy(desc(candidates.createdAt));
        // Limit if needed, but Gemini Flash has 1M context so usually fine for hundreds of resumes.

        if (candidateList.length === 0) {
            return NextResponse.json({ matches: [] });
        }

        // Prepare data for AI
        const jobContext = `
Job Title: ${job.title}
Skills: ${job.skills}
Requirements: ${job.requirements}
Experience Level: ${job.experienceLevel}
        `.trim();

        const candidatesContext = candidateList.map(c => `
ID: ${c.id}
Name: ${c.name}
Title: ${c.currentTitle}
Skills: ${c.skills}
Experience: ${c.experienceYears}
Summary: ${c.aiSummary}
        `.trim()).join("\n---\n");

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return NextResponse.json(
                { error: "AI API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert technical recruiter.
Match the following candidates to the job description.
Rank them from most suitable to least suitable.
Ignore candidates who are completely irrelevant (score < 30).

Job:
${jobContext}

Candidates:
${candidatesContext}

Respond with ONLY valid JSON array of objects.
Schema:
[
  {
    "id": 123, // Candidate ID (number)
    "matchScore": 85, // 0-100
    "reason": "Brief explanation of why they are a good match (max 1 sentence)"
  }
]
`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let matches = [];
        try {
            matches = JSON.parse(clean);
        } catch (e) {
            console.error("Failed to parse match results:", raw);
            return NextResponse.json({ error: "Failed to parse AI results" }, { status: 500 });
        }

        // Update Job with matches
        await db
            .update(jobs)
            .set({
                matchedCandidates: JSON.stringify(matches),
                updatedAt: new Date()
            })
            .where(eq(jobs.id, body.jobId));

        // Enrich matches with candidate details
        const enrichedMatches = matches.map((match: any) => {
            const candidate = candidateList.find((c) => c.id === match.id);
            return {
                ...match,
                candidate: candidate || null,
            };
        });

        return NextResponse.json({ matches: enrichedMatches });

    } catch (error) {
        console.error("Match Candidates error:", error);
        return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
    }
}
