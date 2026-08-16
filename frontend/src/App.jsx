import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";
import { LoadingState } from "./components/feedback/LoadingState";
import {
  AdminProtectedRoute,
  CustomerProtectedRoute,
  PublicOnlyRoute,
  RoleAwareRedirect
} from "./components/routes/RouteGuards";
import { useAuth } from "./context/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

/* Customer Pages */
const CustomerLayout = lazy(() => import("./layouts/CustomerLayout"));
const CustomerOverviewPage = lazy(() => import("./pages/customer/CustomerOverviewPage"));
const AccountsPage = lazy(() => import("./pages/customer/AccountsPage"));
const TransfersPage = lazy(() => import("./pages/customer/TransfersPage"));
const TransactionsPage = lazy(() => import("./pages/customer/TransactionsPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));

/* Admin Pages */
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const CustomerRegistryPage = lazy(() => import("./pages/admin/CustomerRegistryPage"));
const KycManagementPage = lazy(() => import("./pages/admin/KycManagementPage"));
const TransferApprovalsPage = lazy(() => import("./pages/admin/TransferApprovalsPage"));

export default function App() {
  const { authReady, authLoading, isAuthenticated, isAdmin } = useAuth();

  return (
    <AppShell
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      authLoading={authLoading}
      authReady={authReady}
    >
      <ErrorBoundary>
        <Suspense
          fallback={
            <section className="panel">
              <LoadingState
                title="Loading interface"
                message="Code-split modules are being loaded for your workspace."
              />
            </section>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<CustomerProtectedRoute />}>
              <Route path="/dashboard" element={<CustomerLayout />}>
                <Route index element={<CustomerOverviewPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="transfers" element={<TransfersPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="customers" element={<CustomerRegistryPage />} />
                <Route path="kyc" element={<KycManagementPage />} />
                <Route path="transfers" element={<TransferApprovalsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<RoleAwareRedirect />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

