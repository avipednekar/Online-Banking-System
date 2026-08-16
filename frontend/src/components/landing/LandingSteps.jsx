import { ArrowRight, CheckCircle2, ShieldCheck, UserCheck, Wallet } from "lucide-react";
import { RouteLink } from "../common/RouteLink";

const STEPS = [
  {
    number: "01",
    icon: UserCheck,
    title: "1. Digital Registration",
    description: "Create your account in under 2 minutes with basic personal and identity details."
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "2. KYC Clearance",
    description: "Our digital verification desk validates your CIF profile for instant clearance."
  },
  {
    number: "03",
    icon: Wallet,
    title: "3. Deposit & Earn 7.5%",
    description: "Fund your account and start earning daily compounding interest with full DICGC protection."
  }
];

export function LandingSteps() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-6 text-center space-y-16">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Simple 3-Step Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Start banking in under 3 minutes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Zero paperwork, zero branch visits. Enjoy a 100% paperless digital banking experience from the comfort of your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-center text-center space-y-4 relative z-10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-lg shadow-2xs">
                  <Icon size={28} />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
                  Step {step.number}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-200 bg-emerald-600 text-white p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-lg">
            <h3 className="text-2xl font-bold text-white tracking-tight">Ready to experience next-gen banking?</h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Join thousands of customers who enjoy higher yields, instant transfers, and institutional security.
            </p>
          </div>
          <RouteLink
            to="/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-50 transition-all"
          >
            <span>Open Free Account</span>
            <ArrowRight size={14} />
          </RouteLink>
        </div>
      </div>
    </section>
  );
}
