import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, candidates, emailInvites, interviewSessions } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ── Fetch all jobs for this recruiter ──────────────────────────────
        const allJobs = await db
            .select({ id: jobs.id, status: jobs.status, createdAt: jobs.createdAt })
            .from(jobs)
            .where(eq(jobs.userId, userId));

        const activeJobsCount = allJobs.filter((j) => j.status === "active").length;
        const totalJobsCount = allJobs.length;

        // ── Fetch all candidates for this recruiter ────────────────────────
        const allCandidates = await db
            .select({ id: candidates.id, status: candidates.status, createdAt: candidates.createdAt })
            .from(candidates)
            .where(eq(candidates.userId, userId));

        const totalCandidatesCount = allCandidates.length;

        // Count candidates added this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newCandidatesThisWeek = allCandidates.filter(
            (c) => new Date(c.createdAt) >= oneWeekAgo
        ).length;

        // ── Fetch all email invites for this recruiter ─────────────────────
        let allInvites: {
            id: number;
            candidateId: number;
            candidateEmail: string;
            jobId: number | null;
            jobTitle: string | null;
            interviewType: string | null;
            interviewId: string | null;
            sentAt: Date;
        }[] = [];

        try {
            allInvites = await db
                .select({
                    id: emailInvites.id,
                    candidateId: emailInvites.candidateId,
                    candidateEmail: emailInvites.candidateEmail,
                    jobId: emailInvites.jobId,
                    jobTitle: emailInvites.jobTitle,
                    interviewType: emailInvites.interviewType,
                    interviewId: emailInvites.interviewId,
                    sentAt: emailInvites.sentAt,
                })
                .from(emailInvites)
                .where(eq(emailInvites.userId, userId))
                .orderBy(desc(emailInvites.sentAt));
        } catch (e) {
            console.warn("Failed to fetch email invites:", e);
        }

        const totalInvitesCount = allInvites.length;

        // ── Fetch interview sessions for this recruiter's invites ──────────
        const interviewIds = allInvites
            .map((i) => i.interviewId)
            .filter((id): id is string => !!id);

        let completedSessions: {
            id: number;
            interviewId: string;
            candidateName: string;
            candidateEmail: string | null;
            jobTitle: string | null;
            aiSummary: string | null;
            status: string | null;
            completedAt: Date;
        }[] = [];

        try {
            if (interviewIds.length > 0) {
                completedSessions = await db
                    .select({
                        id: interviewSessions.id,
                        interviewId: interviewSessions.interviewId,
                        candidateName: interviewSessions.candidateName,
                        candidateEmail: interviewSessions.candidateEmail,
                        jobTitle: interviewSessions.jobTitle,
                        aiSummary: interviewSessions.aiSummary,
                        status: interviewSessions.status,
                        completedAt: interviewSessions.completedAt,
                    })
                    .from(interviewSessions)
                    .where(inArray(interviewSessions.interviewId, interviewIds))
                    .orderBy(desc(interviewSessions.completedAt));
            }
        } catch (e) {
            console.warn("Failed to fetch interview sessions:", e);
        }

        const completedCount = completedSessions.length;

        // Screening rate = completed / total invites (as percentage)
        const screeningRate =
            totalInvitesCount > 0
                ? Math.round((completedCount / totalInvitesCount) * 100)
                : 0;

        // Pending invites (not yet completed)
        const completedInterviewIds = new Set(completedSessions.map((s) => s.interviewId));
        const pendingInvitesCount = allInvites.filter(
            (i) => !i.interviewId || !completedInterviewIds.has(i.interviewId)
        ).length;

        // ── Build recent activity feed ─────────────────────────────────────
        type ActivityItem = {
            type: "interview_completed" | "invite_sent" | "candidate_added" | "job_created";
            text: string;
            time: Date;
        };

        const activityItems: ActivityItem[] = [];

        // Recent completed interviews
        for (const session of completedSessions.slice(0, 5)) {
            activityItems.push({
                type: "interview_completed",
                text: `AI interview completed for ${session.candidateName}${session.jobTitle ? ` — ${session.jobTitle}` : ""}`,
                time: session.completedAt,
            });
        }

        // Recent invites sent
        for (const invite of allInvites.slice(0, 5)) {
            activityItems.push({
                type: "invite_sent",
                text: `Interview invite sent to ${invite.candidateEmail}${invite.jobTitle ? ` for ${invite.jobTitle}` : ""}`,
                time: invite.sentAt,
            });
        }

        // Recent candidates added
        const recentCandidates = await db
            .select({ id: candidates.id, name: candidates.name, currentTitle: candidates.currentTitle, createdAt: candidates.createdAt })
            .from(candidates)
            .where(eq(candidates.userId, userId))
            .orderBy(desc(candidates.createdAt))
            .limit(5);

        for (const candidate of recentCandidates) {
            activityItems.push({
                type: "candidate_added",
                text: `New candidate added: ${candidate.name}${candidate.currentTitle ? ` — ${candidate.currentTitle}` : ""}`,
                time: candidate.createdAt,
            });
        }

        // Recent jobs created
        const recentJobs = await db
            .select({ id: jobs.id, title: jobs.title, status: jobs.status, createdAt: jobs.createdAt })
            .from(jobs)
            .where(eq(jobs.userId, userId))
            .orderBy(desc(jobs.createdAt))
            .limit(5);

        for (const job of recentJobs) {
            activityItems.push({
                type: "job_created",
                text: `Job posted: ${job.title}`,
                time: job.createdAt,
            });
        }

        // Sort all activity by time descending and take top 8
        activityItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const recentActivity = activityItems.slice(0, 8).map((item) => ({
            type: item.type,
            text: item.text,
            time: item.time.toISOString(),
        }));

        return NextResponse.json({
            stats: {
                activeJobs: activeJobsCount,
                totalJobs: totalJobsCount,
                totalCandidates: totalCandidatesCount,
                newCandidatesThisWeek,
                totalInvites: totalInvitesCount,
                pendingInvites: pendingInvitesCount,
                completedInterviews: completedCount,
                screeningRate,
            },
            recentActivity,
        });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
