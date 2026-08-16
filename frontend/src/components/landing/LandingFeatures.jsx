import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Fingerprint,
  Lock,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Zap
} from "lucide-react";
import { RouteLink } from "../common/RouteLink";

const CORE_FEATURES = [
  {
    icon: Lock,
    title: "Deterministic Pessimistic Locking",
    badge: "Anti-Race Condition",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "All transfer transactions utilize deadlock-free, ordered pessimistic locking on sender and receiver accounts, guaranteeing zero double-spending or race condition vulnerabilities."
  },
  {
    icon: ShieldAlert,
    title: "High-Value Surveillance Gateway",
    badge: "Risk Mitigation",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description:
      "Transfers equal to or exceeding ₹50,000 require administrative authorization, providing institutional risk management and preventing fraudulent capital outflows."
  },
  {
    icon: Database,
    title: "Transactional Outbox Pattern",
    badge: "Zero Data Loss",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "Ledger events are atomically recorded alongside account balance mutations and continuously processed via background workers for 100% guaranteed delivery."
  },
  {
    icon: Fingerprint,
    title: "Instant KYC Clearance Desk",
    badge: "Biometric & Digital",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description:
      "Full CIF-based customer identity verification workflows with dedicated reviewer actions, audit tracking, and real-time clearance status updates."
  }
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider border border-slate-200">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Banking Architecture
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Built from the ground up to guarantee ACID compliance, multi-tier compliance surveillance, and sub-millisecond execution speeds.
          </p>
        </div>

        {/* 4 Core App Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-7 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
                    <Icon size={22} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Regulatory Showcase with Real Picture */}
        <div id="security" className="rounded-3xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Column: Security Information */}
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <ShieldCheck size={14} />
                <span>DICGC Regulatory Protection</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Your money is protected by multi-layered cryptographic vaults.
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                Eligible deposits in Vault Financial accounts are protected up to <strong>₹5,00,000</strong> per depositor under the Deposit Insurance and Credit Guarantee Corporation (DICGC) guidelines.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>256-Bit Hardware-Encrypted Secure Sessions</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Full Audit Trail Logging for Every Transaction</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Separation of Customer &amp; Administrative Authorizations</span>
                </div>
              </div>

              <div className="pt-4">
                <RouteLink
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  <span>Open Insured Account</span>
                  <ArrowRight size={14} />
                </RouteLink>
              </div>
            </div>

            {/* Right Column: Real Vault Security Picture */}
            <div className="lg:col-span-6 h-full flex items-center justify-center p-4 sm:p-8">
              <div className="overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
                <img
                  src="/assets/vault_security_shield.jpg"
                  alt="Vault Financial High-Security Bank Vault and DICGC Insurance"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
