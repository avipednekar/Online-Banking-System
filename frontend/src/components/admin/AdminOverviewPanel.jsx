import { memo } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  WalletCards
} from "lucide-react";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";

function getVerificationRate(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const verifiedKyc = Number(overview?.verifiedKyc || 0);

  if (!totalCustomers) {
    return "0%";
  }

  return `${Math.round((verifiedKyc / totalCustomers) * 100)}%`;
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

export const AdminOverviewPanel = memo(function AdminOverviewPanel({
  overview,
  isLoading,
  hasLoadedOnce = false,
  error,
  onRefresh
}) {
  const showInitialLoading = isLoading && !hasLoadedOnce && !overview;
  const pendingKyc = Number(overview?.pendingKyc || 0);
  const pendingTransfers = Number(overview?.pendingTransfers || 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 w-full min-w-0 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Institutional Metrics Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time banking key performance indicators</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs disabled:opacity-50"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin text-indigo-600" : "text-slate-500"} />
          <span>{isLoading ? "Refreshing..." : "Refresh Metrics"}</span>
        </button>
      </div>

      {showInitialLoading ? (
        <div className="py-8">
          <LoadingState compact title="Loading overview" message="Fetching banking KPIs." />
        </div>
      ) : null}

      {error ? (
        <SectionErrorState
          message={error}
          action={
            <button type="button" className="secondary" onClick={onRefresh}>
              Retry
            </button>
          }
        />
      ) : null}

      {!error && overview ? (
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
            value={pendingKyc.toLocaleString()}
            detail="Profiles awaiting verification."
            badge={pendingKyc > 0 ? "Action Required" : "Cleared"}
            badgeColor={pendingKyc > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}
            iconBg="bg-amber-50 text-amber-600 border-amber-100"
          />
          <KpiCard
            icon={ArrowLeftRight}
            label="Pending Transfers"
            value={pendingTransfers.toLocaleString()}
            detail="High-value transfers (≥ ₹50k)."
            badge={pendingTransfers > 0 ? "Needs Release" : "Queue Clean"}
            badgeColor={pendingTransfers > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}
            iconBg="bg-rose-50 text-rose-600 border-rose-100"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Verified KYC Rate"
            value={getVerificationRate(overview)}
            detail={`${Number(overview?.verifiedKyc || 0).toLocaleString()} verified customer profiles.`}
            badge="Compliance"
            badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
        </div>
      ) : null}
    </div>
  );
});
