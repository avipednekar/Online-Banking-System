import { memo } from "react";
import { formatCurrency } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

export const AccountsPanel = memo(function AccountsPanel({
  accounts,
  selectedAccount,
  isLoading,
  error,
  onRefresh,
  onSelect
}) {
  return (
    <Panel>
      <SectionHeader
        title="Your accounts"
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
      {isLoading ? <LoadingState compact title="Loading accounts" message="Fetching account balances." /> : null}
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
      {!isLoading && !error && accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          message="Create a savings or current account to start using the workspace."
        />
      ) : null}
      <div className="account-list">
        {accounts.map((account) => (
          <button
            key={account.accountNumber}
            type="button"
            className={`account-card ${selectedAccount === account.accountNumber ? "active" : ""}`}
            onClick={() => onSelect(account.accountNumber)}
          >
            <span>
              {account.accountType} | {account.status}
            </span>
            <strong>{account.accountNumber}</strong>
            <em>{formatCurrency(account.balance, account.currencyCode)}</em>
          </button>
        ))}
      </div>
    </Panel>
  );
});
