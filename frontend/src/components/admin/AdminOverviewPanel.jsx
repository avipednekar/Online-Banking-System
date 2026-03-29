import { memo } from "react";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

export const AdminOverviewPanel = memo(function AdminOverviewPanel({
  overview,
  isLoading,
  error,
  onRefresh
}) {
  return (
    <Panel>
      <SectionHeader
        title="Banking system overview"
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh"
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
          <span>Pending account requests</span>
          <strong>{overview?.pendingAccountRequests ?? 0}</strong>
          <p>Customer account requests awaiting admin approval.</p>
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
    </Panel>
  );
});
