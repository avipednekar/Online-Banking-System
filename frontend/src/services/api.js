import { getOrCreateDeviceId } from "../utils/security";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TRUSTED_API_ORIGINS = String(import.meta.env.VITE_TRUSTED_API_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function normalizePath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

function resolveRequestUrl(path) {
  const fallbackOrigin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;

  return new URL(`${API_BASE_URL}${normalizePath(path)}`, fallbackOrigin);
}

function isTrustedApiOrigin(requestUrl) {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    requestUrl.origin === window.location.origin ||
    TRUSTED_API_ORIGINS.includes(requestUrl.origin)
  );
}

function resolveCredentialsMode(requestUrl) {
  if (typeof window === "undefined") {
    return "same-origin";
  }

  return requestUrl.origin === window.location.origin ? "same-origin" : "include";
}

function toPublicErrorMessage(response, data) {
  if (response.status >= 500) {
    return "Server error. Please try again.";
  }

  const candidate = [data?.error, data?.message].find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return candidate || response.statusText || "Request failed";
}

function unwrapEnvelope(payload) {
  if (!payload || typeof payload !== "object" || !("success" in payload) || !("data" in payload)) {
    return payload;
  }

  const unwrapped = payload.data;
  if (Array.isArray(unwrapped) || unwrapped === null || unwrapped === undefined) {
    return unwrapped;
  }

  if (typeof unwrapped === "object") {
    return {
      ...unwrapped,
      message: payload.message || unwrapped.message
    };
  }

  return unwrapped;
}

async function parseResponse(response) {
  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      error: raw,
      message: raw
    };
  }
}

export async function apiRequest(path, options = {}) {
  const { token, body, headers, ...rest } = options;
  const requestUrl = resolveRequestUrl(path);

  if (!isTrustedApiOrigin(requestUrl)) {
    throw new ApiError(
      `Refusing to send requests to untrusted API origin: ${requestUrl.origin}`,
      0
    );
  }

  const response = await fetch(requestUrl.toString(), {
    ...rest,
    cache: "no-store",
    credentials: resolveCredentialsMode(requestUrl),
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Device-Id": getOrCreateDeviceId(),
      ...(headers || {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return null;
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      toPublicErrorMessage(response, data),
      response.status,
      typeof data.fields === "object" && data.fields !== null ? data.fields : {}
    );
  }

  return unwrapEnvelope(data);
}
