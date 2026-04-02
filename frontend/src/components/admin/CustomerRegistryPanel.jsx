import { memo } from "react";
import { formatAddress, formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { FormField } from "../forms/FormField";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

function getInitials(value) {
  return String(value || "Customer")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getRequestStatusTone(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "APPROVED") {
    return "approved";
  }

  if (normalized === "REJECTED") {
    return "rejected";
  }

  return "pending";
}

function RequestStatusBadge({ status }) {
  return (
    <span className={`kyc-pill ${getRequestStatusTone(status)}`}>
      {String(status || "PENDING").replace(/_/g, " ")}
    </span>
  );
}

function CustomerUserCell({ customer }) {
  return (
    <div className="vault-admin-user-cell">
      <div className="vault-admin-registry-avatar">
        {getInitials(customer.fullName || customer.username)}
      </div>
      <div className="vault-admin-registry-copy">
        <strong>{customer.fullName}</strong>
        <span>{customer.email}</span>
        <small>@{customer.username}</small>
      </div>
    </div>
  );
}

function KycActionState({ customer, actionable }) {
  const status = String(customer?.kycStatus || "").toUpperCase();
  const stateClass =
    status === "VERIFIED"
      ? "is-verified"
      : status === "REJECTED"
        ? "is-rejected"
        : "is-pending";

  const label =
    status === "VERIFIED"
      ? "Verification completed"
      : status === "REJECTED"
        ? "Verification rejected"
        : "Awaiting review";

  const description =
    status === "PENDING"
      ? actionable
        ? "Choose approve or reject to complete this review."
        : "Review this customer from the dedicated KYC queue."
      : "No further KYC action is available.";

  return (
    <div className={`vault-admin-action-state ${stateClass}`}>
      <strong>{label}</strong>
      <span>{description}</span>
    </div>
  );
}

export const CustomerRegistryPanel = memo(function CustomerRegistryPanel({
  title = "Customer Registry",
  subtitle = "Manage institution-wide identity verification and account onboarding actions.",
  emptyTitle = "No customer profiles found",
  emptyMessage = "Newly registered customers will appear here for KYC review.",
  searchPlaceholder = "Search by username, name, email, phone, or KYC status",
  actionColumnLabel = "Administrative Action",
  customers,
  searchTerm,
  isLoading,
  error,
  isMutating,
  showKycActions = true,
  showAccountActions = true,
  showRequestMeta = true,
  onSearchChange,
  onRefresh,
  onApproveKyc,
  onRejectKyc,
  onApproveAccount,
  getPendingRequestForCustomer,
  isKycPending
}) {
  return (
    <Panel className="vault-admin-panel vault-admin-registry-panel min-w-0 w-full rounded-[24px] p-4">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh registry"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading || isMutating}
          />
        }
      />

      <div className="vault-admin-registry-toolbar min-w-0">
        <FormField
          label="Search customers"
          name="search"
          value={searchTerm}
          onChange={(_, value) => onSearchChange(value)}
          placeholder={searchPlaceholder}
        />
      </div>

      {isLoading ? (
        <LoadingState compact title="Loading customers" message="Fetching customer registry." />
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

      {!isLoading && !error && customers.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
        />
      ) : null}

      {!isLoading && !error && customers.length > 0 ? (
        <div className="vault-admin-table-shell w-full overflow-x-auto">
          <table className="vault-admin-data-table vault-admin-customer-table w-full">
            <colgroup>
              <col className="vault-admin-col-user" />
              <col className="vault-admin-col-contact" />
              <col className="vault-admin-col-address" />
              <col className="vault-admin-col-status" />
              <col className="vault-admin-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">User Information</th>
                <th scope="col">Contact &amp; DOB</th>
                <th scope="col">Physical Address</th>
                <th scope="col">KYC Status</th>
                <th scope="col" className="is-actions">
                  {actionColumnLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const relatedRequest = getPendingRequestForCustomer(customer.userId);
                const kycPending = isKycPending(customer);

                return (
                  <tr key={customer.userId}>
                    <td>
                      <CustomerUserCell customer={customer} />
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack">
                        <strong>{customer.phoneNumber || "No phone number"}</strong>
                        <span>{formatDate(customer.dateOfBirth)}</span>
                        <small>{customer.occupation || "No occupation listed"}</small>
                      </div>
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack">
                        <strong>{formatAddress(customer) || "No address captured"}</strong>
                        <span>{customer.gender || "Gender not provided"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vault-admin-cell-stack vault-admin-registry-status">
                        <StatusBadge status={customer.kycStatus} />
                        {showRequestMeta && relatedRequest ? (
                          <div className="vault-admin-request-meta">
                            <RequestStatusBadge status={relatedRequest.status} />
                            <small>
                              Request: {relatedRequest.accountType} for{" "}
                              {formatCurrency(relatedRequest.openingBalance)}
                            </small>
                          </div>
                        ) : showRequestMeta ? (
                          <small>No pending account request</small>
                        ) : null}
                      </div>
                    </td>
                    <td className="is-actions">
                      <div className="vault-admin-table-actions-cell">
                        {kycPending ? (
                          showKycActions ? (
                            <div className="vault-admin-action-group">
                              <div className="vault-admin-action-buttons">
                                <button
                                  type="button"
                                  className="vault-admin-action is-approve"
                                  onClick={() => onApproveKyc(customer.userId)}
                                  disabled={isMutating}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="vault-admin-action is-reject"
                                  onClick={() => onRejectKyc(customer.userId)}
                                  disabled={isMutating}
                                >
                                  Reject
                                </button>
                              </div>
                              <KycActionState customer={customer} actionable />
                            </div>
                          ) : (
                            <KycActionState customer={customer} actionable={false} />
                          )
                        ) : (
                          <KycActionState customer={customer} actionable={false} />
                        )}

                        {showAccountActions && relatedRequest ? (
                          <div className="vault-admin-account-request-card">
                            <div>
                              <strong>Account request pending</strong>
                              <span>
                                {relatedRequest.accountType} request for{" "}
                                {formatCurrency(relatedRequest.openingBalance)}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="vault-admin-inline-button"
                              onClick={() => onApproveAccount(relatedRequest.id)}
                              disabled={isMutating}
                            >
                              Approve account
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
      ) : null}
    </Panel>
  );
});
