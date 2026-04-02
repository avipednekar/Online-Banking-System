import { CustomerRegistryPanel } from "../../components/admin/CustomerRegistryPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function CustomerRegistryPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const customersBusy = workspace.tracker.isPending("customers");

  return (
    <section className="vault-admin-page min-w-0">
      <CustomerRegistryPanel
        title="Customer Registry"
        subtitle="Search the full customer base, inspect KYC state, and monitor onboarding signals."
        actionColumnLabel="Review Status"
        customers={workspace.filteredCustomers}
        searchTerm={workspace.searchTerm}
        isLoading={customersBusy}
        error={workspace.customersError}
        isMutating={actionBusy}
        showKycActions={false}
        showAccountActions={false}
        showRequestMeta
        onSearchChange={workspace.setSearchTerm}
        onRefresh={workspace.loadCustomers}
        onApproveKyc={(userId) => workspace.updateKyc(userId, "VERIFIED")}
        onRejectKyc={(userId) => workspace.updateKyc(userId, "REJECTED")}
        onApproveAccount={workspace.approveAccountRequest}
        getPendingRequestForCustomer={workspace.getPendingRequestForCustomer}
        isKycPending={workspace.isKycPending}
      />
    </section>
  );
}
