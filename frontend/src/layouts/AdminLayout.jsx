import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  X
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    description: "Operational overview",
    icon: LayoutDashboard,
    badgeKey: null
  },
  {
    to: "/admin/customers",
    label: "Customer Directory",
    description: "Registry & accounts",
    icon: Users,
    badgeKey: null
  },
  {
    to: "/admin/kyc",
    label: "KYC Verifications",
    description: "Identity approval queue",
    icon: ShieldCheck,
    badgeKey: "pendingKyc"
  },
  {
    to: "/admin/transfers",
    label: "Transfer Approvals",
    description: "High-value clearance",
    icon: ArrowLeftRight,
    badgeKey: "pendingTransfers"
  }
];

const PAGE_META = {
  "/admin/dashboard": {
    title: "Operational Dashboard",
    subtitle: "Real-time surveillance of institutional account movements, KYC controls, and system health."
  },
  "/admin/customers": {
    title: "Customer Directory",
    subtitle: "Search, review, and inspect the bank-wide customer base from one comprehensive view."
  },
  "/admin/kyc": {
    title: "KYC Verification Desk",
    subtitle: "Prioritized verification queue for customers requiring identity clearance."
  },
  "/admin/transfers": {
    title: "Transfer Authorizations",
    subtitle: "Review and approve high-value transactions (≥ ₹50,000) that exceed institutional thresholds."
  }
};

function formatHeaderDate(value) {
  return value.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getInitials(value) {
  return String(value || "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPageMeta(pathname) {
  return PAGE_META[pathname] || PAGE_META["/admin/dashboard"];
}

export default function AdminLayout() {
  const workspace = useAdminWorkspace();
  const location = useLocation();
  const mainRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const todayLabel = formatHeaderDate(new Date());
  const overviewBusy = workspace.tracker.isPending("overview");
  const customersBusy = workspace.tracker.isPending("customers");

  const actionBusy =
    workspace.tracker.isPending("kyc") ||
    workspace.tracker.isPending("approveTransfer");
  const shellBusy = overviewBusy || customersBusy;
  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  const overview = workspace.overview;

  useEffect(() => {
    setDrawerOpen(false);
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen || typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const refreshWorkspace = useCallback(async () => {
    await Promise.all([
      workspace.loadOverview(),
      workspace.refreshCustomerList(),
      workspace.loadPendingTransfers()
    ]);
  }, [workspace.loadOverview, workspace.refreshCustomerList, workspace.loadPendingTransfers]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row w-full font-sans antialiased">
      {/* Mobile Backdrop */}
      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      {/* Enterprise Full-Height Light Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 h-screen sticky top-0 ${
          drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-base shadow-sm">
                OB
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">Online Banking</h1>
                <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Admin Console</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Admin navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badgeCount = item.badgeKey ? Number(overview?.[item.badgeKey] || 0) : 0;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {badgeCount > 0 ? (
                    <span
                      className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                        location.pathname === item.to
                          ? "bg-white text-indigo-700"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
              {getInitials(workspace.user?.fullName || workspace.user?.username)}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-slate-800 truncate">
                {workspace.user?.fullName || workspace.user?.username || "Central Administrator"}
              </strong>
              <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Authorized Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition shadow-sm"
            onClick={workspace.logoutUser}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Full-Screen Right Area */}
      <main
        ref={mainRef}
        className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto min-h-screen bg-white"
      >

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white border-b border-slate-200 w-full shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Admin Console</span>
              <ChevronRight size={12} />
              <span className="text-indigo-600 font-semibold">{pageMeta.title}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {pageMeta.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={16} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <CalendarDays size={14} className="text-slate-400" />
              <span>{todayLabel}</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs disabled:opacity-50"
              aria-label="Refresh workspace"
              onClick={refreshWorkspace}
              disabled={shellBusy}
            >
              <RefreshCw size={13} className={shellBusy ? "animate-spin text-indigo-600" : "text-slate-500"} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container (Full width, flush padding, zero gap) */}
        <div className="p-4 sm:p-6 w-full flex-1 min-w-0 space-y-6">
          <Outlet
            context={{
              workspace,
              shellBusy,
              actionBusy,
              refreshWorkspace
            }}
          />
        </div>
      </main>
    </div>
  );
}
