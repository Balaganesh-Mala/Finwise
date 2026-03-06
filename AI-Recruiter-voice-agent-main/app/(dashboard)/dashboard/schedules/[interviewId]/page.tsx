"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Briefcase,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  BarChart3,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InterviewScoreBadge } from "@/components/dashboard/interviews/InterviewScoreBadge";

type TranscriptMessage = {
  id?: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
};

type AISummary = {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
  summary: string;
  keyHighlights: string[];
};

type InterviewSession = {
  id: number;
  interviewId: string;
  candidateName: string;
  candidateEmail: string | null;
  candidateId: number | null;
  jobId: number | null;
  jobTitle: string | null;
  transcript: TranscriptMessage[];
  aiSummary: AISummary | null;
  durationSeconds: number | null;
  questionsAsked: number | null;
  status: string | null;
  completedAt: string;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    score >= 8
      ? "bg-emerald-500"
      : score >= 6
      ? "bg-blue-500"
      : score >= 4
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score}/10</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  const styles: Record<string, string> = {
    "Strong Yes":
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    Yes: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    Maybe:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
    No: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold border rounded-full px-3 py-1 ${
        styles[rec] ?? styles["Maybe"]
      }`}
    >
      {rec === "Strong Yes" || rec === "Yes" ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <XCircle className="size-4" />
      )}
      {rec}
    </span>
  );
}

export default function InterviewResultPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/interview/complete?interviewId=${interviewId}`
        );
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Interview session not found");
          return;
        }
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Failed to fetch interview session:", err);
        setError("Failed to load interview results.");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) fetchSession();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Loading interview results...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="size-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="size-7 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">
            Interview Not Found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error || "This interview session could not be found."}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const summary = session.aiSummary;
  const transcript = session.transcript ?? [];
  const aiMessages = transcript.filter((m) => m.role === "ai");
  const userMessages = transcript.filter(
    (m) => m.role === "user" && m.content !== "[No response detected]"
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0 mt-0.5"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              Interview Results
            </h1>
            {session.status === "abandoned" && (
              <Badge variant="secondary" className="text-xs">
                Abandoned
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Full transcript and AI analysis for{" "}
            <span className="font-medium text-foreground">
              {session.candidateName}
            </span>
          </p>
        </div>
      </div>

      {/* Meta info bar */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 text-sm">
          <User className="size-4 text-muted-foreground" />
          <span className="font-medium">{session.candidateName}</span>
          {session.candidateEmail && (
            <span className="text-muted-foreground">
              · {session.candidateEmail}
            </span>
          )}
        </div>
        {session.jobTitle && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="size-4 text-muted-foreground" />
            <span>{session.jobTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span>{formatDuration(session.durationSeconds)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span>
            {session.questionsAsked ?? aiMessages.length} questions ·{" "}
            {userMessages.length} responses
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
          <span>Completed {formatDate(session.completedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: AI Summary */}
        <div className="lg:col-span-1 space-y-4">
          {summary ? (
            <>
              {/* Score card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="size-4 text-violet-500" />
                    AI Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-4xl font-bold text-foreground">
                      {summary.overallScore}
                      <span className="text-lg text-muted-foreground font-normal">
                        /10
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall Score
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <ScoreBar
                      label="Communication"
                      score={summary.communicationScore}
                    />
                    <ScoreBar
                      label="Technical"
                      score={summary.technicalScore}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Recommendation
                    </span>
                    <RecommendationBadge rec={summary.recommendation} />
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {summary.strengths?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Concerns */}
              {summary.concerns?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-500" />
                      Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span className="text-muted-foreground">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Candidate links */}
              {session.candidateId && (
                <Link href={`/dashboard/candidates/${session.candidateId}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <User className="size-4" />
                    View Candidate Profile
                    <ChevronRight className="size-4 ml-auto" />
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="size-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No AI Summary</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The AI summary was not generated for this session.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Summary text + Transcript */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Summary text */}
          {summary?.summary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="size-4 text-violet-500" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {summary.summary}
                </p>

                {summary.keyHighlights?.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Key Highlights
                    </p>
                    <ul className="space-y-2">
                      {summary.keyHighlights.map((h, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Star className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Full Transcript */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-blue-500" />
                  Full Conversation Transcript
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {transcript.length} messages
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transcript.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="size-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No transcript available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The conversation was not recorded.
                  </p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {transcript.map((msg, i) => (
                    <div
                      key={msg.id ?? i}
                      className={`p-4 ${
                        msg.role === "ai"
                          ? "bg-muted/30"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            msg.role === "ai"
                              ? "bg-violet-500/20 text-violet-500"
                              : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {msg.role === "ai" ? "AI" : "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">
                              {msg.role === "ai" ? "AI Interviewer" : session.candidateName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              msg.content === "[No response detected]"
                                ? "text-muted-foreground italic"
                                : "text-foreground"
                            }`}
                          >
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
