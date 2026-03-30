import {
  Activity,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Filter,
  Gauge,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  WalletCards
} from "lucide-react";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";
import { formatAddress, formatCurrency, formatDate } from "../utils/formatters";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, active: true },
  { id: "customers", label: "Customers", icon: Users },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "approvals", label: "Approvals", icon: ShieldCheck },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "integrity", label: "System Integrity", icon: Gauge }
];

function formatHeaderDate(value) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getInitials(value) {
  return String(value || "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getStatusTone(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "VERIFIED" || normalized === "APPROVED") {
    return "verified";
  }

  if (normalized === "REJECTED") {
    return "rejected";
  }

  return "pending";
}

function getRiskExposure(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const rejectedKyc = Number(overview?.rejectedKyc || 0);
  const pendingKyc = Number(overview?.pendingKyc || 0);

  if (!totalCustomers) {
    return "Nominal";
  }

  const exposure = (rejectedKyc + pendingKyc) / totalCustomers;

  if (exposure > 0.2) {
    return "Elevated";
  }

  if (exposure > 0.08) {
    return "Guarded";
  }

  return "Low";
}

function getQueueDepth(count) {
  if (count > 12) {
    return "Heavy";
  }

  if (count > 4) {
    return "Active";
  }

  return "Normal";
}

function getVerificationRate(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const verifiedKyc = Number(overview?.verifiedKyc || 0);

  if (!totalCustomers) {
    return "0.0%";
  }

  return `${((verifiedKyc / totalCustomers) * 100).toFixed(1)}%`;
}

function SummaryCard({ icon: Icon, label, value, detail, tone = "default", progress = 0, trend }) {
  return (
    <article className={`vault-admin-kpi-card tone-${tone}`}>
      <div className="vault-admin-kpi-top">
        <div className="vault-admin-kpi-icon">
          <Icon size={18} />
        </div>
        <span className="vault-admin-kpi-trend">{trend}</span>
      </div>
      <p className="vault-admin-kpi-label">{label}</p>
      <h3 className="vault-admin-kpi-value">{value}</h3>
      <p className="vault-admin-kpi-detail">{detail}</p>
      <div className="vault-admin-kpi-progress">
        <span style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

function StatusPill({ status, children }) {
  const tone = getStatusTone(status);

  return <span className={`vault-admin-status is-${tone}`}>{children || status}</span>;
}

export default function AdminPage() {
  const workspace = useAdminWorkspace();
  const todayLabel = formatHeaderDate(new Date());
  const busy =
    workspace.tracker.isPending("overview") ||
    workspace.tracker.isPending("customers") ||
    workspace.tracker.isPending("accountRequests");
  const tableBusy = busy || workspace.tracker.isPending("kyc") || workspace.tracker.isPending("approveAccountRequest");
  const requestsByCustomerId = new Map(
    workspace.accountRequests.map((request) => [request.requesterId, request])
  );

  async function refreshWorkspace() {
    await Promise.all([
      workspace.loadOverview(),
      workspace.loadCustomers(),
      workspace.loadAccountRequests()
    ]);
  }

  return (
    <section className="vault-admin-dashboard">
      <aside className="vault-admin-sidebar">
        <div className="vault-admin-sidebar-head">
          <div>
            <h1>Admin Portal</h1>
            <p>Institutional Access</p>
          </div>
          <button
            type="button"
            className="vault-admin-primary-button"
            onClick={refreshWorkspace}
            disabled={busy}
          >
            <RefreshCw size={15} className={busy ? "spin" : ""} />
            {busy ? "Refreshing" : "Refresh Console"}
          </button>
        </div>

        <nav className="vault-admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={item.active ? "vault-admin-nav-item is-active" : "vault-admin-nav-item"}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="vault-admin-sidebar-footer">
          <a href="#integrity" className="vault-admin-nav-item">
            <CircleAlert size={17} />
            <span>Support</span>
          </a>
          <button
            type="button"
            className="vault-admin-nav-item is-signout"
            onClick={workspace.logoutUser}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
          <div className="vault-admin-profile-card">
            <div className="vault-admin-profile-avatar">
              {getInitials(workspace.user?.fullName || workspace.user?.username)}
            </div>
            <div>
              <strong>{workspace.user?.fullName || workspace.user?.username || "Admin Administrator"}</strong>
              <span>Global Oversight</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="vault-admin-main">
        <header id="overview" className="vault-admin-header">
          <div>
            <div className="vault-admin-breadcrumb">
              <span>Console</span>
              <ChevronRight size={12} />
              <span className="is-active">Workspace Overview</span>
            </div>
            <h2>Operational Ledger</h2>
            <p>Real-time surveillance of institutional account movements, KYC controls, and account approvals.</p>
          </div>

          <div className="vault-admin-header-actions">
            <div className="vault-admin-date-chip">
              <CalendarDays size={16} />
              <span>{todayLabel} - Today</span>
            </div>
            <button
              type="button"
              className="vault-admin-icon-button"
              aria-label="Refresh overview"
              onClick={refreshWorkspace}
              disabled={busy}
            >
              <RefreshCw size={16} className={busy ? "spin" : ""} />
            </button>
            <button
              type="button"
              className="vault-admin-icon-button"
              aria-label="Filter queue"
              onClick={workspace.loadAccountRequests}
              disabled={workspace.tracker.isPending("accountRequests")}
            >
              <Filter size={16} />
            </button>
          </div>
        </header>

        <section className="vault-admin-kpi-grid">
          <SummaryCard
            icon={WalletCards}
            label="Total Accounts"
            value={Number(workspace.overview?.totalAccounts || 0).toLocaleString()}
            detail="Bank accounts under platform management."
            trend={`${Number(workspace.overview?.pendingAccountRequests || 0)} pending approvals`}
            progress={Math.min(100, Number(workspace.overview?.totalAccounts || 0))}
          />
          <SummaryCard
            icon={Users}
            label="Active Beneficiaries"
            value={Number(workspace.overview?.activeBeneficiaries || 0).toLocaleString()}
            detail="Approved internal transfer destinations."
            trend={`${Number(workspace.overview?.totalCustomers || 0)} registered customers`}
            tone="primary"
            progress={Math.min(100, Number(workspace.overview?.activeBeneficiaries || 0))}
          />
          <SummaryCard
            icon={CircleAlert}
            label="Pending KYC"
            value={Number(workspace.overview?.pendingKyc || 0).toLocaleString()}
            detail="Profiles waiting for institutional verification."
            trend="Priority review"
            tone="danger"
            progress={Math.min(100, Number(workspace.overview?.pendingKyc || 0) * 8)}
          />
          <SummaryCard
            icon={CheckCheck}
            label="Verified KYC"
            value={Number(workspace.overview?.verifiedKyc || 0).toLocaleString()}
            detail="Cleared customers eligible for account onboarding."
            trend={`${getVerificationRate(workspace.overview)} verification rate`}
            tone="success"
            progress={
              Number(workspace.overview?.totalCustomers || 0)
                ? (Number(workspace.overview?.verifiedKyc || 0) /
                    Number(workspace.overview?.totalCustomers || 0)) *
                  100
                : 0
            }
          />
        </section>

        <section id="customers" className="vault-admin-registry">
          <div className="vault-admin-section-head">
            <div>
              <h3>Customer Registry</h3>
              <p>Manage institution-wide identity verification and pending account approvals.</p>
            </div>

            <div className="vault-admin-registry-actions">
              <label className="vault-admin-search">
                <Search size={16} />
                <input
                  type="text"
                  value={workspace.searchTerm}
                  onChange={(event) => workspace.setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, phone, or KYC status"
                />
              </label>
              <button
                type="button"
                className="vault-admin-secondary-button"
                onClick={workspace.loadCustomers}
                disabled={tableBusy}
              >
                <RefreshCw size={15} className={workspace.tracker.isPending("customers") ? "spin" : ""} />
                Refresh Registry
              </button>
            </div>
          </div>

          {workspace.customersError ? (
            <div className="vault-admin-inline-state is-error">
              <span>{workspace.customersError}</span>
              <button type="button" onClick={workspace.loadCustomers}>
                Retry
              </button>
            </div>
          ) : null}

          <div className="vault-admin-table-wrap">
            <table className="vault-admin-table">
              <thead>
                <tr>
                  <th>User Information</th>
                  <th>Contact &amp; DOB</th>
                  <th>Physical Address</th>
                  <th id="compliance">KYC Status</th>
                  <th className="is-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableBusy && workspace.filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="vault-admin-empty-row">Loading customer registry.</div>
                    </td>
                  </tr>
                ) : null}

                {!tableBusy && !workspace.customersError && workspace.filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="vault-admin-empty-row">
                        No customer profiles matched the current search.
                      </div>
                    </td>
                  </tr>
                ) : null}

                {workspace.filteredCustomers.map((customer) => {
                  const relatedRequest = requestsByCustomerId.get(customer.userId);

                  return (
                    <tr key={customer.userId}>
                      <td>
                        <div className="vault-admin-user-cell">
                          <div className="vault-admin-avatar">
                            {getInitials(customer.fullName || customer.username)}
                          </div>
                          <div>
                            <strong>{customer.fullName}</strong>
                            <span>{customer.email}</span>
                            <small>@{customer.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{customer.phoneNumber || "No phone number"}</strong>
                        <span>{formatDate(customer.dateOfBirth)}</span>
                      </td>
                      <td>
                        <span>{formatAddress(customer) || "No address captured"}</span>
                      </td>
                      <td>
                        <div className="vault-admin-status-stack">
                          <StatusPill status={customer.kycStatus}>{customer.kycStatus}</StatusPill>
                          {relatedRequest ? (
                            <span className="vault-admin-meta-note">
                              Request: {relatedRequest.accountType} for{" "}
                              {formatCurrency(relatedRequest.openingBalance)}
                            </span>
                          ) : (
                            <span className="vault-admin-meta-note">No pending account request</span>
                          )}
                        </div>
                      </td>
                      <td className="is-right">
                        <div className="vault-admin-row-actions">
                          <div className="vault-admin-action-row">
                            <button
                              type="button"
                              className="vault-admin-action is-approve"
                              onClick={() => workspace.updateKyc(customer.userId, "VERIFIED")}
                              disabled={tableBusy}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="vault-admin-action is-neutral"
                              onClick={() => workspace.updateKyc(customer.userId, "PENDING")}
                              disabled={tableBusy}
                            >
                              Pending
                            </button>
                            <button
                              type="button"
                              className="vault-admin-action is-reject"
                              onClick={() => workspace.updateKyc(customer.userId, "REJECTED")}
                              disabled={tableBusy}
                            >
                              Reject
                            </button>
                          </div>
                          {relatedRequest ? (
                            <div className="vault-admin-approval-row">
                              <span>
                                Account approval is held until admin release. Number generates on approval.
                              </span>
                              <button
                                type="button"
                                className="vault-admin-inline-button"
                                onClick={() => workspace.approveAccountRequest(relatedRequest.id)}
                                disabled={tableBusy}
                              >
                                Approve Account
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="vault-admin-table-footer">
            <p>
              Showing {workspace.filteredCustomers.length} of{" "}
              {Number(workspace.overview?.totalCustomers || workspace.filteredCustomers.length)} registered customers
            </p>
            <div>
              <span>Pending approvals: {Number(workspace.overview?.pendingAccountRequests || 0)}</span>
              <span>Rejected KYC: {Number(workspace.overview?.rejectedKyc || 0)}</span>
            </div>
          </div>
        </section>

        <section className="vault-admin-insight-grid">
          <article id="analytics" className="vault-admin-health-card">
            <div className="vault-admin-insight-copy">
              <h3>Institutional Health Score</h3>
              <p>
                Compliance posture remains stable with a verified KYC rate of{" "}
                {getVerificationRate(workspace.overview)} and a controlled approval queue.
              </p>
            </div>
            <div className="vault-admin-health-stats">
              <div>
                <span>Risk Exposure</span>
                <strong>{getRiskExposure(workspace.overview)}</strong>
              </div>
              <div>
                <span>Sanction Hits</span>
                <strong>{Number(workspace.overview?.rejectedKyc || 0)}</strong>
              </div>
              <div>
                <span>Queue Depth</span>
                <strong>{getQueueDepth(Number(workspace.overview?.pendingAccountRequests || 0))}</strong>
              </div>
            </div>
          </article>

          <article id="approvals" className="vault-admin-system-card">
            <div>
              <span className="vault-admin-system-icon">
                <ShieldCheck size={26} />
              </span>
              <h3 id="integrity">System Integrity</h3>
              <p>
                Verification engines are operational. Pending account requests stay inactive until explicit admin
                approval.
              </p>
            </div>

            {workspace.requestsError ? (
              <div className="vault-admin-inline-state is-error compact">
                <span>{workspace.requestsError}</span>
                <button type="button" onClick={workspace.loadAccountRequests}>
                  Retry
                </button>
              </div>
            ) : null}

            <div className="vault-admin-request-list">
              {workspace.accountRequests.length === 0 && !workspace.requestsError ? (
                <div className="vault-admin-request-empty">No pending account requests.</div>
              ) : null}

              {workspace.accountRequests.slice(0, 3).map((request) => (
                <article key={request.id} className="vault-admin-request-item">
                  <div>
                    <strong>{request.requesterFullName}</strong>
                    <span>
                      {request.accountType} • {formatCurrency(request.openingBalance)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="vault-admin-inline-button"
                    onClick={() => workspace.approveAccountRequest(request.id)}
                    disabled={tableBusy}
                  >
                    Approve
                  </button>
                </article>
              ))}
            </div>
          </article>
        </section>
      </main>
    </section>
  );
}
