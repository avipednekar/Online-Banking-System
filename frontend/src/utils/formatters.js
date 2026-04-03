export function formatAddress(profile) {
  return [
    profile?.addressLine1,
    profile?.addressLine2,
    profile?.city,
    profile?.state,
    profile?.postalCode,
    profile?.country
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatCurrency(value, currencyCode = "INR") {
  const amount = Number(value || 0);
  const normalizedCurrency = String(currencyCode || "INR").toUpperCase() === "INR" ? "INR" : "INR";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function isCreditTransaction(entry) {
  const type = String(entry?.type || "").toUpperCase();
  if (type === "DEPOSIT" || type === "TRANSFER_IN") {
    return true;
  }
  if (type === "WITHDRAWAL" || type === "TRANSFER_OUT") {
    return false;
  }

  return Number(entry?.amount || 0) >= 0;
}

export function formatTransactionAmount(amount, entryOrIsCredit) {
  const absoluteAmount = Math.abs(Number(amount || 0));
  const isCredit =
    typeof entryOrIsCredit === "boolean"
      ? entryOrIsCredit
      : isCreditTransaction(entryOrIsCredit);

  return `${isCredit ? "+" : "-"} ${formatCurrency(absoluteAmount)}`;
}

export function collectFieldErrors(fields = {}) {
  return Object.values(fields).filter(Boolean);
}

export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN");
}
