"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

/* ── SVG icons ───────────────────────────────────────────── */
const Icon = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  products:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  enquiries: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  orders:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  categories:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  arrivals:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  bell:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  burger:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard",    href: "/admin/dashboard",   icon: Icon.dashboard },
    ],
  },
  {
    group: "Store",
    items: [
      { label: "Products",    href: "/admin/products",     icon: Icon.products  },
      { label: "Enquiries",   href: "/admin/enquiries",    icon: Icon.enquiries, badge: 3 },
      { label: "Orders",      href: "/admin/orders",       icon: Icon.orders    },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { label: "Categories",  href: "/admin/categories",   icon: Icon.categories },
      { label: "New Arrivals",href: "/admin/new-arrivals", icon: Icon.arrivals   },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings",    href: "/admin/settings",     icon: Icon.settings },
    ],
  },
];

export default function AdminShell({ children, pageTitle }) {
  const { user, logout } = useAdminAuthContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const allItems = NAV.flatMap(g => g.items);
  const currentPage = pageTitle ?? allItems.find(i => pathname === i.href || pathname.startsWith(i.href + "/"))?.label ?? "Admin";
  const initial = user?.name?.[0]?.toUpperCase() ?? "A";

  return (
    <div className="nhf-admin">

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className={`nhf-sb${open ? " open" : ""}`}>

        <div className="nhf-sb-logo">
          <Image
            src="/images/logo.png"
            alt="Nikita Home Furnishings"
            width={148} height={38}
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
            priority
          />
        </div>

        <nav className="nhf-sb-nav">
          {NAV.map(({ group, items }) => (
            <div key={group} className="nhf-sb-group">
              <span className="nhf-sb-group-label">{group}</span>
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nhf-sb-item${active ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
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
          <div className="nhf-sb-avatar">{initial}</div>
          <div className="nhf-sb-uinfo">
            <div className="nhf-sb-uname">{user?.name ?? "Admin"}</div>
            <div className="nhf-sb-urole">Administrator</div>
          </div>
          <button className="nhf-sb-logout" onClick={logout} title="Sign out" aria-label="Sign out">
            {Icon.logout}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="nhf-overlay" onClick={() => setOpen(false)} />}

      {/* ── Main ───────────────────────────────────────── */}
      <div className="nhf-main">

        {/* Topbar */}
        <header className="nhf-topbar">
          <button
            className="nhf-topbar-burger"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {Icon.burger}
          </button>

          <div className="nhf-topbar-pagetitle">{currentPage}</div>

          <div className="nhf-topbar-right">
            <button className="nhf-topbar-btn" aria-label="Notifications">
              {Icon.bell}
              <span className="nhf-topbar-dot" />
            </button>
            <div className="nhf-topbar-user">
              <div className="nhf-topbar-uavatar">{initial}</div>
              <span className="nhf-topbar-uname">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="nhf-page">
          {children}
        </main>
      </div>
    </div>
  );
}
