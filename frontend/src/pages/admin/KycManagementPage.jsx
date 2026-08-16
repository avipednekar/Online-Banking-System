import { useEffect, useState } from "react";
import { CheckCircle, Clock, ShieldX, Users } from "lucide-react";
import { CustomerRegistryPanel } from "../../components/admin/CustomerRegistryPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

const TABS = [
  { id: "PENDING", label: "Pending Review", icon: Clock, color: "text-amber-600" },
  { id: "", label: "All Records", icon: Users, color: "text-slate-600" },
  { id: "VERIFIED", label: "Verified", icon: CheckCircle, color: "text-emerald-600" },
  { id: "REJECTED", label: "Rejected", icon: ShieldX, color: "text-rose-600" }
];

export default function KycManagementPage() {
  const { workspace, actionBusy } = useAdminRouteWorkspace();
  const customersBusy = workspace.tracker.isPending("customers");
  const detailBusy = workspace.tracker.isPending("customerDetail");
  const [activeTab, setActiveTab] = useState("PENDING");

  useEffect(() => {
    workspace.setCustomerKycFilter("PENDING");
    workspace.closeCustomerDetail();
  }, [workspace.closeCustomerDetail, workspace.setCustomerKycFilter]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    workspace.setCustomerKycFilter(tabId);
  };

  const overview = workspace.overview;

  return (
    <section className="space-y-4 w-full min-w-0">
      {/* KYC Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          let count = null;
          if (tab.id === "PENDING" && overview?.pendingKyc !== undefined) {
            count = Number(overview.pendingKyc);
          } else if (tab.id === "VERIFIED" && overview?.verifiedKyc !== undefined) {
            count = Number(overview.verifiedKyc);
          } else if (tab.id === "REJECTED" && overview?.rejectedKyc !== undefined) {
            count = Number(overview.rejectedKyc);
          } else if (tab.id === "" && overview?.totalCustomers !== undefined) {
            count = Number(overview.totalCustomers);
          }

          return (
            <button
              key={tab.id}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon size={14} className={isActive ? "text-white" : tab.color} />
              <span>{tab.label}</span>
              {count !== null ? (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <CustomerRegistryPanel
        title="KYC Verification Desk"
        subtitle={
          activeTab === "PENDING"
            ? "Actionable customer verification queue prioritized for institutional clearance."
            : `Browsing customer records with KYC status: ${activeTab || "ALL"}.`
        }
        emptyTitle={
          activeTab === "PENDING" ? "No pending KYC reviews" : "No matching customer profiles"
        }
        emptyMessage={
          activeTab === "PENDING"
            ? "All customer profiles are currently verified, rejected, or awaiting new submissions."
            : "No customers match the current filter and search criteria."
        }
        actionColumnLabel="KYC Action"
        searchPlaceholder="Search KYC by customer name, username, email, phone..."
        showPanelCopy={false}
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
        showKycActions={true}
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
