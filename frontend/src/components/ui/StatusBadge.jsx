import { memo } from "react";

export const StatusBadge = memo(function StatusBadge({ status }) {
  return <span className={`kyc-pill ${String(status || "").toLowerCase()}`}>{status}</span>;
});
