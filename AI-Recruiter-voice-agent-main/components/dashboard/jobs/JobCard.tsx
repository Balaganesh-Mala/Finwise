"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    MoreHorizontal,
    Sparkles,
    MapPin,
    Briefcase,
    DollarSign,
    Users,
    Clock,
    Loader2,
    Building2,
    CheckCircle2,
    XCircle,
    FileEdit,
} from "lucide-react";
import { CandidateMatchList } from "./CandidateMatchList";
import SendInviteModal from "./SendInviteModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Job {
    id: number;
    title: string;
    department?: string;
    location?: string;
    type?: string;
    experienceLevel?: string;
    salaryMin?: string;
    salaryMax?: string;
    salaryCurrency?: string;
    status?: string;
    matchedCandidates?: string;
    createdAt: string;
}

interface JobCardProps {
    job: Job;
}

const statusConfig: Record<string, { label: string; badgeClass: string; dot: string }> = {
    active: {
        label: "Active",
        badgeClass:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
        dot: "bg-emerald-500",
    },
    draft: {
        label: "Draft",
        badgeClass:
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
        dot: "bg-amber-500",
    },
    closed: {
        label: "Expired",
        badgeClass:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
        dot: "bg-red-500",
    },
};

export function JobCard({ job }: JobCardProps) {
    const router = useRouter();
    const [showMatches, setShowMatches] = useState(false);
    const [matching, setMatching] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Parse existing matches from DB
    const existingMatches: any[] = (() => {
        try {
            return job.matchedCandidates ? JSON.parse(job.matchedCandidates) : [];
        } catch {
            return [];
        }
    })();

    const status = job.status || "draft";
    const statusInfo = statusConfig[status] || statusConfig.draft;

    // Fetch all candidates to enrich match data
    const fetchCandidates = async () => {
        if (candidates.length > 0) return;
        setLoadingCandidates(true);
        try {
            const response = await fetch("/api/candidates");
            if (response.ok) {
                const data = await response.json();
                setCandidates(data.candidates || []);
            }
        } catch (error) {
            console.error("Failed to fetch candidates", error);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleOpenMatches = () => {
        setShowMatches(true);
        fetchCandidates();
    };

    // Enrich existing matches with full candidate data
    const enrichedMatches = existingMatches
        .map((match: any) => {
            const candidate = candidates.find((c) => c.id === match.id);
            return { ...match, candidate };
        })
        .filter((m: any) => m.candidate);

    // Use enriched if available, otherwise raw existing matches
    const displayMatches = enrichedMatches.length > 0 ? enrichedMatches : existingMatches;

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch(`/api/jobs/${job.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error();
            toast.success(`Status updated to ${newStatus}`);
            router.refresh();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleFindMatches = async () => {
        setMatching(true);
        setShowMatches(true);
        try {
            const response = await fetch("/api/jobs/match-candidates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: job.id }),
            });
            if (!response.ok) throw new Error();
            const data = await response.json();

            // Merge newly fetched candidate data into state
            setCandidates((prev) => {
                const newCandidates = (data.matches || [])
                    .map((m: any) => m.candidate)
                    .filter(Boolean);
                const merged = [...prev];
                newCandidates.forEach((c: any) => {
                    if (!merged.find((x) => x.id === c.id)) merged.push(c);
                });
                return merged;
            });

            toast.success(`Found ${data.matches?.length ?? 0} matches!`);
            router.refresh();
        } catch {
            toast.error("Failed to find matches");
            setShowMatches(false);
        } finally {
            setMatching(false);
        }
    };

    const handleToggleSelect = (id: number) => {
        setSelectedCandidates((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const ids = displayMatches
            .map((m: any) => m.candidate?.id ?? m.id)
            .filter(Boolean);
        setSelectedCandidates(ids);
    };

    const handleDeselectAll = () => {
        setSelectedCandidates([]);
    };

    const formattedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const salaryDisplay =
        job.salaryMin
            ? `${job.salaryCurrency ?? "USD"} ${parseInt(job.salaryMin).toLocaleString()}${job.salaryMax ? `–${parseInt(job.salaryMax).toLocaleString()}` : ""}`
            : null;

    return (
        <>
            <Card className="group overflow-hidden hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Card Header */}
                    <div className="p-5 flex-1">
                        {/* Top Row: Status badge + Menu */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                            {/* Status */}
                            <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                            </span>

                            {/* Actions Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-sm w-44">
                                    <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                        Mark as Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                                        <FileEdit className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                        Mark as Draft
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
                                        <XCircle className="h-3.5 w-3.5 mr-2 text-red-500" />
                                        Mark as Expired
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Job Title */}
                        <h3
                            className="font-semibold text-base leading-snug text-foreground line-clamp-2 mb-1"
                            title={job.title}
                        >
                            {job.title}
                        </h3>

                        {/* Department & Location */}
                        {(job.department || job.location) && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                                {job.department && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        {job.department}
                                    </span>
                                )}
                                {job.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {job.location}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.type && (
                                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 capitalize gap-1">
                                    <Briefcase className="h-2.5 w-2.5" />
                                    {job.type}
                                </Badge>
                            )}
                            {job.experienceLevel && (
                                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 capitalize gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {job.experienceLevel}
                                </Badge>
                            )}
                            {salaryDisplay && (
                                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 gap-1">
                                    <DollarSign className="h-2.5 w-2.5" />
                                    {salaryDisplay}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3 border-t bg-muted/30 flex items-center justify-between gap-2">
                        {/* Matches count */}
                        <button
                            onClick={handleOpenMatches}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Users className="h-3.5 w-3.5" />
                            {existingMatches.length > 0
                                ? `${existingMatches.length} match${existingMatches.length !== 1 ? "es" : ""}`
                                : "No matches yet"}
                        </button>

                        {/* Find Matches Button */}
                        <Button
                            size="sm"
                            onClick={handleFindMatches}
                            disabled={matching}
                            className="h-7 text-[11px] px-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-sm"
                        >
                            {matching ? (
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            ) : (
                                <Sparkles className="mr-1.5 h-3 w-3" />
                            )}
                            {matching ? "Matching..." : "Find Matches"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Matches Dialog */}
            <Dialog
                open={showMatches}
                onOpenChange={(open) => {
                    setShowMatches(open);
                    if (!open) {
                        setShowInviteModal(false);
                        setSelectedCandidates([]);
                    }
                }}
            >
                <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0">
                    {!showInviteModal && (
                        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-lg font-semibold">
                                        Matched Candidates
                                    </DialogTitle>
                                    <DialogDescription className="mt-0.5 text-sm">
                                        AI-ranked candidates for{" "}
                                        <span className="font-medium text-foreground">{job.title}</span>
                                    </DialogDescription>
                                </div>
                                {existingMatches.length > 0 && (
                                    <Badge variant="secondary" className="text-sm px-3 py-1 shrink-0">
                                        {existingMatches.length} match{existingMatches.length !== 1 ? "es" : ""}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {showInviteModal ? (
                            <SendInviteModal
                                selectedCandidates={selectedCandidates}
                                jobId={job.id}
                                onBack={() => setShowInviteModal(false)}
                                onClose={() => {
                                    setShowInviteModal(false);
                                    setShowMatches(false);
                                    setSelectedCandidates([]);
                                }}
                            />
                        ) : matching || loadingCandidates ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <Loader2 className="h-16 w-16 animate-spin text-violet-600 absolute inset-0" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-foreground">
                                        {matching ? "AI is analyzing candidates..." : "Loading profiles..."}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {matching
                                            ? "Comparing skills, experience, and requirements"
                                            : "Fetching candidate data"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <CandidateMatchList
                                    matches={displayMatches}
                                    selectedCandidates={selectedCandidates}
                                    onToggleSelect={handleToggleSelect}
                                    onSelectAll={handleSelectAll}
                                    onDeselectAll={handleDeselectAll}
                                    onSendInvite={() => setShowInviteModal(true)}
                                />
                            </div>
                        )}
                    </div>

                    {!matching && !loadingCandidates && !showInviteModal && existingMatches.length > 0 && (
                        <div className="px-6 py-4 border-t shrink-0 flex justify-end">
                            <Button
                                onClick={handleFindMatches}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-500" />
                                Re-run AI Matching
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
