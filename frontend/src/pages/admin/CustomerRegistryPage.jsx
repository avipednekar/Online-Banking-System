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
    <section className="w-full min-w-0">
      <CustomerRegistryPanel

        title="Institution Customer Directory"
        subtitle="Search the bank-wide customer base, inspect individual KYC verification status, and view registered details."
        actionColumnLabel="Profile"
        customers={workspace.customers}
        searchDraft={workspace.customerSearchDraft}
        isLoading={customersBusy}
        hasLoadedOnce={workspace.customersLoaded}
        error={workspace.customersError}
        isMutating={actionBusy}
        showKycActions={false}
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
        onOpenCustomer={workspace.openCustomerDetail}
        onCloseDetail={workspace.closeCustomerDetail}
      />
    </section>
  );
}
