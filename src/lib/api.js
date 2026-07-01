/**
 * lib/api.js
 * Public-facing data fetchers — used by Next.js Server Components.
 *
 * All functions use Next.js fetch() with ISR revalidation so data is
 * cached at build/request time and automatically refreshed.
 *
 * revalidate: 60  → cache for 60 seconds, then refetch in background (stale-while-revalidate)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Generic fetcher ──────────────────────────────────────────────────────────
async function apiFetch(path, { revalidate = 60 } = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * All active categories (for "ALL CATEGORY" section).
 * Returns [] on error so components can always map safely.
 */
export async function getAllCategories() {
  const body = await apiFetch("/categories", { revalidate: 60 });
  return body?.data?.categories ?? [];
}

/**
 * Wardrobe-only categories (for "THE WARDROBE" homepage section).
 */
export async function getWardrobeCategories() {
  const body = await apiFetch("/categories?wardrobe=true", { revalidate: 60 });
  return body?.data?.categories ?? [];
}

/**
 * Single category by slug.
 */
export async function getCategoryBySlug(slug) {
  const body = await apiFetch(`/categories/${slug}`, { revalidate: 60 });
  return body?.data?.category ?? null;
}
