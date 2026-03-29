import { ToastViewport } from "../feedback/ToastViewport";

export function AppShell({ children, isAuthenticated, isAdmin, authLoading, authReady }) {
  return (
    <div className="app-shell">
      <ToastViewport />
      <main
        className={[
          "page",
          isAuthenticated ? "page-authenticated" : "auth-page-shell"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
