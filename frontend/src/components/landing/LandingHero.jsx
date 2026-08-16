import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { RouteLink } from "../common/RouteLink";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 lg:py-24 border-b border-slate-200">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 relative z-10">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600 animate-pulse" />
            <span>Next-Generation Digital Banking Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Banking built for <br />
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
              higher yields
            </span>{" "}
            &amp; vault security.
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            Experience institutional-grade asset protection paired with high-yield savings schemes up to <strong>7.5% p.a.</strong>, zero hidden fees, and instantaneous real-time fund transfers.
          </p>

          {/* Key Bullet Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Up to 7.5% p.a. on Savings &amp; Fixed Deposits</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Instant KYC Verification in under 2 minutes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Zero minimum balance charge guarantee</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>DICGC Insured deposits up to ₹5,00,000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <RouteLink
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all group"
            >
              <span>Open Free Digital Account</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </RouteLink>
            <RouteLink
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
            >
              Sign In to Portal
            </RouteLink>
          </div>

          {/* Trust Banner Bar */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>DICGC Insured (₹5 Lakh)</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Lock size={15} className="text-slate-700" />
              <span>256-Bit AES Banking Encryption</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Zap size={15} className="text-amber-500" />
              <span>Pessimistic Concurrency Safe</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real-World Banking App Picture */}
        <div className="relative lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Real App Screenshot Image */}
            <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              <img
                src="/assets/hero_banking_mockup.jpg"
                alt="Vault Financial Real-Time Mobile Banking App Mockup"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>

            {/* Floating Live Badge Top-Left */}
            <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md animate-bounce duration-1000">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Current Savings APY</p>
                <p className="text-xs font-bold text-emerald-700 font-mono">7.20% p.a. Active</p>
              </div>
            </div>

            {/* Floating Live Badge Bottom-Right */}
            <div className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Identity Clearance</p>
                <p className="text-xs font-bold text-slate-800">100% KYC Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
