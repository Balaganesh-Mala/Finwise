"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Loader2,
    Search,
    CalendarCheck,
    Mail,
    CheckCircle2,
    Clock,
    Users,
    Briefcase,
    ChevronDown,
    ExternalLink,
    BarChart3,
    Filter,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { InterviewScoreBadge } from "@/components/dashboard/interviews/InterviewScoreBadge";

type AISummary = {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    strengths: string[];
    concerns: string[];
    recommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
    summary: string;
    keyHighlights?: string[];
};

type InterviewSession = {
    id: number;
    interviewId: string;
    candidateName: string;
    durationSeconds: number | null;
    questionsAsked: number | null;
    status: string | null;
    completedAt: string;
    aiSummary: AISummary | null;
};

type EnrichedInvite = {
    id: number;
    candidateId: number;
    candidateEmail: string;
    candidateName: string;
    candidateTitle: string | null;
    candidateCompany: string | null;
    jobId: number | null;
    jobTitle: string | null;
    interviewType: string | null;
    interviewId: string | null;
    uniqueInterviewLink: string | null;
    sentAt: string;
    hasCompleted: boolean;
    session: InterviewSession | null;
};

type JobSummary = {
    id: number;
    title: string;
    department: string | null;
    status: string | null;
    type: string | null;
    inviteCount: number;
    completedCount: number;
};

const interviewTypeLabel: Record<string, string> = {
    screening: "Screening",
    tech: "Technical",
    hr: "HR / Final",
};

const interviewTypeBadge: Record<string, string> = {
    screening: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    tech: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
    hr: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
};

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDuration(seconds: number | null) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + "m " + s + "s";
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CandidateAvatar({ name }: { name: string }) {
    const colors = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-cyan-600",
        "from-emerald-500 to-teal-600",
        "from-orange-500 to-amber-600",
        "from-pink-500 to-rose-600",
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return (
        <div className={"size-10 text-sm rounded-full bg-gradient-to-br " + colors[colorIndex] + " flex items-center justify-center text-white font-semibold shrink-0"}>
            {getInitials(name)}
        </div>
    );
}

function InviteCard({ invite }: { invite: EnrichedInvite }) {
    const typeKey = invite.interviewType ?? "screening";
    const typeLabel = interviewTypeLabel[typeKey] ?? typeKey;
    const typeBadge = interviewTypeBadge[typeKey] ?? interviewTypeBadge.screening;

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
            <CandidateAvatar name={invite.candidateName} />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <Link href={`/dashboard/candidates/${invite.candidateId}`} className="font-medium text-sm hover:underline truncate block">
                            {invite.candidateName}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">{invite.candidateEmail}</p>
                    </div>
                    {invite.hasCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-full px-2 py-0.5 shrink-0">
                            <CheckCircle2 className="size-3" />
                            Done
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 rounded-full px-2 py-0.5 shrink-0">
                            <Clock className="size-3" />
                            Pending
                        </span>
                    )}
                </div>
                {invite.candidateTitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {invite.candidateTitle}{invite.candidateCompany ? " @ " + invite.candidateCompany : ""}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={"text-[10px] border px-1.5 py-0 h-4 " + typeBadge}>{typeLabel}</Badge>
                    <span className="text-[10px] text-muted-foreground">Sent {formatDate(invite.sentAt)}</span>
                </div>
            </div>
        </div>
    );
}

function ResultCard({ invite }: { invite: EnrichedInvite }) {
    const session = invite.session!;
    const summary = session.aiSummary;

    return (
        <Link href={`/dashboard/schedules/${invite.interviewId}`} className="block">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                <CandidateAvatar name={invite.candidateName} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <span className="font-medium text-sm hover:underline truncate block">
                                {invite.candidateName}
                            </span>
                            <p className="text-xs text-muted-foreground truncate">{invite.candidateEmail}</p>
                        </div>
                        <ExternalLink className="size-3.5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                    {summary ? (
                        <div className="mt-2">
                            <InterviewScoreBadge score={summary.overallScore} recommendation={summary.recommendation} size="sm" />
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">No score available</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {session.durationSeconds && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" />{formatDuration(session.durationSeconds)}
                            </span>
                        )}
                        {session.questionsAsked && (
                            <span className="text-[10px] text-muted-foreground">{session.questionsAsked} Q&amp;A</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{formatDate(session.completedAt)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function SchedulesPage() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [invitesByJob, setInvitesByJob] = useState<Record<string, EnrichedInvite[]>>({});
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [resultFilter, setResultFilter] = useState<string>("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/interviews");
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to fetch");
                setJobs(data.jobs || []);
                setInvitesByJob(data.invitesByJob || {});
                const firstJobWithInvites = (data.jobs as JobSummary[]).find(
                    (j) => (data.invitesByJob[String(j.id)]?.length ?? 0) > 0
                );
                if (firstJobWithInvites) {
                    setSelectedJobId(String(firstJobWithInvites.id));
                } else if (data.jobs.length > 0) {
                    setSelectedJobId(String(data.jobs[0].id));
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load interview data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const selectedJob = useMemo(() => jobs.find((j) => String(j.id) === selectedJobId) ?? null, [jobs, selectedJobId]);

    const currentInvites = useMemo(() => {
        if (!selectedJobId) return [];
        return invitesByJob[selectedJobId] ?? [];
    }, [invitesByJob, selectedJobId]);

    const filteredInvites = useMemo(() => {
        return currentInvites.filter((invite) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                invite.candidateName.toLowerCase().includes(q) ||
                invite.candidateEmail.toLowerCase().includes(q) ||
                invite.candidateTitle?.toLowerCase().includes(q) ||
                invite.candidateCompany?.toLowerCase().includes(q);
            const matchesType = typeFilter === "all" || invite.interviewType === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [currentInvites, searchQuery, typeFilter]);

    const completedList = useMemo(() => {
        return filteredInvites.filter((i) => {
            if (!i.hasCompleted) return false;
            if (resultFilter === "all") return true;
            return i.session?.aiSummary?.recommendation === resultFilter;
        });
    }, [filteredInvites, resultFilter]);

    const stats = useMemo(() => {
        const total = currentInvites.length;
        const completed = currentInvites.filter((i) => i.hasCompleted).length;
        const scores = currentInvites
            .filter((i) => i.session?.aiSummary?.overallScore != null)
            .map((i) => i.session!.aiSummary!.overallScore);
        const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
        return { total, completed, avgScore };
    }, [currentInvites]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm">Loading interview data...</p>
            </div>
        );
    }

    const hasAnyInvites = Object.values(invitesByJob).some((arr) => arr.length > 0);

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Schedules &amp; Interviews</h1>
                <p className="text-sm text-muted-foreground mt-1">Track invited candidates and review AI interview results by job.</p>
            </div>

            {!hasAnyInvites ? (
                <div className="py-24 text-center border rounded-xl bg-card border-dashed">
                    <div className="mx-auto mb-4 size-14 rounded-full bg-muted flex items-center justify-center">
                        <CalendarCheck className="size-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No interviews yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Send interview invites to candidates from the Jobs page to see them here.
                    </p>
                    <Link href="/dashboard/jobs">
                        <Button variant="outline" className="mt-4 gap-2">
                            <Briefcase className="size-4" />
                            Go to Jobs
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 min-w-[220px] justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate text-sm font-medium">{selectedJob?.title ?? "Select a Job"}</span>
                                    </div>
                                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-72">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Select Job</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {jobs.map((job) => (
                                    <DropdownMenuItem
                                        key={job.id}
                                        onClick={() => { setSelectedJobId(String(job.id)); setSearchQuery(""); setTypeFilter("all"); setResultFilter("all"); }}
                                        className="flex items-center justify-between gap-2 cursor-pointer"
                                    >
                                        <span className="truncate text-sm">{job.title}</span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{job.inviteCount} invited</span>
                                            {job.completedCount > 0 && (
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 rounded-full px-1.5 py-0.5">{job.completedCount} done</span>
                                            )}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background" />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="size-3.5" />
                                    {typeFilter === "all" ? "All Types" : interviewTypeLabel[typeFilter] ?? typeFilter}
                                    <ChevronDown className="size-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTypeFilter("screening")}>Screening</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTypeFilter("tech")}>Technical</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTypeFilter("hr")}>HR / Final</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <BarChart3 className="size-3.5" />
                                    {resultFilter === "all" ? "All Results" : resultFilter}
                                    <ChevronDown className="size-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => setResultFilter("all")}>All Results</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResultFilter("Strong Yes")}>Strong Yes</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResultFilter("Yes")}>Yes</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResultFilter("Maybe")}>Maybe</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResultFilter("No")}>No</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {selectedJob && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Card className="border-0 bg-muted/40">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Mail className="size-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Invited</p>
                                        <p className="text-xl font-bold">{stats.total}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 bg-muted/40">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                        <p className="text-xl font-bold">{stats.completed}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 bg-muted/40 col-span-2 sm:col-span-1">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <TrendingUp className="size-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Avg Score</p>
                                        <p className="text-xl font-bold">{stats.avgScore ? stats.avgScore + "/10" : "—"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <div className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Mail className="size-4 text-blue-500" />
                                        </div>
                                        Invited Candidates
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">{filteredInvites.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                {filteredInvites.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-3 size-10 rounded-full bg-muted flex items-center justify-center">
                                            <Users className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No candidates found</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {searchQuery || typeFilter !== "all" ? "Try adjusting your filters." : "No invites sent for this job yet."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                                        {filteredInvites.map((invite) => (
                                            <InviteCard key={invite.id} invite={invite} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                        </div>
                                        Interview Results
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">{completedList.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                {completedList.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-3 size-10 rounded-full bg-muted flex items-center justify-center">
                                            <CalendarCheck className="size-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No results yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {resultFilter !== "all" ? "No candidates match this result filter." : "Candidates haven't completed their interviews yet."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                                        {completedList.map((invite) => (
                                            <ResultCard key={invite.id} invite={invite} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
