import { memo } from "react";

export const SectionErrorState = memo(function SectionErrorState({
  title = "Unable to load data",
  message = "Try again in a moment.",
  action
}) {
  return (
    <div className="section-error" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
});
