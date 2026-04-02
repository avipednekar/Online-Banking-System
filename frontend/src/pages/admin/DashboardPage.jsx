import { AdminOverviewPanel } from "../../components/admin/AdminOverviewPanel";
import { useAdminRouteWorkspace } from "../../hooks/useAdminRouteWorkspace";

function getRiskExposure(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const rejectedKyc = Number(overview?.rejectedKyc || 0);
  const pendingKyc = Number(overview?.pendingKyc || 0);

  if (!totalCustomers) {
    return "Nominal";
  }

  const exposure = (rejectedKyc + pendingKyc) / totalCustomers;

  if (exposure > 0.2) {
    return "Elevated";
  }

  if (exposure > 0.08) {
    return "Guarded";
  }

  return "Low";
}

function getQueueDepth(count) {
  if (count > 12) {
    return "Heavy";
  }

  if (count > 4) {
    return "Active";
  }

  return "Normal";
}

function getVerificationRate(overview) {
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const verifiedKyc = Number(overview?.verifiedKyc || 0);

  if (!totalCustomers) {
    return "0.0%";
  }

  return `${((verifiedKyc / totalCustomers) * 100).toFixed(1)}%`;
}

function HealthScoreCard({ overview }) {
  return (
    <article className="vault-admin-health-card min-w-0 rounded-[24px] p-4 sm:p-5">
      <div className="vault-admin-insight-copy">
        <h3>Institutional Health Score</h3>
        <p>
          Compliance posture remains stable with a verified KYC rate of{" "}
          {getVerificationRate(overview)} and a controlled approval queue.
        </p>
      </div>
      <div className="vault-admin-health-stats">
        <div>
          <span>Risk Exposure</span>
          <strong>{getRiskExposure(overview)}</strong>
        </div>
        <div>
          <span>Sanction Hits</span>
          <strong>{Number(overview?.rejectedKyc || 0)}</strong>
        </div>
        <div>
          <span>Queue Depth</span>
          <strong>{getQueueDepth(Number(overview?.pendingAccountRequests || 0))}</strong>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const { workspace } = useAdminRouteWorkspace();
  const overviewBusy = workspace.tracker.isPending("overview");

  return (
    <section className="vault-admin-page min-w-0">
      <AdminOverviewPanel
        overview={workspace.overview}
        isLoading={overviewBusy}
        error={workspace.overviewError}
        onRefresh={workspace.loadOverview}
      />

      <div className="vault-admin-page-grid min-w-0">
        <HealthScoreCard overview={workspace.overview} />
      </div>
    </section>
  );
}
