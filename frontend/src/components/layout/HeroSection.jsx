export function HeroSection({ isAuthenticated, isAdmin, authLoading, authReady }) {
  let status = "Awaiting sign in";
  let detail = "Authenticate to begin.";

  if (!authReady) {
    status = "Bootstrapping";
    detail = "Initializing secure session controls.";
  } else if (authLoading) {
    status = "Syncing session";
    detail = "Refreshing authenticated profile.";
  } else if (isAuthenticated) {
    status = isAdmin ? "Admin console" : "Authenticated";
    detail = isAdmin
      ? "Central management access is active."
      : "Customer banking access is active.";
  }

  return (
    <section className="hero">
      <div>
        <p className="eyebrow">VaultLine Secure Console</p>
        <h1>Banking operations with centralized KYC and role-aware access control.</h1>
        <p className="hero-copy">
          The frontend is organized around API modules, auth context, and dedicated customer
          and admin surfaces. Browser clients call same-origin `/api` routes by default.
        </p>
      </div>
      <div className="hero-card">
        <span>Status</span>
        <strong>{status}</strong>
        <p>{detail}</p>
      </div>
    </section>
  );
}
