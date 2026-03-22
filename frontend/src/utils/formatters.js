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
  return `${currencyCode} ${amount.toFixed(2)}`;
}

export function collectFieldErrors(fields = {}) {
  return Object.values(fields).filter(Boolean);
}
