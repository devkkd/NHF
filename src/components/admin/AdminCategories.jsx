"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import ImageUploader from "@/components/admin/ImageUploader";
import { Pencil, Trash2, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 20;

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  parent: "",
  showInWardrobe: false,
  showInFooter: true,
  isActive: true,
  sortOrder: 0,
};

export default function AdminCategories() {
  // ── List state ──────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // ── Modal state ─────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ── Delete confirm ──────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Parent categories for dropdown ──────────────────────────
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    // Load all active parent categories (no parent set) for dropdown
    apiFetch("/categories?limit=100")
      .then((res) => {
        const all = res.data?.data?.categories ?? [];
        setParentOptions(all.filter((c) => !c.parent));
      })
      .catch(() => {});
  }, []);

  // ── Fetch ────────────────────────────────────────────────────
  const loadCategories = useCallback(async (pg, q) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: pg, limit: LIMIT });
    if (q) params.set("search", q);
    const res = await apiFetch(`/categories/admin/all?${params}`);
    if (res.ok) {
      setCategories(res.data?.data?.categories ?? []);
      setTotal(res.data?.data?.total ?? 0);
    } else {
      setError("Failed to load categories.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(page, search); }, [page]); // eslint-disable-line

  // ── Search debounce ──────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadCategories(1, val);
    }, 400);
  };

  // ── Escape key to close modal ───────────────────────────────
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  // ── Modal helpers ────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setEditingId(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name ?? "",
      description: cat.description ?? "",
      image: cat.image ?? "",
      parent: cat.parent ?? "",
      showInWardrobe: cat.showInWardrobe ?? false,
      showInFooter: cat.showInFooter ?? true,
      isActive: cat.isActive ?? true,
      sortOrder: cat.sortOrder ?? 0,
    });
    setFormError("");
    setEditingId(cat._id);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ── Form submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    setFormSubmitting(true);
    setFormError("");
    const body = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      parent: form.parent || null,
    };
    const res = modalMode === "create"
      ? await apiFetch("/categories", { method: "POST", body: JSON.stringify(body) })
      : await apiFetch(`/categories/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
    if (res.ok) {
      closeModal();
      loadCategories(page, search);
    } else {
      setFormError(res.data?.error || "Save failed.");
    }
    setFormSubmitting(false);
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const res = await apiFetch(`/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteConfirmId(null);
      loadCategories(page, search);
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <AdminShell>
      {/* Page header */}
      <div className="nhf-page-header">
        <div>
          <h1 className="nhf-page-title">Categories</h1>
          <p className="nhf-page-sub">{total} total</p>
        </div>
        <button className="nhf-btn nhf-btn-primary" onClick={openCreate}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="nhf-toolbar">
        <div className="nhf-toolbar-left">
          <div className="nhf-search-box">
            <Search size={13} color="#C0BAB0" />
            <input
              placeholder="Search categories…"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, color: "#C0BAB0" }}
                onClick={() => { setSearch(""); loadCategories(1, ""); setPage(1); }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="nhf-alert nhf-alert-error">{error}</div>}

      {/* Table */}
      <div className="nhf-table-wrap">
        <table className="nhf-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Wardrobe</th>
              <th>Status</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}>
                      <div className="nhf-skeleton nhf-skeleton-text" style={{ width: j === 0 ? 36 : "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="nhf-empty">
                    <div className="nhf-empty-icon">
                      <Search size={22} />
                    </div>
                    No categories found.
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <>
                  <tr key={cat._id}>
                    <td>
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={36}
                          height={36}
                          className="nhf-table-thumb"
                          sizes="36px"
                        />
                      ) : (
                        <div className="nhf-table-thumb-placeholder">
                          <span style={{ fontSize: 10 }}>—</span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: "var(--nhf-muted)", fontFamily: "monospace", fontSize: 11 }}>{cat.slug}</td>
                    <td>
                      {cat.showInWardrobe
                        ? <span className="nhf-badge nhf-badge-olive">Wardrobe</span>
                        : <span style={{ color: "var(--nhf-muted)", fontSize: 11 }}>—</span>
                      }
                    </td>
                    <td>
                      <span className={`nhf-badge ${cat.isActive ? "nhf-badge-green" : "nhf-badge-red"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ color: "var(--nhf-muted)" }}>{cat.sortOrder}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="nhf-btn nhf-btn-ghost nhf-btn-icon"
                          onClick={() => openEdit(cat)}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="nhf-btn nhf-btn-danger nhf-btn-icon"
                          onClick={() => setDeleteConfirmId(cat._id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {deleteConfirmId === cat._id && (
                    <tr key={`confirm-${cat._id}`} className="nhf-confirm-row">
                      <td colSpan={7}>
                        <div className="nhf-confirm-actions">
                          <span style={{ fontSize: 12, color: "var(--nhf-text)" }}>
                            Deactivate <strong>{cat.name}</strong>?
                          </span>
                          <button
                            className="nhf-btn nhf-btn-danger nhf-btn-sm"
                            onClick={() => handleDelete(cat._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="nhf-pagination">
            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span>Page {page} of {pages}</span>
            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="nhf-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="nhf-modal" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
            <div className="nhf-modal-head">
              <h2 className="nhf-modal-title" id="cat-modal-title">
                {modalMode === "create" ? "Add Category" : "Edit Category"}
              </h2>
              <button className="nhf-modal-close" onClick={closeModal} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <form className="nhf-modal-body" onSubmit={handleSubmit}>
              {formError && <div className="nhf-alert nhf-alert-error">{formError}</div>}

              <div className="nhf-form-group">
                <label className="nhf-form-label">Name *</label>
                <input
                  className={`nhf-form-input${formError && !form.name.trim() ? " error" : ""}`}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bed Sheets"
                  autoFocus
                />
              </div>

              <div className="nhf-form-group">
                <label className="nhf-form-label">Description</label>
                <textarea
                  className="nhf-form-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description…"
                  rows={2}
                />
              </div>

              <div className="nhf-form-group">
                <label className="nhf-form-label">Image</label>
                <ImageUploader
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  folder="categories"
                />
              </div>

              <div className="nhf-form-group">
                <label className="nhf-form-label">Parent Category</label>
                <select
                  className="nhf-form-input"
                  value={form.parent}
                  onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                >
                  <option value="">— None (top-level category) —</option>
                  {parentOptions
                    .filter((p) => p._id !== editingId) // can't be own parent
                    .map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  Select a parent to make this a subcategory shown in footer
                </p>
              </div>

              <div className="nhf-form-row">
                <div className="nhf-form-group">
                  <label className="nhf-form-label">Sort Order</label>
                  <input
                    type="number"
                    className="nhf-form-input"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    min={0}
                  />
                </div>
                <div className="nhf-form-group" style={{ justifyContent: "flex-end", gap: 12 }}>
                  <label className="nhf-toggle">
                    <input
                      type="checkbox"
                      checked={form.showInWardrobe}
                      onChange={(e) => setForm((f) => ({ ...f, showInWardrobe: e.target.checked }))}
                    />
                    <span className="nhf-toggle-track" />
                    Show in Wardrobe
                  </label>
                  <label className="nhf-toggle">
                    <input
                      type="checkbox"
                      checked={form.showInFooter}
                      onChange={(e) => setForm((f) => ({ ...f, showInFooter: e.target.checked }))}
                    />
                    <span className="nhf-toggle-track" />
                    Show in Footer
                  </label>
                  <label className="nhf-toggle">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    <span className="nhf-toggle-track" />
                    Active
                  </label>
                </div>
              </div>

              <div className="nhf-form-footer">
                <button type="button" className="nhf-btn nhf-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="nhf-btn nhf-btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Saving…" : modalMode === "create" ? "Create" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
