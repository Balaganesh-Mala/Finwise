import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { JobList } from "@/components/dashboard/jobs/JobList";
import { AddJobModal } from "@/components/dashboard/jobs/AddJobModal";
import { Briefcase, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JobsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const userJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, userId))
        .orderBy(desc(jobs.createdAt));

    // Serialize dates and handle nulls for client components
    const formattedJobs = userJobs.map((job) => ({
        ...job,
        department: job.department || undefined,
        location: job.location || undefined,
        type: job.type || undefined,
        experienceLevel: job.experienceLevel || undefined,
        salaryMin: job.salaryMin || undefined,
        salaryMax: job.salaryMax || undefined,
        salaryCurrency: job.salaryCurrency || undefined,
        status: job.status || undefined,
        matchedCandidates: job.matchedCandidates || undefined,
        createdAt: job.createdAt.toISOString(),
    }));

    const totalJobs = formattedJobs.length;
    const activeJobs = formattedJobs.filter(j => j.status === "active").length;
    const draftJobs = formattedJobs.filter(j => j.status === "draft").length;
    const closedJobs = formattedJobs.filter(j => j.status === "closed").length;

    const stats = [
        {
            title: "Total Jobs",
            value: totalJobs,
            icon: Briefcase,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            title: "Active",
            value: activeJobs,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Drafts",
            value: draftJobs,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            title: "Expired",
            value: closedJobs,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Job Postings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage your open positions. Use AI to find the best candidates.
                    </p>
                </div>
                <AddJobModal />
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${stat.bg}`}>
                                <stat.icon className={`size-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Jobs Grid */}
            <JobList jobs={formattedJobs} />
        </div>
    );
}
