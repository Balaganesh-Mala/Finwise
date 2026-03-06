import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TranscriptMessage {
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

// Fallback placeholder questions used when Gemini API is unavailable
const FALLBACK_QUESTIONS = [
  (name: string, jobTitle: string) =>
    `Hi ${name}! Welcome to your AI interview for the ${jobTitle} position. I'm your AI interviewer today. We'll go through about 6 to 8 questions over the next 15 to 20 minutes. Let's start — can you tell me a bit about yourself and your background?`,
  (_name: string, jobTitle: string) =>
    `Great, thank you! Can you walk me through your most relevant experience for this ${jobTitle} role? What projects or responsibilities are you most proud of?`,
  () =>
    `That's really interesting. What technical skills or tools do you consider your strongest, and how have you applied them in your recent work?`,
  () =>
    `Can you describe a challenging problem you faced at work and how you went about solving it? What was the outcome?`,
  () =>
    `How do you typically collaborate with teammates or cross-functional teams? Can you give me an example of a successful team project?`,
  () =>
    `Where do you see yourself professionally in the next two to three years, and how does this role fit into those goals?`,
  (_name: string, jobTitle: string) =>
    `Can you tell me about a time you had to adapt quickly to a change or unexpected situation at work? How did you handle it?`,
  (_name: string, jobTitle: string) =>
    `Last question — what excites you most about this ${jobTitle} opportunity, and what unique value do you think you'd bring to the team?`,
];

export async function POST(req: NextRequest) {
  try {
    const {
      jobTitle,
      jobDescription,
      candidateName,
      transcript = [],
      questionIndex = 0,
    }: {
      jobTitle: string;
      jobDescription?: string;
      candidateName: string;
      transcript: TranscriptMessage[];
      questionIndex: number;
    } = await req.json();

    if (!jobTitle || !candidateName) {
      return NextResponse.json(
        { error: "jobTitle and candidateName are required" },
        { status: 400 }
      );
    }

    const isLastQuestion = questionIndex >= 7;

    // Try Gemini first if API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build conversation history for context
        const conversationHistory = transcript
          .map((msg) => `${msg.role === "ai" ? "Interviewer" : candidateName}: ${msg.content}`)
          .join("\n");

        const questionTypes = [
          "introduction and background",
          "relevant work experience",
          "technical skills and expertise",
          "problem-solving and challenges",
          "teamwork and collaboration",
          "career goals and motivation",
          "situational or behavioral",
          "closing question about the role",
        ];

        const currentQuestionType = questionTypes[Math.min(questionIndex, questionTypes.length - 1)];
        const isFirstQuestion = questionIndex === 0;

        let prompt: string;

        if (isFirstQuestion) {
          prompt = `You are a professional AI interviewer conducting a voice interview for the position of "${jobTitle}".
${jobDescription ? `\nJob Description:\n${jobDescription}\n` : ""}
The candidate's name is ${candidateName}.

Start the interview with a warm, professional greeting. Introduce yourself as the AI interviewer, welcome the candidate, briefly explain the interview process (6-8 questions, about 15-20 minutes), and ask your first question about their background and what drew them to this ${jobTitle} role.

Keep your response conversational, warm, and under 80 words. Speak naturally as if on a voice call.`;
        } else if (isLastQuestion) {
          prompt = `You are a professional AI interviewer conducting a voice interview for the position of "${jobTitle}".
${jobDescription ? `\nJob Description:\n${jobDescription}\n` : ""}

Previous conversation:
${conversationHistory}

This is the final question. Ask a thoughtful closing question about the candidate's expectations for this role or what they would bring to the team.

Keep it under 60 words, conversational and natural.`;
        } else {
          prompt = `You are a professional AI interviewer conducting a voice interview for the position of "${jobTitle}".
${jobDescription ? `\nJob Description:\n${jobDescription}\n` : ""}

Previous conversation:
${conversationHistory}

Ask the next interview question. This is question ${questionIndex + 1} of 8, focusing on: ${currentQuestionType}.

Guidelines:
- Keep it under 60 words
- Be conversational and natural (voice interview)
- Build on what the candidate has said if relevant
- Ask only ONE question
- Do not repeat topics already covered
- Be professional but friendly`;
        }

        const result = await model.generateContent(prompt);
        const question = result.response.text().trim();

        return NextResponse.json({
          question,
          questionIndex,
          isLastQuestion,
          totalQuestions: 8,
        });
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to placeholder questions:", geminiError);
        // Fall through to placeholder questions
      }
    }

    // Fallback: use hardcoded placeholder questions
    const idx = Math.min(questionIndex, FALLBACK_QUESTIONS.length - 1);
    const question = FALLBACK_QUESTIONS[idx](candidateName, jobTitle);

    return NextResponse.json({
      question,
      questionIndex,
      isLastQuestion,
      totalQuestions: 8,
    });
  } catch (error) {
    console.error("Generate question error:", error);
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
