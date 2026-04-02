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
const CustomerPage = lazy(() => import("./pages/CustomerPage"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const CustomerRegistryPage = lazy(() => import("./pages/admin/CustomerRegistryPage"));
const KycManagementPage = lazy(() => import("./pages/admin/KycManagementPage"));
const AccountApprovalsPage = lazy(() => import("./pages/admin/AccountApprovalsPage"));

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
              <Route path="/dashboard" element={<CustomerPage />} />
            </Route>

            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="customers" element={<CustomerRegistryPage />} />
                <Route path="kyc" element={<KycManagementPage />} />
                <Route path="accounts" element={<AccountApprovalsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<RoleAwareRedirect />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
