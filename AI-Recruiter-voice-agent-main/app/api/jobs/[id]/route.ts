import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

type JobUpdatePayload = {
    title?: string;
    department?: string;
    location?: string;
    type?: "full-time" | "part-time" | "contract" | "internship" | "remote";
    experienceLevel?: "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
    salaryMin?: string;
    salaryMax?: string;
    salaryCurrency?: string;
    description?: string;
    requirements?: string;
    responsibilities?: string;
    skills?: string[] | string;
    status?: "draft" | "active" | "closed";
    matchedCandidates?: string;
};

function toJsonArrayText(value?: string[] | string) {
    if (!value) return null;
    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }

    if (typeof value === 'string' && value.trim().startsWith('[')) {
        return value; // Already JSON string
    }

    const cleaned = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return cleaned.length ? JSON.stringify(cleaned) : null;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jobId = parseInt(id);
        if (isNaN(jobId)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
        }

        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error("Job GET error:", error);
        return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jobId = parseInt(id);
        if (isNaN(jobId)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
        }

        const body = (await req.json()) as JobUpdatePayload;

        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.department !== undefined) updateData.department = body.department;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel;
        if (body.salaryMin !== undefined) updateData.salaryMin = body.salaryMin;
        if (body.salaryMax !== undefined) updateData.salaryMax = body.salaryMax;
        if (body.salaryCurrency !== undefined) updateData.salaryCurrency = body.salaryCurrency;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.requirements !== undefined) updateData.requirements = body.requirements;
        if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
        if (body.skills !== undefined) updateData.skills = toJsonArrayText(body.skills);
        if (body.status !== undefined) updateData.status = body.status;
        if (body.matchedCandidates !== undefined) updateData.matchedCandidates = body.matchedCandidates;

        updateData.updatedAt = new Date();

        const updated = await db
            .update(jobs)
            .set(updateData)
            .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
            .returning();

        if (!updated.length) {
            return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ job: updated[0] });
    } catch (error) {
        console.error("Job PATCH error:", error);
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    }
}
