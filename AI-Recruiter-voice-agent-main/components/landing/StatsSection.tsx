const stats = [
  { value: "500+", label: "Companies Trust Us", sublabel: "From startups to Fortune 500" },
  { value: "2.4M+", label: "Candidates Screened", sublabel: "Across 50+ countries" },
  { value: "85%", label: "Time Saved", sublabel: "vs. manual screening" },
  { value: "4.9★", label: "Average Rating", sublabel: "From 1,200+ reviews" },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-violet-900/30 via-purple-900/20 to-indigo-900/30 border-y border-white/5 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a1a]/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center ${
                index < stats.length - 1
                  ? "lg:border-r lg:border-white/10"
                  : ""
              }`}
            >
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-white font-semibold text-base mb-1">{stat.label}</div>
              <div className="text-gray-500 text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
