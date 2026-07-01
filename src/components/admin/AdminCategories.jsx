"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import { getAccessToken } from "@/lib/adminApi";
import ImageUploader from "@/components/admin/ImageUploader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ── helpers ───────────────────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

// ── sub-components ────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <label className="nhf-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="nhf-toggle-track" />
      {label && <span>{label}</span>}
    </label>
  );
}

function CategoryModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState({
    name:           initial?.name           ?? "",
    description:    initial?.description    ?? "",
    image:          initial?.image          ?? "",
    showInWardrobe: initial?.showInWardrobe ?? false,
    sortOrder:      initial?.sortOrder      ?? 0,
    isActive:       initial?.isActive       ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const url    = isEdit ? `${API}/categories/${initial._id}` : `${API}/categories`;
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: authHeaders(),
        body:    JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) { setError(body.error || "Save failed"); setSaving(false); return; }
      onSave(body.data.category);
    } catch { setError("Network error. Try again."); setSaving(false); }
  };

  return (
    <div className="nhf-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="nhf-modal">
        <div className="nhf-modal-head">
          <span className="nhf-modal-title">{isEdit ? "Edit Category" : "Add Category"}</span>
          <button className="nhf-modal-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form className="nhf-modal-body" onSubmit={handleSubmit} noValidate>
          {error && (
            <div style={{ background:"#fff5f5", borderLeft:"3px solid #e05252", color:"#b91c1c", fontSize:13, padding:"10px 14px", marginBottom:16, borderRadius:4 }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div className="nhf-form-group">
            <label className="nhf-form-label">Category Name *</label>
            <input
              className={`nhf-form-input${!form.name.trim() && error ? " error" : ""}`}
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. Kantha Bedcovers"
            />
          </div>

          {/* Description */}
          <div className="nhf-form-group">
            <label className="nhf-form-label">Description</label>
            <textarea
              className="nhf-form-textarea"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Short description (optional)"
            />
          </div>

          {/* Image — Cloudflare R2 uploader */}
          <div className="nhf-form-group">
            <label className="nhf-form-label">Category Image</label>
            <ImageUploader
              value={form.image}
              onUpload={(url) => set("image", url)}
              folder="categories"
            />
          </div>

          {/* Sort order */}
          <div className="nhf-form-group">
            <label className="nhf-form-label">Sort Order</label>
            <input
              className="nhf-form-input"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={e => set("sortOrder", e.target.value)}
              style={{ width:100 }}
            />
          </div>

          {/* Toggles */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:4 }}>
            <Toggle
              checked={form.showInWardrobe}
              onChange={e => set("showInWardrobe", e.target.checked)}
              label="Show in Wardrobe section"
            />
            {isEdit && (
              <Toggle
                checked={form.isActive}
                onChange={e => set("isActive", e.target.checked)}
                label="Active (visible on site)"
              />
            )}
          </div>

          {/* Footer */}
          <div className="nhf-form-footer">
            <button type="button" className="nhf-btn nhf-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="nhf-btn nhf-btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null); // null | "add" | category object
  const [deletingId, setDeletingId] = useState(null);
  const [filter,     setFilter]     = useState("all"); // all | wardrobe | inactive

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/categories/admin/all`, { headers: authHeaders() });
      const body = await res.json();
      if (res.ok) setCategories(body.data.categories ?? []);
    } catch { /* silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c._id === saved._id);
      return idx >= 0
        ? prev.map(c => c._id === saved._id ? saved : c)
        : [saved, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this category?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/categories/${id}`, { method:"DELETE", headers: authHeaders() });
      setCategories(prev => prev.map(c => c._id === id ? { ...c, isActive: false } : c));
    } catch { /* silently */ }
    setDeletingId(null);
  };

  const handleToggleWardrobe = async (cat) => {
    const updated = { ...cat, showInWardrobe: !cat.showInWardrobe };
    setCategories(prev => prev.map(c => c._id === cat._id ? updated : c));
    try {
      await fetch(`${API}/categories/${cat._id}`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify({ showInWardrobe: !cat.showInWardrobe }),
      });
    } catch {
      // revert on error
      setCategories(prev => prev.map(c => c._id === cat._id ? cat : c));
    }
  };

  // filtered + searched list
  const visible = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"       ? true :
      filter === "wardrobe"  ? c.showInWardrobe :
      filter === "inactive"  ? !c.isActive : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:      categories.length,
    wardrobe: categories.filter(c => c.showInWardrobe).length,
    inactive: categories.filter(c => !c.isActive).length,
  };

  return (
    <AdminShell pageTitle="Categories">

      {/* ── Page header ──────────────────────────────── */}
      <div className="nhf-dash-header">
        <div>
          <h1 className="nhf-dash-title">Categories</h1>
          <p className="nhf-dash-sub">
            Manage product categories. Toggle <strong style={{color:"#7B7F5C"}}>Wardrobe</strong> to show a category in the homepage wardrobe section.
          </p>
        </div>
        <button className="nhf-btn nhf-btn-primary" onClick={() => setModal("add")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="nhf-toolbar">
        <div className="nhf-toolbar-left">
          {/* Filter tabs */}
          {[
            { key:"all",      label:"All",       count: counts.all      },
            { key:"wardrobe", label:"Wardrobe",  count: counts.wardrobe },
            { key:"inactive", label:"Inactive",  count: counts.inactive },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="nhf-btn nhf-btn-ghost nhf-btn-sm"
              style={filter === tab.key ? { borderColor:"#7B7F5C", color:"#4A4E38", background:"rgba(123,127,92,0.06)" } : {}}
            >
              {tab.label}
              <span style={{
                background: filter === tab.key ? "rgba(123,127,92,0.15)" : "#F0EFE8",
                color: filter === tab.key ? "#4A4E38" : "#888",
                fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="nhf-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0BAB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#C0BAB0", padding:0, lineHeight:1 }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────── */}
      {loading ? (
        <div className="nhf-cat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="nhf-cat-card">
              <div className="nhf-skeleton" style={{ height:160 }} />
              <div style={{ padding:"14px 16px" }}>
                <div className="nhf-skeleton" style={{ height:14, width:"60%", marginBottom:8 }} />
                <div className="nhf-skeleton" style={{ height:11, width:"85%", marginBottom:12 }} />
                <div className="nhf-skeleton" style={{ height:28, width:"100%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="nhf-empty">
          <div className="nhf-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p>{search ? `No categories match "${search}"` : "No categories yet."}</p>
          {!search && (
            <button className="nhf-btn nhf-btn-primary" onClick={() => setModal("add")}>
              Create your first category
            </button>
          )}
        </div>
      ) : (
        <div className="nhf-cat-grid">
          {visible.map(cat => (
            <div key={cat._id} className="nhf-cat-card" style={{ opacity: cat.isActive ? 1 : 0.55 }}>

              {/* Image */}
              <div className="nhf-cat-img">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling?.removeAttribute("style"); }} />
                ) : null}
                <div className="nhf-cat-img-placeholder" style={{ display: cat.image ? "none" : "flex" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              </div>

              {/* Body */}
              <div className="nhf-cat-body">
                <div className="nhf-cat-row">
                  <span className="nhf-cat-name">{cat.name}</span>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    {cat.showInWardrobe && (
                      <span className="nhf-tag nhf-tag-wardrobe">Wardrobe</span>
                    )}
                    {!cat.isActive && (
                      <span className="nhf-tag nhf-tag-inactive">Inactive</span>
                    )}
                  </div>
                </div>

                <p className="nhf-cat-desc">
                  {cat.description || <span style={{fontStyle:"italic",color:"#D4D0C8"}}>No description</span>}
                </p>

                {/* Wardrobe toggle */}
                <div style={{ marginBottom:12 }}>
                  <Toggle
                    checked={cat.showInWardrobe}
                    onChange={() => handleToggleWardrobe(cat)}
                    label="Show in Wardrobe"
                  />
                </div>

                {/* Actions */}
                <div className="nhf-cat-actions">
                  <button
                    className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                    style={{ flex:1 }}
                    onClick={() => setModal(cat)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    className="nhf-btn nhf-btn-danger nhf-btn-sm nhf-btn-icon"
                    disabled={deletingId === cat._id}
                    onClick={() => handleDelete(cat._id)}
                    title="Deactivate"
                  >
                    {deletingId === cat._id ? "…" : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────── */}
      {modal && (
        <CategoryModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

    </AdminShell>
  );
}
