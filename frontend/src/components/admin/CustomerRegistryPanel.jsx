import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";
import { formatAddress, formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { FormField } from "../forms/FormField";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

const PAGE_SIZE_OPTIONS = [
  { value: "20", label: "20 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" }
];

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

const CustomerDetailDrawer = memo(function CustomerDetailDrawer({
  customer,
  relatedRequest,
  error,
  isLoading,
  onClose
}) {
  if (!customer && !isLoading && !error) {
    return null;
  }

  return (
    <div className="vault-admin-detail-overlay" role="presentation" onClick={onClose}>
      <aside
        className="vault-admin-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Customer detail"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vault-admin-detail-head">
          <div>
            <p className="vault-admin-detail-eyebrow">Customer detail</p>
            <h3>{customer?.fullName || "Loading customer"}</h3>
            <span>@{customer?.username || "customer"}</span>
          </div>
          <button type="button" className="vault-admin-inline-button" onClick={onClose}>
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="vault-admin-detail-loading">
            <span className="inline-spinner" aria-hidden="true" />
            <p>Loading customer profile...</p>
          </div>
        ) : null}

        {error ? <SectionErrorState message={error} /> : null}

        {customer && !isLoading && !error ? (
          <div className="vault-admin-detail-body">
            <div className="vault-admin-detail-grid">
              <div>
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{customer.phoneNumber || "Not available"}</strong>
              </div>
              <div>
                <span>DOB</span>
                <strong>{formatDate(customer.dateOfBirth)}</strong>
              </div>
              <div>
                <span>Occupation</span>
                <strong>{customer.occupation || "Not available"}</strong>
              </div>
              <div>
                <span>Gender</span>
                <strong>{customer.gender || "Not available"}</strong>
              </div>
              <div>
                <span>KYC</span>
                <strong>{customer.kycStatus}</strong>
              </div>
            </div>

            <div className="vault-admin-detail-section">
              <span>Registered address</span>
              <p>{formatAddress(customer) || "No address captured"}</p>
            </div>

            <div className="vault-admin-detail-section">
              <span>Identifiers</span>
              <p>Customer ID: {customer.customerId}</p>
              <p>Username: @{customer.username}</p>
            </div>

            {relatedRequest ? (
              <div className="vault-admin-detail-section">
                <span>Pending account request</span>
                <p>
                  {relatedRequest.accountType} request for{" "}
                  {formatCurrency(relatedRequest.openingBalance)}
                </p>
                <RequestStatusBadge status={relatedRequest.status} />
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
});

const RegistrySkeletonRows = memo(function RegistrySkeletonRows({ count = 6 }) {
  return (
    <div className="vault-admin-virtual-shell is-skeleton">
      <div className="vault-admin-virtual-header">
        <span>Name</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Location</span>
        <span>Status</span>
      </div>
      <div className="vault-admin-skeleton-list">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="vault-admin-skeleton-row">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
});

const CustomerRow = memo(function CustomerRow({ index, style, data }) {
  const customer = data.customers[index];
  const relatedRequest = data.getPendingRequestForCustomer(customer.userId);
  const kycPending = data.isKycPending(customer);
  const addressSummary = [customer.city, customer.state].filter(Boolean).join(", ");
  const isSummaryOnly = data.summaryOnly;

  const handleOpenDetail = useCallback(async () => {
    await data.onOpenCustomer(customer.userId);
  }, [customer.userId, data]);

  const handleApproveKyc = useCallback(
    (event) => {
      event.stopPropagation();
      data.onApproveKyc(customer.userId);
    },
    [customer.userId, data]
  );

  const handleRejectKyc = useCallback(
    (event) => {
      event.stopPropagation();
      data.onRejectKyc(customer.userId);
    },
    [customer.userId, data]
  );

  const handleApproveAccount = useCallback(
    (event) => {
      event.stopPropagation();
      if (relatedRequest) {
        data.onApproveAccount(relatedRequest.id);
      }
    },
    [data, relatedRequest]
  );

  return (
    <div style={style} className="vault-admin-virtual-row-wrap">
      <article
        className={isSummaryOnly ? "vault-admin-virtual-row is-summary" : "vault-admin-virtual-row"}
        role="button"
        tabIndex={0}
        onClick={() => {
          void handleOpenDetail();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            void handleOpenDetail();
          }
        }}
      >
        <div className="vault-admin-virtual-user">
          <div className="vault-admin-registry-avatar">
            {getInitials(customer.fullName || customer.username)}
          </div>
          <div className="vault-admin-registry-copy">
            <strong title={customer.fullName}>{customer.fullName}</strong>
          </div>
        </div>

        <div className="vault-admin-virtual-cell">
          <strong title={customer.email}>{customer.email}</strong>
        </div>

        <div className="vault-admin-virtual-cell">
          <strong title={customer.phoneNumber || "No phone number"}>
            <Phone size={14} />
            {customer.phoneNumber || "No phone"}
          </strong>
        </div>

        <div className="vault-admin-virtual-cell">
          <strong title={addressSummary || "No location captured"}>
            <MapPin size={14} />
            {addressSummary || "No location"}
          </strong>
        </div>

        {isSummaryOnly ? (
          <div className="vault-admin-virtual-cell">
            <StatusBadge status={customer.kycStatus} />
          </div>
        ) : (
          <>
            <div className="vault-admin-virtual-cell">
              <StatusBadge status={customer.kycStatus} />
              {data.showRequestMeta && relatedRequest ? (
                <div className="vault-admin-request-meta">
                  <RequestStatusBadge status={relatedRequest.status} />
                  <small title={`${relatedRequest.accountType} ${formatCurrency(relatedRequest.openingBalance)}`}>
                    {relatedRequest.accountType} - {formatCurrency(relatedRequest.openingBalance)}
                  </small>
                </div>
              ) : (
                <small>{data.showRequestMeta ? "No pending account request" : customer.customerId}</small>
              )}
            </div>

            <div className="vault-admin-virtual-actions">
              {kycPending ? (
                data.showKycActions ? (
                  <div className="vault-admin-action-group">
                    <div className="vault-admin-action-buttons">
                      <button
                        type="button"
                        className="vault-admin-action is-approve"
                        onClick={handleApproveKyc}
                        disabled={data.isMutating}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="vault-admin-action is-reject"
                        onClick={handleRejectKyc}
                        disabled={data.isMutating}
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

              <div className="vault-admin-virtual-buttons">
                {data.showAccountActions && relatedRequest ? (
                  <button
                    type="button"
                    className="vault-admin-primary-button"
                    onClick={handleApproveAccount}
                    disabled={data.isMutating}
                  >
                    Approve account
                  </button>
                ) : null}
              </div>
            </div>
          </>
        )}
      </article>
    </div>
  );
});

export const CustomerRegistryPanel = memo(function CustomerRegistryPanel({
  title = "Customer Registry",
  subtitle = "Manage institution-wide identity verification and account onboarding actions.",
  emptyTitle = "No customer profiles found",
  emptyMessage = "Newly registered customers will appear here for KYC review.",
  searchPlaceholder = "Search by username, customer ID, email, phone, or KYC status",
  actionColumnLabel = "Administrative Action",
  customers,
  searchDraft,
  isLoading,
  hasLoadedOnce = false,
  error,
  isMutating,
  showKycActions = true,
  showAccountActions = true,
  showRequestMeta = true,
  page,
  pageSize,
  totalPages,
  totalElements,
  selectedCustomerId,
  selectedCustomerDetail,
  selectedCustomerError,
  isDetailLoading,
  onSearchChange,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onApproveKyc,
  onRejectKyc,
  onApproveAccount,
  onOpenCustomer,
  onCloseDetail,
  getPendingRequestForCustomer,
  isKycPending
}) {
  const [rowHeight, setRowHeight] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 188 : 116
  );
  const summaryOnly = !showKycActions && !showAccountActions;

  useEffect(() => {
    function updateRowHeight() {
      if (window.innerWidth < 768) {
        setRowHeight(summaryOnly ? 136 : 188);
        return;
      }

      setRowHeight(window.innerWidth < 1040 ? (summaryOnly ? 104 : 142) : 104);
    }

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => {
      window.removeEventListener("resize", updateRowHeight);
    };
  }, [summaryOnly]);

  const listHeight = useMemo(() => {
    if (!customers.length) {
      return rowHeight * 4;
    }
    return Math.min(customers.length, 6) * rowHeight;
  }, [customers.length, rowHeight]);

  const itemData = useMemo(
    () => ({
      customers,
      showKycActions,
      showAccountActions,
      showRequestMeta,
      summaryOnly,
      isMutating,
      onApproveKyc,
      onRejectKyc,
      onApproveAccount,
      onOpenCustomer,
      getPendingRequestForCustomer,
      isKycPending
    }),
    [
      customers,
      getPendingRequestForCustomer,
      isKycPending,
      isMutating,
      onApproveAccount,
      onApproveKyc,
      onOpenCustomer,
      onRejectKyc,
      showAccountActions,
      showKycActions,
      showRequestMeta,
      summaryOnly
    ]
  );

  const selectedRequest = selectedCustomerDetail
    ? getPendingRequestForCustomer(selectedCustomerDetail.userId)
    : null;
  const showInitialSkeleton = isLoading && !hasLoadedOnce && customers.length === 0 && !error;
  const showEmptyState = !isLoading && !error && customers.length === 0;
  const showList = !error && customers.length > 0;

  return (
    <>
      <Panel className="vault-admin-panel vault-admin-registry-panel min-w-0 w-full rounded-[24px] p-4">
        <div className="vault-admin-panel-copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="vault-admin-registry-toolbar min-w-0">
          <FormField
            label="Search customers"
            name="search"
            value={searchDraft}
            onChange={(_, value) => onSearchChange(value)}
            placeholder={searchPlaceholder}
          />

          <FormField
            label="Rows"
            name="pageSize"
            as="select"
            value={String(pageSize)}
            onChange={(_, value) => onPageSizeChange(value)}
            options={PAGE_SIZE_OPTIONS}
          />
        </div>

        <div className="vault-admin-virtual-meta">
          <span>{totalElements.toLocaleString()} customers</span>
          <span>
            {isLoading && hasLoadedOnce
              ? "Refreshing data..."
              : summaryOnly
                ? "Status overview"
                : actionColumnLabel}
          </span>
        </div>

        {showInitialSkeleton ? <RegistrySkeletonRows /> : null}

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

        {showEmptyState ? <EmptyState title={emptyTitle} message={emptyMessage} /> : null}

        {showList ? (
          <>
            <div className={summaryOnly ? "vault-admin-virtual-shell is-summary" : "vault-admin-virtual-shell"}>
              <div className={summaryOnly ? "vault-admin-virtual-header is-summary" : "vault-admin-virtual-header"}>
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Location</span>
                <span>{summaryOnly ? "Status" : actionColumnLabel}</span>
              </div>

              <List
                className="vault-admin-virtual-list"
                height={listHeight}
                itemCount={customers.length}
                itemData={itemData}
                itemSize={rowHeight}
                itemKey={(index, data) => data.customers[index]?.userId ?? index}
                overscanCount={4}
                width="100%"
              >
                {CustomerRow}
              </List>
            </div>

            <div className="vault-admin-pager">
              <span>
                Page {totalPages === 0 ? 0 : page + 1} of {Math.max(totalPages, 1)}
              </span>
              <div className="vault-admin-pager-actions">
                <button
                  type="button"
                  className="vault-admin-icon-button"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 0 || (isLoading && !hasLoadedOnce)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="vault-admin-icon-button"
                  onClick={() => onPageChange(page + 1)}
                  disabled={
                    totalPages === 0 || page >= totalPages - 1 || (isLoading && !hasLoadedOnce)
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </Panel>

      {selectedCustomerId ? (
        <CustomerDetailDrawer
          customer={selectedCustomerDetail}
          relatedRequest={selectedRequest}
          error={selectedCustomerError}
          isLoading={isDetailLoading}
          onClose={onCloseDetail}
        />
      ) : null}
    </>
  );
});
