import { memo } from "react";
import {
  CheckCheck,
  CircleAlert,
  Users,
  WalletCards
} from "lucide-react";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

function getVerificationRate(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const verifiedKyc = Number(overview?.verifiedKyc || 0);

  if (!totalCustomers) {
    return "0.0%";
  }

  return `${((verifiedKyc / totalCustomers) * 100).toFixed(1)}%`;
}

function SummaryCard({ icon: Icon, label, value, detail, tone = "default", trend }) {
  return (
    <article className={`vault-admin-kpi-card tone-${tone}`}>
      <div className="vault-admin-kpi-top">
        <div className="vault-admin-kpi-icon">
          <Icon size={18} />
        </div>
        {trend ? <span className="vault-admin-kpi-trend">{trend}</span> : null}
      </div>
      <p className="vault-admin-kpi-label">{label}</p>
      <h3 className="vault-admin-kpi-value">{value}</h3>
      <p className="vault-admin-kpi-detail">{detail}</p>
    </article>
  );
}

export const AdminOverviewPanel = memo(function AdminOverviewPanel({
  overview,
  isLoading,
  error,
  onRefresh
}) {
  return (
    <Panel className="vault-admin-panel vault-admin-overview-panel">
      <SectionHeader
        title="Institution overview"
        subtitle="Real-time visibility into operational load, KYC posture, and onboarding approvals."
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh metrics"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading}
          />
        }
      />

      {isLoading ? (
        <LoadingState compact title="Loading overview" message="Fetching banking KPIs." />
      ) : null}

      {error ? (
        <SectionErrorState
          message={error}
          action={
            <button type="button" className="secondary" onClick={onRefresh}>
              Retry
            </button>
          }
        />
      ) : null}

      {!isLoading && !error ? (
        <div className="vault-admin-kpi-grid">
          <SummaryCard
            icon={WalletCards}
            label="Total Accounts"
            value={Number(overview?.totalAccounts || 0).toLocaleString()}
            detail="Bank accounts under platform management."
            trend={`${Number(overview?.pendingAccountRequests || 0)} pending approvals`}
          />
          <SummaryCard
            icon={Users}
            label="Registered Customers"
            value={Number(overview?.totalCustomers || 0).toLocaleString()}
            detail="Customers currently enrolled in the platform."
            tone="primary"
            trend={`${Number(overview?.activeBeneficiaries || 0)} active beneficiaries`}
          />
          <SummaryCard
            icon={CircleAlert}
            label="Pending KYC"
            value={Number(overview?.pendingKyc || 0).toLocaleString()}
            detail="Profiles waiting for institutional verification."
            tone="danger"
            trend="Priority review"
          />
          <SummaryCard
            icon={CheckCheck}
            label="Verified KYC"
            value={Number(overview?.verifiedKyc || 0).toLocaleString()}
            detail="Cleared customers eligible for onboarding."
            tone="success"
            trend={`${getVerificationRate(overview)} verification rate`}
          />
        </div>
      ) : null}
    </Panel>
  );
});
