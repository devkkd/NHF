"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "./AdminShell";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, X, Upload, Loader2, ImageIcon } from "lucide-react";

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

async function uploadImage(file) {
  const { data } = await apiFetch("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ mimeType: file.type, fileSize: file.size, folder: "showcase" }),
  });
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  return data.publicUrl;
}

// ── Single image upload field ─────────────────────────────────
function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handle = async (file) => {
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadImage(file)); }
    catch (e) { alert("Upload failed: " + e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div
        className="relative w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#7B7F5C] transition-colors cursor-pointer"
        style={{ aspectRatio: "16/7", minHeight: 100 }}
        onClick={() => !value && inputRef.current?.click()}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 size={22} className="animate-spin text-[#7B7F5C]" />
          </div>
        )}
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                <Upload size={12} /> Change
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="bg-white text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                <X size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
            <Upload size={20} />
            <p className="text-xs">Click to upload</p>
          </div>
        )}
      </div>
      {!value && (
        <input className="nhf-input w-full text-xs" placeholder="Or paste URL"
          onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }} />
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ item, onClose, onSave }) {
  const empty = { title: "", productName: "", bgImage: "", cardImage: "", isActive: true };
  const [form, setForm] = useState(item || empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bgImage || !form.cardImage) return alert("Please upload both images.");
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            {item?._id ? "Edit Showcase Banner" : "New Showcase Banner"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Title *</label>
            <input required className="nhf-input mt-1 w-full" placeholder="e.g. Bedsheet Showcase"
              value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          {/* Product Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name (shown on card) *</label>
            <input required className="nhf-input mt-1 w-full" placeholder="Hand Block Percale Printed Bedsheet"
              value={form.productName} onChange={(e) => set("productName", e.target.value)} />
          </div>

          {/* BG Image */}
          <ImageField label="Background Image *" value={form.bgImage} onChange={(v) => set("bgImage", v)} />

          {/* Card Image */}
          <ImageField label="Card Image *" value={form.cardImage} onChange={(v) => set("cardImage", v)} />

          {/* Active */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</label>
            <button type="button" onClick={() => set("isActive", !form.isActive)}
              className={`transition-colors ${form.isActive ? "text-[#7B7F5C]" : "text-gray-300"}`}>
              {form.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="nhf-btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="nhf-btn-primary flex items-center gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AdminShowcaseBanner() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);

  const load = async () => {
    try { const { data } = await apiFetch("/showcase-banner/admin"); setItems(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    if (form._id) await apiFetch(`/showcase-banner/admin/${form._id}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/showcase-banner/admin", { method: "POST", body: JSON.stringify(form) });
    await load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this showcase banner?")) return;
    await apiFetch(`/showcase-banner/admin/${id}`, { method: "DELETE" });
    await load();
  };

  const toggle = async (id) => {
    await apiFetch(`/showcase-banner/admin/${id}/toggle`, { method: "PATCH" });
    await load();
  };

  return (
    <AdminShell pageTitle="Showcase Banner">
      <style>{`
        .nhf-input { border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; outline:none; transition:border-color 0.15s; background:#fff; }
        .nhf-input:focus { border-color:#7B7F5C; }
        .nhf-btn-primary { background:#7B7F5C; color:#fff; border:none; border-radius:8px; padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .nhf-btn-primary:hover { background:#636749; }
        .nhf-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
        .nhf-btn-outline { background:transparent; color:#374151; border:1px solid #d1d5db; border-radius:8px; padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer; }
        .nhf-btn-outline:hover { border-color:#9ca3af; }
      `}</style>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Showcase Banner</h1>
            <p className="text-sm text-gray-500 mt-0.5">The product spotlight section on homepage</p>
          </div>
          <button onClick={() => setModal("new")} className="nhf-btn-primary flex items-center gap-2">
            <Plus size={14} /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">
            <Loader2 size={26} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center h-52 text-gray-400">
            <ImageIcon size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No showcase banner yet</p>
            <button onClick={() => setModal("new")} className="mt-2 text-sm text-[#7B7F5C] hover:underline flex items-center gap-1">
              <Plus size={12} /> Create one
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id}
                className={`flex items-center gap-4 bg-white border rounded-xl p-3 shadow-sm ${!item.isActive ? "opacity-50" : ""}`}>
                {/* BG thumb */}
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {item.bgImage
                    ? <img src={item.bgImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-gray-300" /></div>}
                </div>
                {/* Card thumb */}
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border">
                  {item.cardImage
                    ? <img src={item.cardImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{item.productName}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggle(item._id)} title={item.isActive ? "Deactivate" : "Activate"}
                    className={`p-1.5 rounded-lg transition-colors ${item.isActive ? "text-[#7B7F5C] hover:bg-[#7B7F5C]/10" : "text-gray-300 hover:bg-gray-100"}`}>
                    {item.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => setModal(item)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => remove(item._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <p className="mt-4 text-xs text-gray-400">
          💡 Only the latest <strong>active</strong> banner is shown on the homepage.
        </p>
      </div>

      {modal && (
        <Modal
          item={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </AdminShell>
  );
}
