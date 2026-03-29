import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

export const AccountRequestsPanel = memo(function AccountRequestsPanel({
  requests,
  isLoading,
  error,
  onRefresh
}) {
  return (
    <Panel>
      <SectionHeader
        title="Account opening requests"
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
        <LoadingState compact title="Loading requests" message="Fetching submitted account requests." />
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
      {!isLoading && !error && requests.length === 0 ? (
        <EmptyState
          title="No account requests yet"
          message="Verified customers can submit new savings or current account requests here."
        />
      ) : null}
      <div className="transaction-list">
        {requests.map((request) => (
          <article key={request.id} className="admin-customer-card">
            <div className="admin-customer-header">
              <div>
                <span>{request.accountType}</span>
                <strong>{formatCurrency(request.openingBalance)}</strong>
                <p>Submitted {formatDate(request.createdAt)}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p>KYC at submission: {request.kycStatus}</p>
            <p>Approved account: {request.approvedAccountNumber || "Pending admin approval"}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
});
