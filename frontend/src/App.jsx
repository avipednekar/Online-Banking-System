import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const initialRegisterForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  gender: "OTHER",
  occupation: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  dateOfBirth: ""
};

const initialLoginForm = {
  username: "",
  password: ""
};

const initialAccountForm = {
  accountType: "SAVINGS",
  openingBalance: "1000.00"
};

const initialTransferForm = {
  fromAccountNumber: "",
  toAccountNumber: "",
  amount: "100.00"
};

const initialBeneficiaryForm = {
  nickname: "",
  bankName: "Internal Bank",
  accountNumber: ""
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("bank_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("bank_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [transferForm, setTransferForm] = useState(initialTransferForm);
  const [beneficiaryForm, setBeneficiaryForm] = useState(initialBeneficiaryForm);
  const [amount, setAmount] = useState("100.00");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      fetchAccounts();
      fetchBeneficiaries();
    } else {
      setAccounts([]);
      setBeneficiaries([]);
      setTransactions([]);
    }
  }, [token, user]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts]
  );

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }
    return data;
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      const profile = await apiRequest("/api/auth/me");
      setUser(profile);
      localStorage.setItem("bank_user", JSON.stringify(profile));
      setMessage(`Welcome back, ${profile.username}`);
      setError("");
    } catch (requestError) {
      logout();
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccounts() {
    try {
      setLoading(true);
      const data = await apiRequest("/api/accounts");
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].accountNumber);
      }
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBeneficiaries() {
    try {
      const data = await apiRequest("/api/beneficiaries");
      setBeneficiaries(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function fetchTransactions(accountNumber) {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/accounts/${accountNumber}/transactions`);
      setTransactions(data);
      setSelectedAccount(accountNumber);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    await authenticate("/api/auth/register", registerForm);
  }

  async function handleLogin(event) {
    event.preventDefault();
    await authenticate("/api/auth/login", loginForm);
  }

  async function authenticate(path, payload) {
    try {
      setLoading(true);
      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setToken(data.token);
      localStorage.setItem("bank_token", data.token);
      const profile = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        fullName: registerForm.fullName || null,
        phoneNumber: registerForm.phoneNumber || null,
        gender: registerForm.gender || null,
        occupation: registerForm.occupation || null,
        addressLine1: registerForm.addressLine1 || null,
        addressLine2: registerForm.addressLine2 || null,
        city: registerForm.city || null,
        state: registerForm.state || null,
        postalCode: registerForm.postalCode || null,
        country: registerForm.country || null,
        dateOfBirth: registerForm.dateOfBirth || null,
        kycStatus: null
      };
      setUser(profile);
      localStorage.setItem("bank_user", JSON.stringify(profile));
      setRegisterForm(initialRegisterForm);
      setLoginForm(initialLoginForm);
      setMessage(data.message);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const created = await apiRequest("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          ...accountForm,
          openingBalance: Number(accountForm.openingBalance)
        })
      });
      setAccounts((previous) => [...previous, created]);
      setAccountForm(initialAccountForm);
      setMessage(`Account ${created.accountNumber} created`);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBalanceAction(type) {
    if (!selectedAccount) {
      setError("Select an account first");
      return;
    }

    try {
      setLoading(true);
      const updated = await apiRequest(`/api/accounts/${selectedAccount}/${type}`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) })
      });
      setAccounts((previous) =>
        previous.map((account) =>
          account.accountNumber === updated.accountNumber ? updated : account
        )
      );
      setMessage(`${type === "deposit" ? "Deposit" : "Withdrawal"} completed`);
      setError("");
      await fetchTransactions(selectedAccount);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(event) {
    event.preventDefault();
    try {
      setLoading(true);
      await apiRequest("/api/accounts/transfer", {
        method: "POST",
        body: JSON.stringify({
          ...transferForm,
          amount: Number(transferForm.amount)
        })
      });
      setTransferForm(initialTransferForm);
      setMessage("Transfer completed");
      setError("");
      await fetchAccounts();
      if (selectedAccount) {
        await fetchTransactions(selectedAccount);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBeneficiary(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const created = await apiRequest("/api/beneficiaries", {
        method: "POST",
        body: JSON.stringify(beneficiaryForm)
      });
      setBeneficiaries((previous) => [created, ...previous]);
      setBeneficiaryForm(initialBeneficiaryForm);
      setTransferForm((current) => ({ ...current, toAccountNumber: created.accountNumber }));
      setMessage(`Beneficiary ${created.nickname} added`);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("bank_token");
    localStorage.removeItem("bank_user");
    setToken("");
    setUser(null);
    setAccounts([]);
    setBeneficiaries([]);
    setTransactions([]);
    setSelectedAccount("");
    setMessage("Logged out");
    setError("");
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <main className="page">
        <section className="hero">
          <div>
            <p className="eyebrow">VaultLine Secure Console</p>
            <h1>Banking operations with JWT, PostgreSQL, and a React dashboard.</h1>
            <p className="hero-copy">
              Register, sign in, create accounts, move funds, and inspect transaction
              history from one screen. The backend expects a Bearer token on every
              protected request.
            </p>
          </div>
          <div className="hero-card">
            <span>Status</span>
            <strong>{loading ? "Processing..." : token ? "Authenticated" : "Awaiting sign in"}</strong>
            <p>API: {API_BASE_URL}</p>
          </div>
        </section>

        {message ? <div className="banner success">{message}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}

        {!token ? (
          <section className="auth-grid">
            <form className="panel" onSubmit={handleRegister}>
              <h2>Create profile</h2>
              <label>
                Full name
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Username
                <input
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, username: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Phone number
                <input
                  value={registerForm.phoneNumber}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, phoneNumber: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Gender
                <select
                  value={registerForm.gender}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, gender: event.target.value }))
                  }
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label>
                Occupation
                <input
                  value={registerForm.occupation}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, occupation: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Address line 1
                <input
                  value={registerForm.addressLine1}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, addressLine1: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Address line 2
                <input
                  value={registerForm.addressLine2}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, addressLine2: event.target.value }))
                  }
                />
              </label>
              <label>
                City
                <input
                  value={registerForm.city}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, city: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                State
                <input
                  value={registerForm.state}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, state: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Postal code
                <input
                  value={registerForm.postalCode}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, postalCode: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Country
                <input
                  value={registerForm.country}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, country: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={registerForm.dateOfBirth}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                  }
                  required
                />
              </label>
              <button type="submit" disabled={loading}>Register</button>
            </form>

            <form className="panel" onSubmit={handleLogin}>
              <h2>Sign in</h2>
              <label>
                Username
                <input
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, username: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </label>
              <button type="submit" disabled={loading}>Login</button>
            </form>
          </section>
        ) : (
          <>
            <section className="summary-grid">
              <div className="panel">
                <span className="panel-label">Current user</span>
                <h2>{user?.fullName || user?.username}</h2>
                <p>{user?.role} | KYC: {user?.kycStatus || "Loading"}</p>
                <p>{user?.occupation || ""}</p>
                <button className="secondary" onClick={logout}>Logout</button>
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

            <section className="workspace-grid">
              <form className="panel" onSubmit={handleCreateAccount}>
                <h2>Create account</h2>
                <label>
                  Account type
                  <select
                    value={accountForm.accountType}
                    onChange={(event) =>
                      setAccountForm((current) => ({ ...current, accountType: event.target.value }))
                    }
                  >
                    <option value="SAVINGS">Savings</option>
                    <option value="CURRENT">Current</option>
                  </select>
                </label>
                <label>
                  Opening balance
                  <input
                    type="number"
                    min="100"
                    step="0.01"
                    value={accountForm.openingBalance}
                    onChange={(event) =>
                      setAccountForm((current) => ({ ...current, openingBalance: event.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={loading}>Open account</button>
                <p className="muted">Account number will be generated automatically when the account is created.</p>
              </form>

              <div className="panel">
                <div className="panel-header">
                  <h2>Your accounts</h2>
                  <button className="secondary" onClick={fetchAccounts}>Refresh</button>
                </div>
                <div className="account-list">
                  {accounts.map((account) => (
                    <button
                      key={account.accountNumber}
                      className={`account-card ${selectedAccount === account.accountNumber ? "active" : ""}`}
                      onClick={() => fetchTransactions(account.accountNumber)}
                    >
                      <span>{account.accountType} | {account.status}</span>
                      <strong>{account.accountNumber}</strong>
                      <em>{account.currencyCode} {Number(account.balance).toFixed(2)}</em>
                    </button>
                  ))}
                  {accounts.length === 0 ? <p className="muted">No accounts yet.</p> : null}
                </div>
              </div>

              <div className="panel">
                <h2>Deposit / Withdraw</h2>
                <label>
                  Account
                  <select
                    value={selectedAccount}
                    onChange={(event) => setSelectedAccount(event.target.value)}
                  >
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
                </label>
                <div className="button-row">
                  <button type="button" onClick={() => handleBalanceAction("deposit")} disabled={loading}>
                    Deposit
                  </button>
                  <button type="button" className="secondary" onClick={() => handleBalanceAction("withdraw")} disabled={loading}>
                    Withdraw
                  </button>
                </div>
              </div>

              <form className="panel" onSubmit={handleTransfer}>
                <h2>Transfer funds</h2>
                <label>
                  From account
                  <select
                    value={transferForm.fromAccountNumber}
                    onChange={(event) =>
                      setTransferForm((current) => ({ ...current, fromAccountNumber: event.target.value }))
                    }
                  >
                    <option value="">Select source</option>
                    {accounts.map((account) => (
                      <option key={account.accountNumber} value={account.accountNumber}>
                        {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Approved beneficiary
                  <select
                    value={transferForm.toAccountNumber}
                    onChange={(event) =>
                      setTransferForm((current) => ({ ...current, toAccountNumber: event.target.value }))
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
                      setTransferForm((current) => ({ ...current, toAccountNumber: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Amount
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={transferForm.amount}
                    onChange={(event) =>
                      setTransferForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={loading}>Transfer</button>
              </form>

              <form className="panel" onSubmit={handleCreateBeneficiary}>
                <h2>Add beneficiary</h2>
                <label>
                  Nickname
                  <input
                    value={beneficiaryForm.nickname}
                    onChange={(event) =>
                      setBeneficiaryForm((current) => ({ ...current, nickname: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Bank name
                  <input
                    value={beneficiaryForm.bankName}
                    onChange={(event) =>
                      setBeneficiaryForm((current) => ({ ...current, bankName: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Beneficiary account
                  <input
                    value={beneficiaryForm.accountNumber}
                    onChange={(event) =>
                      setBeneficiaryForm((current) => ({ ...current, accountNumber: event.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={loading}>Save beneficiary</button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h2>Transactions {selectedAccount ? `for ${selectedAccount}` : ""}</h2>
                {selectedAccount ? (
                  <button className="secondary" onClick={() => fetchTransactions(selectedAccount)}>
                    Refresh history
                  </button>
                ) : null}
              </div>
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
                <button className="secondary" onClick={fetchBeneficiaries}>Refresh</button>
              </div>
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
        )}
      </main>
    </div>
  );
}

export default App;
