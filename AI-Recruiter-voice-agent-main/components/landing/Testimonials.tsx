import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jennifer Walsh",
    role: "Head of Talent Acquisition",
    company: "TechScale Inc.",
    avatar: "JW",
    avatarColor: "from-violet-500 to-purple-600",
    rating: 5,
    quote:
      "RecruitAI completely transformed our hiring pipeline. We used to spend 3 weeks on initial screening for 200 candidates. Now it's done overnight. The AI asks better questions than most of our junior recruiters!",
    highlight: "3 weeks → overnight",
  },
  {
    name: "David Okonkwo",
    role: "VP of People Operations",
    company: "FinServe Global",
    avatar: "DO",
    avatarColor: "from-purple-500 to-indigo-600",
    rating: 5,
    quote:
      "The quality of candidates that make it through the AI screening is remarkable. Our offer acceptance rate went up 40% because we're spending more time with the right people. This tool pays for itself in the first week.",
    highlight: "40% higher offer acceptance",
  },
  {
    name: "Priya Sharma",
    role: "Recruiting Manager",
    company: "StartupHub",
    avatar: "PS",
    avatarColor: "from-indigo-500 to-blue-600",
    rating: 5,
    quote:
      "As a small team, we couldn't afford to hire more recruiters. RecruitAI gave us the capacity of a 10-person recruiting team at a fraction of the cost. The CSV import is dead simple and the AI sounds incredibly natural.",
    highlight: "10x recruiting capacity",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#080814] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Customer Stories
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Recruiters Worldwide
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See how talent teams are transforming their hiring process with AI-powered voice screening.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 group"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-violet-500/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="text-violet-400 text-xs font-semibold">{testimonial.highlight}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role} · {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-6">Trusted by recruiting teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Stripe", "Airbnb", "Shopify", "Notion", "Linear", "Vercel"].map((company) => (
              <span key={company} className="text-white font-bold text-lg tracking-tight">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
