import { useEffect } from "react";
import { CustomerRegistryPanel } from "../../components/admin/CustomerRegistryPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function CustomerRegistryPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const customersBusy = workspace.tracker.isPending("customers");
  const detailBusy = workspace.tracker.isPending("customerDetail");

  useEffect(() => {
    workspace.setCustomerKycFilter("");
    workspace.closeCustomerDetail();
  }, [workspace.closeCustomerDetail, workspace.setCustomerKycFilter]);

  return (
    <section className="vault-admin-page min-w-0">
      <CustomerRegistryPanel
        title="Customer Registry"
        subtitle="Search the full customer base, inspect KYC state, and monitor onboarding signals."
        actionColumnLabel="Review Status"
        customers={workspace.customers}
        searchDraft={workspace.customerSearchDraft}
        isLoading={customersBusy}
        hasLoadedOnce={workspace.customersLoaded}
        error={workspace.customersError}
        isMutating={actionBusy}
        showKycActions={false}
        showAccountActions={false}
        showRequestMeta={false}
        page={workspace.customerPage}
        pageSize={workspace.customerPageSize}
        totalPages={workspace.customerTotalPages}
        totalElements={workspace.customerTotalElements}
        selectedCustomerId={workspace.selectedCustomerId}
        selectedCustomerDetail={workspace.selectedCustomerDetail}
        selectedCustomerError={workspace.selectedCustomerError}
        isDetailLoading={detailBusy}
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
