import { memo } from "react";

function getBadgeStyle(status) {
  const norm = String(status || "").toUpperCase();

  if (["VERIFIED", "APPROVED", "ACTIVE", "COMPLETED", "SUCCESS"].includes(norm)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (["PENDING", "PENDING_APPROVAL", "WAITING", "IN_REVIEW"].includes(norm)) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  if (["REJECTED", "FAILED", "BLOCKED", "SUSPENDED", "DENIED"].includes(norm)) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

export const StatusBadge = memo(function StatusBadge({ status }) {
  const badgeClass = getBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border tracking-wide uppercase ${badgeClass}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
});
