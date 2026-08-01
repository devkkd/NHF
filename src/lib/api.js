const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export async function apiFetch(path, opts = {}) {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const makeRequest = async (accessToken) => {
    const res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
        ...(opts.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  };

  try {
    let response = await makeRequest(token);

    // Access token expired → refresh and retry
    if (
      response.status === 401 &&
      response.data?.message !== "Refresh token missing."
    ) {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const refreshData = await refreshRes.json().catch(() => ({}));

      if (refreshRes.ok && refreshData.accessToken) {
        localStorage.setItem(
          "accessToken",
          refreshData.accessToken
        );

        response = await makeRequest(refreshData.accessToken);
      } else {
        localStorage.removeItem("accessToken");
      }
    }

    return response;
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: {
        message: "Network Error",
      },
    };
  }
}

// ==================== Categories ====================

export async function getAllCategories() {
  const res = await apiFetch("/categories");
  return res.data?.data?.categories ?? [];
}

export async function getWardrobeCategories() {
  const res = await apiFetch("/categories?wardrobe=true");
  return res.data?.data?.categories ?? [];
}

export async function getCategoryBySlug(slug) {
  const res = await apiFetch(`/categories/${slug}`);
  return res.data?.category ?? null;
}

// ==================== Products ====================

export async function getProducts({
  category,
  featured,
  newArrivals,
  search,
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams({
    page,
    limit,
  });

  if (category) params.set("category", category);
  if (featured) params.set("featured", "true");
  if (newArrivals) params.set("newArrivals", "true");
  if (search) params.set("search", search);

  const res = await apiFetch(`/products?${params}`);

 return (
  res.data?.data ?? {
    products: [],
    total: 0,
    pages: 1,
  }
);
}

export async function getProductBySlug(slug) {
  const res = await apiFetch(`/products/${slug}`);
return res.data?.data?.product ?? null;
}

export async function getNewArrivalProducts() {
  const res = await apiFetch("/products?newArrivals=true&limit=20");
  return res.data?.data?.products ?? [];
}

export async function getFeaturedProducts() {
  const res = await apiFetch("/products?featured=true&limit=8");
  return res.data?.data?.products ?? [];
}
// ==================== Orders ====================

export async function getMyOrders() {
  const res = await apiFetch("/orders/my-orders");
  return res.data;
}

export async function getOrderById(id) {
  const res = await apiFetch(`/orders/${id}`);
  return res.data;
}

export async function trackOrder(id) {
  const res = await apiFetch(`/orders/track/${id}`);
  return res.data;
}
// ==================== Enquiries ====================

export async function submitEnquiry(payload) {
  const res = await apiFetch("/enquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res;
}
/* ===========================================
   ADMIN ORDERS
=========================================== */

