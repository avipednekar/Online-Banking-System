import { AuthScreen } from "./components/auth/AuthScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { NotificationStack } from "./components/common/NotificationStack";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { HeroSection } from "./components/layout/HeroSection";
import { useAuth } from "./context/AuthContext";
import { useNotifications } from "./hooks/useNotifications";

function App() {
  const { authReady, authLoading, isAuthenticated, isAdmin } = useAuth();
  const { notifications, showNotification, dismissNotification } = useNotifications();

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <NotificationStack notifications={notifications} onDismiss={dismissNotification} />
      <main className="page">
        <HeroSection
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          authLoading={authLoading}
          authReady={authReady}
        />

        {!authReady ? (
          <section className="panel">
            <p className="loading-note">
              <span className="inline-spinner" aria-hidden="true" />
              Preparing secure workspace...
            </p>
          </section>
        ) : !isAuthenticated ? (
          <AuthScreen notify={showNotification} />
        ) : isAdmin ? (
          <AdminDashboard notify={showNotification} />
        ) : (
          <CustomerDashboard notify={showNotification} />
        )}
      </main>
    </div>
  );
}

export default App;
