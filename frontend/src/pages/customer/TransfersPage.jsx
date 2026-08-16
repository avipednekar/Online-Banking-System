import { useState } from "react";
import {
  ArrowRight,
  Check,
  Plus,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  X
} from "lucide-react";
import { useCustomerRouteWorkspace } from "../../hooks/useCustomerRouteWorkspace";

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

function getInitials(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function TransfersPage() {
  const { workspace, actionBusy } = useCustomerRouteWorkspace();
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);

  const transferBusy = workspace.tracker.isPending("transfer");
  const beneficiaryBusy = workspace.tracker.isPending("beneficiary");
  const lookupBusy = workspace.tracker.isPending("beneficiaryLookup");

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* Transfer Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <Send size={16} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">New Transfer</h3>
        </div>

        <form className="space-y-4" onSubmit={workspace.createTransfer}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Source Account</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.transferForm.values.fromAccountId}
                onChange={(e) => workspace.transferForm.setValue("fromAccountId", e.target.value)}
              >
                <option value="">Select source account</option>
                {workspace.accounts.map((a) => (
                  <option key={a.accountId || a.accountNumber} value={a.accountId}>
                    {getAccountLabel(a.accountType)} (*{a.accountNumber?.slice(-4)}) — {formatMoney(a.balance)}
                  </option>
                ))}
              </select>
              {workspace.transferForm.errors.fromAccountId ? (
                <span className="text-[11px] text-rose-600 mt-1 block">{workspace.transferForm.errors.fromAccountId}</span>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beneficiary</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.transferForm.values.beneficiaryId}
                onChange={(e) => workspace.transferForm.setValue("beneficiaryId", e.target.value)}
              >
                <option value="">Select beneficiary</option>
                {workspace.activeBeneficiaries.map((b) => (
                  <option key={b.beneficiaryId || b.id} value={b.beneficiaryId}>
                    {b.nickname} — *{b.accountNumber?.slice(-4)}
                  </option>
                ))}
              </select>
              {workspace.activeBeneficiaries.length === 0 ? (
                <span className="text-[11px] text-amber-600 mt-1 block">No active beneficiaries. Add and activate one first.</span>
              ) : null}
              {workspace.transferForm.errors.beneficiaryId ? (
                <span className="text-[11px] text-rose-600 mt-1 block">{workspace.transferForm.errors.beneficiaryId}</span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.transferForm.values.amount}
                onChange={(e) => workspace.transferForm.setValue("amount", e.target.value)}
                placeholder="0.00"
              />
              {workspace.transferForm.errors.amount ? (
                <span className="text-[11px] text-rose-600 mt-1 block">{workspace.transferForm.errors.amount}</span>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                value="INR (₹)"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remarks</label>
              <input
                type="text"
                maxLength={255}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                value={workspace.transferForm.values.remarks}
                onChange={(e) => workspace.transferForm.setValue("remarks", e.target.value)}
                placeholder="Payment for invoice #1234"
              />
              {workspace.transferForm.errors.remarks ? (
                <span className="text-[11px] text-rose-600 mt-1 block">{workspace.transferForm.errors.remarks}</span>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
            disabled={transferBusy}
          >
            {transferBusy ? "Processing..." : "Execute Transfer"}
            <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Beneficiaries Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Beneficiaries</h3>
            <span className="text-xs text-slate-500">({workspace.beneficiaries.length} registered)</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition"
            onClick={() => setShowBeneficiaryForm((v) => !v)}
          >
            {showBeneficiaryForm ? <X size={14} /> : <Plus size={14} />}
            <span>{showBeneficiaryForm ? "Cancel" : "Add New"}</span>
          </button>
        </div>

        {/* Add Beneficiary Form */}
        {showBeneficiaryForm ? (
          <form className="space-y-4 mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200" onSubmit={workspace.createBeneficiary}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    value={workspace.beneficiaryForm.values.accountNumber}
                    onChange={(e) => workspace.updateBeneficiaryField("accountNumber", e.target.value)}
                    placeholder="Enter beneficiary account number"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                    onClick={() => workspace.verifyBeneficiaryAccount(workspace.beneficiaryForm.values.accountNumber, true)}
                    disabled={lookupBusy}
                    title="Verify account"
                  >
                    <Search size={14} />
                  </button>
                </div>
                {workspace.beneficiaryLookupError ? (
                  <span className="text-[11px] text-rose-600 mt-1 block">{workspace.beneficiaryLookupError}</span>
                ) : null}
                {workspace.beneficiaryForm.errors.accountNumber ? (
                  <span className="text-[11px] text-rose-600 mt-1 block">{workspace.beneficiaryForm.errors.accountNumber}</span>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nickname</label>
                <input
                  type="text"
                  maxLength={80}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  value={workspace.beneficiaryForm.values.nickname}
                  onChange={(e) => workspace.beneficiaryForm.setValue("nickname", e.target.value)}
                  placeholder="e.g. John's Savings"
                />
                {workspace.beneficiaryForm.errors.nickname ? (
                  <span className="text-[11px] text-rose-600 mt-1 block">{workspace.beneficiaryForm.errors.nickname}</span>
                ) : null}
              </div>
            </div>

            {workspace.beneficiaryLookup ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">{workspace.beneficiaryLookup.accountHolderName}</strong>
                  <span className="text-xs text-slate-500 ml-2">{workspace.beneficiaryLookup.bankName} • {workspace.beneficiaryLookup.accountType}</span>
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Name</label>
              <input
                type="text"
                maxLength={120}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition read-only:bg-slate-50 read-only:text-slate-500"
                value={workspace.beneficiaryForm.values.bankName}
                onChange={(e) => workspace.beneficiaryForm.setValue("bankName", e.target.value)}
                placeholder="Bank name"
                readOnly={Boolean(workspace.beneficiaryLookup)}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              disabled={beneficiaryBusy}
            >
              {beneficiaryBusy ? "Saving..." : "Save Beneficiary"}
            </button>
          </form>
        ) : null}

        {/* Beneficiary Error */}
        {workspace.beneficiariesError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 mb-4">
            {workspace.beneficiariesError}
          </div>
        ) : null}

        {/* Beneficiaries List */}
        {!showBeneficiaryForm && workspace.beneficiaries.length === 0 && !workspace.beneficiariesError ? (
          <div className="text-center py-6">
            <UserPlus size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No beneficiaries</p>
            <p className="text-xs text-slate-500">Add a beneficiary to start making transfers.</p>
          </div>
        ) : null}

        {workspace.beneficiaries.length > 0 ? (
          <div className="space-y-2">
            {workspace.beneficiaries.map((b, i) => {
              const isActive = b.active || String(b.status).toUpperCase() === "ACTIVE";
              return (
                <div
                  key={b.beneficiaryId || b.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                      i % 4 === 0 ? "bg-emerald-50 text-emerald-700" :
                      i % 4 === 1 ? "bg-blue-50 text-blue-700" :
                      i % 4 === 2 ? "bg-violet-50 text-violet-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {getInitials(b.nickname || b.accountHolderName)}
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-slate-900 truncate">{b.nickname}</strong>
                      <span className="text-[11px] text-slate-500">
                        {b.bankName} • ****{b.accountNumber?.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {isActive ? <><Check size={10} /> Active</> : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
