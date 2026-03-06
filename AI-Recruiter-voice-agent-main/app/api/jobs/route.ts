import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

type JobPayload = {
    title: string;
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
};

function toJsonArrayText(value?: string[] | string) {
    if (!value) return null;
    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }
    // If it's already a string, try to parse it to ensure it's valid JSON or just return it if it's a simple string that needs to be array-ified?
    // Based on schema usage, `skills` is text. But usually we want to store JSON string.
    // If input is "React, Node", we might want to split.
    // Let's stick to the pattern in candidates route for consistency.

    if (typeof value === 'string' && value.trim().startsWith('[')) {
        return value; // Already JSON string
    }

    const cleaned = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return cleaned.length ? JSON.stringify(cleaned) : null;
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rows = await db
            .select()
            .from(jobs)
            .where(eq(jobs.userId, userId))
            .orderBy(desc(jobs.createdAt));

        return NextResponse.json({ jobs: rows });
    } catch (error) {
        console.error("Jobs GET error:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as JobPayload;

        if (!body.title?.trim()) {
            return NextResponse.json(
                { error: "Job title is required" },
                { status: 400 }
            );
        }

        const inserted = await db
            .insert(jobs)
            .values({
                userId,
                title: body.title.trim(),
                department: body.department?.trim() || null,
                location: body.location?.trim() || null,
                type: body.type || "full-time",
                experienceLevel: body.experienceLevel || "mid",
                salaryMin: body.salaryMin?.toString() || null,
                salaryMax: body.salaryMax?.toString() || null,
                salaryCurrency: body.salaryCurrency || "USD",
                description: body.description?.trim() || null,
                requirements: body.requirements?.trim() || null,
                responsibilities: body.responsibilities?.trim() || null,
                skills: toJsonArrayText(body.skills),
                status: body.status || "draft",
            })
            .returning();

        return NextResponse.json({ job: inserted[0] }, { status: 201 });
    } catch (error) {
        console.error("Jobs POST error:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}
