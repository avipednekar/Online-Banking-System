import { Suspense, lazy } from "react";
import { AppShell } from "./components/layout/AppShell";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";
import { LoadingState } from "./components/feedback/LoadingState";
import { useAuth } from "./context/AuthContext";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const CustomerPage = lazy(() => import("./pages/CustomerPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function WorkspaceSwitch() {
  const { authReady, authLoading, isAuthenticated, isAdmin } = useAuth();

  if (!authReady) {
    return (
      <section className="panel">
        <LoadingState
          title="Preparing secure workspace"
          message="Restoring session state and role-aware access."
        />
      </section>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (isAdmin) {
    return <AdminPage />;
  }

  return <CustomerPage />;
}

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
          <WorkspaceSwitch />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
