const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
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
  const response = await fetch(buildUrl(path), {
    ...rest,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      data.error || data.message || response.statusText || "Request failed",
      response.status,
      data.fields || {}
    );
  }

  return unwrapEnvelope(data);
}
