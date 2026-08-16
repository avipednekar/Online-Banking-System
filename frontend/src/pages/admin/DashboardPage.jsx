import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
  WalletCards
} from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingState } from "../../components/feedback/LoadingState";
import { SectionErrorState } from "../../components/feedback/SectionErrorState";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

function getRiskExposure(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const rejectedKyc = Number(overview?.rejectedKyc || 0);
  const pendingKyc = Number(overview?.pendingKyc || 0);

  if (!totalCustomers) {
    return { level: "Nominal", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
  }

  const exposure = (rejectedKyc + pendingKyc) / totalCustomers;

  if (exposure > 0.2) {
    return { level: "Elevated", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
  }

  if (exposure > 0.08) {
    return { level: "Guarded", color: "text-amber-800", bg: "bg-amber-50 border-amber-200" };
  }

  return { level: "Low", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
}

function getVerificationRate(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const verifiedKyc = Number(overview?.verifiedKyc || 0);

  if (!totalCustomers) {
    return 0;
  }

  return Math.round((verifiedKyc / totalCustomers) * 100);
}

function KpiCard({ icon: Icon, label, value, detail, badge, badgeColor = "text-slate-600 bg-slate-100 border-slate-200", iconBg = "bg-indigo-50 text-indigo-600 border-indigo-100" }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-slate-50 transition">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${iconBg}`}>
          <Icon size={18} />
        </div>
        {badge ? (
          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${badgeColor}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</h3>
        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{detail}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { workspace } = useAdminRouteWorkspace();
  const overviewBusy = workspace.tracker.isPending("overview");
  const overview = workspace.overview;
  const risk = getRiskExposure(overview);
  const verificationRate = getVerificationRate(overview);
  const pendingKycCount = Number(overview?.pendingKyc || 0);
  const pendingTransfersCount = Number(overview?.pendingTransfers || 0);
  const showInitialLoading = overviewBusy && !workspace.overviewLoaded && !overview;

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* Top Institutional Metrics Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 w-full min-w-0 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Institutional Metrics Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time banking key performance indicators</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs disabled:opacity-50"
            onClick={workspace.loadOverview}
            disabled={overviewBusy}
          >
            <RefreshCw size={13} className={overviewBusy ? "animate-spin text-indigo-600" : "text-slate-500"} />
            <span>{overviewBusy ? "Refreshing..." : "Refresh Metrics"}</span>
          </button>
        </div>

        {showInitialLoading ? (
          <div className="py-8">
            <LoadingState compact title="Loading overview" message="Fetching banking KPIs." />
          </div>
        ) : null}

        {workspace.overviewError ? (
          <SectionErrorState
            message={workspace.overviewError}
            action={
              <button type="button" className="secondary" onClick={workspace.loadOverview}>
                Retry
              </button>
            }
          />
        ) : null}

        {!workspace.overviewError && overview ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            <KpiCard
              icon={WalletCards}
              label="Total Accounts"
              value={Number(overview?.totalAccounts || 0).toLocaleString()}
              detail="Bank accounts active under platform."
              iconBg="bg-blue-50 text-blue-600 border-blue-100"
            />
            <KpiCard
              icon={Users}
              label="Registered Customers"
              value={Number(overview?.totalCustomers || 0).toLocaleString()}
              detail="Total customer accounts on record."
              badge={`${Number(overview?.activeBeneficiaries || 0)} Beneficiaries`}
              badgeColor="bg-slate-100 text-slate-700 border-slate-200"
              iconBg="bg-indigo-50 text-indigo-600 border-indigo-100"
            />
            <KpiCard
              icon={Clock}
              label="Pending KYC Reviews"
              value={pendingKycCount.toLocaleString()}
              detail="Profiles awaiting verification."
              badge={pendingKycCount > 0 ? "Action Required" : "Cleared"}
              badgeColor={pendingKycCount > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}
              iconBg="bg-amber-50 text-amber-600 border-amber-100"
            />
            <KpiCard
              icon={ArrowLeftRight}
              label="Pending Transfers"
              value={pendingTransfersCount.toLocaleString()}
              detail="High-value transfers (≥ ₹50k)."
              badge={pendingTransfersCount > 0 ? "Needs Release" : "Queue Clean"}
              badgeColor={pendingTransfersCount > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}
              iconBg="bg-rose-50 text-rose-600 border-rose-100"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Verified KYC Rate"
              value={`${verificationRate}%`}
              detail={`${Number(overview?.verifiedKyc || 0).toLocaleString()} verified customer profiles.`}
              badge="Compliance"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
              iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
            />
          </div>
        ) : null}
      </div>

      {/* Actionable Queue Jump Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0">
        {/* KYC Verification Desk Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <ShieldCheck size={18} />
              </div>
              {pendingKycCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {pendingKycCount} Pending
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Queue Clean
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">KYC Verification Desk</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review submitted documents and verify newly enrolled customer accounts.
              </p>
            </div>
          </div>
          <Link
            to="/admin/kyc"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition group"
          >
            <span>Open KYC Verification Desk</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-indigo-600" />
          </Link>
        </div>

        {/* Transfer Authorizations Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <ArrowLeftRight size={18} />
              </div>
              {pendingTransfersCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {pendingTransfersCount} Action Required
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  All Cleared
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Transfer Authorizations</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                High-value transfers (≥ ₹50,000) requiring authorized executive release.
              </p>
            </div>
          </div>
          <Link
            to="/admin/transfers"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition group"
          >
            <span>Review Pending Transfers</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-indigo-600" />
          </Link>
        </div>

        {/* Customer Directory Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users size={18} />
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {Number(overview?.totalCustomers || 0).toLocaleString()} Users
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Directory</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Search, review profiles, inspect accounts, and monitor customer state bank-wide.
              </p>
            </div>
          </div>
          <Link
            to="/admin/customers"
            className="w-full inline-flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition group"
          >
            <span>Search Customer Directory</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-indigo-600" />
          </Link>
        </div>
      </div>

      {/* Compliance & System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
        {/* Compliance Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Institutional KYC Health</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customer verification and clearance rate</p>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${risk.bg} ${risk.color}`}>
              Risk: {risk.level}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Verified Profiles</span>
              <span className="text-emerald-700 font-mono">{verificationRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(verificationRate, 2)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold uppercase">Verified</span>
              <strong className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">{Number(overview?.verifiedKyc || 0)}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold uppercase">Pending</span>
              <strong className="text-base font-bold text-amber-800 font-mono mt-0.5 block">{pendingKycCount}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold uppercase">Rejected</span>
              <strong className="text-base font-bold text-rose-700 font-mono mt-0.5 block">{Number(overview?.rejectedKyc || 0)}</strong>
            </div>
          </div>
        </div>

        {/* System & Architecture Integrity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System &amp; Security Services</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transactional safeguards and background processors</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Healthy
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Lock size={16} className="text-indigo-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <strong className="text-slate-800 block text-xs font-bold">Deterministic Pessimistic Locking</strong>
                <span className="text-[11px] text-slate-500">Deadlock-free sorted account locking prevents concurrent overdrafts</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Database size={16} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <strong className="text-slate-800 block text-xs font-bold">Outbox Background Processor</strong>
                <span className="text-[11px] text-slate-500">Continuous polling scheduled every 5,000ms for reliable event publishing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
