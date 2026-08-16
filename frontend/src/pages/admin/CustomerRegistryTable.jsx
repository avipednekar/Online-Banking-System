import { memo } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  X
} from "lucide-react";
import { formatAddress, formatDate } from "../../utils/formatters";
import { EmptyState } from "../../components/feedback/EmptyState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { SectionErrorState } from "../../components/feedback/SectionErrorState";
import { StatusBadge } from "../../components/ui/StatusBadge";

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" }
];

function getInitials(value) {
  return String(value || "Customer")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const CustomerDetailModal = memo(function CustomerDetailModal({
  customer,
  error,
  isLoading,
  isMutating,
  onApproveKyc,
  onRejectKyc,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Transparent Click-Outside Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-transparent"
        aria-label="Close detail view"
        onClick={onClose}
      />

      {/* Centered Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] text-slate-900 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200/60">
              {getInitials(customer?.fullName || customer?.username)}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {customer?.fullName || customer?.username || "Customer Profile"}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                CIF: <span className="text-indigo-600 font-semibold">{customer?.customerId || customer?.userId || "N/A"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {isLoading ? (
            <div className="py-12">
              <LoadingState compact title="Loading Profile" message="Fetching complete customer record from database." />
            </div>
          ) : null}

          {error ? (
            <SectionErrorState message={error} />
          ) : null}

          {!isLoading && !error && customer ? (
            <div className="space-y-5 text-sm">
              {/* KYC Status & Quick Action Banner */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Identity Clearance</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={customer.kycStatus} />
                    {customer.kycStatus === "PENDING" ? (
                      <span className="text-xs font-semibold text-amber-700">Verification Pending</span>
                    ) : null}
                  </div>
                </div>

                {customer.kycStatus === "PENDING" ? (
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition disabled:opacity-50"
                      onClick={() => onApproveKyc(customer.userId)}
                      disabled={isMutating}
                    >
                      <Check size={14} />
                      <span>Approve KYC</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 transition disabled:opacity-50"
                      onClick={() => onRejectKyc(customer.userId)}
                      disabled={isMutating}
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : null}
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & Identity Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Identity Details</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs shadow-2xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <strong className="text-slate-900 font-semibold">{customer.fullName}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="text-slate-800">{customer.dob || "Not Provided"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Occupation</span>
                      <span className="text-slate-800">{customer.occupation || "Not Provided"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Annual Income</span>
                      <span className="text-slate-800">{customer.annualIncome ? `₹${Number(customer.annualIncome).toLocaleString()}` : "Not Provided"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Registered On</span>
                      <span className="text-slate-800">{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Communications */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact &amp; Location</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5 text-slate-700 py-1 border-b border-slate-100">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="font-mono truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700 py-1 border-b border-slate-100">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="font-mono">{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-700 py-1">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{formatAddress(customer.address)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Identifiers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">System Identifiers</h4>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-slate-700 shadow-2xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">User ID</span>
                    <strong className="text-indigo-600 font-semibold">{customer.userId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer ID</span>
                    <strong className="text-indigo-600 font-semibold truncate block">{customer.customerId || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Username</span>
                    <strong className="text-indigo-600 font-semibold">@{customer.username}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            onClick={onClose}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
});

export const CustomerRegistryTable = memo(function CustomerRegistryTable({
  title = "Customer Directory",
  subtitle = "Manage institution-wide identity verification and customer profiles.",
  emptyTitle = "No customer profiles found",
  emptyMessage = "Newly registered customers will appear here.",
  searchPlaceholder = "Search by username, customer ID, email, or phone...",
  actionColumnLabel = "Actions",
  customers = [],
  searchDraft = "",
  isLoading = false,
  hasLoadedOnce = false,
  error = "",
  isMutating = false,
  showKycActions = false,
  page = 0,
  pageSize = 20,
  totalPages = 0,
  totalElements = 0,
  showPanelCopy = true,
  selectedCustomerId = null,
  selectedCustomerDetail = null,
  selectedCustomerError = "",
  isDetailLoading = false,
  onSearchChange,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onApproveKyc,
  onRejectKyc,
  onOpenCustomer,
  onCloseDetail
}) {
  const showInitialSkeleton = isLoading && !hasLoadedOnce && customers.length === 0 && !error;
  const showEmptyState = !isLoading && !error && customers.length === 0;
  const showList = !error && customers.length > 0;

  return (
    <div className="w-full space-y-4 min-w-0 bg-white">
      <div className="w-full min-w-0 bg-white">
        {showPanelCopy ? (
          <div className="mb-5 border-b border-slate-200 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        ) : null}

        {/* Toolbar: Search & Page Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              placeholder={searchPlaceholder}
              value={searchDraft}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchDraft ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                onClick={() => onSearchChange("")}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onPageSizeChange ? (
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs transition"
                  value={String(pageSize)}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  aria-label="Number of entries per page"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            ) : null}

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition disabled:opacity-50"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Total records status */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
          <span>{totalElements ? `${totalElements.toLocaleString()} TOTAL RECORDS` : "CUSTOMER DIRECTORY"}</span>
          {totalPages > 1 ? (
            <span>Page {page + 1} of {totalPages}</span>
          ) : null}
        </div>

        {/* Feedback states */}
        {showInitialSkeleton ? (
          <div className="py-12">
            <LoadingState compact title="Loading customers" message="Fetching records from database." />
          </div>
        ) : null}

        {error ? (
          <SectionErrorState
            message={error}
            action={
              <button type="button" className="secondary" onClick={onRefresh}>
                Retry
              </button>
            }
          />
        ) : null}

        {showEmptyState ? (
          <EmptyState
            icon={User}
            title={emptyTitle}
            message={emptyMessage}
          />
        ) : null}

        {/* High-Operability Full-Width Data Table */}
        {showList ? (
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3 px-4">Customer</th>
                  <th scope="col" className="py-3 px-4">Email Address</th>
                  <th scope="col" className="py-3 px-4">Phone</th>
                  <th scope="col" className="py-3 px-4">Location</th>
                  <th scope="col" className="py-3 px-4">KYC Status</th>
                  <th scope="col" className="py-3 px-4 text-right">{actionColumnLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {customers.map((c) => (
                  <tr key={c.userId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                          {getInitials(c.fullName || c.username)}
                        </div>
                        <div className="min-w-0">
                          <strong className="block text-xs font-bold text-slate-900 truncate">
                            {c.fullName || c.username}
                          </strong>
                          <span className="block text-[11px] text-slate-500 font-mono truncate">
                            @{c.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 truncate max-w-[180px]">
                      {c.email}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 truncate max-w-[150px]">
                      {c.address?.city && c.address?.state
                        ? `${c.address.city}, ${c.address.state}`
                        : "Location not provided"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.kycStatus} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {showKycActions && c.kycStatus === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition disabled:opacity-50"
                              onClick={() => onApproveKyc(c.userId)}
                              disabled={isMutating}
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 transition disabled:opacity-50"
                              onClick={() => onRejectKyc(c.userId)}
                              disabled={isMutating}
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition"
                          onClick={() => onOpenCustomer(c.userId)}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination Controls */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs mt-4">
            <span className="text-slate-500 font-medium">
              Showing {(page * pageSize) + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1 || isLoading}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Customer Detail Centered Modal */}
      {selectedCustomerId ? (
        <CustomerDetailModal
          customer={selectedCustomerDetail}
          error={selectedCustomerError}
          isLoading={isDetailLoading}
          isMutating={isMutating}
          onApproveKyc={onApproveKyc}
          onRejectKyc={onRejectKyc}
          onClose={onCloseDetail}
        />
      ) : null}
    </div>
  );
});
