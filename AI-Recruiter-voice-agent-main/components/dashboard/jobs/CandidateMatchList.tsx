"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    UserRound,
    ExternalLink,
    Star,
    CheckSquare,
    Square,
    Mail,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CandidateMatch {
    id: number;
    matchScore: number;
    reason: string;
    candidate?: {
        id: number;
        name: string;
        email: string;
        currentTitle?: string;
        currentCompany?: string;
        skills?: string;
        status?: string;
    };
}

interface CandidateMatchListProps {
    matches: CandidateMatch[];
    selectedCandidates: number[];
    onToggleSelect: (id: number) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onSendInvite: () => void;
}

const scoreConfig = (score: number) => {
    if (score >= 80)
        return {
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            bar: "bg-emerald-500",
            label: "Excellent",
        };
    if (score >= 60)
        return {
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            bar: "bg-blue-500",
            label: "Good",
        };
    if (score >= 40)
        return {
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30",
            bar: "bg-amber-500",
            label: "Fair",
        };
    return {
        color: "text-muted-foreground",
        bg: "bg-muted",
        bar: "bg-muted-foreground",
        label: "Low",
    };
};

export function CandidateMatchList({
    matches,
    selectedCandidates,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onSendInvite,
}: CandidateMatchListProps) {
    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <UserRound className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">No matches found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Click &quot;Find Matches&quot; to let AI analyze and rank candidates for this role.
                </p>
            </div>
        );
    }

    const allSelected =
        matches.length > 0 && selectedCandidates.length === matches.length;
    const someSelected = selectedCandidates.length > 0;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        className="text-xs h-8 gap-1.5"
                    >
                        {allSelected ? (
                            <CheckSquare className="h-3.5 w-3.5" />
                        ) : (
                            <Square className="h-3.5 w-3.5" />
                        )}
                        {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                    {someSelected && (
                        <span className="text-xs text-muted-foreground">
                            {selectedCandidates.length} selected
                        </span>
                    )}
                </div>
                {someSelected && (
                    <Button
                        size="sm"
                        onClick={onSendInvite}
                        className="h-8 gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                    >
                        <Mail className="h-3.5 w-3.5" />
                        Send Invite ({selectedCandidates.length})
                    </Button>
                )}
            </div>

            {/* Match List */}
            <div className="space-y-2">
                {matches.map((match, index) => {
                    const cfg = scoreConfig(match.matchScore);
                    const candidate = match.candidate;

                    const skills = candidate?.skills
                        ? (() => {
                              try {
                                  return JSON.parse(candidate.skills as string) as string[];
                              } catch {
                                  return (candidate.skills as string)
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                              }
                          })()
                        : [];

                    const isSelected = candidate?.id
                        ? selectedCandidates.includes(candidate.id)
                        : false;

                    return (
                        <div
                            key={match.id ?? index}
                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 ${
                                isSelected
                                    ? "bg-violet-50/60 border-violet-200 dark:bg-violet-900/10 dark:border-violet-800"
                                    : "bg-card hover:bg-muted/30 border-border"
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="shrink-0 pt-0.5">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                        candidate?.id && onToggleSelect(candidate.id)
                                    }
                                />
                            </div>

                            {/* Rank */}
                            <div className="shrink-0 w-6 text-center pt-0.5">
                                {index === 0 ? (
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                                ) : (
                                    <span className="text-xs font-medium text-muted-foreground">
                                        #{index + 1}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                {candidate?.name
                                    ? candidate.name.charAt(0).toUpperCase()
                                    : "?"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {candidate?.name || `Candidate #${match.id}`}
                                    </p>
                                    {index === 0 && (
                                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 border">
                                            Top Match
                                        </Badge>
                                    )}
                                </div>

                                {(candidate?.currentTitle || candidate?.currentCompany) && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {candidate.currentTitle}
                                        {candidate.currentCompany
                                            ? ` · ${candidate.currentCompany}`
                                            : ""}
                                    </p>
                                )}

                                {match.reason && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic leading-relaxed">
                                        &ldquo;{match.reason}&rdquo;
                                    </p>
                                )}

                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {skills.slice(0, 5).map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {skills.length > 5 && (
                                            <span className="text-[10px] text-muted-foreground">
                                                +{skills.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Score + Action */}
                            <div className="shrink-0 flex flex-col items-end gap-2">
                                {/* Score Badge */}
                                <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color}`}
                                >
                                    {match.matchScore}%
                                </div>

                                {/* Score Bar */}
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${cfg.bar}`}
                                        style={{ width: `${match.matchScore}%` }}
                                    />
                                </div>

                                {/* View Profile Link */}
                                {candidate?.id && (
                                    <Link
                                        href={`/dashboard/candidates/${candidate.id}`}
                                        target="_blank"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
