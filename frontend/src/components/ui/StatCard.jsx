import { memo } from "react";
import { Panel } from "./Panel";

export const StatCard = memo(function StatCard({ label, value, detail, action }) {
  return (
    <Panel>
      <span className="panel-label">{label}</span>
      <h2>{value}</h2>
      {detail ? <p className="muted">{detail}</p> : null}
      {action}
    </Panel>
  );
});
