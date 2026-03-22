import { memo } from "react";

export const SubmitButton = memo(function SubmitButton({
  isLoading,
  idleLabel,
  loadingLabel,
  type = "submit",
  variant = "primary",
  ...rest
}) {
  return (
    <button type={type} className={variant === "secondary" ? "secondary" : ""} {...rest}>
      {isLoading ? (
        <span className="button-content">
          <span className="button-spinner" aria-hidden="true" />
          {loadingLabel}
        </span>
      ) : (
        idleLabel
      )}
    </button>
  );
});
