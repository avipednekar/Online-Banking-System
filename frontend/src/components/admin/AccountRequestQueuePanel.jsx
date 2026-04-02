import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

function getActionLabel(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "APPROVED") {
    return "Approved";
  }
  if (normalized === "REJECTED") {
    return "Rejected";
  }
  return "Approve account";
}

export const AccountRequestQueuePanel = memo(function AccountRequestQueuePanel({
  requests,
  isLoading,
  error,
  isMutating,
  onRefresh,
  onApprove
}) {
  return (
    <Panel className="vault-admin-panel vault-admin-approvals-panel">
      <SectionHeader
        title="Pending Approvals"
        subtitle="Customer account requests awaiting explicit administrative approval."
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh queue"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading || isMutating}
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

      {!isLoading && !error && requests.length > 0 ? (
        <div className="vault-admin-request-grid">
          {requests.map((request) => {
            const isPending = String(request.status || "").toUpperCase() === "PENDING";

            return (
              <article key={request.id} className="vault-admin-request-card">
                <div className="vault-admin-request-card-head">
                  <div>
                    <span>{request.requesterUsername}</span>
                    <strong>{request.requesterFullName}</strong>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="vault-admin-request-card-body">
                  <p>
                    {request.accountType} account for {formatCurrency(request.openingBalance)}
                  </p>
                  <p>Submitted {formatDate(request.createdAt)}</p>
                  <p>KYC status: {request.kycStatus}</p>
                </div>

                <div className="vault-admin-request-card-actions">
                  <button
                    type="button"
                    className="vault-admin-primary-button"
                    onClick={() => onApprove(request.id)}
                    disabled={!isPending || isMutating}
                  >
                    {getActionLabel(request.status)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </Panel>
  );
});
