"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingBag,
  Mail,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    group: "Catalogue",
    items: [
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tag,
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
      },
    ],
  },

{
  group: "Sales",
  items: [
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Enquiries",
      href: "/admin/enquiries",
      icon: Mail,
    },
  ],
},
];

export default function AdminShell({ children, pageTitle }) {
  const { user, logout } = useAdminAuthContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const initials = user?.name?.[0]?.toUpperCase() ?? "A";

  const currentLabel =
    pageTitle ??
    NAV.flatMap((g) => g.items).find((i) => pathname?.startsWith(i.href))
      ?.label ??
    "Admin";

  return (
    <div className="nhf-admin">
      {/* Sidebar */}
      <aside className={`nhf-sb${open ? " open" : ""}`}>
        <div className="nhf-sb-logo">
          <Image
            src="/images/logo.png"
            alt="NHF"
            width={100}
            height={36}
            style={{ objectFit: "contain", height: 36, width: "auto" }}
          />
        </div>

        <nav className="nhf-sb-nav">
          {NAV.map(({ group, items }) => (
            <div key={group} className="nhf-sb-group">
              <span className="nhf-sb-group-label">{group}</span>
              {items.map(({ label, href, icon: Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nhf-sb-item${active ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="nhf-sb-icon">
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="nhf-sb-footer">
          <div className="nhf-sb-avatar">{initials}</div>
          <div>
            <div className="nhf-sb-uname">{user?.name ?? "Admin"}</div>
            <div className="nhf-sb-urole">Administrator</div>
          </div>
         <button
  className="nhf-sb-logout"
  onClick={async () => {
    await logout();
    window.location.href = "/admin/login"; // ya "/" agar home page par bhejna hai
  }}
  title="Sign out"
  aria-label="Sign out"
>
  <LogOut size={15} strokeWidth={1.8} />
</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="nhf-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="nhf-main">
        <header className="nhf-topbar">
          <button
            className="nhf-topbar-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="nhf-topbar-pagetitle">{currentLabel}</div>

          <div className="nhf-topbar-right">
            <div className="nhf-topbar-user">
              <div className="nhf-topbar-uavatar">{initials}</div>
              <span className="nhf-topbar-uname">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="nhf-page">{children}</main>
      </div>
    </div>
  );
}
