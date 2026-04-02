import { AccountRequestQueuePanel } from "../../components/admin/AccountRequestQueuePanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function AccountApprovalsPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const requestsBusy = workspace.tracker.isPending("accountRequests");

  return (
    <section className="vault-admin-page">
      <AccountRequestQueuePanel
        requests={workspace.accountRequests}
        isLoading={requestsBusy}
        error={workspace.requestsError}
        isMutating={actionBusy}
        onRefresh={workspace.loadAccountRequests}
        onApprove={workspace.approveAccountRequest}
      />
    </section>
  );
}
