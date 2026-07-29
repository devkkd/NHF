"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import { Pencil, Trash2, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 20;

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const debounceRef = useRef(null);

  // Load categories for filter dropdown
  useEffect(() => {
    apiFetch("/categories/admin/all?limit=100").then((res) => {
      if (res.ok) setAllCategories(res.data?.data?.categories ?? []);
    });
  }, []);

  const loadProducts = useCallback(async (pg, q, cat, active) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: pg, limit: LIMIT });
    if (q) params.set("search", q);
    if (cat) params.set("category", cat);
    if (active !== "") params.set("active", active);
    const res = await apiFetch(`/products/admin/all?${params}`);
    if (res.ok) {
      setProducts(res.data?.data?.products ?? []);
      setTotal(res.data?.data?.total ?? 0);
    } else {
      setError("Failed to load products.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts(page, search, categoryFilter, activeFilter);
  }, [page]); // eslint-disable-line

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadProducts(1, val, categoryFilter, activeFilter);
    }, 400);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategoryFilter(val);
    setPage(1);
    loadProducts(1, search, val, activeFilter);
  };

  const handleActiveChange = (e) => {
    const val = e.target.value;
    setActiveFilter(val);
    setPage(1);
    loadProducts(1, search, categoryFilter, val);
  };

  const handleDelete = async (id) => {
    const res = await apiFetch(`/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteConfirmId(null);
      loadProducts(page, search, categoryFilter, activeFilter);
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <AdminShell>
      <div className="nhf-page-header">
        <div>
          <h1 className="nhf-page-title">Products</h1>
          <p className="nhf-page-sub">{total} total</p>
        </div>
        <button
          className="nhf-btn nhf-btn-primary"
          onClick={() => router.push("/admin/products/new")}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="nhf-toolbar">
        <div className="nhf-toolbar-left">
          <div className="nhf-search-box">
            <Search size={13} color="#C0BAB0" />
            <input
              placeholder="Search products…"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, color: "#C0BAB0" }}
                onClick={() => { setSearch(""); loadProducts(1, "", categoryFilter, activeFilter); setPage(1); }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select className="nhf-filter-select" value={categoryFilter} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select className="nhf-filter-select" value={activeFilter} onChange={handleActiveChange}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="nhf-alert nhf-alert-error">{error}</div>}

      <div className="nhf-table-wrap">
        <table className="nhf-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Status</th>
              <th>Featured</th>
              <th>New Arrivals</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}>
                      <div className="nhf-skeleton nhf-skeleton-text" style={{ width: j === 0 ? 36 : "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="nhf-empty">
                    <div className="nhf-empty-icon"><Search size={22} /></div>
                    No products found.
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <>
                  <tr key={p._id}>
                    <td>
                      {p.mainImage ? (
                        <Image src={p.mainImage} alt={p.name} width={36} height={36} className="nhf-table-thumb" sizes="36px" />
                      ) : (
                        <div className="nhf-table-thumb-placeholder"><span style={{ fontSize: 10 }}>—</span></div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: 240 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    </td>
                    <td style={{ color: "var(--nhf-muted)", fontFamily: "monospace", fontSize: 11 }}>{p.sku || "—"}</td>
                    <td>{p.category?.name ?? <span style={{ color: "var(--nhf-muted)" }}>—</span>}</td>
                    <td>
                      <span className={`nhf-badge ${p.isActive ? "nhf-badge-green" : "nhf-badge-red"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {p.isFeatured
                        ? <span className="nhf-badge nhf-badge-olive">Yes</span>
                        : <span style={{ color: "var(--nhf-muted)", fontSize: 11 }}>No</span>
                      }
                    </td>
                    <td>
                      {p.showInNewArrivals
                        ? <span className="nhf-badge nhf-badge-olive">Yes</span>
                        : <span style={{ color: "var(--nhf-muted)", fontSize: 11 }}>No</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="nhf-btn nhf-btn-ghost nhf-btn-icon"
                          onClick={() => router.push(`/admin/products/${p._id}/edit`)}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="nhf-btn nhf-btn-danger nhf-btn-icon"
                          onClick={() => setDeleteConfirmId(p._id)}
                          title="Deactivate"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {deleteConfirmId === p._id && (
                    <tr key={`confirm-${p._id}`} className="nhf-confirm-row">
                      <td colSpan={8}>
                        <div className="nhf-confirm-actions">
                          <span style={{ fontSize: 12, color: "var(--nhf-text)" }}>
                            Deactivate <strong>{p.name}</strong>?
                          </span>
                          <button className="nhf-btn nhf-btn-danger nhf-btn-sm" onClick={() => handleDelete(p._id)}>
                            Confirm
                          </button>
                          <button className="nhf-btn nhf-btn-ghost nhf-btn-sm" onClick={() => setDeleteConfirmId(null)}>
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
    </AdminShell>
  );
}
