"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic2,
  Clock,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Shield,
  Headphones,
  Wifi,
  Video,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type InterviewDetails = {
  interviewId: string;
  candidateId: number | null;
  candidateEmail: string;
  candidateName: string | null;
  jobId: number | null;
  jobTitle: string;
  jobDepartment: string | null;
  jobLocation: string;
  jobType: string;
  jobDescription: string | null;
  jobRequirements: string | null;
  interviewType: string;
};

const interviewTypeLabel: Record<string, string> = {
  screening: "AI Voice Screening",
  tech: "AI Technical Interview",
  hr: "AI HR Interview",
};

const estimatedDuration: Record<string, string> = {
  screening: "15–20 minutes",
  tech: "20–30 minutes",
  hr: "15–25 minutes",
};

const whatToExpect = [
  "You will be asked questions about your experience and background.",
  "The AI voice agent will guide you through the entire interview.",
  "Speak clearly and take your time — there is no rush.",
  "Your responses will be recorded and reviewed by the hiring team.",
  "You will receive a follow-up email with next steps after the interview.",
];

const requirements = [
  { icon: Headphones, label: "Headphones or speakers recommended" },
  { icon: Mic2, label: "Working microphone required" },
  { icon: Video, label: "Webcam required" },
  { icon: Wifi, label: "Stable internet connection" },
  { icon: Shield, label: "Quiet environment preferred" },
];

export default function InterviewPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [details, setDetails] = useState<InterviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [nameError, setNameError] = useState("");

  // Fetch real interview details from DB
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/interview/details?interviewId=${interviewId}`
        );
        if (!res.ok) {
          const err = await res.json();
          setFetchError(err.error || "Interview not found");
          return;
        }
        const data: InterviewDetails = await res.json();
        setDetails(data);

        // Pre-fill name if candidate name is known
        if (data.candidateName) {
          setFullName(data.candidateName);
        }
      } catch (err) {
        console.error("Failed to fetch interview details:", err);
        setFetchError("Failed to load interview details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [interviewId]);

  const handleStartInterview = () => {
    if (!fullName.trim()) {
      setNameError("Please enter your full name to continue.");
      return;
    }
    if (fullName.trim().split(" ").length < 2) {
      setNameError("Please enter both your first and last name.");
      return;
    }
    setNameError("");
    setIsStarting(true);

    // Build query params to pass candidate info to session page
    const queryParams = new URLSearchParams({
      name: fullName.trim(),
      job: details?.jobTitle ?? "Software Engineer",
    });

    if (details?.jobDescription) {
      queryParams.set("desc", details.jobDescription.substring(0, 500));
    }
    if (details?.candidateId) {
      queryParams.set("candidateId", String(details.candidateId));
    }
    if (details?.jobId) {
      queryParams.set("jobId", String(details.jobId));
    }
    if (details?.candidateEmail) {
      queryParams.set("email", details.candidateEmail);
    }

    // Navigate to the interview session page
    router.push(
      `/interview/${interviewId}/session?${queryParams.toString()}`
    );
  };

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // ─── ERROR STATE ─────────────────────────────────────────────────────────────
  if (fetchError || !details) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a1a] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Interview Not Found
          </h2>
          <p className="text-sm text-gray-400">
            {fetchError ||
              "This interview link is invalid or has expired. Please contact the recruiter for a new link."}
          </p>
        </div>
      </div>
    );
  }

  const interviewTypeStr = details.interviewType ?? "screening";
  const interviewTypeDisplay =
    interviewTypeLabel[interviewTypeStr] ?? "AI Voice Interview";
  const duration = estimatedDuration[interviewTypeStr] ?? "15–20 minutes";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Compact Hero / Top Bar */}
      <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-violet-950/30 to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 shrink-0">
              <Mic2 className="w-3 h-3 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">
                {interviewTypeDisplay}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                You&apos;re invited to interview for
              </p>
              <h1 className="text-lg font-bold text-white leading-tight">
                {details.jobTitle}{" "}
                <span className="text-violet-400">@ RecruitAI</span>
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Badge
              variant="secondary"
              className="bg-white/5 text-gray-300 border-white/10 text-xs"
            >
              {details.jobType}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/5 text-gray-300 border-white/10 text-xs"
            >
              {details.jobLocation}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/5 text-gray-300 border-white/10 text-xs"
            >
              {duration}
            </Badge>
          </div>
        </div>
      </div>

      {/* Two-column body — fills remaining height */}
      <div className="flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5 min-h-0">
            {/* Interview Details */}
            <Card className="bg-white/5 border-white/10 shrink-0">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Interview Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Position</p>
                      <p className="text-xs text-white font-medium leading-tight">
                        {details.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Location</p>
                      <p className="text-xs text-white font-medium">
                        {details.jobLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Duration</p>
                      <p className="text-xs text-white font-medium">
                        {duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Mic2 className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Type</p>
                      <p className="text-xs text-white font-medium">
                        {interviewTypeDisplay}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-3 bg-white/10" />

                <div className="flex flex-wrap gap-1.5">
                  {details.jobDepartment && (
                    <Badge
                      variant="secondary"
                      className="bg-white/5 text-gray-400 border-white/10 text-[10px]"
                    >
                      {details.jobDepartment}
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-white/5 text-gray-400 border-white/10 text-[10px]"
                  >
                    English
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card className="bg-white/5 border-white/10 flex-1 min-h-0">
              <CardContent className="p-5 h-full flex flex-col">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 shrink-0">
                  What to Expect
                </h3>
                <ul className="space-y-2.5 overflow-auto">
                  {whatToExpect.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-5 min-h-0">
            {/* Before You Begin */}
            <Card className="bg-white/5 border-white/10 shrink-0">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Before You Begin
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5"
                    >
                      <req.icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="text-xs text-gray-300 leading-tight">
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Start Interview Form */}
            <Card className="bg-gradient-to-br from-violet-950/40 to-purple-950/20 border-violet-500/20 flex-1 min-h-0">
              <CardContent className="p-5 sm:p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        Ready to begin?
                      </h3>
                      <p className="text-xs text-gray-400">
                        Confirm your name to start the interview
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="fullName"
                        className="text-xs text-gray-300"
                      >
                        Full Name{" "}
                        <span className="text-violet-400">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="e.g. John Smith"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 h-10 text-sm"
                        disabled={isStarting}
                      />
                      {nameError && (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{nameError}</span>
                        </div>
                      )}
                    </div>

                    {/* Show candidate email if known */}
                    {details.candidateEmail && (
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          Interview sent to
                        </p>
                        <p className="text-xs text-gray-300">
                          {details.candidateEmail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Button
                    onClick={handleStartInterview}
                    disabled={isStarting}
                    className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-60"
                  >
                    {isStarting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting Interview...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Start Interview
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-[10px] text-gray-500 leading-relaxed">
                    By starting, you agree that your responses will be recorded
                    and reviewed by the hiring team.
                  </p>

                  <p className="text-center text-[10px] text-gray-600">
                    Interview ID:{" "}
                    <span className="font-mono text-gray-500">
                      {interviewId}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
