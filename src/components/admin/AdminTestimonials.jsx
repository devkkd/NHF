"use client";

import { useState, useEffect } from "react";
import AdminShell from "./AdminShell";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, X, Loader2, MessageSquare } from "lucide-react";

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

// ── Modal ─────────────────────────────────────────────────────
function Modal({ item, onClose, onSave }) {
  const empty = { quote: "", name: "", location: "", isActive: true, order: 0 };
  const [form, setForm] = useState(item || empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            {item?._id ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Quote */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote *</label>
            <textarea
              required rows={4}
              className="nhf-input mt-1 w-full resize-none"
              placeholder="The kantha bedcover arrived and..."
              value={form.quote}
              onChange={(e) => set("quote", e.target.value)}
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name *</label>
            <input required className="nhf-input mt-1 w-full" placeholder="Sophie R."
              value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
            <input className="nhf-input mt-1 w-full" placeholder="London, UK"
              value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>

          {/* Order + Active */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</label>
              <input type="number" min={0} className="nhf-input mt-1 w-full"
                value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</label>
              <button type="button" onClick={() => set("isActive", !form.isActive)}
                className={`transition-colors ${form.isActive ? "text-[#7B7F5C]" : "text-gray-300"}`}>
                {form.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
            </div>
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
export default function AdminTestimonials() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  const load = async () => {
    try { const { data } = await apiFetch("/testimonials/admin"); setItems(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    if (form._id) await apiFetch(`/testimonials/admin/${form._id}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/testimonials/admin", { method: "POST", body: JSON.stringify(form) });
    await load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await apiFetch(`/testimonials/admin/${id}`, { method: "DELETE" });
    await load();
  };

  const toggle = async (id) => {
    await apiFetch(`/testimonials/admin/${id}/toggle`, { method: "PATCH" });
    await load();
  };

  return (
    <AdminShell pageTitle="Testimonials">
      <style>{`
        .nhf-input { border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; outline:none; transition:border-color 0.15s; background:#fff; width:100%; }
        .nhf-input:focus { border-color:#7B7F5C; }
        .nhf-btn-primary { background:#7B7F5C; color:#fff; border:none; border-radius:8px; padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .nhf-btn-primary:hover { background:#636749; }
        .nhf-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
        .nhf-btn-outline { background:transparent; color:#374151; border:1px solid #d1d5db; border-radius:8px; padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer; }
        .nhf-btn-outline:hover { border-color:#9ca3af; }
      `}</style>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Testimonials</h1>
            <p className="text-sm text-gray-500 mt-0.5">Customer reviews shown on homepage</p>
          </div>
          <button onClick={() => setModal("new")} className="nhf-btn-primary flex items-center gap-2">
            <Plus size={14} /> Add Testimonial
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">
            <Loader2 size={26} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center h-52 text-gray-400">
            <MessageSquare size={32} className="mb-2 opacity-40" />
            <p className="text-sm">No testimonials yet</p>
            <button onClick={() => setModal("new")} className="mt-2 text-sm text-[#7B7F5C] hover:underline flex items-center gap-1">
              <Plus size={12} /> Add first testimonial
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id}
                className={`flex items-start gap-4 bg-white border rounded-xl p-4 shadow-sm transition-opacity ${!item.isActive ? "opacity-50" : ""}`}>
                {/* Order badge */}
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded mt-0.5 flex-shrink-0">
                  #{item.order}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2 italic">&quot;{item.quote}&quot;</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                    {item.location && (
                      <span className="text-xs text-gray-400">· {item.location}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
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
