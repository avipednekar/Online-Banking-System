import { memo } from "react";

export const HeroSection = memo(function HeroSection({
  isAuthenticated,
  isAdmin,
  authLoading,
  authReady
}) {
  let status = "Awaiting sign in";
  let detail = "Authenticate to access customer or central admin operations.";

  if (!authReady) {
    status = "Bootstrapping";
    detail = "Restoring the active session and role-aware workspace.";
  } else if (authLoading) {
    status = "Syncing session";
    detail = "Refreshing the latest profile and access scope.";
  } else if (isAuthenticated) {
    status = isAdmin ? "Admin workspace" : "Customer workspace";
    detail = isAdmin
      ? "Operational oversight, KYC review, and customer controls are active."
      : "Banking operations, transfers, and profile services are active.";
  }

  return (
    <section className="hero">
      <div>
        <p className="eyebrow">VaultLine Operations</p>
        <h1>Production-minded banking UI with role-aware workflows and centralized KYC control.</h1>
        <p className="hero-copy">
          The frontend is organized into pages, services, hooks, shared providers, and reusable
          components. Requests stay same-origin through `/api` by default.
        </p>
      </div>
      <div className="hero-card">
        <span>Status</span>
        <strong>{status}</strong>
        <p>{detail}</p>
      </div>
    </section>
  );
});
