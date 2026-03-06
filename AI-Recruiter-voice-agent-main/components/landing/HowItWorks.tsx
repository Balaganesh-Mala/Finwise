import { Upload, Phone, CalendarCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Import Candidate Data",
    description:
      "Upload a CSV, Excel, or PDF with candidate names and phone numbers. Our system instantly parses and queues them for outreach.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    details: ["CSV / Excel / PDF support", "Auto-parse contact info", "Bulk import up to 10,000 candidates"],
  },
  {
    icon: Phone,
    step: "02",
    title: "AI Agent Auto-Calls",
    description:
      "Our voice AI agent calls each candidate, conducts a natural screening interview, and evaluates responses in real time.",
    color: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-500/30",
    details: ["Human-like voice conversations", "Custom screening questions", "Real-time sentiment analysis"],
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Schedule Interviews",
    description:
      "Top candidates are automatically scored and interview slots are booked directly into your calendar — zero manual work.",
    color: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-500/30",
    details: ["Auto-scoring & ranking", "Calendar integration", "Instant candidate notifications"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            From Import to Interview in{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Minutes
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Three simple steps to automate your entire initial screening process and focus only on the best candidates.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative group">
                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-14 -right-4 z-10 w-8 h-8 items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-violet-500/50" />
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 group-hover:-translate-y-1">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ${step.glow}`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-5xl font-black text-white/5 select-none">{step.step}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{step.description}</p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
