"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small teams just getting started with AI screening.",
    features: [
      "Up to 100 candidates/month",
      "CSV & Excel import",
      "Basic screening questions",
      "Email notifications",
      "Call transcripts",
      "Email support",
    ],
    cta: "Start Free Trial",
    isContactSales: false,
    popular: false,
    gradient: "from-white/[0.05] to-white/[0.02]",
    border: "border-white/10",
    ctaClass: "border border-violet-500/50 text-violet-400 hover:bg-violet-500/10 bg-transparent",
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "For growing teams that need more power and integrations.",
    features: [
      "Up to 1,000 candidates/month",
      "CSV, Excel & PDF import",
      "Custom screening questions",
      "Calendar integration",
      "AI scoring & ranking",
      "Real-time analytics",
      "Slack & ATS integrations",
      "Priority support",
    ],
    cta: "Start Free Trial",
    isContactSales: false,
    popular: true,
    gradient: "from-violet-600/20 to-purple-600/10",
    border: "border-violet-500/40",
    ctaClass: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with advanced needs and compliance requirements.",
    features: [
      "Unlimited candidates",
      "All import formats",
      "Custom AI persona & voice",
      "Multi-language support (30+)",
      "GDPR & CCPA compliance",
      "SSO & advanced security",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    isContactSales: true,
    popular: false,
    gradient: "from-white/[0.05] to-white/[0.02]",
    border: "border-white/10",
    ctaClass: "border border-violet-500/50 text-violet-400 hover:bg-violet-500/10 bg-transparent",
  },
];

export default function PricingSection() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handlePlanCTA = (isContactSales: boolean) => {
    if (isContactSales) {
      // Could link to a contact page or mailto
      return;
    }
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <section id="pricing" className="py-24 bg-[#0a0a1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Plans for Every{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Team Size
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include a 14-day free trial — no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-br ${plan.gradient} border ${plan.border} rounded-2xl p-8 transition-all duration-300 ${plan.popular ? "scale-105 shadow-2xl shadow-violet-500/20" : "hover:-translate-y-1 hover:shadow-xl"
                }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/30">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-sm mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Button
                className={`w-full mb-8 ${plan.ctaClass}`}
                onClick={() => handlePlanCTA(plan.isContactSales)}
              >
                {!plan.isContactSales && isSignedIn ? "Go to Dashboard" : plan.cta}
              </Button>

              {/* Divider */}
              <div className="border-t border-white/5 mb-6" />

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-gray-500"}`} />
                    <span className="text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-600 text-sm mt-10">
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
