// placeholder

const fs = require('fs');
const path = require('path');
const base = __dirname;
const w = (rel, txt) => {
  const f = path.join(base, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, txt.replace(/^\n/, ''), 'utf8');
  console.log('wrote', rel);
};

// ── src/lib/api.js ──────────────────────────────────────────
w('src/lib/api.js', `
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, { next: { revalidate: 60 }, ...opts });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}
export async function getAllCategories() {
  const b = await apiFetch('/categories');
  return b?.data?.categories ?? [];
}
export async function getWardrobeCategories() {
  const b = await apiFetch('/categories?wardrobe=true');
  return b?.data?.categories ?? [];
}
export async function getCategoryBySlug(slug) {
  const b = await apiFetch('/categories/' + slug);
  return b?.data?.category ?? null;
}
export async function getProducts({ category, featured, newArrivals, search, page = 1, limit = 20 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (category) p.set('category', category);
  if (featured) p.set('featured', 'true');
  if (newArrivals) p.set('newArrivals', 'true');
  if (search) p.set('search', search);
  const b = await apiFetch('/products?' + p);
  return b?.data ?? { products: [], total: 0, pages: 1 };
}
export async function getProductBySlug(slug) {
  const b = await apiFetch('/products/' + slug);
  return b?.data?.product ?? null;
}
export async function getNewArrivalProducts() {
  const b = await apiFetch('/products?newArrivals=true&limit=20');
  return b?.data?.products ?? [];
}
export async function getFeaturedProducts() {
  const b = await apiFetch('/products?featured=true&limit=8');
  return b?.data?.products ?? [];
}
`);

// ── src/lib/adminApi.js ─────────────────────────────────────
w('src/lib/adminApi.js', `
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
let _token = null;
export const setAccessToken = (t) => { _token = t; };
export const getAccessToken = () => _token;
export const clearAccessToken = () => { _token = null; };
async function tryRefresh() {
  try {
    const res = await fetch(BASE + '/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const { data } = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch { return false; }
}
export async function apiFetch(path, options = {}) {
  const make = (token) => fetch(BASE + path, {
    ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers },
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

// ── src/context/AdminAuthContext.jsx ───────────────────────
w('src/context/AdminAuthContext.jsx', `
"use client";
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
    clearAccessToken(); setUser(null);
    router.push("/admin/login");
  };
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
export const useAdminAuthContext = () => useContext(Ctx);
`);

// ── src/hooks/useAdminAuth.js ───────────────────────────────
w('src/hooks/useAdminAuth.js', `
import { useAdminAuthContext } from "@/context/AdminAuthContext";
export default function useAdminAuth() { return useAdminAuthContext(); }
`);

// ── src/styles/admin.css ────────────────────────────────────
w('src/styles/admin.css', `
/* NHF Admin CSS */
:root {
  --nhf-olive: #7B7F5C;
  --nhf-olive-dark: #636649;
  --nhf-olive-light: rgba(123,127,92,0.10);
  --nhf-bg: #FAFAF6;
  --nhf-bg-card: #FFFFFF;
  --nhf-border: #EAE7DE;
  --nhf-text: #2C2C24;
  --nhf-muted: #888;
  --nhf-sb-width: 220px;
  --nhf-topbar-h: 56px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body.admin-body { background: var(--nhf-bg); color: var(--nhf-text); font-family: 'Inter', system-ui, sans-serif; font-size: 13px; }

/* Layout */
.nhf-admin { display: flex; min-height: 100vh; background: var(--nhf-bg); }

/* Sidebar */
.nhf-sb { width: var(--nhf-sb-width); background: #1C1F17; color: #fff; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; overflow-y: auto; transition: transform 0.25s ease; }
.nhf-sb-logo { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.nhf-sb-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
.nhf-sb-group { margin-bottom: 4px; }
.nhf-sb-group-label { display: block; padding: 10px 20px 4px; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); font-weight: 600; }
.nhf-sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 20px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 12.5px; font-weight: 500; border-radius: 0; transition: all 0.15s; position: relative; }
.nhf-sb-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
.nhf-sb-item.active { color: #fff; background: var(--nhf-olive); }
.nhf-sb-icon { width: 16px; height: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.nhf-sb-badge { margin-left: auto; background: #e05252; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
.nhf-sb-footer { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
.nhf-sb-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--nhf-olive); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.nhf-sb-uname { font-size: 12px; font-weight: 600; color: #fff; line-height: 1.3; }
.nhf-sb-urole { font-size: 10px; color: rgba(255,255,255,0.4); }
.nhf-sb-logout { margin-left: auto; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4); padding: 4px; transition: color 0.15s; }
.nhf-sb-logout:hover { color: #fff; }
.nhf-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; }

/* Main */
.nhf-main { flex: 1; margin-left: var(--nhf-sb-width); display: flex; flex-direction: column; min-height: 100vh; }

/* Topbar */
.nhf-topbar { height: var(--nhf-topbar-h); background: var(--nhf-bg-card); border-bottom: 1px solid var(--nhf-border); display: flex; align-items: center; padding: 0 24px; gap: 16px; position: sticky; top: 0; z-index: 30; }
.nhf-topbar-burger { display: none; background: none; border: none; cursor: pointer; color: var(--nhf-muted); padding: 4px; }
.nhf-topbar-pagetitle { font-size: 14px; font-weight: 600; color: var(--nhf-text); flex: 1; }
.nhf-topbar-right { display: flex; align-items: center; gap: 12px; }
.nhf-topbar-btn { background: none; border: none; cursor: pointer; color: var(--nhf-muted); padding: 6px; border-radius: 6px; position: relative; transition: background 0.15s; }
.nhf-topbar-btn:hover { background: var(--nhf-olive-light); }
.nhf-topbar-dot { position: absolute; top: 5px; right: 5px; width: 6px; height: 6px; background: #e05252; border-radius: 50%; border: 2px solid var(--nhf-bg-card); }
.nhf-topbar-user { display: flex; align-items: center; gap: 8px; }
.nhf-topbar-uavatar { width: 30px; height: 30px; border-radius: 50%; background: var(--nhf-olive); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
.nhf-topbar-uname { font-size: 12px; font-weight: 600; color: var(--nhf-text); }

/* Page content */
.nhf-page { flex: 1; padding: 28px 28px 48px; overflow-y: auto; }

/* Page header */
.nhf-dash-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.nhf-dash-title { font-size: 20px; font-weight: 700; color: var(--nhf-text); margin: 0 0 4px; }
.nhf-dash-sub { font-size: 12px; color: var(--nhf-muted); margin: 0; }

/* Buttons */
.nhf-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; text-decoration: none; white-space: nowrap; }
.nhf-btn-primary { background: var(--nhf-olive); color: #fff; border-color: var(--nhf-olive); }
.nhf-btn-primary:hover { background: var(--nhf-olive-dark); border-color: var(--nhf-olive-dark); }
.nhf-btn-ghost { background: transparent; color: var(--nhf-text); border-color: var(--nhf-border); }
.nhf-btn-ghost:hover { background: var(--nhf-olive-light); border-color: var(--nhf-olive); color: var(--nhf-olive); }
.nhf-btn-danger { background: #fff5f5; color: #e05252; border-color: #fecaca; }
.nhf-btn-danger:hover { background: #fef2f2; }
.nhf-btn-sm { padding: 5px 10px; font-size: 11px; }
.nhf-btn-icon { padding: 5px 8px; }
.nhf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toolbar */
.nhf-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.nhf-toolbar-left { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.nhf-search-box { display: flex; align-items: center; gap: 8px; border: 1px solid var(--nhf-border); border-radius: 7px; padding: 6px 12px; background: #fff; min-width: 200px; }
.nhf-search-box input { border: none; outline: none; font-size: 12px; color: var(--nhf-text); background: transparent; flex: 1; }
.nhf-search-box input::placeholder { color: #C0BAB0; }

/* Forms */
.nhf-form-group { display: flex; flex-direction: column; gap: 5px; }
.nhf-form-label { font-size: 11px; font-weight: 600; color: var(--nhf-muted); letter-spacing: 0.04em; text-transform: uppercase; }
.nhf-form-input { border: 1px solid var(--nhf-border); border-radius: 7px; padding: 8px 12px; font-size: 13px; color: var(--nhf-text); background: #fff; outline: none; width: 100%; transition: border-color 0.15s; }
.nhf-form-input:focus { border-color: var(--nhf-olive); }
.nhf-form-input.error { border-color: #e05252; }
.nhf-form-textarea { border: 1px solid var(--nhf-border); border-radius: 7px; padding: 8px 12px; font-size: 13px; color: var(--nhf-text); background: #fff; outline: none; width: 100%; resize: vertical; font-family: inherit; transition: border-color 0.15s; }
.nhf-form-textarea:focus { border-color: var(--nhf-olive); }
.nhf-form-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; border-top: 1px solid var(--nhf-border); margin-top: 8px; }

/* Toggle */
.nhf-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--nhf-text); user-select: none; }
.nhf-toggle input { display: none; }
.nhf-toggle-track { width: 36px; height: 20px; border-radius: 10px; background: #E8E4DC; position: relative; transition: background 0.2s; flex-shrink: 0; }
.nhf-toggle input:checked + .nhf-toggle-track { background: var(--nhf-olive); }
.nhf-toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.nhf-toggle input:checked + .nhf-toggle-track::after { transform: translateX(16px); }

/* Modal */
.nhf-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.nhf-modal { background: var(--nhf-bg-card); border-radius: 14px; width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
.nhf-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 14px; border-bottom: 1px solid var(--nhf-border); flex-shrink: 0; }
.nhf-modal-title { font-size: 15px; font-weight: 700; color: var(--nhf-text); }
.nhf-modal-close { background: none; border: none; cursor: pointer; color: var(--nhf-muted); padding: 4px; border-radius: 6px; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
.nhf-modal-close:hover { background: #F0EDE6; }
.nhf-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }

/* Category grid */
.nhf-cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.nhf-cat-card { background: var(--nhf-bg-card); border: 1px solid var(--nhf-border); border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s; }
.nhf-cat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.nhf-cat-img { position: relative; height: 140px; background: #F0EDE6; overflow: hidden; }
.nhf-cat-img img { width: 100%; height: 100%; object-fit: cover; }
.nhf-cat-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #C0BAB0; }
.nhf-cat-body { padding: 12px 14px; }
.nhf-cat-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 4px; }
.nhf-cat-name { font-size: 13px; font-weight: 700; color: var(--nhf-text); }
.nhf-cat-desc { font-size: 11px; color: var(--nhf-muted); line-height: 1.5; margin-bottom: 10px; min-height: 16px; }
.nhf-cat-actions { display: flex; gap: 6px; }

/* Tags */
.nhf-tag { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; white-space: nowrap; }
.nhf-tag-wardrobe { background: var(--nhf-olive-light); color: var(--nhf-olive); }
.nhf-tag-inactive { background: #FEF2F2; color: #dc2626; }

/* Empty + Skeleton */
.nhf-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; text-align: center; color: var(--nhf-muted); }
.nhf-empty-icon { width: 52px; height: 52px; border-radius: 12px; background: #F0EDE6; display: flex; align-items: center; justify-content: center; color: #C0BAB0; }
.nhf-skeleton { background: linear-gradient(90deg, #F0EDE6 25%, #E8E4DC 50%, #F0EDE6 75%); background-size: 200% 100%; animation: nhfSkel 1.4s infinite; border-radius: 6px; }
@keyframes nhfSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Image uploader */
.img-uploader { position: relative; width: 100%; height: 140px; border: 2px dashed var(--nhf-border); border-radius: 10px; cursor: pointer; transition: border-color 0.15s; overflow: hidden; background: #FAFAF6; }
.img-uploader:hover, .img-uploader.drag { border-color: var(--nhf-olive); background: var(--nhf-olive-light); }
.img-preview-wrap { position: absolute; inset: 0; }
.img-preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.img-uploader:hover .img-preview-overlay { background: rgba(0,0,0,0.3); }
.img-preview-overlay span { color: #fff; font-size: 12px; font-weight: 600; opacity: 0; transition: opacity 0.2s; }
.img-uploader:hover .img-preview-overlay span { opacity: 1; }
.img-placeholder-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
.img-upload-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--nhf-olive-light); color: var(--nhf-olive); display: flex; align-items: center; justify-content: center; }
.img-upload-label { font-size: 12px; color: var(--nhf-muted); text-align: center; }
.img-upload-label span { color: var(--nhf-olive); font-weight: 600; text-decoration: underline; }
.img-upload-hint { font-size: 10px; color: #C0BAB0; }

/* Login page */
.nhf-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #F5F3EE 0%, #EDE9E0 100%); padding: 20px; }
.nhf-login-card { background: #fff; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
.nhf-login-logo { margin-bottom: 28px; text-align: center; }
.nhf-login-title { font-size: 20px; font-weight: 700; color: var(--nhf-text); margin-bottom: 4px; }
.nhf-login-sub { font-size: 13px; color: var(--nhf-muted); margin-bottom: 28px; }
.nhf-login-error { background: #fff5f5; border-left: 3px solid #e05252; color: #b91c1c; font-size: 12px; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; }
.nhf-login-form { display: flex; flex-direction: column; gap: 14px; }
.nhf-login-submit { width: 100%; padding: 11px; background: var(--nhf-olive); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; letter-spacing: 0.04em; }
.nhf-login-submit:hover { background: var(--nhf-olive-dark); }
.nhf-login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Responsive */
@media (max-width: 768px) {
  .nhf-sb { transform: translateX(-100%); }
  .nhf-sb.open { transform: translateX(0); }
  .nhf-overlay { display: block; }
  .nhf-main { margin-left: 0; }
  .nhf-topbar-burger { display: flex; }
  .nhf-page { padding: 20px 16px 40px; }
  .nhf-cat-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
`);

// ── Admin layout + pages ────────────────────────────────────
w('src/app/(admin)/layout.js', `
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import "@/styles/admin.css";
export const metadata = { title: "Admin — NHF" };
export default function AdminLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
`);
w('src/app/(admin)/admin/page.js', `
import { redirect } from "next/navigation";
export default function AdminRoot() { redirect("/admin/dashboard"); }
`);
w('src/app/(admin)/admin/login/page.js', `
import AdminLoginPage from "@/components/admin/AdminLoginPage";
export const metadata = { title: "Login — NHF Admin" };
export default function LoginPage() { return <AdminLoginPage />; }
`);
w('src/app/(admin)/admin/dashboard/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";
export const metadata = { title: "Dashboard — NHF Admin" };
export default function DashboardPage() { return <AdminGuard><AdminDashboard /></AdminGuard>; }
`);
w('src/app/(admin)/admin/categories/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminCategories from "@/components/admin/AdminCategories";
export const metadata = { title: "Categories — NHF Admin" };
export default function CategoriesPage() { return <AdminGuard><AdminCategories /></AdminGuard>; }
`);
w('src/app/(admin)/admin/products/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminProducts from "@/components/admin/AdminProducts";
export const metadata = { title: "Products — NHF Admin" };
export default function ProductsPage() { return <AdminGuard><AdminProducts /></AdminGuard>; }
`);

// ── AdminGuard ──────────────────────────────────────────────
w('src/components/admin/AdminGuard.jsx', `
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";
export default function AdminGuard({ children }) {
  const { user, loading } = useAdminAuthContext();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/admin/login"); }, [user, loading, router]);
  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#FAFAF6",fontFamily:"sans-serif",color:"#7B7F5C",fontSize:14,gap:10 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Loading...
      <style>{"\`@keyframes spin{to{transform:rotate(360deg)}}\`"}</style>
    </div>
  );
  if (!user) return null;
  return children;
}
`);

// ── AdminLoginPage ──────────────────────────────────────────
w('src/components/admin/AdminLoginPage.jsx', `
"use client";
import { useState } from "react";
import { useAdminAuthContext } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";
export default function AdminLoginPage() {
  const { login } = useAdminAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) { setError(err.message); setLoading(false); }
  };
  return (
    <div className="nhf-login-page">
      <div className="nhf-login-card">
        <div className="nhf-login-logo">
          <img src="/images/logo.png" alt="NHF" style={{ height: 48, objectFit: "contain" }} />
        </div>
        <h1 className="nhf-login-title">Admin Panel</h1>
        <p className="nhf-login-sub">Sign in to manage your store</p>
        {error && <div className="nhf-login-error">{error}</div>}
        <form className="nhf-login-form" onSubmit={handleSubmit}>
          <div className="nhf-form-group">
            <label className="nhf-form-label">Email</label>
            <input className="nhf-form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@nikitahf.com" required autoFocus />
          </div>
          <div className="nhf-form-group">
            <label className="nhf-form-label">Password</label>
            <input className="nhf-form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="nhf-login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
`);

// ── AdminShell ──────────────────────────────────────────────
w('src/components/admin/AdminShell.jsx', `
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";
const Icon = {
  dashboard: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
  products:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>),
  categories:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>),
  logout:    (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  burger:    (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
};
const NAV = [
  { group: "Overview", items: [{ label:"Dashboard", href:"/admin/dashboard", icon:Icon.dashboard }] },
  { group: "Catalogue", items: [{ label:"Products", href:"/admin/products", icon:Icon.products }, { label:"Categories", href:"/admin/categories", icon:Icon.categories }] },
];
export default function AdminShell({ children, pageTitle }) {
  const { user, logout } = useAdminAuthContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const init = user?.name?.[0]?.toUpperCase() ?? "A";
  const current = pageTitle ?? NAV.flatMap(g=>g.items).find(i=>pathname.startsWith(i.href))?.label ?? "Admin";
  return (
    <div className="nhf-admin">
      <aside className={"nhf-sb" + (open ? " open" : "")}>
        <div className="nhf-sb-logo">
          <img src="/images/logo.png" alt="NHF" style={{height:36,objectFit:"contain"}} />
        </div>
        <nav className="nhf-sb-nav">
          {NAV.map(({group, items}) => (
            <div key={group} className="nhf-sb-group">
              <span className="nhf-sb-group-label">{group}</span>
              {items.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={"nhf-sb-item" + (active ? " active" : "")} onClick={()=>setOpen(false)}>
                    <span className="nhf-sb-icon">{item.icon}</span>
                    <span className="nhf-sb-label">{item.label}</span>
                    {item.badge && <span className="nhf-sb-badge">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="nhf-sb-footer">
          <div className="nhf-sb-avatar">{init}</div>
          <div><div className="nhf-sb-uname">{user?.name ?? "Admin"}</div><div className="nhf-sb-urole">Administrator</div></div>
          <button className="nhf-sb-logout" onClick={logout} title="Sign out">{Icon.logout}</button>
        </div>
      </aside>
      {open && <div className="nhf-overlay" onClick={()=>setOpen(false)} />}
      <div className="nhf-main">
        <header className="nhf-topbar">
          <button className="nhf-topbar-burger" onClick={()=>setOpen(v=>!v)}>{Icon.burger}</button>
          <div className="nhf-topbar-pagetitle">{current}</div>
          <div className="nhf-topbar-right">
            <div className="nhf-topbar-user">
              <div className="nhf-topbar-uavatar">{init}</div>
              <span className="nhf-topbar-uname">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="nhf-page">{children}</main>
      </div>
    </div>
  );
}
`);

// ── ImageUploader ───────────────────────────────────────────
w('src/components/admin/ImageUploader.jsx', `
"use client";
import { useState, useRef, useCallback } from "react";
import { getAccessToken } from "@/lib/adminApi";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const ALLOWED = ["image/jpeg","image/png","image/webp","image/avif"];
export default function ImageUploader({ value, onUpload, folder = "categories" }) {
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const upload = useCallback(async (file) => {
    if (!ALLOWED.includes(file.type)) { setErrMsg("Only JPEG/PNG/WebP/AVIF"); setStatus("error"); return; }
    if (file.size > 5*1024*1024) { setErrMsg("Max 5 MB"); setStatus("error"); return; }
    setStatus("uploading"); setErrMsg("");
    try {
      const pRes = await fetch(API+"/upload/presign", { method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+getAccessToken()}, body:JSON.stringify({mimeType:file.type,fileSize:file.size,folder}) });
      const pBody = await pRes.json();
      if (!pRes.ok) throw new Error(pBody.error||"Presign failed");
      const r2 = await fetch(pBody.data.uploadUrl, { method:"PUT", headers:{"Content-Type":file.type}, body:file });
      if (!r2.ok) throw new Error("Upload to R2 failed");
      setStatus("idle"); onUpload(pBody.data.publicUrl);
    } catch(e) { setErrMsg(e.message); setStatus("error"); }
  }, [folder, onUpload]);
  const handleFiles = (files) => { if (files?.[0]) upload(files[0]); };
  return (
    <div>
      <div
        className={"img-uploader" + (drag?" drag":"") + (status==="uploading"?" uploading":"")}
        onClick={()=>status!=="uploading"&&inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handleFiles(e.dataTransfer.files);}}
        role="button" tabIndex={0}
      >
        <input ref={inputRef} type="file" accept={ALLOWED.join(",")} style={{display:"none"}} onChange={e=>handleFiles(e.target.files)} />
        {value && status!=="uploading" ? (
          <div className="img-preview-wrap">
            <img src={value} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
            <div className="img-preview-overlay"><span>Change image</span></div>
          </div>
        ) : status==="uploading" ? (
          <div className="img-placeholder-content"><p style={{color:"#7B7F5C",fontSize:13}}>Uploading...</p></div>
        ) : (
          <div className="img-placeholder-content">
            <div className="img-upload-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
            </div>
            <p className="img-upload-label"><span>Click to upload</span> or drag &amp; drop</p>
            <p className="img-upload-hint">PNG, JPG, WebP · Max 5 MB</p>
          </div>
        )}
      </div>
      {status==="error" && <p style={{fontSize:11,color:"#e05252",marginTop:5}}>{errMsg}</p>}
      <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1,height:1,background:"#E8E4DC"}}/>
        <span style={{fontSize:11,color:"#C0BAB0",whiteSpace:"nowrap"}}>or paste URL</span>
        <div style={{flex:1,height:1,background:"#E8E4DC"}}/>
      </div>
      <input type="url" className="nhf-form-input" style={{marginTop:8}} value={value||""} onChange={e=>onUpload(e.target.value)} placeholder="https://..." />
    </div>
  );
}
`);

// ── AdminDashboard ──────────────────────────────────────────
w('src/components/admin/AdminDashboard.jsx', `
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { apiFetch } from "@/lib/adminApi";
export default function AdminDashboard() {
  const [stats, setStats] = useState({ products:0, categories:0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      apiFetch("/products/admin/all?limit=1"),
      apiFetch("/categories/admin/all?limit=1"),
    ]).then(([p, c]) => {
      setStats({ products: p?.data?.data?.total??0, categories: c?.data?.data?.total??0 });
      setLoading(false);
    });
  }, []);
  const cards = [
    { label:"Total Products", value:stats.products, href:"/admin/products", color:"#7B7F5C" },
    { label:"Total Categories", value:stats.categories, href:"/admin/categories", color:"#8B7355" },
  ];
  return (
    <AdminShell pageTitle="Dashboard">
      <div className="nhf-dash-header">
        <div><h1 className="nhf-dash-title">Dashboard</h1><p className="nhf-dash-sub">Welcome back! Here is an overview of your store.</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:32}}>
        {cards.map(c => (
          <Link key={c.label} href={c.href} style={{textDecoration:"none"}}>
            <div style={{background:"#fff",border:"1px solid #EAE7DE",borderRadius:12,padding:"20px 22px",transition:"box-shadow 0.2s",cursor:"pointer"}}>
              <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 8px"}}>{c.label}</p>
              <p style={{fontSize:32,fontWeight:700,color:c.color,margin:0,fontFamily:"serif"}}>{loading?"—":c.value}</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Link href="/admin/products" className="nhf-btn nhf-btn-primary" style={{justifyContent:"center",padding:"14px"}}>Manage Products →</Link>
        <Link href="/admin/categories" className="nhf-btn nhf-btn-ghost" style={{justifyContent:"center",padding:"14px"}}>Manage Categories →</Link>
      </div>
    </AdminShell>
  );
}
`);
