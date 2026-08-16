import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Send,
  User,
  Wallet,
  X
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useCustomerWorkspace } from "../hooks/useCustomerWorkspace";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Overview",
    description: "Account summary",
    icon: LayoutDashboard,
    end: true
  },
  {
    to: "/dashboard/accounts",
    label: "Accounts",
    description: "Manage accounts",
    icon: Wallet
  },
  {
    to: "/dashboard/transfers",
    label: "Transfers",
    description: "Send money & beneficiaries",
    icon: Send
  },
  {
    to: "/dashboard/transactions",
    label: "Transactions",
    description: "Transaction history",
    icon: ArrowLeftRight
  },
  {
    to: "/dashboard/profile",
    label: "My Profile",
    description: "Personal details",
    icon: User
  }
];

const PAGE_META = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Your financial summary at a glance."
  },
  "/dashboard/accounts": {
    title: "Account Management",
    subtitle: "View balances, open new accounts, and manage deposits & withdrawals."
  },
  "/dashboard/transfers": {
    title: "Transfers & Beneficiaries",
    subtitle: "Send money to beneficiaries and manage your transfer destinations."
  },
  "/dashboard/transactions": {
    title: "Transaction History",
    subtitle: "View detailed transaction records for all your accounts."
  },
  "/dashboard/profile": {
    title: "My Profile",
    subtitle: "Your personal and contact information."
  }
};

function getInitials(value) {
  return String(value || "Customer")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPageMeta(pathname) {
  return PAGE_META[pathname] || PAGE_META["/dashboard"];
}

export default function CustomerLayout() {
  const workspace = useCustomerWorkspace();
  const location = useLocation();
  const mainRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  const shellBusy =
    workspace.tracker.isPending("accounts") ||
    workspace.tracker.isPending("beneficiaries");

  const actionBusy =
    workspace.tracker.isPending("transfer") ||
    workspace.tracker.isPending("balance") ||
    workspace.tracker.isPending("createAccount") ||
    workspace.tracker.isPending("beneficiary");

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
      workspace.loadAccounts(),
      workspace.loadBeneficiaries()
    ]);
  }, [workspace.loadAccounts, workspace.loadBeneficiaries]);

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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 h-screen sticky top-0 ${
          drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-base shadow-sm">
                VF
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">Vault Financial</h1>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Banking Portal</p>
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
          <nav className="space-y-1" aria-label="Customer navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end || false}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
              {getInitials(workspace.user?.fullName || workspace.user?.username)}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-slate-800 truncate">
                {workspace.user?.fullName || workspace.user?.username || "Customer"}
              </strong>
              <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                {workspace.user?.kycStatus === "VERIFIED" ? "Verified Member" : "Member"}
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

      {/* Main Content Area */}
      <main
        ref={mainRef}
        className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto min-h-screen bg-white"
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white border-b border-slate-200 w-full shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Banking Portal</span>
              <ChevronRight size={12} />
              <span className="text-emerald-600 font-semibold">{pageMeta.title}</span>
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

            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs disabled:opacity-50"
              aria-label="Refresh workspace"
              onClick={refreshWorkspace}
              disabled={shellBusy}
            >
              <RefreshCw size={13} className={shellBusy ? "animate-spin text-emerald-600" : "text-slate-500"} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
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
