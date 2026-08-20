"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "./AdminShell";
import { Image as ImageIcon, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, GripVertical, X, Upload, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken");
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

// ── Upload image to R2 via presign ───────────────────────────
async function uploadImage(file) {
  const { data } = await apiFetch("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ mimeType: file.type, fileSize: file.size, folder: "banners" }),
  });
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return data.publicUrl;
}

// ── Empty banner template ─────────────────────────────────────
const emptyBanner = () => ({
  title: "",
  headline: "",
  subtext: "",
  image: "",
  isActive: true,
  order: 0,
  buttons: [
    { label: "Explore The Collection", href: "/collection", style: "primary" },
    { label: "Our Story", href: "/our-story", style: "secondary" },
  ],
});

// ── Button row editor ─────────────────────────────────────────
function ButtonEditor({ buttons, onChange }) {
  const update = (i, key, val) => {
    const next = buttons.map((b, idx) => (idx === i ? { ...b, [key]: val } : b));
    onChange(next);
  };
  const add = () => onChange([...buttons, { label: "", href: "/", style: "primary" }]);
  const remove = (i) => onChange(buttons.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Buttons</label>
      {buttons.map((btn, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="nhf-input flex-1"
            placeholder="Label"
            value={btn.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <input
            className="nhf-input flex-1"
            placeholder="Link e.g. /collection"
            value={btn.href}
            onChange={(e) => update(i, "href", e.target.value)}
          />
          <select
            className="nhf-input w-28"
            value={btn.style}
            onChange={(e) => update(i, "style", e.target.value)}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {buttons.length < 4 && (
        <button type="button" onClick={add} className="text-xs text-[#7B7F5C] hover:underline flex items-center gap-1 mt-1">
          <Plus size={12} /> Add Button
        </button>
      )}
    </div>
  );
}

// ── Image uploader ────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handle = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner Image</label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => !value && inputRef.current?.click()}
        className={`relative w-full rounded-lg overflow-hidden border-2 border-dashed transition-colors
          ${drag ? "border-[#7B7F5C] bg-[#f0f2e8]" : "border-gray-200 hover:border-[#7B7F5C]"}
          ${value ? "cursor-default" : "cursor-pointer"}`}
        style={{ aspectRatio: "16/6", minHeight: 120 }}
      >
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 size={24} className="animate-spin text-[#7B7F5C]" />
          </div>
        )}

        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="banner preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Change / Remove overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
              >
                <Upload size={12} /> Change
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="bg-white text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
              >
                <X size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
            <Upload size={22} />
            <p className="text-xs">Click or drag image here</p>
            <p className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      {/* URL input — only show when no image */}
      {!value && (
        <input
          className="nhf-input w-full text-xs"
          placeholder="Or paste image URL directly"
          onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Banner Form Modal ─────────────────────────────────────────
function BannerModal({ banner, onClose, onSave }) {
  const [form, setForm] = useState(banner || emptyBanner());
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Please upload or provide a banner image.");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {banner?._id ? "Edit Banner" : "New Banner"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Internal title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Title *</label>
            <input
              required
              className="nhf-input mt-1 w-full"
              placeholder="e.g. Summer Sale Banner"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Image */}
          <ImageUploader value={form.image} onChange={(v) => set("image", v)} />

          {/* Headline */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Headline *</label>
            <input
              required
              className="nhf-input mt-1 w-full"
              placeholder="Every Thread Carries A Story..."
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
          </div>

          {/* Subtext */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtext</label>
            <textarea
              rows={2}
              className="nhf-input mt-1 w-full resize-none"
              placeholder="Short description below the headline..."
              value={form.subtext}
              onChange={(e) => set("subtext", e.target.value)}
            />
          </div>

          {/* Buttons */}
          <ButtonEditor buttons={form.buttons} onChange={(v) => set("buttons", v)} />

          {/* Order + Active */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</label>
              <input
                type="number"
                min={0}
                className="nhf-input mt-1 w-full"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`transition-colors ${form.isActive ? "text-[#7B7F5C]" : "text-gray-300"}`}
              >
                {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="nhf-btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="nhf-btn-primary flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminBannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | banner object

  const load = async () => {
    try {
      const { data } = await apiFetch("/banners/admin");
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    if (form._id) {
      await apiFetch(`/banners/admin/${form._id}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await apiFetch("/banners/admin", { method: "POST", body: JSON.stringify(form) });
    }
    await load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await apiFetch(`/banners/admin/${id}`, { method: "DELETE" });
    await load();
  };

  const toggle = async (id) => {
    await apiFetch(`/banners/admin/${id}/toggle`, { method: "PATCH" });
    await load();
  };

  return (
    <AdminShell pageTitle="Banners">
      <style>{`
        .nhf-input {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          background: #fff;
        }
        .nhf-input:focus { border-color: #7B7F5C; }
        .nhf-btn-primary {
          background: #7B7F5C;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .nhf-btn-primary:hover { background: #636749; }
        .nhf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .nhf-btn-outline {
          background: transparent;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .nhf-btn-outline:hover { border-color: #9ca3af; }
      `}</style>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Hero Banners</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage homepage hero slides</p>
          </div>
          <button
            onClick={() => setModal("new")}
            className="nhf-btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> Add Banner
          </button>
        </div>

        {/* Banner List */}
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center h-56 text-gray-400">
            <ImageIcon size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No banners yet</p>
            <button onClick={() => setModal("new")} className="mt-3 text-sm text-[#7B7F5C] hover:underline flex items-center gap-1">
              <Plus size={13} /> Create your first banner
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((b) => (
              <div
                key={b._id}
                className={`flex items-center gap-4 bg-white border rounded-xl p-3 shadow-sm transition-opacity ${!b.isActive ? "opacity-50" : ""}`}
              >
                {/* Drag handle */}
                <GripVertical size={16} className="text-gray-300 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{b.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{b.headline}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {b.buttons?.map((btn, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${btn.style === "primary" ? "bg-[#7B7F5C]/10 border-[#7B7F5C]/30 text-[#7B7F5C]" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                        {btn.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Order badge */}
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded hidden sm:block">
                  #{b.order}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggle(b._id)}
                    title={b.isActive ? "Deactivate" : "Activate"}
                    className={`p-1.5 rounded-lg transition-colors ${b.isActive ? "text-[#7B7F5C] hover:bg-[#7B7F5C]/10" : "text-gray-300 hover:bg-gray-100"}`}
                  >
                    {b.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => setModal(b)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => remove(b._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <BannerModal
          banner={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </AdminShell>
  );
}
