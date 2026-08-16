import { useEffect } from "react";
import { TransferApprovalQueuePanel } from "../../components/admin/TransferApprovalQueuePanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function TransferApprovalsPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const transfersBusy = workspace.tracker.isPending("pendingTransfers");
  const approveBusy = workspace.tracker.isPending("approveTransfer");

  useEffect(() => {
    const controller = new AbortController();
    workspace.loadPendingTransfers({ signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, [workspace.loadPendingTransfers]);

  return (
    <section className="vault-admin-page min-w-0">
      <TransferApprovalQueuePanel
        transfers={workspace.pendingTransfers}
        isLoading={transfersBusy}
        error={workspace.pendingTransfersError}
        isMutating={approveBusy || actionBusy}
        onRefresh={() => workspace.loadPendingTransfers()}
        onApprove={(transferId) => workspace.approveTransfer(transferId)}
      />
    </section>
  );
}
