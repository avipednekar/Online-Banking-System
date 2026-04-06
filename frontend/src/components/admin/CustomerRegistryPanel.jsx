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

const RegistrySkeletonRows = memo(function RegistrySkeletonRows({
  count = 6,
  isKycQueueLayout = false
}) {
  return (
    <div
      className={
        isKycQueueLayout ? "vault-admin-virtual-shell is-kyc" : "vault-admin-virtual-shell is-summary"
      }
    >
      <div
        className={
          isKycQueueLayout ? "vault-admin-virtual-header is-kyc" : "vault-admin-virtual-header is-summary"
        }
      >
        <span>Name</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Location</span>
        <span>Status</span>
        {isKycQueueLayout ? <span>Actions</span> : null}
      </div>
      <div className={isKycQueueLayout ? "vault-admin-grid-list is-skeleton" : "vault-admin-skeleton-list"}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={isKycQueueLayout ? "vault-admin-grid-row is-skeleton" : "vault-admin-skeleton-row"}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
            {isKycQueueLayout ? <span /> : null}
          </div>
        ))}
      </div>
    </div>
  );
});

function SummaryCells({ customer }) {
  const addressSummary = [customer.city, customer.state].filter(Boolean).join(", ");

  return (
    <>
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
    </>
  );
}

const KycGridRow = memo(function KycGridRow({ customer, data }) {
  const relatedRequest = data.getPendingRequestForCustomer(customer.userId);

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

  return (
    <article
      className="vault-admin-grid-row"
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
      <SummaryCells customer={customer} />

      <div className="vault-admin-virtual-cell">
        <StatusBadge status={customer.kycStatus} />
      </div>

      <div className="vault-admin-grid-actions">
        <div className="vault-admin-grid-action-buttons">
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
        {relatedRequest ? <RequestStatusBadge status={relatedRequest.status} /> : null}
      </div>
    </article>
  );
});

const VirtualCustomerRow = memo(function VirtualCustomerRow({ index, style, data }) {
  const customer = data.customers[index];

  const handleOpenDetail = useCallback(async () => {
    await data.onOpenCustomer(customer.userId);
  }, [customer.userId, data]);

  return (
    <div style={style} className="vault-admin-virtual-row-wrap">
      <article
        className="vault-admin-virtual-row is-summary"
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
        <SummaryCells customer={customer} />
        <div className="vault-admin-virtual-cell">
          <StatusBadge status={customer.kycStatus} />
        </div>
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
  page,
  pageSize,
  totalPages,
  totalElements,
  showPanelCopy = true,
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
  onOpenCustomer,
  onCloseDetail,
  getPendingRequestForCustomer
}) {
  const [rowHeight, setRowHeight] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 136 : 104
  );
  const isKycQueueLayout = showKycActions && !showAccountActions;

  useEffect(() => {
    if (isKycQueueLayout) {
      return undefined;
    }

    function updateRowHeight() {
      if (window.innerWidth < 768) {
        setRowHeight(136);
        return;
      }

      setRowHeight(104);
    }

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => {
      window.removeEventListener("resize", updateRowHeight);
    };
  }, [isKycQueueLayout]);

  const listHeight = useMemo(() => {
    if (!customers.length) {
      return rowHeight * 4;
    }
    return Math.min(customers.length, 6) * rowHeight;
  }, [customers.length, rowHeight]);

  const itemData = useMemo(
    () => ({
      customers,
      isMutating,
      onApproveKyc,
      onRejectKyc,
      onOpenCustomer,
      getPendingRequestForCustomer
    }),
    [customers, getPendingRequestForCustomer, isMutating, onApproveKyc, onOpenCustomer, onRejectKyc]
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
        {showPanelCopy ? (
          <div className="vault-admin-panel-copy">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        ) : null}

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
              : isKycQueueLayout
                ? "KYC actions"
                : "Status overview"}
          </span>
        </div>

        {showInitialSkeleton ? <RegistrySkeletonRows isKycQueueLayout={isKycQueueLayout} /> : null}

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
            {isKycQueueLayout ? (
              <div className="vault-admin-virtual-shell is-kyc">
                <div className="vault-admin-virtual-header is-kyc">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Location</span>
                  <span>Status</span>
                  <span>{actionColumnLabel}</span>
                </div>

                <div className="vault-admin-grid-list">
                  {customers.map((customer) => (
                    <KycGridRow key={customer.userId} customer={customer} data={itemData} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="vault-admin-virtual-shell is-summary">
                <div className="vault-admin-virtual-header is-summary">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Location</span>
                  <span>Status</span>
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
                  {VirtualCustomerRow}
                </List>
              </div>
            )}

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
