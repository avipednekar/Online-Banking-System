const DEVICE_ID_STORAGE_KEY = "bank_device_id";

let inMemoryDeviceId = "";

function requireCrypto() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto;
  }

  throw new Error("Secure randomness is unavailable in this environment.");
}

export function generateSecureId(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  requireCrypto().getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getOrCreateDeviceId() {
  if (typeof window === "undefined") {
    if (!inMemoryDeviceId) {
      inMemoryDeviceId = `dev_${generateSecureId(16)}`;
    }
    return inMemoryDeviceId;
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = `dev_${generateSecureId(16)}`;
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    if (!inMemoryDeviceId) {
      inMemoryDeviceId = `dev_${generateSecureId(16)}`;
    }
    return inMemoryDeviceId;
  }
}
