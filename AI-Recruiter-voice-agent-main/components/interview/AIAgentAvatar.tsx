"use client";

import { Mic2 } from "lucide-react";

interface AIAgentAvatarProps {
  isSpeaking: boolean;
  isProcessing: boolean;
}

// Fixed heights for waveform bars to avoid hydration issues
const WAVE_HEIGHTS = [16, 28, 20, 32, 18, 26, 14];

export function AIAgentAvatar({ isSpeaking, isProcessing }: AIAgentAvatarProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Inject keyframe animation via a global style tag */}
      <style>{`
        @keyframes waveBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        @keyframes speakingPing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* Avatar with animated rings */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer pulsing rings when speaking */}
        {isSpeaking && (
          <>
            <span
              className="absolute inset-0 rounded-full bg-violet-500/20"
              style={{ animation: "speakingPing 1.2s ease-out infinite" }}
            />
            <span
              className="absolute inset-2 rounded-full bg-violet-500/25"
              style={{ animation: "speakingPing 1.2s ease-out infinite", animationDelay: "0.3s" }}
            />
          </>
        )}

        {/* Avatar circle */}
        <div
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isSpeaking
              ? "bg-gradient-to-br from-violet-500 to-purple-700 shadow-violet-500/50 scale-110"
              : isProcessing
              ? "bg-gradient-to-br from-violet-600/70 to-purple-800/70 shadow-violet-500/30"
              : "bg-gradient-to-br from-violet-600 to-purple-800 shadow-violet-500/20"
          }`}
        >
          <Mic2
            className={`w-8 h-8 text-white transition-all duration-300 ${
              isSpeaking ? "scale-110" : ""
            }`}
          />
        </div>
      </div>

      {/* Waveform bars */}
      <div className="flex items-end gap-1 h-10">
        {WAVE_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-colors duration-300 ${
              isSpeaking ? "bg-violet-400" : "bg-white/20"
            }`}
            style={
              isSpeaking
                ? {
                    height: `${height}px`,
                    animation: `waveBar 0.5s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.07}s`,
                    transformOrigin: "bottom",
                  }
                : { height: "4px" }
            }
          />
        ))}
      </div>

      {/* Status label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white">AI Interviewer</p>
        <p
          className={`text-xs mt-0.5 transition-colors duration-300 ${
            isSpeaking
              ? "text-violet-300"
              : isProcessing
              ? "text-yellow-400"
              : "text-gray-500"
          }`}
        >
          {isSpeaking ? "Speaking..." : isProcessing ? "Thinking..." : "Listening"}
        </p>
      </div>
    </div>
  );
}
