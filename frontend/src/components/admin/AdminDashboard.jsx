import { useEffect, useState } from "react";
import { apiRequest } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { collectFieldErrors, formatAddress } from "../../utils/formatters";

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

export function AdminDashboard({ notify }) {
  const { token, user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);

  const loading = pendingActions.length > 0;
  const activeAction = pendingActions[0] || "";

  useEffect(() => {
    loadOverview();
    loadCustomers();
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

  function handleApiError(title, error) {
    if (error.status === 401) {
      logout();
      notify("error", "Session expired", error.message || "Please sign in again.");
      return;
    }

    notify("error", title, error.message || "Request failed", collectFieldErrors(error.fields));
  }

  async function loadOverview() {
    startAction("adminOverview");
    try {
      const data = await apiRequest("/admin/overview", { token });
      setOverview(data);
    } catch (error) {
      handleApiError("Unable to load admin overview", error);
    } finally {
      finishAction("adminOverview");
    }
  }

  async function loadCustomers() {
    startAction("adminCustomers");
    try {
      const data = await apiRequest("/admin/customers", { token });
      setCustomers(data);
    } catch (error) {
      handleApiError("Unable to load customer registry", error);
    } finally {
      finishAction("adminCustomers");
    }
  }

  async function updateKyc(userId, kycStatus) {
    startAction("kycUpdate");
    try {
      const updated = await apiRequest(`/admin/customers/${userId}/kyc`, {
        method: "PATCH",
        token,
        body: { kycStatus }
      });
      setCustomers((current) =>
        current.map((customer) => (customer.userId === updated.userId ? updated : customer))
      );
      await loadOverview();
      notify("success", "KYC updated", `Customer ${updated.username} marked as ${updated.kycStatus}.`);
    } catch (error) {
      handleApiError("KYC update failed", error);
    } finally {
      finishAction("kycUpdate");
    }
  }

  return (
    <>
      <section className="summary-grid">
        <div className="panel">
          <span className="panel-label">Central admin</span>
          <h2>{user?.fullName || user?.username}</h2>
          <p>{user?.email}</p>
          <button className="secondary" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="panel">
          <span className="panel-label">Customers</span>
          <h2>{overview?.totalCustomers ?? 0}</h2>
          <p>Registered retail customers under review and service.</p>
        </div>
        <div className="panel">
          <span className="panel-label">Pending KYC</span>
          <h2>{overview?.pendingKyc ?? 0}</h2>
          <p>Customers waiting for central verification.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Banking system overview</h2>
          <button className="secondary" type="button" onClick={loadOverview} disabled={loading}>
            <ButtonLabel
              active={activeAction === "adminOverview"}
              idleLabel="Refresh"
              loadingLabel="Refreshing..."
            />
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
            <strong>{overview?.verifiedKyc ?? 0}</strong>
            <p>Customers fully cleared for onboarding checks.</p>
          </article>
          <article className="profile-card">
            <span>Rejected KYC</span>
            <strong>{overview?.rejectedKyc ?? 0}</strong>
            <p>Profiles blocked pending remediation.</p>
          </article>
          <article className="profile-card">
            <span>Total accounts</span>
            <strong>{overview?.totalAccounts ?? 0}</strong>
            <p>Bank accounts under platform management.</p>
          </article>
          <article className="profile-card">
            <span>Active beneficiaries</span>
            <strong>{overview?.activeBeneficiaries ?? 0}</strong>
            <p>Approved transfer destinations across customers.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Customer KYC control</h2>
          <button className="secondary" type="button" onClick={loadCustomers} disabled={loading}>
            <ButtonLabel
              active={activeAction === "adminCustomers"}
              idleLabel="Refresh registry"
              loadingLabel="Refreshing..."
            />
          </button>
        </div>
        {activeAction === "adminCustomers" || activeAction === "kycUpdate" ? (
          <p className="loading-note">
            <span className="inline-spinner" aria-hidden="true" />
            {activeAction === "kycUpdate" ? "Updating KYC status..." : "Loading customer registry..."}
          </p>
        ) : null}
        <div className="transaction-list">
          {customers.map((customer) => (
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
                <button type="button" onClick={() => updateKyc(customer.userId, "VERIFIED")} disabled={loading}>
                  Verify
                </button>
                <button type="button" className="secondary" onClick={() => updateKyc(customer.userId, "PENDING")} disabled={loading}>
                  Mark pending
                </button>
                <button type="button" className="danger" onClick={() => updateKyc(customer.userId, "REJECTED")} disabled={loading}>
                  Reject
                </button>
              </div>
            </article>
          ))}
          {customers.length === 0 ? <p className="muted">No customer profiles are available yet.</p> : null}
        </div>
      </section>
    </>
  );
}
