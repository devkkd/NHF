const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 }, ...opts });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// Categories
export async function getAllCategories() {
  const b = await apiFetch("/categories");
  return b?.data?.categories ?? [];
}
export async function getWardrobeCategories() {
  const b = await apiFetch("/categories?wardrobe=true");
  return b?.data?.categories ?? [];
}
export async function getCategoryBySlug(slug) {
  const b = await apiFetch(`/categories/${slug}`);
  return b?.data?.category ?? null;
}

// Products
export async function getProducts({ category, featured, newArrivals, search, page = 1, limit = 20 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (category) p.set("category", category);
  if (featured) p.set("featured", "true");
  if (newArrivals) p.set("newArrivals", "true");
  if (search) p.set("search", search);
  const b = await apiFetch(`/products?${p}`);
  return b?.data ?? { products: [], total: 0, pages: 1 };
}
export async function getProductBySlug(slug) {
  const b = await apiFetch(`/products/${slug}`);
  return b?.data?.product ?? null;
}
export async function getNewArrivalProducts() {
  const b = await apiFetch("/products?newArrivals=true&limit=20");
  return b?.data?.products ?? [];
}
export async function getFeaturedProducts() {
  const b = await apiFetch("/products?featured=true&limit=8");
  return b?.data?.products ?? [];
}
