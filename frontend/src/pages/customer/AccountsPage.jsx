import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Plus,
  Wallet,
  X
} from "lucide-react";
import { useCustomerRouteWorkspace } from "../../hooks/useCustomerRouteWorkspace";
import { accountTypeOptions } from "../../constants/forms";

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function getAccountLabel(accountType) {
  const normalized = String(accountType || "").toUpperCase();
  if (normalized === "SAVINGS") return "Savings Account";
  if (normalized === "CURRENT") return "Current Account";
  return normalized.replace(/_/g, " ");
}

export default function AccountsPage() {
  const { workspace, actionBusy } = useCustomerRouteWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeAction, setActiveAction] = useState("deposit");
  const [visibleNumbers, setVisibleNumbers] = useState(() => new Set());

  const accountsBusy = workspace.tracker.isPending("accounts");
  const balanceBusy = workspace.tracker.isPending("balance");
  const createBusy = workspace.tracker.isPending("createAccount");

  function toggleVisibility(accountNumber) {
    setVisibleNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(accountNumber)) {
        next.delete(accountNumber);
      } else {
        next.add(accountNumber);
      }
      return next;
    });
  }

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {workspace.accounts.length} account{workspace.accounts.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          onClick={() => setCreateOpen((v) => !v)}
        >
          {createOpen ? <X size={14} /> : <Plus size={14} />}
          <span>{createOpen ? "Cancel" : "Open New Account"}</span>
        </button>
      </div>

      {/* Create Account Form */}
      {createOpen ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Open New Account</h3>
          <form className="space-y-4" onSubmit={workspace.createAccount}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Type</label>
                <select
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  value={workspace.accountForm.values.accountType}
                  onChange={(e) => workspace.accountForm.setValue("accountType", e.target.value)}
                >
                  {accountTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Opening Balance (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  value={workspace.accountForm.values.openingBalance}
                  onChange={(e) => workspace.accountForm.setValue("openingBalance", e.target.value)}
                  placeholder="1000.00"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              disabled={createBusy}
            >
              {createBusy ? "Submitting..." : "Submit Account Request"}
            </button>
            <p className="text-[11px] text-slate-400">Only KYC-verified customers can submit account opening requests. Admin approval generates the account number.</p>
          </form>
        </div>
      ) : null}

      {/* Accounts List */}
      {workspace.accountsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {workspace.accountsError}
        </div>
      ) : null}

      {workspace.accounts.length === 0 && !workspace.accountsError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <Wallet size={32} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No accounts yet</h3>
          <p className="text-xs text-slate-500">Open your first account to get started.</p>
        </div>
      ) : null}

      {workspace.accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspace.accounts.map((account) => (
            <div
              key={account.accountNumber}
              className={`rounded-xl border p-5 shadow-2xs transition cursor-pointer ${
                workspace.selectedAccount === account.accountNumber
                  ? "border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
              onClick={() => workspace.loadTransactions(account.accountNumber)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  workspace.loadTransactions(account.accountNumber);
                }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {getAccountLabel(account.accountType)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  account.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {account.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm text-slate-700">
                  {visibleNumbers.has(account.accountNumber)
                    ? account.accountNumber
                    : `**** ${account.accountNumber?.slice(-4) || "----"}`}
                </span>
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(account.accountNumber);
                  }}
                  aria-label={visibleNumbers.has(account.accountNumber) ? "Hide" : "Show"}
                >
                  {visibleNumbers.has(account.accountNumber) ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <p className="text-xl font-bold text-slate-900 tracking-tight">
                {formatMoney(account.balance)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Deposit / Withdraw Section */}
      {workspace.accounts.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 w-fit mb-4">
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeAction === "deposit"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveAction("deposit")}
            >
              Deposit
            </button>
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeAction === "withdraw"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveAction("withdraw")}
            >
              Withdraw
            </button>
          </div>

          <form
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              workspace.postBalanceAction(activeAction);
            }}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.selectedAccount}
                onChange={(e) => workspace.setSelectedAccount(e.target.value)}
              >
                <option value="">Select account</option>
                {workspace.accounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {getAccountLabel(a.accountType)} (*{a.accountNumber?.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.amount}
                onChange={(e) => workspace.setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              disabled={balanceBusy}
            >
              {balanceBusy
                ? "Posting..."
                : activeAction === "deposit"
                ? "Post Deposit"
                : "Post Withdrawal"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
