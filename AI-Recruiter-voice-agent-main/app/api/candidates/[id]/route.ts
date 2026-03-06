import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { candidates } from "@/lib/db/schema";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const candidateId = parseInt(id);

        if (isNaN(candidateId)) {
            return NextResponse.json({ error: "Invalid candidate ID" }, { status: 400 });
        }

        const deleted = await db
            .delete(candidates)
            .where(and(eq(candidates.id, candidateId), eq(candidates.userId, userId)))
            .returning();

        if (!deleted.length) {
            return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete candidate error:", error);
        return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
    }
}
