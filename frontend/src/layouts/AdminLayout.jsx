import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    description: "Institution overview",
    icon: LayoutDashboard
  },
  {
    to: "/admin/customers",
    label: "Customers",
    description: "Registry and search",
    icon: Users
  },
  {
    to: "/admin/kyc",
    label: "KYC",
    description: "Verification queue",
    icon: ShieldCheck
  },
  {
    to: "/admin/accounts",
    label: "Accounts",
    description: "Approval queue",
    icon: WalletCards
  }
];

const PAGE_META = {
  "/admin/dashboard": {
    title: "Operational Dashboard",
    subtitle: "Real-time surveillance of institutional account movements, KYC controls, and onboarding approvals."
  },
  "/admin/customers": {
    title: "Customer Registry",
    subtitle: "Search, review, and monitor the bank-wide customer base from one operational view."
  },
  "/admin/kyc": {
    title: "KYC Management",
    subtitle: "Prioritized verification queue for customers that still need administrative action."
  },
  "/admin/accounts": {
    title: "Account Approvals",
    subtitle: "Approve or monitor pending account-opening requests after verification controls are complete."
  }
};

function formatHeaderDate(value) {
  return value.toLocaleDateString("en-US", {
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
  const requestsBusy = workspace.tracker.isPending("accountRequests");
  const actionBusy =
    workspace.tracker.isPending("kyc") ||
    workspace.tracker.isPending("approveAccountRequest");
  const shellBusy = overviewBusy || customersBusy || requestsBusy;
  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

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

  async function refreshWorkspace() {
    await Promise.all([
      workspace.loadOverview(),
      workspace.loadCustomers(),
      workspace.loadAccountRequests()
    ]);
  }

  return (
    <section className="vault-admin-dashboard vault-admin-layout min-h-screen px-3 py-3 md:px-4 md:py-4 lg:h-screen lg:overflow-hidden">
      {drawerOpen ? (
        <button
          type="button"
          className="vault-admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <aside
        className={
          drawerOpen
            ? "vault-admin-sidebar is-open w-full lg:w-auto"
            : "vault-admin-sidebar w-full lg:w-auto"
        }
      >
        <div className="vault-admin-sidebar-head">
          <div className="vault-admin-sidebar-brand">
            <h1>Admin Portal</h1>
            <p>Institutional Access</p>
          </div>
          <button
            type="button"
            className="vault-admin-sidebar-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="vault-admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "vault-admin-nav-item is-active group rounded-2xl px-3 py-3"
                    : "vault-admin-nav-item group rounded-2xl px-3 py-3"
                }
              >
                <Icon size={17} />
                <span className="vault-admin-nav-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="vault-admin-sidebar-footer">
          <button
            type="button"
            className="vault-admin-nav-item is-signout"
            onClick={workspace.logoutUser}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
          <div className="vault-admin-profile-card">
            <div className="vault-admin-profile-avatar">
              {getInitials(workspace.user?.fullName || workspace.user?.username)}
            </div>
            <div>
              <strong>{workspace.user?.fullName || workspace.user?.username || "Admin Administrator"}</strong>
              <span>Global Oversight</span>
            </div>
          </div>
        </div>
      </aside>

      <main
        ref={mainRef}
        className="vault-admin-main vault-admin-layout-main min-w-0 flex-1 overflow-y-auto"
      >
        <header className="vault-admin-header">
          <div className="min-w-0">
            <div className="vault-admin-breadcrumb">
              <span>Admin Console</span>
              <ChevronRight size={12} />
              <span className="is-active">{pageMeta.title}</span>
            </div>
            <h2>{pageMeta.title}</h2>
            <p>{pageMeta.subtitle}</p>
          </div>

          <div className="vault-admin-header-actions shrink-0">
            <button
              type="button"
              className="vault-admin-icon-button vault-admin-menu-button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={17} />
            </button>
            <div className="vault-admin-date-chip">
              <CalendarDays size={16} />
              <span>{todayLabel} - Today</span>
            </div>
            <button
              type="button"
              className="vault-admin-icon-button"
              aria-label="Refresh dashboard"
              onClick={refreshWorkspace}
              disabled={shellBusy}
            >
              <RefreshCw size={16} className={shellBusy ? "spin" : ""} />
            </button>
          </div>
        </header>

        <div className="vault-admin-content min-w-0 flex-1">
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
    </section>
  );
}
