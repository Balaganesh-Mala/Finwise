import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { candidates } from "@/lib/db/schema";

type CandidatePayload = {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    currentTitle?: string;
    currentCompany?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl?: string;
    resumeText?: string;
    resumeFileName?: string;
    strengths?: string[] | string;
    weaknesses?: string[] | string;
    aiSummary?: string;
    skills?: string[] | string;
    experienceYears?: string;
    status?: "new" | "reviewing" | "shortlisted" | "interviewing" | "offered" | "hired" | "rejected";
    notes?: string;
    tags?: string[] | string;
};

function toJsonArrayText(value?: string[] | string) {
    if (!value) return null;

    if (Array.isArray(value)) {
        const cleaned = value.map((item) => item.trim()).filter(Boolean);
        return cleaned.length ? JSON.stringify(cleaned) : null;
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
            .from(candidates)
            .where(eq(candidates.userId, userId))
            .orderBy(desc(candidates.createdAt));

        return NextResponse.json({ candidates: rows });
    } catch (error) {
        console.error("Candidates GET error:", error);
        return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as CandidatePayload;

        if (!body.name?.trim() || !body.email?.trim()) {
            return NextResponse.json(
                { error: "name and email are required" },
                { status: 400 }
            );
        }

        const now = new Date();

        const inserted = await db
            .insert(candidates)
            .values({
                userId,
                name: body.name.trim(),
                email: body.email.trim(),
                phone: body.phone?.trim() || null,
                location: body.location?.trim() || null,
                currentTitle: body.currentTitle?.trim() || null,
                currentCompany: body.currentCompany?.trim() || null,
                linkedinUrl: body.linkedinUrl?.trim() || null,
                portfolioUrl: body.portfolioUrl?.trim() || null,
                resumeUrl: body.resumeUrl?.trim() || null,
                resumeText: body.resumeText || null,
                resumeFileName: body.resumeFileName || null,
                strengths: toJsonArrayText(body.strengths),
                weaknesses: toJsonArrayText(body.weaknesses),
                aiSummary: body.aiSummary?.trim() || null,
                skills: toJsonArrayText(body.skills),
                experienceYears: body.experienceYears?.trim() || null,
                status: body.status || "new",
                notes: body.notes?.trim() || null,
                tags: toJsonArrayText(body.tags),
                updatedAt: now,
            })
            .returning();

        return NextResponse.json({ candidate: inserted[0] }, { status: 201 });
    } catch (error) {
        console.error("Candidates POST error:", error);
        return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
    }
}
