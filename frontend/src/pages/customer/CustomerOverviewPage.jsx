import { useCustomerRouteWorkspace } from "../../hooks/useCustomerRouteWorkspace";
import {
  ArrowLeftRight,
  CreditCard,
  Send,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Link } from "react-router-dom";

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export default function CustomerOverviewPage() {
  const { workspace } = useCustomerRouteWorkspace();

  const totalBalance = workspace.accounts.reduce(
    (sum, a) => sum + Number(a.balance || 0),
    0
  );

  const accountCount = workspace.accounts.length;
  const beneficiaryCount = workspace.beneficiaries.length;
  const activeBeneficiaryCount = workspace.activeBeneficiaries.length;
  const txCount = workspace.transactions.length;

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* KYC Status Banner */}
      {workspace.user?.kycStatus !== "VERIFIED" ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
          <span className="text-lg">⚠️</span>
          <span>
            Your KYC verification is <strong>{workspace.user?.kycStatus || "PENDING"}</strong>.
            {workspace.user?.kycStatus === "REJECTED"
              ? " Please contact support."
              : " Some features may be limited until verification is complete."}
          </span>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Balance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatMoney(totalBalance)}</p>
          <p className="text-xs text-slate-500 mt-1">Across {accountCount} account{accountCount !== 1 ? "s" : ""}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounts</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{accountCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active accounts</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficiaries</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <Send size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{activeBeneficiaryCount}</p>
          <p className="text-xs text-slate-500 mt-1">{beneficiaryCount} total registered</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transactions</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{txCount}</p>
          <p className="text-xs text-slate-500 mt-1">Loaded records</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/dashboard/accounts"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <Wallet size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Manage Accounts</h3>
          </div>
          <p className="text-xs text-slate-500">View balances, open new accounts, deposit or withdraw funds.</p>
        </Link>

        <Link
          to="/dashboard/transfers"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
              <Send size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Send Money</h3>
          </div>
          <p className="text-xs text-slate-500">Transfer funds to beneficiaries or manage your transfer destinations.</p>
        </Link>

        <Link
          to="/dashboard/transactions"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition">
              <ArrowLeftRight size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">View Transactions</h3>
          </div>
          <p className="text-xs text-slate-500">Browse detailed transaction history for all your accounts.</p>
        </Link>
      </div>

      {/* Accounts Summary Table */}
      {workspace.accounts.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Account Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Account</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspace.accounts.map((a) => (
                  <tr key={a.accountNumber} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-5 font-mono text-xs text-slate-700">
                      ****{a.accountNumber?.slice(-4) || "----"}
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-700 capitalize">
                      {String(a.accountType || "").toLowerCase()}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        a.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-slate-900">
                      {formatMoney(a.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
