import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/api";
import {
  createInitialFormErrors,
  initialAccountForm,
  initialBeneficiaryForm,
  initialTransferForm
} from "../../constants/forms";
import { useAuth } from "../../context/AuthContext";
import { collectFieldErrors, formatAddress, formatCurrency } from "../../utils/formatters";

function ButtonLabel({ active, idleLabel, loadingLabel }) {
  if (!active) {
    return idleLabel;
  }

  return (
    <span className="button-content">
      <span className="button-spinner" aria-hidden="true" />
      {loadingLabel}
    </span>
  );
}

export function CustomerDashboard({ notify }) {
  const { token, user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [transferForm, setTransferForm] = useState(initialTransferForm);
  const [beneficiaryForm, setBeneficiaryForm] = useState(initialBeneficiaryForm);
  const [amount, setAmount] = useState("100.00");
  const [formErrors, setFormErrors] = useState(createInitialFormErrors);
  const [pendingActions, setPendingActions] = useState([]);

  const loading = pendingActions.length > 0;
  const activeAction = pendingActions[0] || "";
  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts]
  );

  useEffect(() => {
    loadAccounts();
    loadBeneficiaries();
  }, []);

  function handleLogout() {
    logout();
    notify("info", "Signed out", "You have been logged out.");
  }

  function startAction(action) {
    setPendingActions((current) => (current.includes(action) ? current : [...current, action]));
  }

  function finishAction(action) {
    setPendingActions((current) => current.filter((entry) => entry !== action));
  }

  function clearFormErrors(formKey) {
    setFormErrors((current) => ({
      ...current,
      [formKey]: {}
    }));
  }

  function updateField(setter, formKey, field, value) {
    setter((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({
      ...current,
      [formKey]: {
        ...current[formKey],
        [field]: ""
      }
    }));
  }

  function renderFieldError(formKey, field) {
    const message = formErrors[formKey]?.[field];
    return message ? <span className="field-error">{message}</span> : null;
  }

  function renderFormAlert(formKey) {
    const hasErrors = Object.values(formErrors[formKey] || {}).some(Boolean);
    return hasErrors ? (
      <div className="inline-alert" role="alert">
        Please correct the highlighted fields before continuing.
      </div>
    ) : null;
  }

  function handleApiError(title, error, formKey = null) {
    if (error.status === 401) {
      logout();
      notify("error", "Session expired", error.message || "Please sign in again.");
      return;
    }

    if (formKey) {
      setFormErrors((current) => ({
        ...current,
        [formKey]: error.fields || {}
      }));
    }

    notify("error", title, error.message || "Request failed", collectFieldErrors(error.fields));
  }

  async function loadAccounts() {
    startAction("accounts");
    try {
      const data = await apiRequest("/accounts", { token });
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount((current) => current || data[0].accountNumber);
      } else {
        setSelectedAccount("");
      }
    } catch (error) {
      handleApiError("Unable to load accounts", error);
    } finally {
      finishAction("accounts");
    }
  }

  async function loadBeneficiaries() {
    startAction("beneficiaries");
    try {
      const data = await apiRequest("/beneficiaries", { token });
      setBeneficiaries(data);
    } catch (error) {
      handleApiError("Unable to load beneficiaries", error);
    } finally {
      finishAction("beneficiaries");
    }
  }

  async function loadTransactions(accountNumber) {
    startAction("transactions");
    try {
      const data = await apiRequest(`/accounts/${accountNumber}/transactions`, { token });
      setTransactions(data);
      setSelectedAccount(accountNumber);
    } catch (error) {
      handleApiError("Unable to load transaction history", error);
    } finally {
      finishAction("transactions");
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    clearFormErrors("account");
    startAction("account");
    try {
      const created = await apiRequest("/accounts", {
        method: "POST",
        token,
        body: {
          ...accountForm,
          openingBalance: Number(accountForm.openingBalance)
        }
      });
      setAccounts((current) => [...current, created]);
      setAccountForm(initialAccountForm);
      setSelectedAccount(created.accountNumber);
      notify("success", "Account created", `Account ${created.accountNumber} created successfully.`);
    } catch (error) {
      handleApiError("Account creation failed", error, "account");
    } finally {
      finishAction("account");
    }
  }

  async function handleBalanceAction(type) {
    if (!selectedAccount) {
      notify("error", "No account selected", "Select an account first.");
      return;
    }

    clearFormErrors("balance");
    startAction("balance");
    try {
      const updated = await apiRequest(`/accounts/${selectedAccount}/${type}`, {
        method: "POST",
        token,
        body: { amount: Number(amount) }
      });
      setAccounts((current) =>
        current.map((account) =>
          account.accountNumber === updated.accountNumber ? updated : account
        )
      );
      notify(
        "success",
        type === "deposit" ? "Deposit completed" : "Withdrawal completed",
        `${type === "deposit" ? "Deposit" : "Withdrawal"} posted for ${updated.accountNumber}.`
      );
      await loadTransactions(selectedAccount);
    } catch (error) {
      handleApiError(type === "deposit" ? "Deposit failed" : "Withdrawal failed", error, "balance");
    } finally {
      finishAction("balance");
    }
  }

  async function handleTransfer(event) {
    event.preventDefault();
    clearFormErrors("transfer");
    startAction("transfer");
    try {
      await apiRequest("/accounts/transfer", {
        method: "POST",
        token,
        body: {
          ...transferForm,
          amount: Number(transferForm.amount)
        }
      });
      setTransferForm(initialTransferForm);
      notify("success", "Transfer completed", "Funds were transferred successfully.");
      await loadAccounts();
      if (selectedAccount) {
        await loadTransactions(selectedAccount);
      }
    } catch (error) {
      handleApiError("Transfer failed", error, "transfer");
    } finally {
      finishAction("transfer");
    }
  }

  async function handleCreateBeneficiary(event) {
    event.preventDefault();
    clearFormErrors("beneficiary");
    startAction("beneficiary");
    try {
      const created = await apiRequest("/beneficiaries", {
        method: "POST",
        token,
        body: beneficiaryForm
      });
      setBeneficiaries((current) => [created, ...current]);
      setBeneficiaryForm(initialBeneficiaryForm);
      setTransferForm((current) => ({ ...current, toAccountNumber: created.accountNumber }));
      notify("success", "Beneficiary saved", `Beneficiary ${created.nickname} added successfully.`);
    } catch (error) {
      handleApiError("Beneficiary creation failed", error, "beneficiary");
    } finally {
      finishAction("beneficiary");
    }
  }

  return (
    <>
      <section className="summary-grid">
        <div className="panel">
          <span className="panel-label">Current user</span>
          <h2>{user?.fullName || user?.username}</h2>
          <p>{user?.role} | KYC: {user?.kycStatus || "Loading"}</p>
          <p>{user?.occupation || user?.email || ""}</p>
          <button className="secondary" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="panel">
          <span className="panel-label">Accounts</span>
          <h2>{accounts.length}</h2>
          <p>Managed through JWT-protected endpoints</p>
        </div>
        <div className="panel">
          <span className="panel-label">Total balance</span>
          <h2>Rs {totalBalance.toFixed(2)}</h2>
          <p>Combined live value across your accounts</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Customer profile</h2>
          <span className={`kyc-pill ${String(user?.kycStatus || "").toLowerCase()}`}>
            {user?.kycStatus || "Loading"}
          </span>
        </div>
        {activeAction === "profile" ? (
          <p className="loading-note">
            <span className="inline-spinner" aria-hidden="true" />
            Loading customer profile...
          </p>
        ) : null}
        <div className="profile-grid">
          <article className="profile-card">
            <span>Identity</span>
            <strong>{user?.fullName || "Not available"}</strong>
            <p>{user?.gender || "Not available"}</p>
            <p>Date of birth: {user?.dateOfBirth || "Not available"}</p>
          </article>
          <article className="profile-card">
            <span>Contact</span>
            <strong>{user?.phoneNumber || "Not available"}</strong>
            <p>{user?.email || "Not available"}</p>
            <p>{user?.occupation || "Not available"}</p>
          </article>
          <article className="profile-card profile-card-wide">
            <span>Address</span>
            <strong>{formatAddress(user) || "Not available"}</strong>
            <p>Username: {user?.username || "Not available"}</p>
            <p>Role: {user?.role || "Not available"}</p>
          </article>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="panel" onSubmit={handleCreateAccount}>
          <h2>Create account</h2>
          {renderFormAlert("account")}
          <label>
            Account type
            <select
              value={accountForm.accountType}
              onChange={(event) =>
                updateField(setAccountForm, "account", "accountType", event.target.value)
              }
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
            {renderFieldError("account", "accountType")}
          </label>
          <label>
            Opening balance
            <input
              type="number"
              min="100"
              step="0.01"
              value={accountForm.openingBalance}
              onChange={(event) =>
                updateField(setAccountForm, "account", "openingBalance", event.target.value)
              }
              required
            />
            {renderFieldError("account", "openingBalance")}
          </label>
          <button type="submit" disabled={loading}>
            <ButtonLabel
              active={activeAction === "account"}
              idleLabel="Open account"
              loadingLabel="Opening account..."
            />
          </button>
          <p className="muted">Account number will be generated automatically when the account is created.</p>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Your accounts</h2>
            <button className="secondary" type="button" onClick={loadAccounts} disabled={loading}>
              <ButtonLabel
                active={activeAction === "accounts"}
                idleLabel="Refresh"
                loadingLabel="Refreshing..."
              />
            </button>
          </div>
          {activeAction === "accounts" ? (
            <p className="loading-note">
              <span className="inline-spinner" aria-hidden="true" />
              Loading accounts...
            </p>
          ) : null}
          <div className="account-list">
            {accounts.map((account) => (
              <button
                key={account.accountNumber}
                type="button"
                className={`account-card ${selectedAccount === account.accountNumber ? "active" : ""}`}
                onClick={() => loadTransactions(account.accountNumber)}
              >
                <span>{account.accountType} | {account.status}</span>
                <strong>{account.accountNumber}</strong>
                <em>{formatCurrency(account.balance, account.currencyCode)}</em>
              </button>
            ))}
            {accounts.length === 0 ? <p className="muted">No accounts yet.</p> : null}
          </div>
        </div>

        <div className="panel">
          <h2>Deposit / Withdraw</h2>
          <label>
            Account
            <select value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            {renderFieldError("balance", "amount")}
          </label>
          <div className="button-row">
            <button type="button" onClick={() => handleBalanceAction("deposit")} disabled={loading}>
              <ButtonLabel
                active={activeAction === "balance"}
                idleLabel="Deposit"
                loadingLabel="Posting..."
              />
            </button>
            <button type="button" className="secondary" onClick={() => handleBalanceAction("withdraw")} disabled={loading}>
              <ButtonLabel
                active={activeAction === "balance"}
                idleLabel="Withdraw"
                loadingLabel="Posting..."
              />
            </button>
          </div>
        </div>

        <form className="panel" onSubmit={handleTransfer}>
          <h2>Transfer funds</h2>
          {renderFormAlert("transfer")}
          <label>
            From account
            <select
              value={transferForm.fromAccountNumber}
              onChange={(event) =>
                updateField(setTransferForm, "transfer", "fromAccountNumber", event.target.value)
              }
            >
              <option value="">Select source</option>
              {accounts.map((account) => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber}
                </option>
              ))}
            </select>
            {renderFieldError("transfer", "fromAccountNumber")}
          </label>
          <label>
            Approved beneficiary
            <select
              value={transferForm.toAccountNumber}
              onChange={(event) =>
                updateField(setTransferForm, "transfer", "toAccountNumber", event.target.value)
              }
            >
              <option value="">Select beneficiary</option>
              {beneficiaries.map((beneficiary) => (
                <option key={beneficiary.id} value={beneficiary.accountNumber}>
                  {beneficiary.nickname} - {beneficiary.accountNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            To account
            <input
              value={transferForm.toAccountNumber}
              onChange={(event) =>
                updateField(setTransferForm, "transfer", "toAccountNumber", event.target.value)
              }
              required
            />
            {renderFieldError("transfer", "toAccountNumber")}
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={transferForm.amount}
              onChange={(event) =>
                updateField(setTransferForm, "transfer", "amount", event.target.value)
              }
              required
            />
            {renderFieldError("transfer", "amount")}
          </label>
          <button type="submit" disabled={loading}>
            <ButtonLabel
              active={activeAction === "transfer"}
              idleLabel="Transfer"
              loadingLabel="Transferring..."
            />
          </button>
        </form>

        <form className="panel" onSubmit={handleCreateBeneficiary}>
          <h2>Add beneficiary</h2>
          {renderFormAlert("beneficiary")}
          <label>
            Nickname
            <input
              value={beneficiaryForm.nickname}
              onChange={(event) =>
                updateField(setBeneficiaryForm, "beneficiary", "nickname", event.target.value)
              }
              required
            />
            {renderFieldError("beneficiary", "nickname")}
          </label>
          <label>
            Bank name
            <input
              value={beneficiaryForm.bankName}
              onChange={(event) =>
                updateField(setBeneficiaryForm, "beneficiary", "bankName", event.target.value)
              }
              required
            />
            {renderFieldError("beneficiary", "bankName")}
          </label>
          <label>
            Beneficiary account
            <input
              value={beneficiaryForm.accountNumber}
              onChange={(event) =>
                updateField(setBeneficiaryForm, "beneficiary", "accountNumber", event.target.value)
              }
              required
            />
            {renderFieldError("beneficiary", "accountNumber")}
          </label>
          <button type="submit" disabled={loading}>
            <ButtonLabel
              active={activeAction === "beneficiary"}
              idleLabel="Save beneficiary"
              loadingLabel="Saving beneficiary..."
            />
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Transactions {selectedAccount ? `for ${selectedAccount}` : ""}</h2>
          {selectedAccount ? (
            <button
              className="secondary"
              type="button"
              onClick={() => loadTransactions(selectedAccount)}
              disabled={loading}
            >
              <ButtonLabel
                active={activeAction === "transactions"}
                idleLabel="Refresh history"
                loadingLabel="Refreshing..."
              />
            </button>
          ) : null}
        </div>
        {activeAction === "transactions" ? (
          <p className="loading-note">
            <span className="inline-spinner" aria-hidden="true" />
            Loading transaction history...
          </p>
        ) : null}
        <div className="transaction-list">
          {transactions.map((entry) => (
            <article key={entry.id} className="transaction-card">
              <span>{entry.type}</span>
              <strong>Rs {Number(entry.amount).toFixed(2)}</strong>
              <p>{entry.description}</p>
              <time>{new Date(entry.createdAt).toLocaleString()}</time>
            </article>
          ))}
          {transactions.length === 0 ? (
            <p className="muted">Choose an account to view transactions.</p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Approved beneficiaries</h2>
          <button className="secondary" type="button" onClick={loadBeneficiaries} disabled={loading}>
            <ButtonLabel
              active={activeAction === "beneficiaries"}
              idleLabel="Refresh"
              loadingLabel="Refreshing..."
            />
          </button>
        </div>
        {activeAction === "beneficiaries" ? (
          <p className="loading-note">
            <span className="inline-spinner" aria-hidden="true" />
            Loading beneficiaries...
          </p>
        ) : null}
        <div className="transaction-list">
          {beneficiaries.map((beneficiary) => (
            <article key={beneficiary.id} className="transaction-card">
              <span>{beneficiary.bankName}</span>
              <strong>{beneficiary.nickname}</strong>
              <p>{beneficiary.accountNumber}</p>
              <time>{new Date(beneficiary.createdAt).toLocaleString()}</time>
            </article>
          ))}
          {beneficiaries.length === 0 ? (
            <p className="muted">No beneficiaries added yet.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
