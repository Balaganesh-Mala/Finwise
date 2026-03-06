"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Phone, CheckCircle2, Mic } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a] pt-16">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge className="mb-6 inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 px-4 py-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              AI-Powered Recruiting
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Hire Faster with{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                AI Voice
              </span>{" "}
              Screening
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Import your candidate list and let our AI agent automatically call, screen, and schedule interviews — 24/7, at scale, with zero manual effort.
            </p>

            {/* Trust Bullets */}
            <ul className="flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start">
              {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all group px-8"
              >
                {isSignedIn ? "Go to Dashboard" : "Start Screening Free"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 group gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right — AI Call Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">RecruitAI Agent</p>
                      <p className="text-gray-500 text-xs">Calling candidates...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Live</span>
                  </div>
                </div>

                {/* Call Progress */}
                <div className="space-y-3 mb-6">
                  {[
                    { name: "Sarah Johnson", role: "Frontend Dev", status: "Screened ✓", color: "text-green-400" },
                    { name: "Marcus Chen", role: "Backend Dev", status: "Calling...", color: "text-yellow-400", active: true },
                    { name: "Priya Patel", role: "UX Designer", status: "Queued", color: "text-gray-500" },
                    { name: "Alex Rivera", role: "DevOps Eng.", status: "Queued", color: "text-gray-500" },
                  ].map((candidate) => (
                    <div
                      key={candidate.name}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${candidate.active
                          ? "bg-violet-500/15 border border-violet-500/30"
                          : "bg-white/[0.03] border border-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${candidate.active ? "bg-violet-500/30 text-violet-300" : "bg-white/10 text-gray-400"
                          }`}>
                          {candidate.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{candidate.name}</p>
                          <p className="text-gray-500 text-xs">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {candidate.active && (
                          <Phone className="w-3.5 h-3.5 text-violet-400 animate-bounce" />
                        )}
                        <span className={`text-xs font-medium ${candidate.color}`}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Waveform */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-500 text-xs mb-3">Live Transcript</p>
                  <div className="flex items-end gap-1 h-8 mb-3">
                    {[3, 6, 4, 8, 5, 9, 4, 7, 3, 6, 8, 5, 4, 7, 6, 3, 8, 5, 6, 4].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-violet-500/60 rounded-full animate-pulse"
                        style={{
                          height: `${h * 4}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${0.8 + (i % 3) * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs italic">
                    "Tell me about your experience with React and TypeScript..."
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Screened", value: "1/4" },
                    { label: "Avg. Score", value: "8.4" },
                    { label: "Time Saved", value: "3.2h" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 bg-white/[0.03] rounded-lg border border-white/5">
                      <p className="text-white font-bold text-sm">{stat.value}</p>
                      <p className="text-gray-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Badge — Interview Scheduled */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-white text-xs font-semibold">Interview Scheduled!</p>
                    <p className="text-gray-400 text-xs">Sarah Johnson — Tomorrow 2PM</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge — Calls Made */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-white text-xs font-semibold">247 calls today</p>
                    <p className="text-gray-400 text-xs">Fully automated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
