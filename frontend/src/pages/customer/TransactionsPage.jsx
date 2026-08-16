import {
  ArrowDownToLine,
  ArrowLeftRight,
  Download,
  Send,
  Zap
} from "lucide-react";
import { useCustomerRouteWorkspace } from "../../hooks/useCustomerRouteWorkspace";
import { formatTransactionAmount, isCreditTransaction } from "../../utils/formatters";

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatCompactDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getAccountLabel(accountType) {
  const normalized = String(accountType || "").toUpperCase();
  if (normalized === "SAVINGS") return "Savings Account";
  if (normalized === "CURRENT") return "Current Account";
  return normalized.replace(/_/g, " ");
}

function getTransactionPresentation(entry) {
  const type = String(entry.type || "").toUpperCase();
  switch (type) {
    case "TRANSFER_IN":
      return { title: "Inbound Transfer", subtitle: entry.description || "Wire credit", icon: ArrowDownToLine, isCredit: true };
    case "TRANSFER_OUT":
      return { title: "Outbound Transfer", subtitle: entry.description || "Wire debit", icon: Send, isCredit: false };
    case "WITHDRAWAL":
      return { title: "Withdrawal", subtitle: entry.description || "Funds withdrawn", icon: Zap, isCredit: false };
    case "DEPOSIT":
    default:
      return { title: "Deposit", subtitle: entry.description || "Funds deposited", icon: ArrowDownToLine, isCredit: Number(entry.amount) >= 0 };
  }
}

function getStatusTone(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING" || s === "PENDING_APPROVAL") return "pending";
  if (s === "FAILED" || s === "REVERSED" || s === "REJECTED") return "failed";
  return "completed";
}

export default function TransactionsPage() {
  const { workspace } = useCustomerRouteWorkspace();
  const txBusy = workspace.tracker.isPending("transactions");

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* Account Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Select Account</h3>
            <p className="text-xs text-slate-500">Choose an account to view its transaction history.</p>
          </div>
          <select
            className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            value={workspace.selectedAccount}
            onChange={(e) => workspace.loadTransactions(e.target.value)}
          >
            <option value="">Select account</option>
            {workspace.accounts.map((a) => (
              <option key={a.accountNumber} value={a.accountNumber}>
                {getAccountLabel(a.accountType)} (*{a.accountNumber?.slice(-4)}) — {formatMoney(a.balance)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction History Table */}
      {workspace.transactionsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {workspace.transactionsError}
        </div>
      ) : null}

      {workspace.transactions.length === 0 && !workspace.transactionsError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <ArrowLeftRight size={32} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No transactions yet</h3>
          <p className="text-xs text-slate-500">
            {workspace.selectedAccount
              ? "This account has no posted transactions yet."
              : "Select an account to view its history, or make your first deposit."}
          </p>
        </div>
      ) : null}

      {workspace.transactions.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {workspace.selectedAccount
                ? `Transactions — ****${workspace.selectedAccount.slice(-4)}`
                : "Recent Transactions"}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {workspace.transactions.length} record{workspace.transactions.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Transaction</th>
                  <th className="py-3 px-5">Reference</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspace.transactions.map((entry) => {
                  const p = getTransactionPresentation(entry);
                  const Icon = p.icon;
                  const tone = getStatusTone(entry.status);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                            isCreditTransaction(entry)
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <strong className="block text-xs font-bold text-slate-900 truncate">{p.title}</strong>
                            <span className="block text-[11px] text-slate-500 truncate">{p.subtitle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                        {entry.transactionReference || "—"}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600 whitespace-nowrap">
                        {formatCompactDate(entry.createdAt)}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          tone === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tone === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {String(entry.status || "POSTED")}
                        </span>
                      </td>
                      <td className={`py-3 px-5 text-right font-semibold text-xs ${
                        isCreditTransaction(entry) ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {formatTransactionAmount(entry.amount, entry)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
