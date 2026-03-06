import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { recruiterSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Default settings object — used when no settings row exists yet
export const DEFAULT_SETTINGS = {
    screeningQuestionsCount: 6,
    techQuestionsCount: 8,
    hrQuestionsCount: 5,
    silenceTimeoutSeconds: 3,
    autoEndInterview: true,
    aiVoiceId: "en-US-falcon",
    aiInterviewerName: "Alex",
    interviewTone: "professional",
    screeningPrompt: "",
    techPrompt: "",
    hrPrompt: "",
    closingMessage: "",
    evaluationStrictness: "balanced",
    companyName: "",
    recruiterDisplayName: "",
    customEmailSubject: "",
    customEmailIntro: "",
    replyToEmail: "",
    inviteExpiryDays: 7,
    companyLogoUrl: "",
    notifyOnComplete: true,
    notificationEmail: "",
    lowScoreAlert: false,
    lowScoreThreshold: 5,
    industry: "",
    defaultLocation: "",
    defaultCurrency: "USD",
    timezone: "UTC",
};

// GET /api/settings — fetch recruiter settings (or return defaults)
export async function GET(req: NextRequest) {
    try {
        // Support both authenticated dashboard calls and public interview calls (via userId param)
        const { searchParams } = new URL(req.url);
        const publicUserId = searchParams.get("userId");

        let userId: string | null = null;

        if (publicUserId) {
            // Public access for interview pages — only return interview-relevant fields
            userId = publicUserId;
        } else {
            const { userId: authUserId } = await auth();
            if (!authUserId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            userId = authUserId;
        }

        try {
            const rows = await db
                .select()
                .from(recruiterSettings)
                .where(eq(recruiterSettings.userId, userId))
                .limit(1);

            if (rows.length === 0) {
                return NextResponse.json({ ...DEFAULT_SETTINGS, userId });
            }

            const row = rows[0];
            return NextResponse.json({
                userId: row.userId,
                screeningQuestionsCount: row.screeningQuestionsCount ?? DEFAULT_SETTINGS.screeningQuestionsCount,
                techQuestionsCount: row.techQuestionsCount ?? DEFAULT_SETTINGS.techQuestionsCount,
                hrQuestionsCount: row.hrQuestionsCount ?? DEFAULT_SETTINGS.hrQuestionsCount,
                silenceTimeoutSeconds: row.silenceTimeoutSeconds ?? DEFAULT_SETTINGS.silenceTimeoutSeconds,
                autoEndInterview: row.autoEndInterview ?? DEFAULT_SETTINGS.autoEndInterview,
                aiVoiceId: row.aiVoiceId ?? DEFAULT_SETTINGS.aiVoiceId,
                aiInterviewerName: row.aiInterviewerName ?? DEFAULT_SETTINGS.aiInterviewerName,
                interviewTone: row.interviewTone ?? DEFAULT_SETTINGS.interviewTone,
                screeningPrompt: row.screeningPrompt ?? DEFAULT_SETTINGS.screeningPrompt,
                techPrompt: row.techPrompt ?? DEFAULT_SETTINGS.techPrompt,
                hrPrompt: row.hrPrompt ?? DEFAULT_SETTINGS.hrPrompt,
                closingMessage: row.closingMessage ?? DEFAULT_SETTINGS.closingMessage,
                evaluationStrictness: row.evaluationStrictness ?? DEFAULT_SETTINGS.evaluationStrictness,
                companyName: row.companyName ?? DEFAULT_SETTINGS.companyName,
                recruiterDisplayName: row.recruiterDisplayName ?? DEFAULT_SETTINGS.recruiterDisplayName,
                customEmailSubject: row.customEmailSubject ?? DEFAULT_SETTINGS.customEmailSubject,
                customEmailIntro: row.customEmailIntro ?? DEFAULT_SETTINGS.customEmailIntro,
                replyToEmail: row.replyToEmail ?? DEFAULT_SETTINGS.replyToEmail,
                inviteExpiryDays: row.inviteExpiryDays ?? DEFAULT_SETTINGS.inviteExpiryDays,
                companyLogoUrl: row.companyLogoUrl ?? DEFAULT_SETTINGS.companyLogoUrl,
                notifyOnComplete: row.notifyOnComplete ?? DEFAULT_SETTINGS.notifyOnComplete,
                notificationEmail: row.notificationEmail ?? DEFAULT_SETTINGS.notificationEmail,
                lowScoreAlert: row.lowScoreAlert ?? DEFAULT_SETTINGS.lowScoreAlert,
                lowScoreThreshold: row.lowScoreThreshold ?? DEFAULT_SETTINGS.lowScoreThreshold,
                industry: row.industry ?? DEFAULT_SETTINGS.industry,
                defaultLocation: row.defaultLocation ?? DEFAULT_SETTINGS.defaultLocation,
                defaultCurrency: row.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
                timezone: row.timezone ?? DEFAULT_SETTINGS.timezone,
            });
        } catch (dbError) {
            console.warn("recruiter_settings table may not exist yet:", dbError);
            return NextResponse.json({ ...DEFAULT_SETTINGS, userId });
        }
    } catch (error) {
        console.error("GET /api/settings error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// PUT /api/settings — upsert recruiter settings
export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const settingsData = {
            userId,
            screeningQuestionsCount: body.screeningQuestionsCount ?? DEFAULT_SETTINGS.screeningQuestionsCount,
            techQuestionsCount: body.techQuestionsCount ?? DEFAULT_SETTINGS.techQuestionsCount,
            hrQuestionsCount: body.hrQuestionsCount ?? DEFAULT_SETTINGS.hrQuestionsCount,
            silenceTimeoutSeconds: body.silenceTimeoutSeconds ?? DEFAULT_SETTINGS.silenceTimeoutSeconds,
            autoEndInterview: body.autoEndInterview ?? DEFAULT_SETTINGS.autoEndInterview,
            aiVoiceId: body.aiVoiceId ?? DEFAULT_SETTINGS.aiVoiceId,
            aiInterviewerName: body.aiInterviewerName ?? DEFAULT_SETTINGS.aiInterviewerName,
            interviewTone: body.interviewTone ?? DEFAULT_SETTINGS.interviewTone,
            screeningPrompt: body.screeningPrompt ?? null,
            techPrompt: body.techPrompt ?? null,
            hrPrompt: body.hrPrompt ?? null,
            closingMessage: body.closingMessage ?? null,
            evaluationStrictness: body.evaluationStrictness ?? DEFAULT_SETTINGS.evaluationStrictness,
            companyName: body.companyName ?? null,
            recruiterDisplayName: body.recruiterDisplayName ?? null,
            customEmailSubject: body.customEmailSubject ?? null,
            customEmailIntro: body.customEmailIntro ?? null,
            replyToEmail: body.replyToEmail ?? null,
            inviteExpiryDays: body.inviteExpiryDays ?? DEFAULT_SETTINGS.inviteExpiryDays,
            companyLogoUrl: body.companyLogoUrl ?? null,
            notifyOnComplete: body.notifyOnComplete ?? DEFAULT_SETTINGS.notifyOnComplete,
            notificationEmail: body.notificationEmail ?? null,
            lowScoreAlert: body.lowScoreAlert ?? DEFAULT_SETTINGS.lowScoreAlert,
            lowScoreThreshold: body.lowScoreThreshold ?? DEFAULT_SETTINGS.lowScoreThreshold,
            industry: body.industry ?? null,
            defaultLocation: body.defaultLocation ?? null,
            defaultCurrency: body.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
            timezone: body.timezone ?? DEFAULT_SETTINGS.timezone,
            updatedAt: new Date(),
        };

        try {
            // Check if row exists
            const existing = await db
                .select({ id: recruiterSettings.id })
                .from(recruiterSettings)
                .where(eq(recruiterSettings.userId, userId))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(recruiterSettings)
                    .set(settingsData)
                    .where(eq(recruiterSettings.userId, userId));
            } else {
                await db.insert(recruiterSettings).values(settingsData);
            }

            return NextResponse.json({ success: true, settings: settingsData });
        } catch (dbError) {
            console.error("DB error saving settings:", dbError);
            return NextResponse.json({ error: "Failed to save settings to database" }, { status: 500 });
        }
    } catch (error) {
        console.error("PUT /api/settings error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
