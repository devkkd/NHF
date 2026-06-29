/**
 * lib/adminApi.js
 * Thin fetch wrapper for the NHF backend.
 *
 * - Attaches the in-memory access token to every request
 * - On 401, silently calls /auth/refresh (which reads the httpOnly cookie)
 *   and retries the original request ONCE
 * - On a second 401, the session is dead → redirects to /admin
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// In-memory token store — intentionally NOT localStorage/sessionStorage
// so XSS cannot read it
let _accessToken = null;

export const setAccessToken  = (t) => { _accessToken = t; };
export const getAccessToken  = ()  => _accessToken;
export const clearAccessToken = () => { _accessToken = null; };

// ── Silent token refresh ─────────────────────────────────────
async function tryRefresh() {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method:      "POST",
    credentials: "include",   // sends the httpOnly refresh cookie
  });
  if (!res.ok) return false;
  const { data } = await res.json();
  setAccessToken(data.accessToken);
  return true;
}

// ── Core fetch wrapper ───────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const makeRequest = (token) =>
    fetch(`${BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(_accessToken);

  // Token expired — try to refresh once then retry
  if (res.status === 401 && _accessToken) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearAccessToken();
      // Signal callers to redirect to login
      return { ok: false, status: 401, _sessionExpired: true };
    }
    res = await makeRequest(_accessToken);
  }

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
