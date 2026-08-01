const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
let _token = null;
export const setAccessToken = (t) => { _token = t; };
export const getAccessToken = () => _token;
export const clearAccessToken = () => { _token = null; };

async function tryRefresh() {
  try {
   const res = await fetch(`${BASE}/auth/admin/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
   const json = await res.json();
setAccessToken(json.accessToken);
    return true;
  } catch { return false; }
}

export async function apiFetch(path, options = {}) {
  const make = (token) => fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  let res = await make(_token);
  if (res.status === 401 && _token) {
    const ok = await tryRefresh();
    if (!ok) { clearAccessToken(); return { ok: false, status: 401, _sessionExpired: true }; }
    res = await make(_token);
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
/* ==========================
   ADMIN ORDERS
========================== */

export async function getAllOrders() {
  const res = await apiFetch("/orders/admin/all");
  return res.data;
}

export async function getAdminOrder(id) {
  const res = await apiFetch(`/orders/admin/${id}`);
  return res.data;
}

export async function updateOrderStatus(id, orderStatus) {
  const res = await apiFetch(`/orders/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus }),
  });

  return res.data;
}
// ==================== ENQUIRIES ====================

export async function getAllEnquiries() {
  const res = await apiFetch("/enquiries/admin/all");
  return res.data;
}

export async function getEnquiry(id) {
  const res = await apiFetch(`/enquiries/admin/${id}`);
  return res.data;
}

export async function updateEnquiryStatus(id, status, adminNotes = "") {
  const res = await apiFetch(`/enquiries/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      adminNotes,
    }),
  });

  return res.data;
}

export async function deleteEnquiry(id) {
  const res = await apiFetch(`/enquiries/admin/${id}`, {
    method: "DELETE",
  });

  return res.data;
}