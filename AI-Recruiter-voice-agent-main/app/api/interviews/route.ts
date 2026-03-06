import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { emailInvites, interviewSessions, jobs, candidates } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

type InviteRow = {
    id: number;
    userId: string;
    candidateId: number;
    candidateEmail: string;
    jobId: number | null;
    jobTitle: string | null;
    interviewType: string | null;
    interviewId: string | null;
    screeningLink: string | null;
    uniqueInterviewLink: string | null;
    sentAt: Date;
    createdAt: Date;
};

type SessionRow = {
    id: number;
    interviewId: string;
    candidateName: string;
    candidateEmail: string | null;
    jobTitle: string | null;
    aiSummary: string | null;
    durationSeconds: number | null;
    questionsAsked: number | null;
    status: string | null;
    completedAt: Date;
};

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch all jobs for this recruiter
        let userJobs: { id: number; title: string; department: string | null; status: string | null; type: string | null }[] = [];
        try {
            userJobs = await db
                .select({
                    id: jobs.id,
                    title: jobs.title,
                    department: jobs.department,
                    status: jobs.status,
                    type: jobs.type,
                })
                .from(jobs)
                .where(eq(jobs.userId, userId));
        } catch (e) {
            console.warn("Failed to fetch jobs:", e);
        }

        // 2. Fetch all email invites for this recruiter
        let invites: InviteRow[] = [];
        try {
            const rows = await db
                .select()
                .from(emailInvites)
                .where(eq(emailInvites.userId, userId));
            invites = rows as InviteRow[];
        } catch (e) {
            console.warn("Failed to fetch email invites (table may not exist):", e);
            // Return empty data gracefully
            return NextResponse.json({
                jobs: userJobs.map((j) => ({ ...j, inviteCount: 0, completedCount: 0 })),
                invitesByJob: {},
            });
        }

        // 3. Fetch candidate details for all invited candidates
        const candidateIds = [...new Set(invites.map((i) => i.candidateId))];
        let candidateMap: Record<number, { name: string; email: string; currentTitle: string | null; currentCompany: string | null }> = {};

        if (candidateIds.length > 0) {
            try {
                const candidateRows = await db
                    .select({
                        id: candidates.id,
                        name: candidates.name,
                        email: candidates.email,
                        currentTitle: candidates.currentTitle,
                        currentCompany: candidates.currentCompany,
                    })
                    .from(candidates)
                    .where(inArray(candidates.id, candidateIds));

                candidateMap = Object.fromEntries(candidateRows.map((c) => [c.id, c]));
            } catch (e) {
                console.warn("Failed to fetch candidates:", e);
            }
        }

        // 4. Fetch all interview sessions for the invite interviewIds
        const interviewIds = invites
            .map((i) => i.interviewId)
            .filter((id): id is string => !!id);

        let sessionMap: Record<string, SessionRow> = {};

        if (interviewIds.length > 0) {
            try {
                const sessions = await db
                    .select({
                        id: interviewSessions.id,
                        interviewId: interviewSessions.interviewId,
                        candidateName: interviewSessions.candidateName,
                        candidateEmail: interviewSessions.candidateEmail,
                        jobTitle: interviewSessions.jobTitle,
                        aiSummary: interviewSessions.aiSummary,
                        durationSeconds: interviewSessions.durationSeconds,
                        questionsAsked: interviewSessions.questionsAsked,
                        status: interviewSessions.status,
                        completedAt: interviewSessions.completedAt,
                    })
                    .from(interviewSessions)
                    .where(inArray(interviewSessions.interviewId, interviewIds));

                sessionMap = Object.fromEntries(sessions.map((s) => [s.interviewId, s]));
            } catch (e) {
                console.warn("Failed to fetch interview sessions (table may not exist — run db:migrate):", e);
            }
        }

        // 5. Build enriched invites with candidate info + session status
        const enrichedInvites = invites.map((invite) => {
            const candidate = candidateMap[invite.candidateId];
            const session = invite.interviewId ? sessionMap[invite.interviewId] : null;

            let parsedSummary = null;
            if (session?.aiSummary) {
                try {
                    parsedSummary = JSON.parse(session.aiSummary);
                } catch {
                    parsedSummary = null;
                }
            }

            return {
                id: invite.id,
                candidateId: invite.candidateId,
                candidateEmail: invite.candidateEmail,
                candidateName: candidate?.name ?? invite.candidateEmail,
                candidateTitle: candidate?.currentTitle ?? null,
                candidateCompany: candidate?.currentCompany ?? null,
                jobId: invite.jobId,
                jobTitle: invite.jobTitle,
                interviewType: invite.interviewType,
                interviewId: invite.interviewId,
                uniqueInterviewLink: invite.uniqueInterviewLink,
                sentAt: invite.sentAt.toISOString(),
                hasCompleted: !!session,
                session: session
                    ? {
                        id: session.id,
                        interviewId: session.interviewId,
                        candidateName: session.candidateName,
                        durationSeconds: session.durationSeconds,
                        questionsAsked: session.questionsAsked,
                        status: session.status,
                        completedAt: session.completedAt.toISOString(),
                        aiSummary: parsedSummary,
                    }
                    : null,
            };
        });

        // 6. Group invites by jobId
        const invitesByJob: Record<string, typeof enrichedInvites> = {};

        for (const invite of enrichedInvites) {
            const key = invite.jobId ? String(invite.jobId) : "no-job";
            if (!invitesByJob[key]) invitesByJob[key] = [];
            invitesByJob[key].push(invite);
        }

        return NextResponse.json({
            jobs: userJobs.map((j) => ({
                ...j,
                inviteCount: invitesByJob[String(j.id)]?.length ?? 0,
                completedCount: invitesByJob[String(j.id)]?.filter((i) => i.hasCompleted).length ?? 0,
            })),
            invitesByJob,
        });
    } catch (error) {
        console.error("GET /api/interviews error:", error);
        return NextResponse.json({ error: "Failed to fetch interview data" }, { status: 500 });
    }
}
