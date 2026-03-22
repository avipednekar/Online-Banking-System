import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const NOTIFICATION_TIMEOUT_MS = 5000;

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

const initialFormErrors = {
  register: {},
  login: {},
  account: {},
  balance: {},
  transfer: {},
  beneficiary: {}
};

const actionDescriptions = {
  profile: "Loading secure profile",
  accounts: "Refreshing accounts",
  beneficiaries: "Refreshing beneficiaries",
  transactions: "Loading transaction history",
  adminOverview: "Loading management overview",
  adminCustomers: "Loading customer registry",
  kycUpdate: "Updating KYC status",
  register: "Submitting onboarding",
  login: "Signing in",
  account: "Opening account",
  balance: "Posting balance update",
  transfer: "Processing transfer",
  beneficiary: "Saving beneficiary"
};

function formatAddress(profile) {
  return [
    profile?.addressLine1,
    profile?.addressLine2,
    profile?.city,
    profile?.state,
    profile?.postalCode,
    profile?.country
  ]
    .filter(Boolean)
    .join(", ");
}

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
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [loadingState, setLoadingState] = useState({ count: 0, action: "" });
  const [notifications, setNotifications] = useState([]);
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const loading = loadingState.count > 0;
  const activeAction = loadingState.action;

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      if (user.role === "ADMIN") {
        fetchAdminOverview();
        fetchAdminCustomers();
      } else {
        fetchAccounts();
        fetchBeneficiaries();
      }
    } else {
      setAccounts([]);
      setBeneficiaries([]);
      setTransactions([]);
      setAdminOverview(null);
      setAdminCustomers([]);
    }
  }, [token, user]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts]
  );

  function startLoading(action) {
    setLoadingState((current) => ({
      count: current.count + 1,
      action
    }));
  }

  function stopLoading() {
    setLoadingState((current) => ({
      count: Math.max(0, current.count - 1),
      action: current.count <= 1 ? "" : current.action
    }));
  }

  function showNotification(type, title, message, details = []) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((current) => [...current, { id, type, title, message, details }]);
    window.setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, NOTIFICATION_TIMEOUT_MS);
  }

  function dismissNotification(id) {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
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

  function setRequestErrors(formKey, requestError) {
    setFormErrors((current) => ({
      ...current,
      [formKey]: requestError?.fields || {}
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

  function renderButtonLabel(idleLabel, loadingLabel, action) {
    if (activeAction !== action) {
      return idleLabel;
    }

    return (
      <span className="button-content">
        <span className="button-spinner" aria-hidden="true" />
        {loadingLabel}
      </span>
    );
  }

  function handleRequestError(title, requestError, formKey = null) {
    if (formKey) {
      setRequestErrors(formKey, requestError);
    }

    const details = Object.values(requestError?.fields || {});
    if (requestError?.status === 401 && token) {
      logout(true);
      showNotification("error", "Session expired", requestError.message || "Please sign in again.");
      return;
    }

    showNotification(
      "error",
      title,
      requestError?.message || "Request failed",
      details
    );
  }

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

    const raw = await response.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = {
          error: raw,
          message: raw
        };
      }
    }

    if (!response.ok) {
      const requestError = new Error(
        data.error || data.message || response.statusText || "Request failed"
      );
      requestError.status = response.status;
      requestError.fields = data.fields || {};
      throw requestError;
    }
    return data;
  }

  async function fetchProfile() {
    try {
      startLoading("profile");
      const profile = await apiRequest("/api/auth/me");
      setUser(profile);
      localStorage.setItem("bank_user", JSON.stringify(profile));
    } catch (requestError) {
      logout(true);
      showNotification("error", "Session expired", requestError.message);
    } finally {
      stopLoading();
    }
  }

  async function fetchAccounts() {
    try {
      startLoading("accounts");
      const data = await apiRequest("/api/accounts");
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].accountNumber);
      } else if (data.length === 0) {
        setSelectedAccount("");
      }
    } catch (requestError) {
      handleRequestError("Unable to load accounts", requestError);
    } finally {
      stopLoading();
    }
  }

  async function fetchBeneficiaries() {
    try {
      startLoading("beneficiaries");
      const data = await apiRequest("/api/beneficiaries");
      setBeneficiaries(data);
    } catch (requestError) {
      handleRequestError("Unable to load beneficiaries", requestError);
    } finally {
      stopLoading();
    }
  }

  async function fetchTransactions(accountNumber) {
    try {
      startLoading("transactions");
      const data = await apiRequest(`/api/accounts/${accountNumber}/transactions`);
      setTransactions(data);
      setSelectedAccount(accountNumber);
    } catch (requestError) {
      handleRequestError("Unable to load transaction history", requestError);
    } finally {
      stopLoading();
    }
  }

  async function fetchAdminOverview() {
    try {
      startLoading("adminOverview");
      const data = await apiRequest("/api/admin/overview");
      setAdminOverview(data);
    } catch (requestError) {
      handleRequestError("Unable to load admin overview", requestError);
    } finally {
      stopLoading();
    }
  }

  async function fetchAdminCustomers() {
    try {
      startLoading("adminCustomers");
      const data = await apiRequest("/api/admin/customers");
      setAdminCustomers(data);
    } catch (requestError) {
      handleRequestError("Unable to load customer registry", requestError);
    } finally {
      stopLoading();
    }
  }

  async function handleKycUpdate(userId, kycStatus) {
    try {
      startLoading("kycUpdate");
      const updated = await apiRequest(`/api/admin/customers/${userId}/kyc`, {
        method: "PATCH",
        body: JSON.stringify({ kycStatus })
      });
      setAdminCustomers((current) =>
        current.map((customer) => (customer.userId === updated.userId ? updated : customer))
      );
      await fetchAdminOverview();
      showNotification("success", "KYC updated", `Customer ${updated.username} marked as ${updated.kycStatus}.`);
    } catch (requestError) {
      handleRequestError("KYC update failed", requestError);
    } finally {
      stopLoading();
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
      const action = path === "/api/auth/register" ? "register" : "login";
      clearFormErrors(action);
      startLoading(action);
      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const isRegister = path === "/api/auth/register";
      setToken(data.token);
      localStorage.setItem("bank_token", data.token);
      const profile = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        email: isRegister ? payload.email : null,
        fullName: isRegister ? payload.fullName : null,
        phoneNumber: isRegister ? payload.phoneNumber : null,
        gender: isRegister ? payload.gender : null,
        occupation: isRegister ? payload.occupation : null,
        addressLine1: isRegister ? payload.addressLine1 : null,
        addressLine2: isRegister ? payload.addressLine2 : null,
        city: isRegister ? payload.city : null,
        state: isRegister ? payload.state : null,
        postalCode: isRegister ? payload.postalCode : null,
        country: isRegister ? payload.country : null,
        dateOfBirth: isRegister ? payload.dateOfBirth : null,
        kycStatus: isRegister ? "PENDING" : null
      };
      setUser(profile);
      localStorage.setItem("bank_user", JSON.stringify(profile));
      setRegisterForm(initialRegisterForm);
      setLoginForm(initialLoginForm);
      showNotification(
        "success",
        isRegister ? "Customer onboarded" : "Signed in",
        data.message,
        isRegister ? ["KYC status is pending review."] : []
      );
    } catch (requestError) {
      handleRequestError(
        path === "/api/auth/register" ? "Registration failed" : "Login failed",
        requestError,
        path === "/api/auth/register" ? "register" : "login"
      );
    } finally {
      stopLoading();
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    try {
      clearFormErrors("account");
      startLoading("account");
      const created = await apiRequest("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          ...accountForm,
          openingBalance: Number(accountForm.openingBalance)
        })
      });
      setAccounts((previous) => [...previous, created]);
      setAccountForm(initialAccountForm);
      setSelectedAccount(created.accountNumber);
      showNotification(
        "success",
        "Account created",
        `Account ${created.accountNumber} created successfully.`
      );
    } catch (requestError) {
      handleRequestError("Account creation failed", requestError, "account");
    } finally {
      stopLoading();
    }
  }

  async function handleBalanceAction(type) {
    if (!selectedAccount) {
      showNotification("error", "No account selected", "Select an account first.");
      return;
    }

    try {
      clearFormErrors("balance");
      startLoading("balance");
      const updated = await apiRequest(`/api/accounts/${selectedAccount}/${type}`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) })
      });
      setAccounts((previous) =>
        previous.map((account) =>
          account.accountNumber === updated.accountNumber ? updated : account
        )
      );
      showNotification(
        "success",
        type === "deposit" ? "Deposit completed" : "Withdrawal completed",
        `${type === "deposit" ? "Deposit" : "Withdrawal"} posted for ${updated.accountNumber}.`
      );
      await fetchTransactions(selectedAccount);
    } catch (requestError) {
      handleRequestError(
        type === "deposit" ? "Deposit failed" : "Withdrawal failed",
        requestError,
        "balance"
      );
    } finally {
      stopLoading();
    }
  }

  async function handleTransfer(event) {
    event.preventDefault();
    try {
      clearFormErrors("transfer");
      startLoading("transfer");
      await apiRequest("/api/accounts/transfer", {
        method: "POST",
        body: JSON.stringify({
          ...transferForm,
          amount: Number(transferForm.amount)
        })
      });
      setTransferForm(initialTransferForm);
      showNotification("success", "Transfer completed", "Funds were transferred successfully.");
      await fetchAccounts();
      if (selectedAccount) {
        await fetchTransactions(selectedAccount);
      }
    } catch (requestError) {
      handleRequestError("Transfer failed", requestError, "transfer");
    } finally {
      stopLoading();
    }
  }

  async function handleCreateBeneficiary(event) {
    event.preventDefault();
    try {
      clearFormErrors("beneficiary");
      startLoading("beneficiary");
      const created = await apiRequest("/api/beneficiaries", {
        method: "POST",
        body: JSON.stringify(beneficiaryForm)
      });
      setBeneficiaries((previous) => [created, ...previous]);
      setBeneficiaryForm(initialBeneficiaryForm);
      setTransferForm((current) => ({ ...current, toAccountNumber: created.accountNumber }));
      showNotification(
        "success",
        "Beneficiary saved",
        `Beneficiary ${created.nickname} added successfully.`
      );
    } catch (requestError) {
      handleRequestError("Beneficiary creation failed", requestError, "beneficiary");
    } finally {
      stopLoading();
    }
  }

  function logout(silent = false) {
    localStorage.removeItem("bank_token");
    localStorage.removeItem("bank_user");
    setToken("");
    setUser(null);
    setAccounts([]);
    setBeneficiaries([]);
    setTransactions([]);
    setSelectedAccount("");
    if (!silent) {
      showNotification("info", "Signed out", "You have been logged out.");
    }
  }

  function renderAdminDashboard() {
    return (
      <>
        <section className="summary-grid">
          <div className="panel">
            <span className="panel-label">Central admin</span>
            <h2>{user?.fullName || user?.username}</h2>
            <p>{user?.email}</p>
            <button className="secondary" type="button" onClick={logout}>
              Logout
            </button>
          </div>
          <div className="panel">
            <span className="panel-label">Customers</span>
            <h2>{adminOverview?.totalCustomers ?? 0}</h2>
            <p>Registered retail customers under review and service.</p>
          </div>
          <div className="panel">
            <span className="panel-label">Pending KYC</span>
            <h2>{adminOverview?.pendingKyc ?? 0}</h2>
            <p>Customers waiting for central verification.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Banking system overview</h2>
            <button className="secondary" type="button" onClick={fetchAdminOverview} disabled={loading}>
              {renderButtonLabel("Refresh", "Refreshing...", "adminOverview")}
            </button>
          </div>
          {activeAction === "adminOverview" ? (
            <p className="loading-note">
              <span className="inline-spinner" aria-hidden="true" />
              Loading management overview...
            </p>
          ) : null}
          <div className="profile-grid">
            <article className="profile-card">
              <span>Verified KYC</span>
              <strong>{adminOverview?.verifiedKyc ?? 0}</strong>
              <p>Customers fully cleared for onboarding checks.</p>
            </article>
            <article className="profile-card">
              <span>Rejected KYC</span>
              <strong>{adminOverview?.rejectedKyc ?? 0}</strong>
              <p>Profiles blocked pending remediation.</p>
            </article>
            <article className="profile-card">
              <span>Total accounts</span>
              <strong>{adminOverview?.totalAccounts ?? 0}</strong>
              <p>Bank accounts under platform management.</p>
            </article>
            <article className="profile-card">
              <span>Active beneficiaries</span>
              <strong>{adminOverview?.activeBeneficiaries ?? 0}</strong>
              <p>Approved transfer destinations across customers.</p>
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Customer KYC control</h2>
            <button className="secondary" type="button" onClick={fetchAdminCustomers} disabled={loading}>
              {renderButtonLabel("Refresh registry", "Refreshing...", "adminCustomers")}
            </button>
          </div>
          {activeAction === "adminCustomers" || activeAction === "kycUpdate" ? (
            <p className="loading-note">
              <span className="inline-spinner" aria-hidden="true" />
              {activeAction === "kycUpdate" ? "Updating KYC status..." : "Loading customer registry..."}
            </p>
          ) : null}
          <div className="transaction-list">
            {adminCustomers.map((customer) => (
              <article key={customer.userId} className="admin-customer-card">
                <div className="admin-customer-header">
                  <div>
                    <span>{customer.username}</span>
                    <strong>{customer.fullName}</strong>
                    <p>{customer.email}</p>
                  </div>
                  <span className={`kyc-pill ${String(customer.kycStatus || "").toLowerCase()}`}>
                    {customer.kycStatus}
                  </span>
                </div>
                <p>{customer.phoneNumber || "No phone number"}</p>
                <p>{customer.occupation || "No occupation"} | {customer.gender || "N/A"}</p>
                <p>{formatAddress(customer) || "No address captured"}</p>
                <p>Date of birth: {customer.dateOfBirth || "N/A"}</p>
                <div className="button-row">
                  <button type="button" onClick={() => handleKycUpdate(customer.userId, "VERIFIED")} disabled={loading}>
                    Verify
                  </button>
                  <button type="button" className="secondary" onClick={() => handleKycUpdate(customer.userId, "PENDING")} disabled={loading}>
                    Mark pending
                  </button>
                  <button type="button" className="danger" onClick={() => handleKycUpdate(customer.userId, "REJECTED")} disabled={loading}>
                    Reject
                  </button>
                </div>
              </article>
            ))}
            {adminCustomers.length === 0 ? (
              <p className="muted">No customer profiles are available yet.</p>
            ) : null}
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="notification-stack" aria-live="polite">
        {notifications.map((notification) => (
          <article key={notification.id} className={`notification-card ${notification.type}`}>
            <div className="notification-header">
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              <button
                type="button"
                className="notification-close"
                onClick={() => dismissNotification(notification.id)}
              >
                Close
              </button>
            </div>
            {notification.details?.length ? (
              <ul className="notification-list">
                {notification.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
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
            <strong>{loading ? "Working..." : token ? "Authenticated" : "Awaiting sign in"}</strong>
            <p>{loading ? actionDescriptions[activeAction] : token ? "Authenticated session ready" : "Authenticate to begin"}</p>
            <p>API: {API_BASE_URL}</p>
          </div>
        </section>

        {!token ? (
          <section className="auth-grid">
            <form className="panel" onSubmit={handleRegister}>
              <h2>Customer onboarding</h2>
              <p className="muted">
                Capture the core KYC profile now. New registrations start in pending review.
              </p>
              {renderFormAlert("register")}
              <label>
                Full name
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "fullName", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "fullName")}
              </label>
              <label>
                Username
                <input
                  value={registerForm.username}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "username", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "username")}
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "email", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "email")}
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "password", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "password")}
              </label>
              <label>
                Phone number
                <input
                  value={registerForm.phoneNumber}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "phoneNumber", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "phoneNumber")}
              </label>
              <label>
                Gender
                <select
                  value={registerForm.gender}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "gender", event.target.value)
                  }
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {renderFieldError("register", "gender")}
              </label>
              <label>
                Occupation
                <input
                  value={registerForm.occupation}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "occupation", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "occupation")}
              </label>
              <label>
                Address line 1
                <input
                  value={registerForm.addressLine1}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "addressLine1", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "addressLine1")}
              </label>
              <label>
                Address line 2
                <input
                  value={registerForm.addressLine2}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "addressLine2", event.target.value)
                  }
                />
                {renderFieldError("register", "addressLine2")}
              </label>
              <label>
                City
                <input
                  value={registerForm.city}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "city", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "city")}
              </label>
              <label>
                State
                <input
                  value={registerForm.state}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "state", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "state")}
              </label>
              <label>
                Postal code
                <input
                  value={registerForm.postalCode}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "postalCode", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "postalCode")}
              </label>
              <label>
                Country
                <input
                  value={registerForm.country}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "country", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "country")}
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={registerForm.dateOfBirth}
                  onChange={(event) =>
                    updateField(setRegisterForm, "register", "dateOfBirth", event.target.value)
                  }
                  required
                />
                {renderFieldError("register", "dateOfBirth")}
              </label>
              <button type="submit" disabled={loading}>
                {renderButtonLabel("Register", "Registering...", "register")}
              </button>
            </form>

            <form className="panel" onSubmit={handleLogin}>
              <h2>Customer and admin sign in</h2>
              <p className="muted">
                Central management uses the same secure login endpoint and routes by role after authentication.
              </p>
              {renderFormAlert("login")}
              <label>
                Username
                <input
                  value={loginForm.username}
                  onChange={(event) =>
                    updateField(setLoginForm, "login", "username", event.target.value)
                  }
                  required
                />
                {renderFieldError("login", "username")}
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    updateField(setLoginForm, "login", "password", event.target.value)
                  }
                  required
                />
                {renderFieldError("login", "password")}
              </label>
              <button type="submit" disabled={loading}>
                {renderButtonLabel("Login", "Signing in...", "login")}
              </button>
            </form>
          </section>
        ) : user?.role === "ADMIN" ? (
          renderAdminDashboard()
        ) : (
          <>
            <section className="summary-grid">
              <div className="panel">
                <span className="panel-label">Current user</span>
                <h2>{user?.fullName || user?.username}</h2>
                <p>{user?.role} | KYC: {user?.kycStatus || "Loading"}</p>
                <p>{user?.occupation || user?.email || ""}</p>
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
                  {renderButtonLabel("Open account", "Opening account...", "account")}
                </button>
                <p className="muted">Account number will be generated automatically when the account is created.</p>
              </form>

              <div className="panel">
                <div className="panel-header">
                  <h2>Your accounts</h2>
                  <button className="secondary" type="button" onClick={fetchAccounts} disabled={loading}>
                    {renderButtonLabel("Refresh", "Refreshing...", "accounts")}
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
                  {renderFieldError("balance", "amount")}
                </label>
                <div className="button-row">
                  <button type="button" onClick={() => handleBalanceAction("deposit")} disabled={loading}>
                    {renderButtonLabel("Deposit", "Posting...", "balance")}
                  </button>
                  <button type="button" className="secondary" onClick={() => handleBalanceAction("withdraw")} disabled={loading}>
                    {renderButtonLabel("Withdraw", "Posting...", "balance")}
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
                  {renderButtonLabel("Transfer", "Transferring...", "transfer")}
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
                  {renderButtonLabel("Save beneficiary", "Saving beneficiary...", "beneficiary")}
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h2>Transactions {selectedAccount ? `for ${selectedAccount}` : ""}</h2>
                {selectedAccount ? (
                  <button className="secondary" type="button" onClick={() => fetchTransactions(selectedAccount)} disabled={loading}>
                    {renderButtonLabel("Refresh history", "Refreshing...", "transactions")}
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
                <button className="secondary" type="button" onClick={fetchBeneficiaries} disabled={loading}>
                  {renderButtonLabel("Refresh", "Refreshing...", "beneficiaries")}
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
        )}
      </main>
    </div>
  );
}

export default App;
