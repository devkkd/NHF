"use client";

import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

/* ── Data ─────────────────────────────────────────────────── */
const STATS = [
  {
    label: "Total Products", value: "124", change: "+8 this month", up: true,
    color: "#7B7F5C", bg: "rgba(123,127,92,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  },
  {
    label: "New Enquiries", value: "18", change: "+5 this week", up: true,
    color: "#9A7040", bg: "rgba(154,112,64,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    label: "Bulk Orders", value: "7", change: "+2 this week", up: true,
    color: "#3D7A5C", bg: "rgba(61,122,92,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    label: "New Arrivals", value: "12", change: "Updated 2 days ago", up: null,
    color: "#7060A0", bg: "rgba(112,96,160,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
];

const ENQUIRIES = [
  { id: 1, name: "Priya Sharma",   email: "priya@example.com",  type: "Bulk Order",    date: "27 Jun 2026", status: "new"         },
  { id: 2, name: "Rahul Mehta",    email: "rahul@example.com",  type: "Customization", date: "26 Jun 2026", status: "in-progress" },
  { id: 3, name: "Anita Kapoor",   email: "anita@example.com",  type: "General",       date: "25 Jun 2026", status: "resolved"    },
  { id: 4, name: "Vikram Singh",   email: "vikram@example.com", type: "Wardrobe",      date: "25 Jun 2026", status: "new"         },
  { id: 5, name: "Sunita Agarwal", email: "sunita@example.com", type: "Bulk Order",    date: "24 Jun 2026", status: "new"         },
];

const PRODUCTS = [
  { id: 1, name: "Hand Block Percale Bedsheet",   cat: "Bedsheets",  stock: 42, status: "active" },
  { id: 2, name: "Kantha Quilt — Vintage Indigo", cat: "Quilts",     stock: 18, status: "active" },
  { id: 3, name: "Cotton Kaftan — Block Print",   cat: "Kaftans",    stock: 0,  status: "out"    },
  { id: 4, name: "Organdi Bed Cover — White",     cat: "Bed Covers", stock: 9,  status: "active" },
  { id: 5, name: "Velvet Tote Bag — Mustard",     cat: "Bags",       stock: 31, status: "active" },
];

const PILL = {
  new:          { bg: "rgba(123,127,92,0.14)", color: "#4A5230", text: "New"          },
  "in-progress":{ bg: "rgba(154,112,64,0.14)", color: "#7A5020", text: "In Progress"  },
  resolved:     { bg: "rgba(61,122,92,0.14)",  color: "#1E6040", text: "Resolved"     },
  active:       { bg: "rgba(123,127,92,0.14)", color: "#4A5230", text: "Active"       },
  out:          { bg: "rgba(224,82,82,0.10)",  color: "#b91c1c", text: "Out of Stock" },
};

function Pill({ status }) {
  const s = PILL[status] ?? PILL.new;
  return (
    <span className="nhf-pill" style={{ background: s.bg, color: s.color }}>
      {s.text}
    </span>
  );
}

const QUICK = [
  {
    label: "Add Product", href: "/admin/products/new",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  },
  {
    label: "Enquiries", href: "/admin/enquiries",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    label: "New Arrivals", href: "/admin/new-arrivals",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    label: "Settings", href: "/admin/settings",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  },
];

/* ── Component ────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAdminAuthContext();

  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Admin";
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AdminShell pageTitle="Dashboard">

      {/* ── Page header ──────────────────────────────── */}
      <div className="nhf-dash-header">
        <div>
          <h1 className="nhf-dash-title">{greeting}, {firstName} 👋</h1>
          <p className="nhf-dash-sub">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="nhf-dash-date">{dateStr}</div>
      </div>

      {/* ── Stats ────────────────────────────────────── */}
      <div className="nhf-stats">
        {STATS.map((s) => (
          <div key={s.label} className="nhf-stat">
            <div className="nhf-stat-head">
              <span className="nhf-stat-label">{s.label}</span>
              <div className="nhf-stat-ico" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="nhf-stat-val">{s.value}</div>
            <div
              className="nhf-stat-change"
              style={{ color: s.up === true ? "#3D7A5C" : s.up === false ? "#e05252" : "#B0A898" }}
            >
              {s.up === true && <span>↑</span>}
              {s.up === false && <span>↓</span>}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────── */}
      <div className="nhf-grid2">

        {/* Enquiries table */}
        <div className="nhf-card">
          <div className="nhf-card-head">
            <span className="nhf-card-title">Recent Enquiries</span>
            <a href="/admin/enquiries" className="nhf-card-link">View all →</a>
          </div>
          <div className="nhf-table-wrap">
            <table className="nhf-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ENQUIRIES.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="nhf-td-name">{e.name}</div>
                      <div className="nhf-td-email">{e.email}</div>
                    </td>
                    <td>{e.type}</td>
                    <td>{e.date}</td>
                    <td><Pill status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="nhf-col-right">

          {/* Products */}
          <div className="nhf-card">
            <div className="nhf-card-head">
              <span className="nhf-card-title">Products</span>
              <a href="/admin/products" className="nhf-card-link">Manage →</a>
            </div>
            {PRODUCTS.map((p) => (
              <div key={p.id} className="nhf-prod-row">
                <div className="nhf-prod-info">
                  <div className="nhf-prod-name">{p.name}</div>
                  <div className="nhf-prod-cat">{p.cat}</div>
                </div>
                <div className="nhf-prod-right">
                  <span className="nhf-prod-stock" style={{ color: p.stock === 0 ? "#e05252" : "#AAA" }}>
                    {p.stock === 0 ? "Out" : `${p.stock} pcs`}
                  </span>
                  <Pill status={p.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="nhf-card">
            <div className="nhf-card-head">
              <span className="nhf-card-title">Quick Actions</span>
            </div>
            <div className="nhf-actions">
              {QUICK.map((a) => (
                <a key={a.label} href={a.href} className="nhf-action">
                  <div className="nhf-action-ico">{a.icon}</div>
                  {a.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

    </AdminShell>
  );
}
