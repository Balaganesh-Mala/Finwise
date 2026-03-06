import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { emailInvites, candidates, jobs } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import Plunk from "@plunk/node";
import { randomBytes } from "crypto";

// Initialize Plunk client
const plunk = new Plunk(process.env.PLUNK_API_KEY || "");

// Generate a unique interview link
function generateUniqueInterviewLink(
    interviewType: string,
    candidateId: number,
    jobId?: number
): { fullLink: string; interviewId: string } {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const interviewId = randomBytes(8).toString("hex");
    const jobIdParam = jobId ? `&jobId=${jobId}` : "";
    const fullLink = `${baseUrl}/interview/${interviewId}?type=${interviewType}&candidateId=${candidateId}${jobIdParam}`;
    return { fullLink, interviewId };
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { candidateIds, jobId, interviewType, forceResend = false } = body;

        if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
            return NextResponse.json(
                { error: "Candidate IDs are required" },
                { status: 400 }
            );
        }

        // Fetch job details to get title
        let jobTitle = "";
        if (jobId) {
            const job = await db.query.jobs.findFirst({
                where: eq(jobs.id, jobId),
                columns: { title: true },
            });
            if (job) jobTitle = job.title;
        }

        // Check for already-invited candidates (only when not force-resending)
        let newCandidateIds = candidateIds;
        let alreadyInvitedCount = 0;

        if (jobId && !forceResend) {
            const existingInvites = await db
                .select({ candidateId: emailInvites.candidateId })
                .from(emailInvites)
                .where(
                    and(
                        eq(emailInvites.userId, userId),
                        eq(emailInvites.jobId, jobId),
                        inArray(emailInvites.candidateId, candidateIds)
                    )
                );

            const invitedCandidateIds = new Set(existingInvites.map((i) => i.candidateId));
            alreadyInvitedCount = invitedCandidateIds.size;
            newCandidateIds = candidateIds.filter((id: number) => !invitedCandidateIds.has(id));
        }

        if (newCandidateIds.length === 0) {
            return NextResponse.json(
                {
                    error: "All selected candidates have already been invited for this job",
                    alreadyInvited: alreadyInvitedCount,
                    canForceResend: true,
                },
                { status: 400 }
            );
        }

        // Fetch candidate details
        const candidateRecords = await db
            .select()
            .from(candidates)
            .where(
                and(
                    eq(candidates.userId, userId),
                    inArray(candidates.id, newCandidateIds)
                )
            );

        if (candidateRecords.length === 0) {
            return NextResponse.json(
                { error: "No candidates found" },
                { status: 404 }
            );
        }

        const results = {
            sent: [] as number[],
            failed: [] as { id: number; email: string; error: string }[],
        };

        // Send emails to each candidate
        for (const candidate of candidateRecords) {
            try {
                const { fullLink: uniqueInterviewLink, interviewId } =
                    generateUniqueInterviewLink(
                        interviewType || "screening",
                        candidate.id,
                        jobId
                    );

                const interviewLabel =
                    interviewType === "tech"
                        ? "Technical Interview"
                        : interviewType === "hr"
                        ? "HR / Final Interview"
                        : "Screening Call";

                const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Invitation</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0;">Dear <strong>${candidate.name}</strong>,</p>
    <p>Thank you for your interest in joining our team. We were impressed with your background and would like to invite you for a <strong>${interviewLabel}</strong>.</p>
    ${jobTitle ? `<p><strong>Position:</strong> ${jobTitle}</p>` : ""}
    <p>Please click the button below to start your AI-powered interview:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${uniqueInterviewLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Start Interview
      </a>
    </div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="color: #667eea;">${uniqueInterviewLink}</span>
    </p>
    <p>Good luck!</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The Recruitment Team</p>
  </div>
</body>
</html>`;

                // Send email via Plunk API
                await plunk.emails.send({
                    to: candidate.email,
                    subject: jobTitle
                        ? `Interview Invitation: ${jobTitle}`
                        : "Interview Invitation",
                    body: emailHtml,
                });

                // Save invite record to database
                await db.insert(emailInvites).values({
                    userId,
                    candidateId: candidate.id,
                    candidateEmail: candidate.email,
                    jobId: jobId || null,
                    jobTitle: jobTitle || null,
                    interviewType: interviewType || null,
                    uniqueInterviewLink,
                    interviewId,
                });

                results.sent.push(candidate.id);
            } catch (emailError) {
                console.error(
                    `Failed to send email to candidate ${candidate.id}:`,
                    emailError
                );
                results.failed.push({
                    id: candidate.id,
                    email: candidate.email,
                    error:
                        emailError instanceof Error
                            ? emailError.message
                            : "Unknown error",
                });
            }
        }

        return NextResponse.json({
            success: true,
            results: {
                totalSelected: candidateIds.length,
                sent: results.sent.length,
                failed: results.failed.length,
                alreadyInvited: alreadyInvitedCount,
            },
            details: results,
        });
    } catch (error) {
        console.error("POST /api/candidates/send-invite error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
