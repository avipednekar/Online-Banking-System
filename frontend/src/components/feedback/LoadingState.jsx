import { memo } from "react";

export const LoadingState = memo(function LoadingState({
  title = "Loading",
  message = "Please wait while the latest data is fetched.",
  compact = false
}) {
  return (
    <div className={`loading-state ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      <span className="inline-spinner" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
});
