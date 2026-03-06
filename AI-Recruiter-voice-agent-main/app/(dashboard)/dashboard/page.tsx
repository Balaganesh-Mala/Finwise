"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  Mail,
  Plus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  activeJobs: number;
  totalJobs: number;
  totalCandidates: number;
  newCandidatesThisWeek: number;
  totalInvites: number;
  pendingInvites: number;
  completedInterviews: number;
  screeningRate: number;
};

type ActivityItem = {
  type: "interview_completed" | "invite_sent" | "candidate_added" | "job_created";
  text: string;
  time: string;
};

const activityIconMap: Record<
  ActivityItem["type"],
  { icon: React.ElementType; color: string }
> = {
  interview_completed: { icon: CheckCircle2, color: "text-green-500" },
  invite_sent: { icon: Mail, color: "text-blue-500" },
  candidate_added: { icon: Users, color: "text-purple-500" },
  job_created: { icon: Briefcase, color: "text-orange-500" },
};

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-4 mt-0.5 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch dashboard data");
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = stats
    ? [
        {
          title: "Active Jobs",
          value: stats.activeJobs.toString(),
          description:
            stats.totalJobs > 0
              ? `${stats.totalJobs} total job${stats.totalJobs !== 1 ? "s" : ""} posted`
              : "No jobs posted yet",
          icon: Briefcase,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          href: "/dashboard/jobs",
        },
        {
          title: "Total Candidates",
          value: stats.totalCandidates.toString(),
          description:
            stats.newCandidatesThisWeek > 0
              ? `+${stats.newCandidatesThisWeek} added this week`
              : "No new candidates this week",
          icon: Users,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
          href: "/dashboard/candidates",
        },
        {
          title: "Interviews Sent",
          value: stats.totalInvites.toString(),
          description:
            stats.pendingInvites > 0
              ? `${stats.pendingInvites} pending response${stats.pendingInvites !== 1 ? "s" : ""}`
              : stats.completedInterviews > 0
              ? "All interviews completed"
              : "No invites sent yet",
          icon: CalendarCheck,
          color: "text-green-500",
          bg: "bg-green-500/10",
          href: "/dashboard/schedules",
        },
        {
          title: "Screening Rate",
          value: stats.totalInvites > 0 ? `${stats.screeningRate}%` : "—",
          description:
            stats.completedInterviews > 0
              ? `${stats.completedInterviews} interview${stats.completedInterviews !== 1 ? "s" : ""} completed`
              : "No completed interviews yet",
          icon: TrendingUp,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          href: "/dashboard/schedules",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Welcome back! 👋</h2>
        <p className="text-purple-100 text-sm">
          Your AI voice agent is active and screening candidates 24/7. Here&apos;s your overview.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <Link key={stat.title} href={stat.href} className="block group">
                <Card className="transition-shadow group-hover:shadow-md">
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
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Bottom Section: Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            {!loading && recentActivity.length > 0 && (
              <Link href="/dashboard/schedules">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                  View all
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
            ) : recentActivity.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 size-10 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start by adding candidates or posting a job.
                </p>
              </div>
            ) : (
              recentActivity.map((activity, index) => {
                const { icon: Icon, color } = activityIconMap[activity.type] ?? {
                  icon: Clock,
                  color: "text-muted-foreground",
                };
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.time)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/jobs" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Briefcase className="size-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Post a Job</p>
                  <p className="text-xs text-muted-foreground">Create a new job listing</p>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/candidates" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Users className="size-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Add Candidate</p>
                  <p className="text-xs text-muted-foreground">Add to your talent pool</p>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/schedules" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">View Interviews</p>
                  <p className="text-xs text-muted-foreground">Track AI interview results</p>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4"
              >
                <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="size-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Configure AI Agent</p>
                  <p className="text-xs text-muted-foreground">Customize interview settings</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Empty State CTA — shown only when no data at all */}
      {!loading && stats && stats.totalJobs === 0 && stats.totalCandidates === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 size-14 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Plus className="size-7 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Get started with AI Recruiting</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Post your first job and add candidates to start using the AI voice agent for automated screening.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link href="/dashboard/jobs">
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/20">
                  <Briefcase className="size-4" />
                  Post a Job
                </Button>
              </Link>
              <Link href="/dashboard/candidates">
                <Button variant="outline" className="gap-2">
                  <Users className="size-4" />
                  Add Candidates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
