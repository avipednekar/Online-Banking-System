import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  ChevronRight,
  Download,
  Landmark,
  LogOut,
  Plus,
  Settings,
  ShoppingCart,
  UserPlus,
  Wallet,
  Zap
} from "lucide-react";
import { accountTypeOptions } from "../constants/forms";
import { useCustomerWorkspace } from "../hooks/useCustomerWorkspace";

const CUSTOMER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnZuPDXz4R9CndRc6N7mJb4vbMuiJwkQkdVOFERnBUvDHOR-x-6O-mESC5WLwhpivI-CoYmMK1O-1ax_vJa8Jz4xbKwssaYR5zChMq1uQW2norEScAH5OGnbM_-3aLYqWZ9iMSE5fxjHsvMxzSUeInolWWZT2H4R4maaKc_xC_EyH5lcl3GiXObc-8lt7xHUSwSzEv1B2Bfa8r8u88YH4eGunGHO_YymzDzaig5-r18klE8CwfXlUxLUXfum4AZ5I67n1Jp3FH2TQB";

function formatMoney(value, currencyCode = "USD") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode === "INR" ? "USD" : currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatCompactDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
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

function getAccountLabel(accountType) {
  const normalized = String(accountType || "").toUpperCase();
  if (normalized === "SAVINGS") {
    return "Savings Account";
  }

  if (normalized === "CURRENT") {
    return "Checking Account";
  }

  return normalized.replace(/_/g, " ");
}

function getTransactionPresentation(entry) {
  const type = String(entry.type || "").toUpperCase();

  switch (type) {
    case "TRANSFER_IN":
      return {
        title: "Inbound Wire Transfer",
        subtitle: entry.description || "Payroll Deposit",
        amountClassName: "is-positive",
        icon: ArrowDownToLine
      };
    case "TRANSFER_OUT":
      return {
        title: "Internal Transfer",
        subtitle: entry.description || "To approved beneficiary",
        amountClassName: "",
        icon: ArrowLeftRight
      };
    case "WITHDRAWAL":
      return {
        title: "Withdrawal",
        subtitle: entry.description || "Funds withdrawn",
        amountClassName: "is-negative",
        icon: Zap
      };
    case "DEPOSIT":
    default:
      return {
        title: "Deposit",
        subtitle: entry.description || "Funds deposited",
        amountClassName: Number(entry.amount) >= 0 ? "is-positive" : "is-negative",
        icon: ShoppingCart
      };
  }
}

function getStatusTone(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "PENDING") {
    return "pending";
  }

  if (normalized === "FAILED" || normalized === "REVERSED") {
    return "failed";
  }

  return "completed";
}

function getInitials(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function QuickActionCard({
  workspace,
  activeAction,
  onActionChange,
  createAccountOpen,
  onToggleCreateAccount
}) {
  const isTransfer = activeAction === "transfer";
  const isDeposit = activeAction === "deposit";
  const isWithdraw = activeAction === "withdraw";

  async function handleSubmit(event) {
    event.preventDefault();

    if (isTransfer) {
      await workspace.createTransfer(event);
      return;
    }

    await workspace.postBalanceAction(isDeposit ? "deposit" : "withdraw");
  }

  return (
    <section className="vault-dashboard-card vault-dashboard-actions-card">
      <div className="vault-dashboard-card-header">
        <h2>Quick Actions</h2>
        <button type="button" className="vault-dashboard-inline-button" onClick={onToggleCreateAccount}>
          <Plus size={14} strokeWidth={2} />
          {createAccountOpen ? "Hide Account Form" : "Open New Account"}
        </button>
      </div>

      <div className="vault-dashboard-tabs">
        <button
          type="button"
          className={isTransfer ? "is-active" : ""}
          onClick={() => onActionChange("transfer")}
        >
          Transfer
        </button>
        <button
          type="button"
          className={isDeposit ? "is-active" : ""}
          onClick={() => onActionChange("deposit")}
        >
          Deposit
        </button>
        <button
          type="button"
          className={isWithdraw ? "is-active" : ""}
          onClick={() => onActionChange("withdraw")}
        >
          Withdraw
        </button>
      </div>

      <form className="vault-dashboard-action-form" onSubmit={handleSubmit}>
        <label className="vault-dashboard-field is-wide">
          <span>Amount (USD)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={isTransfer ? workspace.transferForm.values.amount : workspace.amount}
            onChange={(event) =>
              isTransfer
                ? workspace.transferForm.setValue("amount", event.target.value)
                : workspace.setAmount(event.target.value)
            }
            placeholder="0.00"
          />
        </label>

        <label className="vault-dashboard-field">
          <span>{isTransfer ? "Source" : "Account"}</span>
          <select
            value={isTransfer ? workspace.transferForm.values.fromAccountNumber : workspace.selectedAccount}
            onChange={(event) => {
              if (isTransfer) {
                workspace.transferForm.setValue("fromAccountNumber", event.target.value);
              } else {
                workspace.setSelectedAccount(event.target.value);
              }
            }}
          >
            <option value="">{isTransfer ? "Select source" : "Select account"}</option>
            {workspace.accounts.map((account) => (
              <option key={account.accountNumber} value={account.accountNumber}>
                {getAccountLabel(account.accountType)} ({account.accountNumber})
              </option>
            ))}
          </select>
        </label>

        {isTransfer ? (
          <label className="vault-dashboard-field">
            <span>Destination</span>
            <select
              value={workspace.transferForm.values.toAccountNumber}
              onChange={(event) => workspace.transferForm.setValue("toAccountNumber", event.target.value)}
            >
              <option value="">Select beneficiary</option>
              {workspace.beneficiaries.map((beneficiary) => (
                <option key={beneficiary.id} value={beneficiary.accountNumber}>
                  {beneficiary.nickname} ({beneficiary.accountNumber})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="submit"
          className="vault-dashboard-primary-button"
          disabled={
            isTransfer
              ? workspace.tracker.isPending("transfer")
              : workspace.tracker.isPending("balance")
          }
        >
          {isTransfer
            ? workspace.tracker.isPending("transfer")
              ? "Executing..."
              : "Execute Transaction"
            : workspace.tracker.isPending("balance")
              ? "Posting..."
              : isDeposit
                ? "Post Deposit"
                : "Post Withdrawal"}
        </button>
      </form>

      {createAccountOpen ? (
        <form className="vault-dashboard-create-account" onSubmit={workspace.createAccount}>
          <div className="vault-dashboard-card-header compact">
            <h3>Open New Account</h3>
            <span className="vault-dashboard-muted-pill">Request flow</span>
          </div>
          <div className="vault-dashboard-create-grid">
            <label className="vault-dashboard-field">
              <span>Account Type</span>
              <select
                value={workspace.accountForm.values.accountType}
                onChange={(event) => workspace.accountForm.setValue("accountType", event.target.value)}
              >
                {accountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
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
                onChange={(event) =>
                  workspace.accountForm.setValue("openingBalance", event.target.value)
                }
              />
            </label>
          </div>
          <button
            type="submit"
            className="vault-dashboard-secondary-button"
            disabled={workspace.tracker.isPending("createAccount")}
          >
            {workspace.tracker.isPending("createAccount") ? "Submitting..." : "Submit Account Request"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function EmptyAccountsState() {
  return (
    <div className="vault-dashboard-empty-state">
      <Wallet size={28} strokeWidth={1.5} />
      <div>
        <strong>No accounts yet</strong>
        <p>Open your first account to get started with Vault Financial.</p>
      </div>
    </div>
  );
}

function EmptyTransactionsState() {
  return (
    <div className="vault-dashboard-empty-state">
      <ArrowLeftRight size={28} strokeWidth={1.5} />
      <div>
        <strong>No transactions yet</strong>
        <p>Select an account above to view its transaction history, or make your first deposit.</p>
      </div>
    </div>
  );
}

export default function CustomerPage() {
  const workspace = useCustomerWorkspace();
  const [activeAction, setActiveAction] = useState("transfer");
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const verifiedRequest = useMemo(
    () =>
      workspace.accountRequests.find((entry) => String(entry.status || "").toUpperCase() === "PENDING"),
    [workspace.accountRequests]
  );

  return (
    <section className="vault-customer-dashboard">
      <header className="vault-dashboard-nav">
        <div className="vault-dashboard-nav-brand">
          <span>Vault Financial</span>
          <nav>
            <a href="#dashboard" className="is-active">
              Dashboard
            </a>
            <a href="#accounts">Accounts</a>
            <a href="#actions">Transfers</a>
            <a href="#transactions">History</a>
          </nav>
        </div>

        <div className="vault-dashboard-nav-actions">
          <button type="button" aria-label="Notifications" title="Coming Soon">
            <Bell size={16} />
          </button>
          <button type="button" aria-label="Settings" title="Coming Soon">
            <Settings size={16} />
          </button>
          <div className="vault-dashboard-user">
            <div>
              <strong>{workspace.user?.fullName || workspace.user?.username || "Customer"}</strong>
              <span>{workspace.user?.role === "ADMIN" ? "Administrator" : "Premium Member"}</span>
            </div>
            <img src={CUSTOMER_AVATAR} alt="Customer avatar" />
          </div>
          <button
            type="button"
            className="vault-dashboard-logout"
            onClick={workspace.logoutUser}
            aria-label="Log out"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="vault-dashboard-main">
        <section id="dashboard" className="vault-dashboard-summary">
          <div>
            <div className="vault-dashboard-summary-meta">
              <span className="vault-dashboard-status-badge is-completed">Verified</span>
              <span>
                Customer ID: #
                {workspace.user?.userId ? `VF-${String(workspace.user.userId).padStart(5, "0")}` : "VF-99281"}
              </span>
            </div>
            <h1>{formatMoney(workspace.totalBalance, "USD")}</h1>
            <p>
              Total Balance across <strong>{workspace.accounts.length} Active Accounts</strong>
            </p>
          </div>

          <div className="vault-dashboard-summary-actions">
            <button
              type="button"
              className="vault-dashboard-nav-primary"
              onClick={() => setCreateAccountOpen((value) => !value)}
            >
              <Plus size={16} />
              Open New Account
            </button>
          </div>
        </section>

        {verifiedRequest ? (
          <section className="vault-dashboard-request-banner">
            <div>
              <span className="vault-dashboard-status-badge is-pending">Pending Request</span>
              <strong>
                {verifiedRequest.accountType} account request for{" "}
                {formatMoney(verifiedRequest.openingBalance, "USD")}
              </strong>
            </div>
            <span>Submitted {formatCompactDate(verifiedRequest.createdAt)}</span>
          </section>
        ) : null}

        <section id="accounts" className="vault-dashboard-card vault-dashboard-accounts-section">
          <div className="vault-dashboard-card-header">
            <h2>Your Accounts</h2>
          </div>

          {workspace.accountsError ? (
            <div className="vault-dashboard-inline-state error">{workspace.accountsError}</div>
          ) : null}

          {workspace.accounts.length === 0 && !workspace.accountsError ? (
            <EmptyAccountsState />
          ) : (
            <div className="vault-dashboard-account-strip">
              {workspace.accounts.map((account, index) => (
                <button
                  key={account.accountNumber}
                  type="button"
                  className={[
                    "vault-dashboard-account-card",
                    workspace.selectedAccount === account.accountNumber ? "is-selected" : "",
                    index === 1 ? "is-portfolio" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => workspace.loadTransactions(account.accountNumber)}
                >
                  <div className="vault-dashboard-account-top">
                    <div>
                      <p>{getAccountLabel(account.accountType)}</p>
                      <span>**** {formatAccountAlias(account.accountNumber)}</span>
                    </div>
                    {index === 0 ? <Wallet size={16} /> : index === 1 ? <Landmark size={16} /> : <Wallet size={16} />}
                  </div>
                  <div className="vault-dashboard-account-bottom">
                    <strong>{formatMoney(account.balance, account.currencyCode)}</strong>
                    <span>
                      {account.status === "ACTIVE"
                        ? index === 1
                          ? "Market Active"
                          : "+ 2.4% APY"
                        : account.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="vault-dashboard-grid">
          <div id="actions">
            <QuickActionCard
              workspace={workspace}
              activeAction={activeAction}
              onActionChange={setActiveAction}
              createAccountOpen={createAccountOpen}
              onToggleCreateAccount={() => setCreateAccountOpen((value) => !value)}
            />
          </div>

          <section className="vault-dashboard-card">
            <div className="vault-dashboard-card-header">
              <h2>Recent Beneficiaries</h2>
              <button type="button" className="vault-dashboard-inline-button" title="Coming Soon" disabled>
                <UserPlus size={14} />
                Add New
              </button>
            </div>

            {workspace.beneficiariesError ? (
              <div className="vault-dashboard-inline-state error">{workspace.beneficiariesError}</div>
            ) : null}

            {workspace.beneficiaries.length === 0 && !workspace.beneficiariesError ? (
              <div className="vault-dashboard-empty-state">
                <UserPlus size={28} strokeWidth={1.5} />
                <div>
                  <strong>No beneficiaries</strong>
                  <p>Add beneficiaries to start making transfers.</p>
                </div>
              </div>
            ) : (
              <div className="vault-dashboard-beneficiaries">
                {workspace.beneficiaries.slice(0, 4).map((beneficiary, index) => (
                  <article key={beneficiary.id} className="vault-dashboard-beneficiary">
                    <div className={`vault-dashboard-beneficiary-avatar tone-${index % 4}`}>
                      {getInitials(beneficiary.nickname || beneficiary.accountHolderName)}
                    </div>
                    <div>
                      <strong>{beneficiary.nickname}</strong>
                      <span>
                        {beneficiary.bankName} • ****{formatAccountAlias(beneficiary.accountNumber)}
                      </span>
                    </div>
                    <ChevronRight size={16} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section id="transactions" className="vault-dashboard-card vault-dashboard-transactions-card">
          <div className="vault-dashboard-card-header">
            <h2>Recent Transactions</h2>
            <div className="vault-dashboard-table-actions">
              <button type="button" aria-label="Filter transactions" title="Filter">
                <ArrowLeftRight size={14} />
              </button>
              <button type="button" aria-label="Download transactions" title="Download">
                <Download size={14} />
              </button>
            </div>
          </div>

          {workspace.transactionsError ? (
            <div className="vault-dashboard-inline-state error">{workspace.transactionsError}</div>
          ) : null}

          {workspace.transactions.length === 0 && !workspace.transactionsError ? (
            <EmptyTransactionsState />
          ) : (
            <div className="vault-dashboard-table-wrapper">
              <table className="vault-dashboard-table">
                <thead>
                  <tr>
                    <th>Transaction Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="is-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {workspace.transactions.map((entry) => {
                    const presentation = getTransactionPresentation(entry);
                    const StatusIcon = presentation.icon;

                    return (
                      <tr key={entry.id}>
                        <td>
                          <div className="vault-dashboard-transaction-main">
                            <span className={`vault-dashboard-transaction-icon ${presentation.amountClassName}`}>
                              <StatusIcon size={15} />
                            </span>
                            <div>
                              <strong>{presentation.title}</strong>
                              <span>{presentation.subtitle}</span>
                            </div>
                          </div>
                        </td>
                        <td>{formatCompactDate(entry.createdAt)}</td>
                        <td>
                          <span className={`vault-dashboard-status-badge is-${getStatusTone(entry.status)}`}>
                            {String(entry.status || "POSTED")}
                          </span>
                        </td>
                        <td className={`is-right ${presentation.amountClassName}`}>
                          {Number(entry.amount) >= 0 ? "+" : "-"}
                          {formatMoney(Math.abs(Number(entry.amount || 0)), "USD")}
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
        <p>&copy; 2026 Vault Financial Services. All deposits are FDIC insured up to $250,000.</p>
        <div>
          <a href="#dashboard">Privacy Policy</a>
          <a href="#dashboard">Terms of Service</a>
          <a href="#dashboard">Security Centre</a>
        </div>
      </footer>
    </section>
  );
}
