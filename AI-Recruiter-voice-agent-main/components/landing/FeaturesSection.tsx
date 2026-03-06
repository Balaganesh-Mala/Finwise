import {
  Mic2,
  CalendarDays,
  FileSpreadsheet,
  ScrollText,
  Globe2,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Mic2,
    title: "Human-Like Voice AI",
    description:
      "Natural, conversational AI that candidates can't distinguish from a real recruiter. Handles follow-ups, clarifications, and objections.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk Candidate Import",
    description:
      "Upload CSV, Excel, or PDF files with thousands of candidates. Our parser extracts names, phone numbers, and job roles automatically.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "Automatically books interview slots based on recruiter availability. Syncs with Google Calendar, Outlook, and more.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: ScrollText,
    title: "Real-Time Transcripts",
    description:
      "Every call is transcribed and summarized instantly. Get key insights, candidate scores, and red flags highlighted automatically.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Globe2,
    title: "Multi-Language Support",
    description:
      "Screen candidates in 30+ languages. Our AI adapts to the candidate's preferred language for a seamless experience.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track screening rates, candidate scores, time-to-hire, and pipeline health with a real-time analytics dashboard.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Privacy",
    description:
      "GDPR and CCPA compliant. All calls are recorded with consent, and candidate data is encrypted and securely stored.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description:
      "Go live in under 5 minutes. No complex integrations required — just upload your candidates and let the AI do the rest.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#080814] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Modern Recruiters
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to automate candidate screening and focus your energy on what matters — building great teams.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
