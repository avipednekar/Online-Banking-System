export function VaultRegisterProgress({ steps, activeStep }) {
  return (
    <div className="vault-progress" aria-label="Registration progress">
      {steps.map((step, index) => {
        const state =
          index < activeStep ? "complete" : index === activeStep ? "active" : "upcoming";

        return (
          <div key={step.id} className={`vault-progress-item is-${state}`}>
            <div className="vault-progress-pin">
              <span>{step.stepLabel}</span>
            </div>
            <div className="vault-progress-copy">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
