"use client";

import { useEffect, useRef } from "react";
import { Mic2, User } from "lucide-react";
import type { TranscriptMessage } from "@/hooks/useInterviewSession";

interface ChatTranscriptProps {
  transcript: TranscriptMessage[];
  interimTranscript: string;
  isListening: boolean;
  candidateName: string;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatTranscript({
  transcript,
  interimTranscript,
  isListening,
  candidateName,
}: ChatTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimTranscript]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Live Transcript</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {transcript.length === 0
            ? "Conversation will appear here"
            : `${transcript.length} message${transcript.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Mic2 className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Interview transcript will appear here</p>
            <p className="text-xs text-gray-700 mt-1">Start the interview to begin</p>
          </div>
        )}

        {transcript.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                msg.role === "ai"
                  ? "bg-violet-500/20 border border-violet-500/30"
                  : "bg-blue-500/20 border border-blue-500/30"
              }`}
            >
              {msg.role === "ai" ? (
                <Mic2 className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-medium">
                  {msg.role === "ai" ? "AI Interviewer" : candidateName}
                </span>
                <span className="text-[10px] text-gray-700">{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-violet-500/15 border border-violet-500/20 text-gray-200 rounded-tl-sm"
                    : "bg-blue-500/15 border border-blue-500/20 text-gray-200 rounded-tr-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Interim transcript (live speech-to-text) */}
        {isListening && interimTranscript && (
          <div className="flex gap-2.5 flex-row-reverse">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 bg-blue-500/20 border border-blue-500/30">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col gap-1 max-w-[80%] items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-medium">{candidateName}</span>
                <span className="text-[10px] text-blue-400 animate-pulse">● Live</span>
              </div>
              <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-blue-500/10 border border-blue-500/15 text-gray-400 italic">
                {interimTranscript}
              </div>
            </div>
          </div>
        )}

        {/* Listening indicator */}
        {isListening && !interimTranscript && (
          <div className="flex gap-2.5 flex-row-reverse">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 bg-blue-500/20 border border-blue-500/30">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] text-gray-500 font-medium">{candidateName}</span>
              <div className="px-3 py-2 rounded-2xl rounded-tr-sm bg-blue-500/10 border border-blue-500/15 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
