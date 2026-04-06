import { useEffect } from "react";
import { CustomerRegistryPanel } from "../../components/admin/CustomerRegistryPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function KycManagementPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const customersBusy = workspace.tracker.isPending("customers");
  const detailBusy = workspace.tracker.isPending("customerDetail");

  useEffect(() => {
    workspace.setCustomerKycFilter("PENDING");
    workspace.closeCustomerDetail();
  }, [workspace.closeCustomerDetail, workspace.setCustomerKycFilter]);

  return (
    <section className="vault-admin-page min-w-0">
      <CustomerRegistryPanel
        title="KYC Management"
        subtitle="Actionable customer verification queue prioritized for completion."
        emptyTitle="No pending KYC reviews"
        emptyMessage="All customer profiles are currently verified, rejected, or awaiting new submissions."
        actionColumnLabel="KYC Action"
        searchPlaceholder="Search pending KYC by username, customer ID, email, or phone"
        customers={workspace.customers}
        searchDraft={workspace.customerSearchDraft}
        isLoading={customersBusy}
        hasLoadedOnce={workspace.customersLoaded}
        error={workspace.customersError}
        isMutating={actionBusy}
        page={workspace.customerPage}
        pageSize={workspace.customerPageSize}
        totalPages={workspace.customerTotalPages}
        totalElements={workspace.customerTotalElements}
        selectedCustomerId={workspace.selectedCustomerId}
        selectedCustomerDetail={workspace.selectedCustomerDetail}
        selectedCustomerError={workspace.selectedCustomerError}
        isDetailLoading={detailBusy}
        showKycActions
        showAccountActions={false}
        showRequestMeta={false}
        onSearchChange={workspace.setCustomerSearchDraft}
        onRefresh={workspace.refreshCustomerList}
        onPageChange={workspace.setCustomerPage}
        onPageSizeChange={workspace.setCustomerPageSize}
        onApproveKyc={(userId) => workspace.updateKyc(userId, "VERIFIED")}
        onRejectKyc={(userId) => workspace.updateKyc(userId, "REJECTED")}
        onApproveAccount={workspace.approveAccountRequest}
        onOpenCustomer={workspace.openCustomerDetail}
        onCloseDetail={workspace.closeCustomerDetail}
        getPendingRequestForCustomer={workspace.getPendingRequestForCustomer}
        isKycPending={workspace.isKycPending}
      />
    </section>
  );
}
