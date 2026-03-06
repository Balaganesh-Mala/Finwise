"use client";

import {
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
  Code2,
  TrendingUp,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InterviewSummary as SummaryType } from "@/hooks/useInterviewSession";

interface InterviewSummaryProps {
  summary: SummaryType;
  candidateName: string;
  jobTitle: string;
  durationSeconds: number;
  questionsAsked: number;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white w-6 text-right">{score}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const recommendationConfig = {
  "Strong Yes": {
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    icon: ThumbsUp,
    iconColor: "text-green-400",
    description: "Highly recommended for next round",
  },
  Yes: {
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: ThumbsUp,
    iconColor: "text-blue-400",
    description: "Recommended for next round",
  },
  Maybe: {
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    icon: Minus,
    iconColor: "text-yellow-400",
    description: "Consider with reservations",
  },
  No: {
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: ThumbsDown,
    iconColor: "text-red-400",
    description: "Not recommended at this time",
  },
};

export function InterviewSummary({
  summary,
  candidateName,
  jobTitle,
  durationSeconds,
  questionsAsked,
}: InterviewSummaryProps) {
  const recConfig = recommendationConfig[summary.recommendation] || recommendationConfig["Maybe"];
  const RecIcon = recConfig.icon;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Interview Complete</span>
        </div>
        <h2 className="text-xl font-bold text-white">{candidateName}</h2>
        <p className="text-sm text-gray-400">{jobTitle}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(durationSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{questionsAsked} questions</span>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <Card className={`border ${recConfig.color} bg-transparent`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${recConfig.color}`}>
            <RecIcon className={`w-5 h-5 ${recConfig.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recommendation</p>
            <p className="text-base font-bold text-white">{summary.recommendation}</p>
            <p className="text-xs text-gray-400">{recConfig.description}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Overall Score</p>
            <p className="text-3xl font-bold text-white">{summary.overallScore}<span className="text-sm text-gray-500">/10</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Scores */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Performance Scores</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-gray-300">Communication</span>
              </div>
              <ScoreBar score={summary.communicationScore} color="bg-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-gray-300">Technical Knowledge</span>
              </div>
              <ScoreBar score={summary.technicalScore} color="bg-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-300">Overall Performance</span>
              </div>
              <ScoreBar score={summary.overallScore} color="bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {summary.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Areas of Concern
            </h3>
            {summary.concerns.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No major concerns identified</p>
            ) : (
              <ul className="space-y-2">
                {summary.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Highlights */}
      {summary.keyHighlights && summary.keyHighlights.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              Key Highlights
            </h3>
            <ul className="space-y-2">
              {summary.keyHighlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <Star className="w-3 h-3 text-yellow-400 mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            AI Assessment Summary
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {summary.summary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
