import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  LogOut,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  UserPlus,
  Wallet,
  X,
  Zap
} from "lucide-react";
import { accountTypeOptions } from "../constants/forms";
import { useCustomerWorkspace } from "../hooks/useCustomerWorkspace";

const CUSTOMER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnZuPDXz4R9CndRc6N7mJb4vbMuiJwkQkdVOFERnBUvDHOR-x-6O-mESC5WLwhpivI-CoYmMK1O-1ax_vJa8Jz4xbKwssaYR5zChMq1uQW2norEScAH5OGnbM_-3aLYqWZ9iMSE5fxjHsvMxzSUeInolWWZT2H4R4maaKc_xC_EyH5lcl3GiXObc-8lt7xHUSwSzEv1B2Bfa8r8u88YH4eGunGHO_YymzDzaig5-r18klE8CwfXlUxLUXfum4AZ5I67n1Jp3FH2TQB";

function formatMoney(value, currencyCode = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: String(currencyCode || "INR").toUpperCase() === "INR" ? "INR" : "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatCompactDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatAccountAlias(accountNumber) {
  if (!accountNumber) {
    return "----";
  }

  return accountNumber.slice(-4);
}

function formatMaskedAccountNumber(accountNumber) {
  if (!accountNumber) {
    return "****";
  }

  return `**** ${accountNumber.slice(-4)}`;
}

function getAccountLabel(accountType) {
  const normalized = String(accountType || "").toUpperCase();
  if (normalized === "SAVINGS") return "Savings Account";
  if (normalized === "CURRENT") return "Checking Account";
  return normalized.replace(/_/g, " ");
}

function getTransactionPresentation(entry) {
  const type = String(entry.type || "").toUpperCase();
  switch (type) {
    case "TRANSFER_IN":
      return { title: "Inbound Transfer", subtitle: entry.description || "Wire credit", className: "is-positive", icon: ArrowDownToLine };
    case "TRANSFER_OUT":
      return { title: "Outbound Transfer", subtitle: entry.description || "Wire debit", className: "", icon: Send };
    case "WITHDRAWAL":
      return { title: "Withdrawal", subtitle: entry.description || "Funds withdrawn", className: "is-negative", icon: Zap };
    case "DEPOSIT":
    default:
      return { title: "Deposit", subtitle: entry.description || "Funds deposited", className: Number(entry.amount) >= 0 ? "is-positive" : "is-negative", icon: ArrowDownToLine };
  }
}

function getStatusTone(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING" || s === "PENDING_APPROVAL") return "pending";
  if (s === "FAILED" || s === "REVERSED" || s === "REJECTED") return "failed";
  return "completed";
}

function getInitials(value) {
  return String(value || "").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/* ──────────── Sub-components ──────────── */

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="vault-dashboard-empty-state">
      <Icon size={28} strokeWidth={1.5} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}


function TransferCard({ workspace }) {
  return (
    <section className="vault-dashboard-card vault-dashboard-actions-card">
      <div className="vault-dashboard-card-header">
        <h2>
          <Send size={16} strokeWidth={2} />
          New Transfer
        </h2>
      </div>

      <form className="vault-dashboard-action-form" onSubmit={workspace.createTransfer}>
        <label className="vault-dashboard-field">
          <span>Source Account</span>
          <select
            value={workspace.transferForm.values.fromAccountId}
            onChange={(e) => workspace.transferForm.setValue("fromAccountId", e.target.value)}
          >
            <option value="">Select source account</option>
            {workspace.accounts.map((a) => (
              <option key={a.accountId || a.accountNumber} value={a.accountId}>
                {getAccountLabel(a.accountType)} (*{formatAccountAlias(a.accountNumber)}) — {formatMoney(a.balance)}
              </option>
            ))}
          </select>
          {workspace.transferForm.errors.fromAccountId ? <span className="vault-field-error">{workspace.transferForm.errors.fromAccountId}</span> : null}
        </label>

        <label className="vault-dashboard-field">
          <span>Beneficiary</span>
          <select
            value={workspace.transferForm.values.beneficiaryId}
            onChange={(e) => workspace.transferForm.setValue("beneficiaryId", e.target.value)}
          >
            <option value="">Select beneficiary</option>
            {workspace.activeBeneficiaries.map((b) => (
              <option key={b.beneficiaryId || b.id} value={b.beneficiaryId}>
                {b.nickname} — *{formatAccountAlias(b.accountNumber)}
              </option>
            ))}
          </select>
          {workspace.activeBeneficiaries.length === 0 ? (
            <span className="vault-field-hint">No active beneficiaries. Add and activate one first.</span>
          ) : null}
          {workspace.transferForm.errors.beneficiaryId ? <span className="vault-field-error">{workspace.transferForm.errors.beneficiaryId}</span> : null}
        </label>

        <div className="vault-dashboard-field-row">
          <label className="vault-dashboard-field">
            <span>Amount</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={workspace.transferForm.values.amount}
              onChange={(e) => workspace.transferForm.setValue("amount", e.target.value)}
              placeholder="0.00"
            />
            {workspace.transferForm.errors.amount ? <span className="vault-field-error">{workspace.transferForm.errors.amount}</span> : null}
          </label>
          <label className="vault-dashboard-field vault-dashboard-field-sm">
            <span>Currency</span>
            <input
              type="text"
              value="INR (₹)"
              readOnly
            />
          </label>
        </div>

        <label className="vault-dashboard-field is-wide">
          <span>Remarks</span>
          <input
            type="text"
            maxLength={255}
            value={workspace.transferForm.values.remarks}
            onChange={(e) => workspace.transferForm.setValue("remarks", e.target.value)}
            placeholder="Payment for invoice #1234"
          />
          {workspace.transferForm.errors.remarks ? <span className="vault-field-error">{workspace.transferForm.errors.remarks}</span> : null}
        </label>

        <button
          type="submit"
          className="vault-dashboard-primary-button"
          disabled={workspace.tracker.isPending("transfer")}
        >
          {workspace.tracker.isPending("transfer") ? "Processing..." : "Execute Transfer"}
          <ArrowRight size={16} />
        </button>
      </form>
    </section>
  );
}

function DepositWithdrawCard({ workspace, activeAction, onActionChange }) {
  return (
    <section className="vault-dashboard-card">
      <div className="vault-dashboard-card-header">
        <h2>
          <Wallet size={16} strokeWidth={2} />
          Quick Actions
        </h2>
      </div>

      <div className="vault-dashboard-tabs">
        <button type="button" className={activeAction === "deposit" ? "is-active" : ""} onClick={() => onActionChange("deposit")}>
          Deposit
        </button>
        <button type="button" className={activeAction === "withdraw" ? "is-active" : ""} onClick={() => onActionChange("withdraw")}>
          Withdraw
        </button>
      </div>

      <form
        className="vault-dashboard-action-form"
        onSubmit={(e) => { e.preventDefault(); workspace.postBalanceAction(activeAction); }}
      >
        <label className="vault-dashboard-field">
          <span>Account</span>
          <select
            value={workspace.selectedAccount}
            onChange={(e) => workspace.setSelectedAccount(e.target.value)}
          >
            <option value="">Select account</option>
            {workspace.accounts.map((a) => (
              <option key={a.accountNumber} value={a.accountNumber}>
                {getAccountLabel(a.accountType)} (*{formatAccountAlias(a.accountNumber)})
              </option>
            ))}
          </select>
        </label>
        <label className="vault-dashboard-field">
          <span>Amount (INR)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={workspace.amount}
            onChange={(e) => workspace.setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <button type="submit" className="vault-dashboard-secondary-button" disabled={workspace.tracker.isPending("balance")}>
          {workspace.tracker.isPending("balance") ? "Posting..." : activeAction === "deposit" ? "Post Deposit" : "Post Withdrawal"}
        </button>
      </form>
    </section>
  );
}

function AddBeneficiaryCard({ workspace }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="vault-dashboard-card">
      <div className="vault-dashboard-card-header">
        <h2>
          <UserPlus size={16} strokeWidth={2} />
          Beneficiaries
        </h2>
        <button type="button" className="vault-dashboard-inline-button" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} strokeWidth={2} />
          {showForm ? "Cancel" : "Add New"}
        </button>
      </div>

      {showForm ? (
        <form className="vault-dashboard-action-form" onSubmit={workspace.createBeneficiary}>
          <label className="vault-dashboard-field is-wide">
            <span>Account Number</span>
            <div className="vault-dashboard-field-with-action">
              <input
                type="text"
                value={workspace.beneficiaryForm.values.accountNumber}
                onChange={(e) => workspace.updateBeneficiaryField("accountNumber", e.target.value)}
                placeholder="Enter beneficiary account number"
              />
              <button
                type="button"
                className="vault-dashboard-icon-button"
                onClick={() => workspace.verifyBeneficiaryAccount(workspace.beneficiaryForm.values.accountNumber, true)}
                disabled={workspace.tracker.isPending("beneficiaryLookup")}
                title="Verify account"
              >
                <Search size={14} />
              </button>
            </div>
            {workspace.beneficiaryLookupError ? <span className="vault-field-error">{workspace.beneficiaryLookupError}</span> : null}
            {workspace.beneficiaryForm.errors.accountNumber ? <span className="vault-field-error">{workspace.beneficiaryForm.errors.accountNumber}</span> : null}
          </label>

          {workspace.beneficiaryLookup ? (
            <div className="vault-beneficiary-lookup-result">
              <ShieldCheck size={16} />
              <div>
                <strong>{workspace.beneficiaryLookup.accountHolderName}</strong>
                <span>{workspace.beneficiaryLookup.bankName} • {workspace.beneficiaryLookup.accountType}</span>
              </div>
            </div>
          ) : null}

          <label className="vault-dashboard-field">
            <span>Nickname</span>
            <input
              type="text"
              maxLength={80}
              value={workspace.beneficiaryForm.values.nickname}
              onChange={(e) => workspace.beneficiaryForm.setValue("nickname", e.target.value)}
              placeholder="e.g. John's Savings"
            />
            {workspace.beneficiaryForm.errors.nickname ? <span className="vault-field-error">{workspace.beneficiaryForm.errors.nickname}</span> : null}
          </label>

          <label className="vault-dashboard-field">
            <span>Bank Name</span>
            <input
              type="text"
              maxLength={120}
              value={workspace.beneficiaryForm.values.bankName}
              onChange={(e) => workspace.beneficiaryForm.setValue("bankName", e.target.value)}
              placeholder="Bank name"
              readOnly={Boolean(workspace.beneficiaryLookup)}
            />
          </label>

          <button type="submit" className="vault-dashboard-primary-button" disabled={workspace.tracker.isPending("beneficiary")}>
            {workspace.tracker.isPending("beneficiary") ? "Saving..." : "Save Beneficiary"}
          </button>
        </form>
      ) : null}

      {workspace.beneficiariesError ? (
        <div className="vault-dashboard-inline-state error">{workspace.beneficiariesError}</div>
      ) : null}

      {!showForm && workspace.beneficiaries.length === 0 && !workspace.beneficiariesError ? (
        <EmptyState icon={UserPlus} title="No beneficiaries" description="Add a beneficiary to start making transfers." />
      ) : null}

      {!showForm && workspace.beneficiaries.length > 0 ? (
        <div className="vault-dashboard-beneficiaries">
          {workspace.beneficiaries.map((b, index) => (
            <BeneficiaryRow key={b.beneficiaryId || b.id} beneficiary={b} index={index} workspace={workspace} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function BeneficiaryRow({ beneficiary, index }) {
  const isActive = beneficiary.active || String(beneficiary.status).toUpperCase() === "ACTIVE";

  return (
      <article className="vault-dashboard-beneficiary">
        <div className={`vault-dashboard-beneficiary-avatar tone-${index % 4}`}>
          {getInitials(beneficiary.nickname || beneficiary.accountHolderName)}
        </div>
        <div>
          <strong>{beneficiary.nickname}</strong>
          <span>
            {beneficiary.bankName} • ****{formatAccountAlias(beneficiary.accountNumber)}
          </span>
        </div>
        {isActive ? (
          <span className="vault-dashboard-status-badge is-completed">
            <Check size={12} /> Active
          </span>
        ) : (
          <span className="vault-dashboard-status-badge is-pending">Pending</span>
        )}
      </article>
  );
}

function CreateAccountCard({ workspace, open, onToggle }) {
  if (!open) return null;

  return (
    <section className="vault-dashboard-card">
      <div className="vault-dashboard-card-header">
        <h2>
          <Plus size={16} strokeWidth={2} />
          Open New Account
        </h2>
        <span className="vault-dashboard-muted-pill">Request flow</span>
      </div>

      <form className="vault-dashboard-action-form" onSubmit={workspace.createAccount}>
        <label className="vault-dashboard-field">
          <span>Account Type</span>
          <select
            value={workspace.accountForm.values.accountType}
            onChange={(e) => workspace.accountForm.setValue("accountType", e.target.value)}
          >
            {accountTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="vault-dashboard-field">
          <span>Opening Balance</span>
          <input
            type="number"
            min="100"
            step="0.01"
            value={workspace.accountForm.values.openingBalance}
            onChange={(e) => workspace.accountForm.setValue("openingBalance", e.target.value)}
          />
        </label>
        <button type="submit" className="vault-dashboard-primary-button" disabled={workspace.tracker.isPending("createAccount")}>
          {workspace.tracker.isPending("createAccount") ? "Submitting..." : "Submit Account Request"}
        </button>
      </form>
    </section>
  );
}

/* ──────────── Main Page ──────────── */

export default function CustomerPage() {
  const workspace = useCustomerWorkspace();
  const [activeAction, setActiveAction] = useState("deposit");
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState(() => new Set());

  const verifiedRequest = useMemo(
    () => workspace.accountRequests.find((e) => String(e.status || "").toUpperCase() === "PENDING"),
    [workspace.accountRequests]
  );

  function toggleAccountNumber(accountNumber) {
    setVisibleAccountNumbers((current) => {
      const next = new Set(current);
      if (next.has(accountNumber)) {
        next.delete(accountNumber);
      } else {
        next.add(accountNumber);
      }
      return next;
    });
  }

  function handleAccountCardKeyDown(event, accountNumber) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      workspace.loadTransactions(accountNumber);
    }
  }

  return (
    <section className="vault-customer-dashboard">
      {/* ── Nav ── */}
      <header className="vault-dashboard-nav">
        <div className="vault-dashboard-nav-brand">
          <span>Vault Financial</span>
          <nav>
            <a href="#dashboard" className="is-active">Dashboard</a>
            <a href="#accounts">Accounts</a>
            <a href="#actions">Actions</a>
            <a href="#transactions">History</a>
          </nav>
        </div>
        <div className="vault-dashboard-nav-actions">
          <button type="button" aria-label="Notifications" title="Coming Soon"><Bell size={16} /></button>
          <button type="button" aria-label="Settings" title="Coming Soon"><Settings size={16} /></button>
          <div className="vault-dashboard-user">
            <div>
              <strong>{workspace.user?.fullName || workspace.user?.username || "Customer"}</strong>
              <span>{workspace.user?.kycStatus === "VERIFIED" ? "Verified Member" : "Premium Member"}</span>
            </div>
            <img src={CUSTOMER_AVATAR} alt="" />
          </div>
          <button type="button" className="vault-dashboard-logout" onClick={workspace.logoutUser} aria-label="Log out" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="vault-dashboard-main">
        {/* ── Summary ── */}
        <section id="dashboard" className="vault-dashboard-summary">
          <div>
            <div className="vault-dashboard-summary-meta">
              {workspace.user?.kycStatus === "VERIFIED" ? (
                <span className="vault-dashboard-status-badge is-completed">Verified</span>
              ) : workspace.user?.kycStatus === "REJECTED" ? (
                <span className="vault-dashboard-status-badge is-failed">KYC Rejected</span>
              ) : (
                <span className="vault-dashboard-status-badge is-pending">KYC Pending</span>
              )}
              <span>
                {workspace.user?.customerId || `VF-${String(workspace.user?.userId || 0).padStart(5, "0")}`}
              </span>
            </div>
            <h1>{formatMoney(workspace.totalBalance)}</h1>
            <p>Total Balance across <strong>{workspace.accounts.length} Active Accounts</strong></p>
          </div>
          <div className="vault-dashboard-summary-actions">
            <button type="button" className="vault-dashboard-nav-primary" onClick={() => setCreateAccountOpen((v) => !v)}>
              <Plus size={16} />
              {createAccountOpen ? "Close" : "Open New Account"}
            </button>
          </div>
        </section>

        {/* ── Pending Request Banner ── */}
        {verifiedRequest ? (
          <section className="vault-dashboard-request-banner">
            <div>
              <span className="vault-dashboard-status-badge is-pending">Pending Request</span>
              <strong>{verifiedRequest.accountType} account — {formatMoney(verifiedRequest.openingBalance)}</strong>
            </div>
            <span>Submitted {formatCompactDate(verifiedRequest.createdAt)}</span>
          </section>
        ) : null}

        {/* ── Create Account (conditional) ── */}
        <CreateAccountCard workspace={workspace} open={createAccountOpen} onToggle={() => setCreateAccountOpen((v) => !v)} />

        {/* ── Account Strip ── */}
        <section id="accounts" className="vault-dashboard-card vault-dashboard-accounts-section">
          <div className="vault-dashboard-card-header">
            <h2>Your Accounts</h2>
          </div>
          {workspace.accountsError ? <div className="vault-dashboard-inline-state error">{workspace.accountsError}</div> : null}
          {workspace.accounts.length === 0 && !workspace.accountsError ? (
            <EmptyState icon={Wallet} title="No accounts yet" description="Open your first account to get started with Vault Financial." />
          ) : (
            <div className="vault-dashboard-account-strip">
              {workspace.accounts.map((account, i) => (
                <article
                  key={account.accountNumber}
                  className={["vault-dashboard-account-card", workspace.selectedAccount === account.accountNumber ? "is-selected" : "", i === 1 ? "is-portfolio" : ""].filter(Boolean).join(" ")}
                  onClick={() => workspace.loadTransactions(account.accountNumber)}
                  onKeyDown={(event) => handleAccountCardKeyDown(event, account.accountNumber)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="vault-dashboard-account-top">
                    <div className="vault-dashboard-account-copy">
                      <p>{getAccountLabel(account.accountType)}</p>
                      <div className="vault-dashboard-account-number-row">
                        <span>
                          {visibleAccountNumbers.has(account.accountNumber)
                            ? account.accountNumber
                            : formatMaskedAccountNumber(account.accountNumber)}
                        </span>
                        <button
                          type="button"
                          className="vault-dashboard-account-visibility"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleAccountNumber(account.accountNumber);
                          }}
                          aria-label={
                            visibleAccountNumbers.has(account.accountNumber)
                              ? `Hide account number ending in ${formatAccountAlias(account.accountNumber)}`
                              : `Show account number ending in ${formatAccountAlias(account.accountNumber)}`
                          }
                          title={
                            visibleAccountNumbers.has(account.accountNumber)
                              ? "Hide account number"
                              : "Show account number"
                          }
                        >
                          {visibleAccountNumbers.has(account.accountNumber) ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    {i === 1 ? <Landmark size={16} /> : <Wallet size={16} />}
                  </div>
                  <div className="vault-dashboard-account-bottom">
                    <strong>{formatMoney(account.balance, account.currencyCode)}</strong>
                    <span>{account.status === "ACTIVE" ? (i === 1 ? "Market Active" : "+ 2.4% APY") : account.status}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Actions Grid ── */}
        <section id="actions" className="vault-dashboard-grid">
          <TransferCard workspace={workspace} />
          <div className="vault-dashboard-grid-stack">
            <DepositWithdrawCard workspace={workspace} activeAction={activeAction} onActionChange={setActiveAction} />
            <AddBeneficiaryCard workspace={workspace} />
          </div>
        </section>

        {/* ── Transactions ── */}
        <section id="transactions" className="vault-dashboard-card vault-dashboard-transactions-card">
          <div className="vault-dashboard-card-header">
            <h2>Recent Transactions</h2>
            <div className="vault-dashboard-table-actions">
              <button type="button" title="Filter"><ArrowLeftRight size={14} /></button>
              <button type="button" title="Download"><Download size={14} /></button>
            </div>
          </div>
          {workspace.transactionsError ? <div className="vault-dashboard-inline-state error">{workspace.transactionsError}</div> : null}
          {workspace.transactions.length === 0 && !workspace.transactionsError ? (
            <EmptyState icon={ArrowLeftRight} title="No transactions yet" description="Select an account to view its history, or make your first deposit." />
          ) : (
            <div className="vault-dashboard-table-wrapper">
              <table className="vault-dashboard-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="is-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {workspace.transactions.map((entry) => {
                    const p = getTransactionPresentation(entry);
                    const Icon = p.icon;
                    return (
                      <tr key={entry.id}>
                        <td>
                          <div className="vault-dashboard-transaction-main">
                            <span className={`vault-dashboard-transaction-icon ${p.className}`}><Icon size={15} /></span>
                            <div>
                              <strong>{p.title}</strong>
                              <span>{p.subtitle}</span>
                            </div>
                          </div>
                        </td>
                        <td className="vault-dashboard-ref-cell">{entry.transactionReference || "—"}</td>
                        <td>{formatCompactDate(entry.createdAt)}</td>
                        <td><span className={`vault-dashboard-status-badge is-${getStatusTone(entry.status)}`}>{String(entry.status || "POSTED")}</span></td>
                        <td className={`is-right ${p.className}`}>
                          {Number(entry.amount) >= 0 ? "+" : "-"}{formatMoney(Math.abs(Number(entry.amount || 0)))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="vault-dashboard-footer">
        <p>&copy; 2026 Vault Financial Services. Eligible deposits are protected under DICGC guidelines in India.</p>
        <div>
          <a href="#dashboard">Privacy Policy</a>
          <a href="#dashboard">Terms of Service</a>
          <a href="#dashboard">Security Centre</a>
        </div>
      </footer>
    </section>
  );
}
