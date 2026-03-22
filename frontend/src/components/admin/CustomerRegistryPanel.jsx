import { memo } from "react";
import { kycStatusOptions } from "../../constants/forms";
import { formatAddress, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { FormField } from "../forms/FormField";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

export const CustomerRegistryPanel = memo(function CustomerRegistryPanel({
  customers,
  searchTerm,
  isLoading,
  error,
  onSearchChange,
  onRefresh,
  onUpdateKyc
}) {
  return (
    <Panel>
      <SectionHeader
        title="Customer KYC control"
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh registry"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading}
          />
        }
      />
      <div className="toolbar">
        <FormField
          label="Search customers"
          name="search"
          value={searchTerm}
          onChange={(_, value) => onSearchChange(value)}
          placeholder="Search by username, name, email, phone, or KYC status"
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
          title="No customer profiles found"
          message="Newly registered customers will appear here for KYC review."
        />
      ) : null}
      <div className="transaction-list">
        {customers.map((customer) => (
          <article key={customer.userId} className="admin-customer-card">
            <div className="admin-customer-header">
              <div>
                <span>{customer.username}</span>
                <strong>{customer.fullName}</strong>
                <p>{customer.email}</p>
              </div>
              <StatusBadge status={customer.kycStatus} />
            </div>
            <p>{customer.phoneNumber || "No phone number"}</p>
            <p>
              {customer.occupation || "No occupation"} | {customer.gender || "N/A"}
            </p>
            <p>{formatAddress(customer) || "No address captured"}</p>
            <p>Date of birth: {formatDate(customer.dateOfBirth)}</p>
            <div className="button-row">
              {kycStatusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={option.value === "REJECTED" ? "danger" : option.value === "PENDING" ? "secondary" : ""}
                  onClick={() => onUpdateKyc(customer.userId, option.value)}
                  disabled={isLoading}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
});
