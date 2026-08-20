"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "./AdminShell";
import { Upload, X, Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken");
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

async function uploadImage(file) {
  const { data } = await apiFetch("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ mimeType: file.type, fileSize: file.size, folder: "new-arrivals" }),
  });
  await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return data.publicUrl;
}

// ── Image upload field ────────────────────────────────────────
function ImageField({ label, value, onChange, aspect = "16/9" }) {
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
        style={{ aspectRatio: aspect, minHeight: 100 }}
        onClick={() => !value && inputRef.current?.click()}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 size={20} className="animate-spin text-[#7B7F5C]" />
          </div>
        )}
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                <Upload size={11} /> Change
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="bg-white text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                <X size={11} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
            <Upload size={18} />
            <p className="text-xs">Click to upload</p>
          </div>
        )}
      </div>
      {!value && (
        <input className="nhf-input w-full text-xs" placeholder="Or paste image URL"
          onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }} />
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function AdminNewArrivalsSection() {
  const [form, setForm] = useState({
    heading: "", paragraph: "", cardImage: "", cardTitle: "", bigImage: "", isActive: true,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    apiFetch("/new-arrivals-section/admin")
      .then(({ data }) => { if (data) setForm(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch("/new-arrivals-section/admin", { method: "POST", body: JSON.stringify(form) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell pageTitle="New Arrivals Section">
      <style>{`
        .nhf-input { border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; outline:none; transition:border-color 0.15s; background:#fff; }
        .nhf-input:focus { border-color:#7B7F5C; }
        .nhf-btn-primary { background:#7B7F5C; color:#fff; border:none; border-radius:8px; padding:10px 24px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s; display:flex; align-items:center; gap:6px; }
        .nhf-btn-primary:hover { background:#636749; }
        .nhf-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">New Arrivals Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Edit the "A Home Is A Feeling" section on the homepage</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">
            <Loader2 size={26} className="animate-spin" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">

            {/* Heading */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Section Heading
              </label>
              <textarea rows={2} className="nhf-input mt-1 w-full resize-none"
                placeholder={"A HOME IS A FEELING,\nWE HELP YOU BUILD IT."}
                value={form.heading}
                onChange={(e) => set("heading", e.target.value)} />
              <p className="text-[11px] text-gray-400 mt-1">Use new line for line break</p>
            </div>

            {/* Paragraph */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paragraph Text</label>
              <textarea rows={5} className="nhf-input mt-1 w-full resize-y"
                placeholder="The morning light through a window..."
                value={form.paragraph}
                onChange={(e) => set("paragraph", e.target.value)} />
            </div>

            {/* Card Image + Card Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageField label="Product Card Image" value={form.cardImage}
                onChange={(v) => set("cardImage", v)} aspect="3/4" />
              <div className="space-y-1 flex flex-col justify-end">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Card Title</label>
                <input className="nhf-input w-full"
                  placeholder="Hand Block Percale Printed Bedsheet"
                  value={form.cardTitle}
                  onChange={(e) => set("cardTitle", e.target.value)} />
              </div>
            </div>

            {/* Big Image */}
            <ImageField label="Large Right Image" value={form.bigImage}
              onChange={(v) => set("bigImage", v)} aspect="16/10" />

            {/* Active */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section Active</label>
              <button type="button" onClick={() => set("isActive", !form.isActive)}
                className={`transition-colors ${form.isActive ? "text-[#7B7F5C]" : "text-gray-300"}`}>
                {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2 border-t">
              <button type="submit" disabled={saving} className="nhf-btn-primary">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saved && <span className="text-sm text-[#7B7F5C] font-medium">✓ Saved successfully</span>}
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
