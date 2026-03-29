import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

export const AccountRequestQueuePanel = memo(function AccountRequestQueuePanel({
  requests,
  isLoading,
  error,
  onRefresh,
  onApprove
}) {
  return (
    <Panel>
      <SectionHeader
        title="Pending account requests"
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh queue"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading}
          />
        }
      />
      {isLoading ? (
        <LoadingState compact title="Loading requests" message="Fetching account requests awaiting approval." />
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
          title="No pending requests"
          message="New verified customer account requests will appear here for approval."
        />
      ) : null}
      <div className="transaction-list">
        {requests.map((request) => (
          <article key={request.id} className="admin-customer-card">
            <div className="admin-customer-header">
              <div>
                <span>{request.requesterUsername}</span>
                <strong>{request.requesterFullName}</strong>
                <p>
                  {request.accountType} | {formatCurrency(request.openingBalance)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p>KYC status: {request.kycStatus}</p>
            <p>Submitted: {formatDate(request.createdAt)}</p>
            <div className="button-row">
              <button type="button" onClick={() => onApprove(request.id)} disabled={isLoading}>
                Approve and open
              </button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
});
