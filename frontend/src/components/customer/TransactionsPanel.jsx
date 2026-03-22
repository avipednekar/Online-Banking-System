import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

export function TransactionsPanel({
  transactions,
  selectedAccount,
  isLoading,
  error,
  onRefresh
}) {
  return (
    <Panel>
      <SectionHeader
        title={selectedAccount ? `Transactions for ${selectedAccount}` : "Transactions"}
        action={
          selectedAccount ? (
            <SubmitButton
              type="button"
              variant="secondary"
              isLoading={isLoading}
              idleLabel="Refresh history"
              loadingLabel="Refreshing..."
              onClick={() => onRefresh(selectedAccount)}
              disabled={isLoading}
            />
          ) : null
        }
      />
      {isLoading ? (
        <LoadingState compact title="Loading transactions" message="Fetching transaction history." />
      ) : null}
      {error ? (
        <SectionErrorState
          message={error}
          action={
            selectedAccount ? (
              <button type="button" className="secondary" onClick={() => onRefresh(selectedAccount)}>
                Retry
              </button>
            ) : null
          }
        />
      ) : null}
      {!isLoading && !error && transactions.length === 0 ? (
        <EmptyState
          title="No transactions to show"
          message={
            selectedAccount
              ? "This account has no posted transactions yet."
              : "Select an account to view transaction history."
          }
        />
      ) : null}
      <div className="transaction-list">
        {transactions.map((entry) => (
          <article key={entry.id} className="transaction-card">
            <span>{entry.type}</span>
            <strong>Rs {Number(entry.amount).toFixed(2)}</strong>
            <p>{entry.description}</p>
            <time>{new Date(entry.createdAt).toLocaleString()}</time>
          </article>
        ))}
      </div>
    </Panel>
  );
}
