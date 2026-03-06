"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Wifi,
  AlertCircle,
  Loader2,
  Camera,
  CameraOff,
  RefreshCw,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIAgentAvatar } from "@/components/interview/AIAgentAvatar";
import { ChatTranscript } from "@/components/interview/ChatTranscript";
import { CallControls } from "@/components/interview/CallControls";
import { useInterviewSession } from "@/hooks/useInterviewSession";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = use(params);
  const searchParams = useSearchParams();

  const candidateName = searchParams.get("name") || "Candidate";
  const jobTitle = searchParams.get("job") || "Software Engineer";
  const jobDescription = searchParams.get("desc") || undefined;
  const candidateEmail = searchParams.get("email") || undefined;
  const candidateId = searchParams.get("candidateId") || undefined;
  const jobId = searchParams.get("jobId") || undefined;

  const {
    phase,
    transcript,
    questionIndex,
    isMuted,
    isCameraOff,
    isSpeaking,
    isListening,
    elapsedSeconds,
    error,
    interimTranscript,
    videoRef,
    requestPermissions,
    startInterview,
    toggleMute,
    toggleCamera,
    endCall,
  } = useInterviewSession({
    interviewId,
    candidateName,
    jobTitle,
    jobDescription,
    candidateEmail,
    candidateId: candidateId ? parseInt(candidateId) : undefined,
    jobId: jobId ? parseInt(jobId) : undefined,
  });

  const [hasStarted, setHasStarted] = useState(false);

  // Auto-request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const handleStartInterview = async () => {
    setHasStarted(true);
    await startInterview();
  };

  const isActive =
    phase === "ai-speaking" ||
    phase === "user-speaking" ||
    phase === "processing" ||
    phase === "ready";

  // ─── COMPLETED SCREEN (candidate-facing — no summary shown) ─────────────────
  if (phase === "completed") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Success icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="absolute w-24 h-24 rounded-full bg-green-500/10 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-base text-gray-300 mb-1">
            Thank you, <span className="text-violet-400 font-semibold">{candidateName}</span>!
          </p>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Your interview for the <span className="text-white font-medium">{jobTitle}</span> position has been successfully recorded. Our hiring team will review your responses and get back to you within a few business days.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{questionIndex}</p>
              <p className="text-xs text-gray-500 mt-0.5">Questions answered</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Duration</p>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What happens next?</p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                Our team will review your interview responses
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                You will receive an email with the next steps
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                Expect to hear back within 2–5 business days
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
            <Mail className="w-3.5 h-3.5" />
            <span>Check your email for confirmation</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR SCREEN ────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ─── MAIN INTERVIEW UI ───────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0a0a1a] flex flex-col overflow-hidden">
      {/* Top Status Bar */}
      <div className="shrink-0 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          {hasStarted && phase !== "ready" && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400">LIVE</span>
            </div>
          )}
          <span className="text-xs text-gray-500 font-medium">{jobTitle}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Question progress */}
          {hasStarted && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Q {Math.min(questionIndex + 1, 8)}/8</span>
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-1 rounded-full transition-colors ${
                      i < questionIndex
                        ? "bg-violet-500"
                        : i === questionIndex
                        ? "bg-violet-400 animate-pulse"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Timer */}
          {hasStarted && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatTimer(elapsedSeconds)}</span>
            </div>
          )}

          {/* Connection status */}
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connected</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Video Call Area */}
        <div className="flex-1 flex flex-col bg-[#080812] relative overflow-hidden">
          {/* Video grid */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
            </div>

            {/* AI Agent Avatar — top center */}
            <div className="relative z-10 flex flex-col items-center">
              <AIAgentAvatar
                isSpeaking={isSpeaking}
                isProcessing={phase === "processing"}
              />
            </div>

            {/* User Webcam — bottom right (picture-in-picture style) */}
            <div className="absolute bottom-20 right-4 z-20">
              <div className="relative w-36 h-24 sm:w-48 sm:h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                    isCameraOff ? "opacity-0" : "opacity-100"
                  }`}
                />
                {isCameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <CameraOff className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-[10px] text-gray-600">Camera off</span>
                  </div>
                )}
                {/* Name label */}
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] text-white font-medium bg-black/50 rounded px-1.5 py-0.5 truncate max-w-[80%]">
                    {candidateName}
                  </span>
                  {isMuted && (
                    <span className="text-[10px] text-red-400 bg-black/50 rounded px-1 py-0.5">
                      🔇
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Requesting permissions overlay */}
            {phase === "requesting-permissions" && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080812]/90 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                <p className="text-white font-semibold">Requesting camera & microphone access...</p>
                <p className="text-sm text-gray-400 mt-1">Please allow permissions in your browser</p>
              </div>
            )}

            {/* Ready to start overlay */}
            {phase === "ready" && !hasStarted && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080812]/80 backdrop-blur-sm">
                <div className="text-center max-w-sm px-6">
                  <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Ready to Begin</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Camera and microphone are active. Click below to start your AI interview.
                  </p>
                  <Button
                    onClick={handleStartInterview}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/30"
                  >
                    Start Interview
                  </Button>
                </div>
              </div>
            )}

            {/* Processing overlay */}
            {phase === "processing" && hasStarted && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-xs text-gray-300">AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs text-blue-300">Listening...</span>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls — bottom bar */}
          <div className="shrink-0 border-t border-white/10 bg-[#080812]/80 backdrop-blur-sm px-4 py-4">
            <CallControls
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              onToggleMute={toggleMute}
              onToggleCamera={toggleCamera}
              onEndCall={endCall}
              disabled={phase === "requesting-permissions" || phase === "processing"}
            />
          </div>
        </div>

        {/* RIGHT: Chat Transcript Panel */}
        <div className="w-80 xl:w-96 shrink-0 border-l border-white/10 bg-[#0a0a1a] flex flex-col overflow-hidden">
          <ChatTranscript
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
            candidateName={candidateName}
          />
        </div>
      </div>
    </div>
  );
}
