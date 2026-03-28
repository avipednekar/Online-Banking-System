import { HeroSection } from "./HeroSection";
import { ToastViewport } from "../feedback/ToastViewport";

export function AppShell({ children, isAuthenticated, isAdmin, authLoading, authReady }) {
  return (
    <div className="app-shell">
      {isAuthenticated ? <div className="ambient ambient-left" /> : null}
      {isAuthenticated ? <div className="ambient ambient-right" /> : null}
      <ToastViewport />
      <main className={`page ${isAuthenticated ? "" : "auth-page-shell"}`.trim()}>
        {isAuthenticated ? (
          <HeroSection
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            authLoading={authLoading}
            authReady={authReady}
          />
        ) : null}
        {children}
      </main>
    </div>
  );
}
