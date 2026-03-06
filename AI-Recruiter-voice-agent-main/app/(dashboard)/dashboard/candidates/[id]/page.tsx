"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Linkedin,
  Globe,
  Clock,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Star,
  TrendingUp,
  Code2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TranscriptMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

interface InterviewSummary {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
  summary: string;
  keyHighlights: string[];
}

interface InterviewSession {
  id: number;
  interviewId: string;
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string | null;
  transcript: TranscriptMessage[];
  aiSummary: InterviewSummary | null;
  durationSeconds: number | null;
  questionsAsked: number | null;
  status: string | null;
  completedAt: string;
}

// Mock candidate data — replace with real DB fetch
const mockCandidate = {
  id: 1,
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  currentTitle: "Software Engineer",
  currentCompany: "TechCorp Inc.",
  linkedinUrl: "https://linkedin.com/in/sarahjohnson",
  portfolioUrl: "https://sarahjohnson.dev",
  resumeFileName: "sarah_johnson_resume.pdf",
  aiSummary: "Strong candidate with 5+ years of experience in full-stack development. Excellent communication skills and solid technical foundation.",
  strengths: '["Strong problem-solving skills", "Excellent communication", "React & Node.js expertise"]',
  weaknesses: '["Limited DevOps experience", "No team lead experience"]',
  skills: '["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"]',
  experienceYears: "5",
  status: "interviewing",
  notes: "Referred by John from engineering team.",
  tags: '["senior", "frontend", "react"]',
  createdAt: new Date().toISOString(),
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold w-5 text-right">{score}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const recommendationConfig = {
  "Strong Yes": { color: "bg-green-500/20 text-green-600 border-green-500/30", icon: ThumbsUp, iconColor: "text-green-600" },
  "Yes": { color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: ThumbsUp, iconColor: "text-blue-600" },
  "Maybe": { color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", icon: Minus, iconColor: "text-yellow-600" },
  "No": { color: "bg-red-500/20 text-red-600 border-red-500/30", icon: ThumbsDown, iconColor: "text-red-600" },
};

const statusColors: Record<string, string> = {
  new: "bg-muted text-muted-foreground border-border",
  reviewing: "bg-blue-500/10 text-blue-600 border-blue-200",
  shortlisted: "bg-purple-500/10 text-purple-600 border-purple-200",
  interviewing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  offered: "bg-green-500/10 text-green-600 border-green-200",
  hired: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  rejected: "bg-red-500/10 text-red-600 border-red-200",
};

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  // In a real app, fetch candidate from DB using id
  const candidate = mockCandidate;

  // Try to fetch interview session for this candidate
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        // In a real app, you'd look up the interviewId from emailInvites by candidateId
        // For now, we'll try to fetch by a mock interviewId
        const response = await fetch(`/api/interview/complete?interviewId=mock-${id}`);
        if (response.ok) {
          const data = await response.json();
          setInterviewSession(data);
        }
      } catch (err) {
        // No interview session found
      } finally {
        setLoadingInterview(false);
      }
    };

    fetchInterview();
  }, [id]);

  const skills = candidate.skills ? JSON.parse(candidate.skills) as string[] : [];
  const strengths = candidate.strengths ? JSON.parse(candidate.strengths) as string[] : [];
  const weaknesses = candidate.weaknesses ? JSON.parse(candidate.weaknesses) as string[] : [];
  const tags = candidate.tags ? JSON.parse(candidate.tags) as string[] : [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Candidates
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
            <p className="text-sm text-muted-foreground">
              {candidate.currentTitle} {candidate.currentCompany && `@ ${candidate.currentCompany}`}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge className={`text-xs border ${statusColors[candidate.status] || statusColors.new}`}>
                {candidate.status}
              </Badge>
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Contact & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{candidate.location}</span>
                </div>
              )}
              {candidate.currentCompany && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{candidate.currentCompany}</span>
                </div>
              )}
              {candidate.linkedinUrl && (
                <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-blue-500 hover:text-blue-600">
                  <Linkedin className="w-4 h-4 shrink-0" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {candidate.portfolioUrl && (
                <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-violet-500 hover:text-violet-600">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Portfolio</span>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {candidate.experienceYears && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-semibold text-foreground">{candidate.experienceYears} years</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: AI Analysis + Interview Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Resume Summary */}
          {candidate.aiSummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{candidate.aiSummary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Strengths
                      </p>
                      <ul className="space-y-1">
                        {strengths.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-600 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Areas to Improve
                      </p>
                      <ul className="space-y-1">
                        {weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                AI Interview Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInterview ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading interview results...
                </div>
              ) : !interviewSession ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No interview completed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Interview results will appear here once the candidate completes their session</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Interview metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {interviewSession.durationSeconds ? formatDuration(interviewSession.durationSeconds) : "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {interviewSession.questionsAsked || 0} questions
                    </div>
                    <Badge
                      className={`text-xs border ${interviewSession.status === "completed" ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"}`}
                    >
                      {interviewSession.status}
                    </Badge>
                  </div>

                  {interviewSession.aiSummary && (
                    <>
                      <Separator />

                      {/* Recommendation */}
                      {(() => {
                        const rec = interviewSession.aiSummary!.recommendation;
                        const config = recommendationConfig[rec] || recommendationConfig["Maybe"];
                        const RecIcon = config.icon;
                        return (
                          <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.color}`}>
                            <RecIcon className={`w-5 h-5 ${config.iconColor}`} />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommendation</p>
                              <p className="text-sm font-bold text-foreground">{rec}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="text-2xl font-bold text-foreground">
                                {interviewSession.aiSummary!.overallScore}
                                <span className="text-xs text-muted-foreground">/10</span>
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Score bars */}
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-muted-foreground">Communication</span>
                          </div>
                          <ScoreBar score={interviewSession.aiSummary!.communicationScore} color="bg-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Code2 className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-muted-foreground">Technical</span>
                          </div>
                          <ScoreBar score={interviewSession.aiSummary!.technicalScore} color="bg-purple-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">Overall</span>
                          </div>
                          <ScoreBar score={interviewSession.aiSummary!.overallScore} color="bg-green-500" />
                        </div>
                      </div>

                      {/* Strengths & Concerns */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Strengths
                          </p>
                          <ul className="space-y-1">
                            {interviewSession.aiSummary!.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-yellow-600 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Concerns
                          </p>
                          {interviewSession.aiSummary!.concerns.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">None identified</p>
                          ) : (
                            <ul className="space-y-1">
                              {interviewSession.aiSummary!.concerns.map((c, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Key Highlights */}
                      {interviewSession.aiSummary!.keyHighlights?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-yellow-600" /> Key Highlights
                          </p>
                          <ul className="space-y-1">
                            {interviewSession.aiSummary!.keyHighlights.map((h, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Star className="w-3 h-3 text-yellow-600 mt-0.5 shrink-0" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Summary text */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">AI Assessment</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {interviewSession.aiSummary!.summary}
                        </p>
                      </div>

                      {/* Transcript toggle */}
                      {interviewSession.transcript?.length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowTranscript((v) => !v)}
                            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {showTranscript ? "Hide" : "View"} Full Transcript ({interviewSession.transcript.length} messages)
                          </button>

                          {showTranscript && (
                            <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
                              {interviewSession.transcript.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${msg.role === "ai" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    }`}>
                                    {msg.role === "ai" ? "AI" : "C"}
                                  </div>
                                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "ai"
                                      ? "bg-primary/10 text-foreground rounded-tl-sm"
                                      : "bg-muted text-muted-foreground rounded-tr-sm"
                                    }`}>
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {candidate.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Recruiter Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{candidate.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
