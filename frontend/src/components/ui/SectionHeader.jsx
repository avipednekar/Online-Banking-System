import { memo } from "react";

export const SectionHeader = memo(function SectionHeader({ title, action, subtitle }) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
});
