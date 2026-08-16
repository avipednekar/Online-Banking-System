import { Check, RefreshCw, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { EmptyState } from "../../components/feedback/EmptyState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { SectionErrorState } from "../../components/feedback/SectionErrorState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function TransferApprovalsPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const transfersBusy = workspace.tracker.isPending("pendingTransfers");
  const isMutating = workspace.tracker.isPending("approveTransfer");
  const transfers = workspace.pendingTransfers || [];

  return (
    <section className="space-y-4 w-full min-w-0">
      {/* High Value Policy Notice */}
      <div className="flex items-start gap-3.5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 shadow-xs">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold text-amber-900 block">High-Value Surveillance Policy Active</strong>
          <p className="text-amber-800/90 leading-relaxed">
            Transactions equal to or exceeding <strong>₹50,000.00</strong> require explicit administrative review and authorization before ledger posting to prevent unauthorized capital outflow.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 w-full min-w-0 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Transfer Authorizations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve pending large-amount transfers awaiting clearance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {transfers.length} Pending
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition shadow-xs disabled:opacity-50"
              onClick={workspace.loadPendingTransfers}
              disabled={transfersBusy || isMutating}
            >
              <RefreshCw size={13} className={transfersBusy ? "animate-spin text-indigo-600" : "text-slate-500"} />
              <span>{transfersBusy ? "Refreshing..." : "Refresh Queue"}</span>
            </button>
          </div>
        </div>

        {transfersBusy && transfers.length === 0 ? (
          <div className="py-12">
            <LoadingState compact title="Loading transfers" message="Fetching pending high-value transfers." />
          </div>
        ) : null}

        {workspace.pendingTransfersError ? (
          <SectionErrorState
            message={workspace.pendingTransfersError}
            action={
              <button type="button" className="secondary" onClick={workspace.loadPendingTransfers}>
                Retry
              </button>
            }
          />
        ) : null}

        {!transfersBusy && !workspace.pendingTransfersError && transfers.length === 0 ? (
          <EmptyState
            icon={Check}
            title="Authorization Queue Cleared"
            message="There are no pending high-value transfer requests. All transactions are up-to-date."
          />
        ) : null}

        {!workspace.pendingTransfersError && transfers.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3 px-4">Transfer Reference</th>
                  <th scope="col" className="py-3 px-4">Amount</th>
                  <th scope="col" className="py-3 px-4">Origin Account</th>
                  <th scope="col" className="py-3 px-4">Destination / Beneficiary</th>
                  <th scope="col" className="py-3 px-4">Initiated At</th>
                  <th scope="col" className="py-3 px-4">Remarks</th>
                  <th scope="col" className="py-3 px-4 text-right">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transfers.map((item) => (
                  <tr key={item.transferId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-slate-900 block">{item.transferId}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block">
                          {item.channel || "ONLINE_BANKING"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-700 font-mono">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{item.currency || "INR"}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">
                      {item.fromAccountId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs text-slate-800 block">{item.toAccountId}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                          Beneficiary: {item.beneficiaryId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="text-slate-700 block text-xs">{formatDate(item.createdAt)}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-500 italic block truncate max-w-[160px]" title={item.remarks}>
                        {item.remarks || "No remarks provided"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition disabled:opacity-50"
                        onClick={() => workspace.approveTransfer(item.transferId)}
                        disabled={isMutating}
                      >
                        <Check size={14} />
                        <span>Approve &amp; Post</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
