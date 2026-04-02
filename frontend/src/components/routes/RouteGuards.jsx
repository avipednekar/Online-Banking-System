import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../feedback/LoadingState";
import { useAuth } from "../../context/AuthContext";

function AuthLoadingFallback() {
  return (
    <section className="panel">
      <LoadingState
        title="Preparing secure workspace"
        message="Restoring session state and role-aware access."
      />
    </section>
  );
}

function getAuthenticatedTarget(isAdmin) {
  return isAdmin ? "/admin/dashboard" : "/dashboard";
}

export function PublicOnlyRoute() {
  const { authReady, isAuthenticated, isAdmin } = useAuth();

  if (!authReady) {
    return <AuthLoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to={getAuthenticatedTarget(isAdmin)} replace />;
  }

  return <Outlet />;
}

export function CustomerProtectedRoute() {
  const { authReady, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export function AdminProtectedRoute() {
  const { authReady, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function RoleAwareRedirect() {
  const { authReady, isAuthenticated, isAdmin } = useAuth();

  if (!authReady) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getAuthenticatedTarget(isAdmin)} replace />;
}
