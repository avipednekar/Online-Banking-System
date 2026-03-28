import { LockKeyhole, ScanFace, ShieldCheck } from "lucide-react";

const trustItems = [
  {
    title: "Verified entry",
    description: "Single access surface for customer and administrative sessions.",
    icon: ShieldCheck
  },
  {
    title: "Protected data",
    description: "Sensitive profile details stay behind the same validated onboarding flow.",
    icon: LockKeyhole
  },
  {
    title: "Review ready",
    description: "Registration details are structured for downstream KYC verification.",
    icon: ScanFace
  }
];

export function VaultTrustPanel() {
  return (
    <aside className="vault-trust-panel">
      <p className="vault-block-label">Security posture</p>
      <h3>Institutional-grade onboarding, translated into a calm customer experience.</h3>
      <p className="vault-trust-intro">
        We layer trust through tone, clarity, and verified interaction states instead of noisy
        friction.
      </p>

      <div className="vault-trust-list">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="vault-trust-item">
              <span className="vault-trust-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
