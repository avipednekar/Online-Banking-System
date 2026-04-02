import { CustomerRegistryPanel } from "../../components/admin/CustomerRegistryPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

export default function KycManagementPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const customersBusy = workspace.tracker.isPending("customers");
  const pendingCustomers = workspace.filteredCustomers.filter((customer) =>
    workspace.isKycPending(customer)
  );

  return (
    <section className="vault-admin-page">
      <CustomerRegistryPanel
        title="KYC Management"
        subtitle="Actionable customer verification queue prioritized for completion."
        emptyTitle="No pending KYC reviews"
        emptyMessage="All customer profiles are currently verified, rejected, or awaiting new submissions."
        actionColumnLabel="KYC Action"
        searchPlaceholder="Search pending KYC by username, name, email, or phone"
        customers={pendingCustomers}
        searchTerm={workspace.searchTerm}
        isLoading={customersBusy}
        error={workspace.customersError}
        isMutating={actionBusy}
        showKycActions
        showAccountActions={false}
        showRequestMeta={false}
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
