import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { interviewSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface TranscriptMessage {
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export interface InterviewSummary {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
  summary: string;
  keyHighlights: string[];
}

function buildFallbackSummary(candidateName: string, transcript: TranscriptMessage[]): InterviewSummary {
  const userMessages = transcript.filter((m) => m.role === "user" && m.content !== "[No response detected]");
  const responseCount = userMessages.length;
  const avgLength = responseCount > 0
    ? Math.round(userMessages.reduce((sum, m) => sum + m.content.length, 0) / responseCount)
    : 0;

  const score = Math.min(10, Math.max(3, Math.round(3 + (responseCount * 0.8) + (avgLength > 100 ? 2 : avgLength > 50 ? 1 : 0))));

  return {
    overallScore: score,
    communicationScore: score,
    technicalScore: Math.max(3, score - 1),
    strengths: [
      responseCount >= 6 ? "Completed all interview questions" : "Participated in the interview",
      avgLength > 100 ? "Provided detailed, thoughtful responses" : "Responded to interview questions",
      "Engaged with the AI interviewer throughout the session",
    ],
    concerns: responseCount < 4 ? ["Limited responses provided — may need follow-up"] : [],
    recommendation: score >= 8 ? "Strong Yes" : score >= 6 ? "Yes" : score >= 4 ? "Maybe" : "No",
    summary: `${candidateName} completed the AI interview session with ${responseCount} responses out of ${transcript.filter(m => m.role === "ai").length} questions asked. ${avgLength > 100 ? "The candidate provided detailed and substantive answers." : "The candidate provided concise responses."} A full AI analysis was not available — please review the transcript for a complete evaluation.`,
    keyHighlights: userMessages.slice(0, 3).map((m) => `"${m.content.substring(0, 80)}${m.content.length > 80 ? "..." : ""}"`),
  };
}

export async function POST(req: NextRequest) {
  try {
    const {
      interviewId,
      candidateName,
      candidateEmail,
      candidateId,
      jobId,
      jobTitle,
      jobDescription,
      transcript,
      durationSeconds,
      questionsAsked,
      status,
    }: {
      interviewId: string;
      candidateName: string;
      candidateEmail?: string;
      candidateId?: number;
      jobId?: number;
      jobTitle: string;
      jobDescription?: string;
      transcript: TranscriptMessage[];
      durationSeconds: number;
      questionsAsked: number;
      status?: string;
    } = await req.json();

    if (!interviewId || !candidateName || !jobTitle || !transcript) {
      return NextResponse.json(
        { error: "interviewId, candidateName, jobTitle, and transcript are required" },
        { status: 400 }
      );
    }

    let aiSummary: InterviewSummary;

    // Try Gemini summary if API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey && apiKey !== "your_gemini_api_key_here" && transcript.length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const conversationHistory = transcript
          .map((msg) => `${msg.role === "ai" ? "Interviewer" : candidateName}: ${msg.content}`)
          .join("\n\n");

        const summaryPrompt = `You are an expert HR analyst. Analyze the following AI interview transcript for the position of "${jobTitle}" and provide a comprehensive evaluation.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ""}

Interview Transcript:
${conversationHistory}

Provide a detailed evaluation in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "overallScore": <number 1-10>,
  "communicationScore": <number 1-10>,
  "technicalScore": <number 1-10>,
  "strengths": [<array of 3-5 specific strength strings observed in the interview>],
  "concerns": [<array of 2-4 specific concern strings or empty array if none>],
  "recommendation": <"Strong Yes" | "Yes" | "Maybe" | "No">,
  "summary": "<2-3 paragraph detailed summary of the candidate's performance, communication style, and fit for the role>",
  "keyHighlights": [<array of 3-5 notable moments or quotes from the interview>]
}

Scoring guidelines:
- overallScore: Overall candidate quality and fit
- communicationScore: Clarity, articulation, confidence in responses
- technicalScore: Depth of knowledge relevant to the role
- recommendation: Strong Yes (8-10), Yes (6-7), Maybe (4-5), No (1-3)`;

        const result = await model.generateContent(summaryPrompt);
        const rawText = result.response.text().trim();
        const jsonText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        aiSummary = JSON.parse(jsonText);
      } catch (geminiError) {
        console.warn("Gemini summary failed, using fallback:", geminiError);
        aiSummary = buildFallbackSummary(candidateName, transcript);
      }
    } else {
      // No API key — use algorithmic fallback summary
      aiSummary = buildFallbackSummary(candidateName, transcript);
    }

    // Save to DB
    try {
      const existing = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.interviewId, interviewId))
        .limit(1);

      const sessionStatus = status || "completed";

      if (existing.length > 0) {
        await db
          .update(interviewSessions)
          .set({
            transcript: JSON.stringify(transcript),
            aiSummary: JSON.stringify(aiSummary),
            durationSeconds,
            questionsAsked,
            status: sessionStatus,
            candidateId: candidateId ?? existing[0].candidateId,
            jobId: jobId ?? existing[0].jobId,
            candidateEmail: candidateEmail ?? existing[0].candidateEmail,
          })
          .where(eq(interviewSessions.interviewId, interviewId));
      } else {
        await db.insert(interviewSessions).values({
          interviewId,
          candidateName,
          candidateEmail,
          candidateId,
          jobId,
          jobTitle,
          jobDescription,
          transcript: JSON.stringify(transcript),
          aiSummary: JSON.stringify(aiSummary),
          durationSeconds,
          questionsAsked,
          status: sessionStatus,
        });
      }

      console.log(`✅ Interview session saved: ${interviewId} | candidate: ${candidateName} | status: ${sessionStatus} | questions: ${questionsAsked} | transcript messages: ${transcript.length}`);
    } catch (dbError) {
      console.error("DB save failed:", dbError);
      // Still return the summary even if DB save fails
    }

    return NextResponse.json({
      success: true,
      summary: aiSummary,
    });
  } catch (error) {
    console.error("Interview complete error:", error);
    return NextResponse.json({ error: "Failed to save interview" }, { status: 500 });
  }
}

// GET endpoint to retrieve interview results by interviewId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json({ error: "interviewId is required" }, { status: 400 });
    }

    try {
      const session = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.interviewId, interviewId))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
      }

      const result = session[0];
      return NextResponse.json({
        ...result,
        transcript: result.transcript ? JSON.parse(result.transcript) : [],
        aiSummary: result.aiSummary ? JSON.parse(result.aiSummary) : null,
      });
    } catch (dbError) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json({ error: "Failed to retrieve interview" }, { status: 500 });
  }
}
