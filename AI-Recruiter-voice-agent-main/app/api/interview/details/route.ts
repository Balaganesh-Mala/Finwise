import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailInvites, jobs, candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/interview/details?interviewId=xxx
 * Public endpoint (no auth) — used by the candidate-facing interview landing page
 * to fetch real job + candidate info from the invite record.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json({ error: "interviewId is required" }, { status: 400 });
    }

    // Find the invite record for this interviewId
    const inviteRows = await db
      .select()
      .from(emailInvites)
      .where(eq(emailInvites.interviewId, interviewId))
      .limit(1);

    if (inviteRows.length === 0) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const invite = inviteRows[0];

    // Fetch job details if jobId exists
    let jobDetails: {
      title: string;
      department: string | null;
      location: string | null;
      type: string | null;
      description: string | null;
      requirements: string | null;
    } | null = null;

    if (invite.jobId) {
      const jobRows = await db
        .select({
          title: jobs.title,
          department: jobs.department,
          location: jobs.location,
          type: jobs.type,
          description: jobs.description,
          requirements: jobs.requirements,
        })
        .from(jobs)
        .where(eq(jobs.id, invite.jobId))
        .limit(1);

      if (jobRows.length > 0) {
        jobDetails = jobRows[0];
      }
    }

    // Fetch candidate name if candidateId exists
    let candidateName: string | null = null;
    if (invite.candidateId) {
      const candidateRows = await db
        .select({ name: candidates.name })
        .from(candidates)
        .where(eq(candidates.id, invite.candidateId))
        .limit(1);

      if (candidateRows.length > 0) {
        candidateName = candidateRows[0].name;
      }
    }

    return NextResponse.json({
      interviewId: invite.interviewId,
      candidateId: invite.candidateId,
      candidateEmail: invite.candidateEmail,
      candidateName,
      jobId: invite.jobId,
      jobTitle: jobDetails?.title ?? invite.jobTitle ?? "Software Engineer",
      jobDepartment: jobDetails?.department ?? null,
      jobLocation: jobDetails?.location ?? "Remote",
      jobType: jobDetails?.type ?? "full-time",
      jobDescription: jobDetails?.description ?? null,
      jobRequirements: jobDetails?.requirements ?? null,
      interviewType: invite.interviewType ?? "screening",
    });
  } catch (error) {
    console.error("GET /api/interview/details error:", error);
    return NextResponse.json({ error: "Failed to fetch interview details" }, { status: 500 });
  }
}
