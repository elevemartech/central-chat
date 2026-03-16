const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAccessToken();

  const makeRequest = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(token);

  // Token expirado — tenta renovar uma vez
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) throw new Error("UNAUTHORIZED");
    res = await makeRequest(token);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── WebSocket factory ────────────────────────────────────────────────────────

export function createWebSocket(path: string): WebSocket {
  const token = getAccessToken();
  const wsBase = API_BASE.replace(/^http/, "ws");
  return new WebSocket(`${wsBase}${path}?token=${token ?? ""}`);
}