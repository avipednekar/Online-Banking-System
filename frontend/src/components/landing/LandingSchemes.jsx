import { useState, useMemo } from "react";
import {
  ArrowRight,
  BadgePercent,
  Calculator,
  Check,
  Coins,
  CreditCard,
  Landmark,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { RouteLink } from "../common/RouteLink";

const SCHEMES = [
  {
    id: "savings",
    icon: PiggyBank,
    badge: "Most Popular",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    name: "Vault SuperSaver Account",
    interestRate: "7.20% p.a.",
    subtitle: "High-yield daily compounding on your everyday savings balance.",
    benefits: [
      "Zero monthly balance penalty fees",
      "Interest calculated daily & credited monthly",
      "Free unlimited IMPS / NEFT / RTGS transfers",
      "Instant virtual debit card on registration"
    ],
    ctaText: "Open SuperSaver",
    accentColor: "border-emerald-500"
  },
  {
    id: "fd",
    icon: Landmark,
    badge: "Highest Return",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    name: "Fixed Deposit Accelerator",
    interestRate: "8.10% p.a.",
    subtitle: "Lock in guaranteed inflation-beating yields with complete capital security.",
    benefits: [
      "8.10% p.a. for Senior Citizens (7.60% regular)",
      "Flexible tenures from 7 days to 10 years",
      "Instant loan against FD up to 90% without breaking",
      "DICGC insured deposit coverage up to ₹5 Lakh"
    ],
    ctaText: "Lock High Yield FD",
    accentColor: "border-indigo-500"
  },
  {
    id: "rd",
    icon: TrendingUp,
    badge: "Auto-Pilot Growth",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    name: "Smart Recurring Deposit (RD)",
    interestRate: "7.40% p.a.",
    subtitle: "Systematic wealth building starting from as little as ₹500 per month.",
    benefits: [
      "Automated monthly sweep from your savings",
      "Quarterly compounding interest multiplication",
      "Milestone loyalty cashbacks on completion",
      "Flexible pause or step-up contributions"
    ],
    ctaText: "Start Recurring Deposit",
    accentColor: "border-amber-500"
  },
  {
    id: "current",
    icon: CreditCard,
    badge: "For Enterprises",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    name: "Commercial Current Plus",
    interestRate: "Zero Fees",
    subtitle: "High-velocity corporate checking with multi-tier administrative controls.",
    benefits: [
      "Unlimited monthly transactions with zero fee surcharges",
      "High-value surveillance clearance for transactions ≥ ₹50,000",
      "Multi-account management under unified CIF",
      "Instant ledger audit exports & statements"
    ],
    ctaText: "Open Current Account",
    accentColor: "border-blue-500"
  }
];

export function LandingSchemes() {
  // Calculator state
  const [depositAmount, setDepositAmount] = useState(100000);
  const [tenureYears, setTenureYears] = useState(3);
  const [schemeType, setSchemeType] = useState("fd");

  const annualRate = schemeType === "fd" ? 0.076 : 0.072;

  // Compounded Return Calculation: A = P * (1 + r/n)^(n*t) with n = 4 (quarterly compounding)
  const calculation = useMemo(() => {
    const p = Number(depositAmount);
    const t = Number(tenureYears);
    const n = 4; // Quarterly compounding
    const r = annualRate;

    const maturityAmount = p * Math.pow(1 + r / n, n * t);
    const interestEarned = maturityAmount - p;

    return {
      principal: p,
      interest: Math.round(interestEarned),
      total: Math.round(maturityAmount),
      effectiveRate: ((Math.pow(1 + r / n, n) - 1) * 100).toFixed(2)
    };
  }, [depositAmount, tenureYears, annualRate]);

  return (
    <section id="schemes" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Institutional Banking Schemes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Grow your capital with our flagship interest schemes.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose from tailored savings, fixed, recurring, and corporate accounts designed to maximize your net financial returns with guaranteed DICGC regulatory protection.
          </p>
        </div>

        {/* 4 Flagship Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SCHEMES.map((scheme) => {
            const Icon = scheme.icon;

            return (
              <div
                key={scheme.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Icon size={20} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${scheme.badgeColor}`}>
                      {scheme.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{scheme.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-emerald-600 font-mono tracking-tight">{scheme.interestRate}</span>
                      <span className="text-xs text-slate-400 font-medium">annual yield</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{scheme.subtitle}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {scheme.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <RouteLink
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <span>{scheme.ctaText}</span>
                  <ArrowRight size={13} />
                </RouteLink>
              </div>
            );
          })}
        </div>

        {/* Visual Showcase Banner & Interactive Yield Calculator */}
        <div id="calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
          {/* Left Column: Visual Growth Card Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <img
                src="/assets/banking_schemes_growth.jpg"
                alt="Vault Financial High-Yield Compounding Interest Growth Card"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Coins size={16} className="text-amber-500" />
                <span>Transparent Quarterly Compounding</span>
              </div>
              <p className="text-xs text-slate-500">
                All returns are backed by RBI-regulated safety mandates and insured under DICGC guidelines.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Return Calculator */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Interactive Yield &amp; Maturity Calculator</h3>
                <p className="text-xs text-slate-500">Simulate your compounding wealth growth with Vault Financial.</p>
              </div>
            </div>

            {/* Scheme Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Select Scheme Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-3 rounded-xl border text-left transition ${
                    schemeType === "fd"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setSchemeType("fd")}
                >
                  <span className="block text-xs font-bold">Fixed Deposit Accelerator</span>
                  <span className="block text-xs text-emerald-700 font-mono mt-0.5">7.60% p.a. (8.10% Sr.)</span>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-xl border text-left transition ${
                    schemeType === "savings"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setSchemeType("savings")}
                >
                  <span className="block text-xs font-bold">SuperSaver Savings</span>
                  <span className="block text-xs text-emerald-700 font-mono mt-0.5">7.20% p.a. Daily Yield</span>
                </button>
              </div>
            </div>

            {/* Deposit Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deposit Amount</label>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ₹{Number(depositAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹10,000</span>
                <span>₹5,00,000</span>
                <span>₹10,00,000</span>
              </div>
            </div>

            {/* Tenure Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Tenure Period</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((years) => (
                  <button
                    key={years}
                    type="button"
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      tenureYears === years
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setTenureYears(years)}
                  >
                    {years} {years === 1 ? "Year" : "Years"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Output Breakdown Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Principal</span>
                <strong className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">
                  ₹{calculation.principal.toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Total Interest Earned</span>
                <strong className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">
                  + ₹{calculation.interest.toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block">Maturity Value</span>
                <strong className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
                  ₹{calculation.total.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <RouteLink
                to="/register"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 transition shadow-sm"
              >
                <span>Lock In This Rate Today</span>
                <ArrowRight size={14} />
              </RouteLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
