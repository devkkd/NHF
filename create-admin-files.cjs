// NHF Admin file creator - Part 1
const fs = require("fs");
const path = require("path");

const ROOT = "D:\\Development\\Nikita-Home-Furnishing\\NHF";

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("✓", rel);
}

// ── STEP 1: src/lib/api.js ─────────────────────────────────────────────────
write("src/lib/api.js", `const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(\`\${BASE}\${path}\`, { next: { revalidate: 60 }, ...opts });
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
  const b = await apiFetch(\`/categories/\${slug}\`);
  return b?.data?.category ?? null;
}

// Products
export async function getProducts({ category, featured, newArrivals, search, page = 1, limit = 20 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (category) p.set("category", category);
  if (featured) p.set("featured", "true");
  if (newArrivals) p.set("newArrivals", "true");
  if (search) p.set("search", search);
  const b = await apiFetch(\`/products?\${p}\`);
  return b?.data ?? { products: [], total: 0, pages: 1 };
}
export async function getProductBySlug(slug) {
  const b = await apiFetch(\`/products/\${slug}\`);
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
`);

// ── STEP 2: src/lib/adminApi.js ────────────────────────────────────────────
write("src/lib/adminApi.js", `const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
let _token = null;
export const setAccessToken = (t) => { _token = t; };
export const getAccessToken = () => _token;
export const clearAccessToken = () => { _token = null; };

async function tryRefresh() {
  try {
    const res = await fetch(\`\${BASE}/auth/refresh\`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const { data } = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch { return false; }
}

export async function apiFetch(path, options = {}) {
  const make = (token) => fetch(\`\${BASE}\${path}\`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: \`Bearer \${token}\` } : {}), ...options.headers },
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
`);

// ── STEP 3: src/context/AdminAuthContext.jsx ───────────────────────────────
write("src/context/AdminAuthContext.jsx", `"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAccessToken, clearAccessToken, apiFetch } from "@/lib/adminApi";
import { useRouter } from "next/navigation";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const init = useCallback(async () => {
    const res = await apiFetch("/auth/refresh", { method: "POST" });
    if (res.ok && res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
      const me = await apiFetch("/auth/me");
      if (me.ok) setUser(me.data?.data?.user ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error(res.data?.error || "Login failed");
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAccessToken();
    setUser(null);
    router.push("/admin/login");
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAdminAuthContext = () => useContext(Ctx);
`);

// ── STEP 4: src/hooks/useAdminAuth.js ─────────────────────────────────────
write("src/hooks/useAdminAuth.js", `import { useAdminAuthContext } from "@/context/AdminAuthContext";
export default function useAdminAuth() {
  return useAdminAuthContext();
}
`);

console.log("Part 1 done (steps 1-4)");
