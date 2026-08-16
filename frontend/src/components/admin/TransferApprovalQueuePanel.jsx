import { memo } from "react";
import { ArrowRight, Check, Clock, Send, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export const TransferApprovalQueuePanel = memo(function TransferApprovalQueuePanel({
  transfers,
  isLoading,
  error,
  isMutating,
  onRefresh,
  onApprove
}) {
  return (
    <Panel className="vault-admin-panel vault-admin-approvals-panel min-w-0 w-full rounded-[24px] p-4">
      <div className="vault-admin-panel-toolbar flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-500" />
          <span className="text-sm font-medium text-slate-300">
            {transfers.length} transfer{transfers.length === 1 ? "" : "s"} requiring authorization (≥ ₹50,000)
          </span>
        </div>
        <SubmitButton
          type="button"
          variant="secondary"
          isLoading={isLoading}
          idleLabel="Refresh Queue"
          loadingLabel="Refreshing..."
          onClick={onRefresh}
          disabled={isLoading || isMutating}
        />
      </div>

      {isLoading && transfers.length === 0 ? (
        <LoadingState compact title="Loading transfers" message="Fetching pending high-value transfers." />
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

      {!isLoading && !error && transfers.length === 0 ? (
        <EmptyState
          icon={Check}
          title="No pending transfers"
          message="All high-value transfer requests have been reviewed and cleared."
        />
      ) : null}

      {!error && transfers.length > 0 ? (
        <div className="vault-admin-table-shell w-full overflow-x-auto">
          <table className="vault-admin-data-table vault-admin-request-table w-full">
            <thead>
              <tr>
                <th scope="col">Transfer ID &amp; Channel</th>
                <th scope="col">Amount (INR)</th>
                <th scope="col">From Account</th>
                <th scope="col">To Account / Beneficiary</th>
                <th scope="col">Requested At</th>
                <th scope="col">Remarks</th>
                <th scope="col" className="is-actions text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((item) => (
                <tr key={item.transferId}>
                  <td>
                    <div className="vault-admin-cell-stack">
                      <strong className="font-mono text-xs text-slate-200">{item.transferId}</strong>
                      <span className="text-xs text-slate-400">{item.channel || "ONLINE_BANKING"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-base font-semibold text-emerald-400">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td>
                    <div className="vault-admin-cell-stack">
                      <span className="font-mono text-xs text-slate-300">{item.fromAccountId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="vault-admin-cell-stack">
                      <span className="font-mono text-xs text-slate-300">{item.toAccountId}</span>
                      <small className="text-xs text-slate-400">Beneficiary: {item.beneficiaryId}</small>
                    </div>
                  </td>
                  <td>
                    <div className="vault-admin-cell-stack">
                      <span className="text-xs text-slate-300">{formatDate(item.createdAt)}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 italic">
                      {item.remarks || "No remarks"}
                    </span>
                  </td>
                  <td className="is-actions text-right">
                    <button
                      type="button"
                      className="vault-admin-primary-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                      onClick={() => onApprove(item.transferId)}
                      disabled={isMutating}
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Panel>
  );
});
