export function VaultSectionHeading({ step, title }) {
  return (
    <div className="vault-section-heading">
      <span className="vault-section-step">
        {step}
      </span>
      <h2>{title}</h2>
    </div>
  );
}
