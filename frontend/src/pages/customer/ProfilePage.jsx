import { Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { useCustomerRouteWorkspace } from "../../hooks/useCustomerRouteWorkspace";
import { formatAddress, formatDate } from "../../utils/formatters";

function getInitials(value) {
  return String(value || "Customer")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { workspace } = useCustomerRouteWorkspace();
  const user = workspace.user;

  return (
    <section className="space-y-6 w-full min-w-0">
      {/* Profile Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xl border border-emerald-200">
            {getInitials(user?.fullName || user?.username)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {user?.fullName || user?.username || "Customer"}
            </h3>
            <p className="text-sm text-slate-500">@{user?.username || "N/A"}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                user?.kycStatus === "VERIFIED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : user?.kycStatus === "REJECTED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <ShieldCheck size={10} />
                {user?.kycStatus || "PENDING"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{user?.role || "CUSTOMER"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Identity Details</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Full Name</span>
              <strong className="text-slate-900 font-semibold">{user?.fullName || "Not available"}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Gender</span>
              <span className="text-slate-800">{user?.gender || "Not available"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Date of Birth</span>
              <span className="text-slate-800">{formatDate(user?.dateOfBirth) || "Not available"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Occupation</span>
              <span className="text-slate-800">{user?.occupation || "Not available"}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">Annual Income</span>
              <span className="text-slate-800">
                {user?.annualIncome
                  ? `₹${Number(user.annualIncome).toLocaleString()}`
                  : "Not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={16} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Contact & Address</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-700 py-2 border-b border-slate-100">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <span className="font-mono truncate">{user?.email || "Not available"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 py-2 border-b border-slate-100">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <span className="font-mono">{user?.phoneNumber || "Not available"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-700 py-2">
              <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formatAddress(user) || "Not available"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3">System Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">User ID</span>
            <strong className="text-emerald-600 font-semibold">{user?.userId || "N/A"}</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Customer ID</span>
            <strong className="text-emerald-600 font-semibold truncate block">{user?.customerId || "N/A"}</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Username</span>
            <strong className="text-emerald-600 font-semibold">@{user?.username || "N/A"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
