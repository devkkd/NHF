"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import ImageUploader from "@/components/admin/ImageUploader";
import { Plus, X, ArrowLeft } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  mainImage: "",
  galleryImages: [],
  colors: [],
  item: "",
  threadCount: "",
  fabric: "",
  material: "",
  size: "",
  gsm: "",
  usageApplication: "",
  bedSize: "",
  washType: "",
  packagingType: "",
  type: "",
  countryOfOrigin: "Made In India",
  cotton: "",
  handmade: "",
  design: "",
  description: "",
  moreInformation: "",
  features: [],
  materials: [],
  careInstructions: [],
  specs: [],
  isActive: true,
  isFeatured: false,
  showInNewArrivals: false,
  sortOrder: 0,
};

// ── Dynamic string-array editor (features, materials, care) ──
function ListEditor({ label, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, v) => onChange(items.map((item, idx) => idx === i ? v : item));

  return (
    <div className="nhf-form-group">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label className="nhf-form-label">{label}</label>
        <button type="button" className="nhf-btn nhf-btn-ghost nhf-btn-sm" onClick={add}>
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="nhf-list-editor">
        {items.map((item, i) => (
          <div key={i} className="nhf-list-item">
            <input
              className="nhf-form-input"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${label} item ${i + 1}`}
            />
            <button type="button" className="nhf-btn nhf-btn-danger nhf-btn-icon" onClick={() => remove(i)}>
              <X size={12} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--nhf-muted)" }}>No items yet. Click Add.</p>
        )}
      </div>
    </div>
  );
}

// ── Specs key-value editor ──
function SpecsEditor({ value, onChange }) {
  const specs = Array.isArray(value) ? value : [];
  const add = () => onChange([...specs, { label: "", value: "" }]);
  const remove = (i) => onChange(specs.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(specs.map((s, idx) => idx === i ? { ...s, [field]: v } : s));

  return (
    <div className="nhf-form-group">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label className="nhf-form-label">Specs (Key / Value)</label>
        <button type="button" className="nhf-btn nhf-btn-ghost nhf-btn-sm" onClick={add}>
          <Plus size={12} /> Add Row
        </button>
      </div>
      <div className="nhf-specs-editor">
        {specs.map((s, i) => (
          <div key={i} className="nhf-spec-row">
            <input
              className="nhf-form-input"
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label (e.g. Fabric)"
            />
            <input
              className="nhf-form-input"
              value={s.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="Value (e.g. Cotton)"
            />
            <button type="button" className="nhf-btn nhf-btn-danger nhf-btn-icon" onClick={() => remove(i)}>
              <X size={12} />
            </button>
          </div>
        ))}
        {specs.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--nhf-muted)" }}>No specs yet. Click Add Row.</p>
        )}
      </div>
    </div>
  );
}

// ── Colors editor (hex + optional name) ──
function ColorsEditor({ value, onChange }) {
  const colors = Array.isArray(value) ? value : [];
  const [newColor, setNewColor] = useState("#7B7F5C");
  const add = () => {
    if (newColor && !colors.includes(newColor)) {
      onChange([...colors, newColor]);
    }
  };
  const remove = (i) => onChange(colors.filter((_, idx) => idx !== i));

  return (
    <div className="nhf-form-group">
      <label className="nhf-form-label">Colours</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          style={{ width: 40, height: 34, padding: 2, border: "1px solid var(--nhf-border)", borderRadius: 6, cursor: "pointer" }}
        />
        <input
          className="nhf-form-input"
          style={{ maxWidth: 120 }}
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          placeholder="#7B7F5C"
        />
        <button type="button" className="nhf-btn nhf-btn-ghost nhf-btn-sm" onClick={add}>
          <Plus size={12} /> Add
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid var(--nhf-border)", borderRadius: 6, padding: "3px 8px" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontFamily: "monospace" }}>{c}</span>
            <button type="button" onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, color: "var(--nhf-muted)" }}>
              <X size={11} />
            </button>
          </div>
        ))}
        {colors.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--nhf-muted)" }}>No colours yet.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  // Load categories
  useEffect(() => {
    apiFetch("/categories/admin/all?limit=100").then((res) => {
      if (res.ok) setCategories(res.data?.data?.categories ?? []);
    });
  }, []);

  // Load product in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setLoading(true);
      // Fetch all and find by id — admin/all supports this
      const res = await apiFetch(`/products/admin/all?limit=200`);
      if (res.ok) {
        const found = (res.data?.data?.products ?? []).find((p) => p._id === productId);
        if (found) {
          setForm({
            name: found.name ?? "",
            sku: found.sku ?? "",
            category: found.category?._id ?? found.category ?? "",
            mainImage: found.mainImage ?? "",
            galleryImages: found.galleryImages ?? [],
            colors: found.colors ?? [],
            item: found.item ?? "",
            threadCount: found.threadCount ?? "",
            fabric: found.fabric ?? "",
            material: found.material ?? "",
            size: found.size ?? "",
            gsm: found.gsm ?? "",
            usageApplication: found.usageApplication ?? "",
            bedSize: found.bedSize ?? "",
            washType: found.washType ?? "",
            packagingType: found.packagingType ?? "",
            type: found.type ?? "",
            countryOfOrigin: found.countryOfOrigin ?? "Made In India",
            cotton: found.cotton ?? "",
            handmade: found.handmade ?? "",
            design: found.design ?? "",
            description: found.description ?? "",
            moreInformation: found.moreInformation ?? "",
            features: found.features ?? [],
            materials: found.materials ?? [],
            careInstructions: found.careInstructions ?? [],
            specs: found.specs ?? [],
            isActive: found.isActive ?? true,
            isFeatured: found.isFeatured ?? false,
            showInNewArrivals: found.showInNewArrivals ?? false,
            sortOrder: found.sortOrder ?? 0,
          });
        } else {
          setError("Product not found.");
        }
      } else {
        setError("Failed to load product.");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setNameError("Product name is required."); return; }
    setNameError("");
    setSubmitting(true);
    setError("");

    const body = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      // filter out empty spec rows
      specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
      features: form.features.filter((f) => f.trim()),
      materials: form.materials.filter((m) => m.trim()),
      careInstructions: form.careInstructions.filter((c) => c.trim()),
    };

    const res = isEdit
      ? await apiFetch(`/products/${productId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      setError(res.data?.error || "Save failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <AdminShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "var(--nhf-muted)", fontSize: 13 }}>
          <svg className="nhf-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          &nbsp; Loading…
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle={isEdit ? "Edit Product" : "New Product"}>
      <div className="nhf-page-header">
        <div>
          <button
            type="button"
            className="nhf-btn nhf-btn-ghost nhf-btn-sm"
            onClick={() => router.push("/admin/products")}
            style={{ marginBottom: 8 }}
          >
            <ArrowLeft size={13} /> Back to Products
          </button>
          <h1 className="nhf-page-title">{isEdit ? "Edit Product" : "Add Product"}</h1>
        </div>
      </div>

      {error && <div className="nhf-alert nhf-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* ── SECTION: Basic Info ── */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Basic Information</div>

          <div className="nhf-form-group" style={{ marginBottom: 16 }}>
            <label className="nhf-form-label">Product Name *</label>
            <input
              className={`nhf-form-input${nameError ? " error" : ""}`}
              value={form.name}
              onChange={(e) => { set("name", e.target.value); setNameError(""); }}
              placeholder="e.g. Percal Hand Block Cotton Bed Sheet"
              autoFocus
            />
            {nameError && <div className="nhf-form-error">{nameError}</div>}
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">SKU</label>
              <input className="nhf-form-input" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. HBBS-04" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Category</label>
              <select className="nhf-form-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">— Select Category —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Sort Order</label>
              <input type="number" className="nhf-form-input" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} min={0} />
            </div>
            <div className="nhf-form-group" style={{ justifyContent: "flex-end", gap: 14, flexDirection: "row", flexWrap: "wrap", paddingTop: 20 }}>
              <label className="nhf-toggle">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                <span className="nhf-toggle-track" /> Active
              </label>
              <label className="nhf-toggle">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
                <span className="nhf-toggle-track" /> Featured
              </label>
              <label className="nhf-toggle">
                <input type="checkbox" checked={form.showInNewArrivals} onChange={(e) => set("showInNewArrivals", e.target.checked)} />
                <span className="nhf-toggle-track" /> New Arrivals
              </label>
            </div>
          </div>
        </div>

        {/* ── SECTION: Images ── */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Images</div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Main Image</label>
              <ImageUploader
                value={form.mainImage}
                onChange={(url) => set("mainImage", url)}
                folder="products"
              />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Gallery Images (up to 4)</label>
              <ImageUploader
                value={form.galleryImages}
                onChange={(urls) => set("galleryImages", urls)}
                multiple
                folder="products"
              />
              <p style={{ fontSize: 10, color: "var(--nhf-muted)", marginTop: 4 }}>Add multiple images — shown in product detail gallery</p>
            </div>
          </div>

          <ColorsEditor value={form.colors} onChange={(v) => set("colors", v)} />
        </div>

        {/* ── SECTION: Specs & Attributes ── */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Specs & Attributes</div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Item</label>
              <input className="nhf-form-input" value={form.item} onChange={(e) => set("item", e.target.value)} placeholder="e.g. 100% HAND BLOCK COTTON" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Thread Count</label>
              <input className="nhf-form-input" value={form.threadCount} onChange={(e) => set("threadCount", e.target.value)} placeholder="e.g. 210 TC" />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Fabric</label>
              <input className="nhf-form-input" value={form.fabric} onChange={(e) => set("fabric", e.target.value)} placeholder="e.g. Cotton" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Material</label>
              <input className="nhf-form-input" value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="e.g. Cotton" />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Size</label>
              <input className="nhf-form-input" value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="e.g. 93x108" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">GSM</label>
              <input className="nhf-form-input" value={form.gsm} onChange={(e) => set("gsm", e.target.value)} placeholder="e.g. 210" />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Usage / Application</label>
              <input className="nhf-form-input" value={form.usageApplication} onChange={(e) => set("usageApplication", e.target.value)} placeholder="e.g. Home" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Bed Size</label>
              <input className="nhf-form-input" value={form.bedSize} onChange={(e) => set("bedSize", e.target.value)} placeholder="e.g. Double" />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Wash Type</label>
              <input className="nhf-form-input" value={form.washType} onChange={(e) => set("washType", e.target.value)} placeholder="e.g. Hand Wash" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Packaging Type</label>
              <input className="nhf-form-input" value={form.packagingType} onChange={(e) => set("packagingType", e.target.value)} placeholder="e.g. Each Item Packed Separately" />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Type</label>
              <input className="nhf-form-input" value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="e.g. BEDSHEET" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Country of Origin</label>
              <input className="nhf-form-input" value={form.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)} />
            </div>
          </div>

          <div className="nhf-form-row" style={{ marginBottom: 16 }}>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Cotton</label>
              <input className="nhf-form-input" value={form.cotton} onChange={(e) => set("cotton", e.target.value)} placeholder="e.g. Yes" />
            </div>
            <div className="nhf-form-group">
              <label className="nhf-form-label">Handmade</label>
              <input className="nhf-form-input" value={form.handmade} onChange={(e) => set("handmade", e.target.value)} placeholder="e.g. Yes" />
            </div>
          </div>

          <div className="nhf-form-group" style={{ marginBottom: 16 }}>
            <label className="nhf-form-label">Design</label>
            <input className="nhf-form-input" value={form.design} onChange={(e) => set("design", e.target.value)} placeholder="e.g. Printed" />
          </div>

          <SpecsEditor value={form.specs} onChange={(v) => set("specs", v)} />
        </div>

        {/* ── SECTION: Description ── */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Description & Information</div>

          <div className="nhf-form-group" style={{ marginBottom: 16 }}>
            <label className="nhf-form-label">Description</label>
            <textarea
              className="nhf-form-textarea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Product description…"
              rows={4}
            />
          </div>

          <div className="nhf-form-group">
            <label className="nhf-form-label">More Information</label>
            <textarea
              className="nhf-form-textarea"
              value={form.moreInformation}
              onChange={(e) => set("moreInformation", e.target.value)}
              placeholder="Additional information about the product…"
              rows={4}
            />
          </div>
        </div>

        {/* ── SECTION: Lists ── */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Features, Materials & Care</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ListEditor label="Features" value={form.features} onChange={(v) => set("features", v)} />
            <ListEditor label="Materials" value={form.materials} onChange={(v) => set("materials", v)} />
            <ListEditor label="Care Instructions" value={form.careInstructions} onChange={(v) => set("careInstructions", v)} />
          </div>
        </div>

        {/* ── Submit ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 48 }}>
          <button type="button" className="nhf-btn nhf-btn-ghost" onClick={() => router.push("/admin/products")}>
            Cancel
          </button>
          <button type="submit" className="nhf-btn nhf-btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
