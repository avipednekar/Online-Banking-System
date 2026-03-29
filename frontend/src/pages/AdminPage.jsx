import { AdminOverviewPanel } from "../components/admin/AdminOverviewPanel";
import { AccountRequestQueuePanel } from "../components/admin/AccountRequestQueuePanel";
import { CustomerRegistryPanel } from "../components/admin/CustomerRegistryPanel";
import { StatCard } from "../components/ui/StatCard";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";

export default function AdminPage() {
  const workspace = useAdminWorkspace();

  return (
    <>
      <section className="summary-grid">
        <StatCard
          label="Central admin"
          value={workspace.user?.fullName || workspace.user?.username}
          detail={workspace.user?.email || "Central operations access"}
          action={
            <button className="secondary" type="button" onClick={workspace.logoutUser}>
              Logout
            </button>
          }
        />
        <StatCard
          label="Customers"
          value={workspace.overview?.totalCustomers ?? 0}
          detail="Registered retail customers under review and service."
        />
        <StatCard
          label="Pending KYC"
          value={workspace.overview?.pendingKyc ?? 0}
          detail="Customers waiting for central verification."
        />
        <StatCard
          label="Pending account requests"
          value={workspace.overview?.pendingAccountRequests ?? 0}
          detail="Requests awaiting admin approval before account creation."
        />
      </section>

      <AdminOverviewPanel
        overview={workspace.overview}
        isLoading={workspace.tracker.isPending("overview")}
        error={workspace.overviewError}
        onRefresh={workspace.loadOverview}
      />

      <CustomerRegistryPanel
        customers={workspace.filteredCustomers}
        searchTerm={workspace.searchTerm}
        isLoading={workspace.tracker.isPending("customers") || workspace.tracker.isPending("kyc")}
        error={workspace.customersError}
        onSearchChange={workspace.setSearchTerm}
        onRefresh={workspace.loadCustomers}
        onUpdateKyc={workspace.updateKyc}
      />

      <AccountRequestQueuePanel
        requests={workspace.accountRequests}
        isLoading={workspace.tracker.isPending("accountRequests") || workspace.tracker.isPending("approveAccountRequest")}
        error={workspace.requestsError}
        onRefresh={workspace.loadAccountRequests}
        onApprove={workspace.approveAccountRequest}
      />
    </>
  );
}
