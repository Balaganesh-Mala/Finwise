"use client";

import { cn } from "@/lib/utils";

type Recommendation = "Strong Yes" | "Yes" | "Maybe" | "No";

interface InterviewScoreBadgeProps {
    score: number; // 1–10
    recommendation?: Recommendation;
    size?: "sm" | "md";
}

const recommendationConfig: Record<Recommendation, { label: string; color: string; bg: string }> = {
    "Strong Yes": {
        label: "Strong Yes",
        color: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30",
    },
    Yes: {
        label: "Yes",
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30",
    },
    Maybe: {
        label: "Maybe",
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30",
    },
    No: {
        label: "No",
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30",
    },
};

function getScoreColor(score: number) {
    if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 6) return "text-blue-600 dark:text-blue-400";
    if (score >= 4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

function getProgressColor(score: number) {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
}

export function InterviewScoreBadge({ score, recommendation, size = "md" }: InterviewScoreBadgeProps) {
    const pct = Math.round((score / 10) * 100);
    const recConfig = recommendation ? recommendationConfig[recommendation] : null;

    return (
        <div className={cn("flex flex-col gap-1.5", size === "sm" ? "gap-1" : "gap-1.5")}>
            {/* Score row */}
            <div className="flex items-center justify-between gap-2">
                <span className={cn("font-bold tabular-nums", getScoreColor(score), size === "sm" ? "text-sm" : "text-base")}>
                    {pct}%
                </span>
                <span className={cn("text-muted-foreground", size === "sm" ? "text-[10px]" : "text-xs")}>
                    {score}/10
                </span>
            </div>

            {/* Progress bar */}
            <div className={cn("w-full rounded-full bg-muted overflow-hidden", size === "sm" ? "h-1.5" : "h-2")}>
                <div
                    className={cn("h-full rounded-full transition-all", getProgressColor(score))}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Recommendation badge */}
            {recConfig && (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 font-medium w-fit",
                        recConfig.bg,
                        recConfig.color,
                        size === "sm" ? "text-[10px]" : "text-xs"
                    )}
                >
                    {recConfig.label}
                </span>
            )}
        </div>
    );
}
