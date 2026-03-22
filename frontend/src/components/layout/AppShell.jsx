import { HeroSection } from "./HeroSection";
import { ToastViewport } from "../feedback/ToastViewport";

export function AppShell({ children, isAuthenticated, isAdmin, authLoading, authReady }) {
  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <ToastViewport />
      <main className="page">
        <HeroSection
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          authLoading={authLoading}
          authReady={authReady}
        />
        {children}
      </main>
    </div>
  );
}
