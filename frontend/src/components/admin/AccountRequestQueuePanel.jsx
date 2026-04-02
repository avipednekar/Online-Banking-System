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

function RequesterCell({ request }) {
  return (
    <div className="vault-admin-cell-stack">
      <strong>{request.requesterFullName}</strong>
      <span>@{request.requesterUsername}</span>
    </div>
  );
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
    <Panel className="vault-admin-panel vault-admin-approvals-panel min-w-0 w-full rounded-[24px] p-4">
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
        <div className="vault-admin-table-shell w-full overflow-x-auto">
          <table className="vault-admin-data-table vault-admin-request-table w-full">
            <colgroup>
              <col className="vault-admin-col-requester" />
              <col className="vault-admin-col-request-details" />
              <col className="vault-admin-col-request-date" />
              <col className="vault-admin-col-request-status" />
              <col className="vault-admin-col-request-actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Requester</th>
                <th scope="col">Account Request</th>
                <th scope="col">Submitted</th>
                <th scope="col">KYC &amp; Status</th>
                <th scope="col" className="is-actions">
                  Approval
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const isPending = String(request.status || "").toUpperCase() === "PENDING";

                return (
                  <tr key={request.id}>
                    <td>
                      <RequesterCell request={request} />
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack">
                        <strong>{request.accountType} Account</strong>
                        <span>{formatCurrency(request.openingBalance)} opening balance</span>
                      </div>
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack">
                        <strong>{formatDate(request.createdAt)}</strong>
                        <span>Awaiting administrative release</span>
                      </div>
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack">
                        <StatusBadge status={request.status} />
                        <small>KYC status: {request.kycStatus}</small>
                      </div>
                    </td>
                    <td className="is-actions">
                      <div className="vault-admin-table-actions-cell">
                        <button
                          type="button"
                          className="vault-admin-primary-button"
                          onClick={() => onApprove(request.id)}
                          disabled={!isPending || isMutating}
                        >
                          {getActionLabel(request.status)}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Panel>
  );
});
