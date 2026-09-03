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
  Upload,
  ShoppingBag,
  Mail,
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  MessageSquare as MessageSquareIcon,
  Layout as LayoutIcon,
   RotateCcw,
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
    group: "Content",
    items: [
      {
        label: "Banners",
        href: "/admin/banners",
        icon: ImageIcon,
      },
      {
        label: "Showcase Banner",
        href: "/admin/showcase-banner",
        icon: ImageIcon,
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareIcon,
      },
      {
        label: "New Arrivals Section",
        href: "/admin/new-arrivals-section",
        icon: LayoutIcon,
      },
      {
        label: "Trade Fairs",
        href: "/admin/trade-fairs",
        icon: ImageIcon,
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
      {
        label: "Bulk Upload",
        href: "/admin/products/bulk-products",
        icon: Upload,
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
      label: "Order cancel Requests",
      href: "/admin/order-requests",
      icon: RotateCcw,
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
    NAV.flatMap((g) => g.items).find(
      (i) => pathname === i.href || pathname?.startsWith(`${i.href}/`)
    )?.label ??
    "Admin";

  return (
    <div className="nhf-admin">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className={`nhf-sb${open ? " open" : ""}`}>

        {/* Logo */}
        <div className="nhf-sb-logo">
          <Image
            src="/images/logo.png"
            alt="NHF"
            width={100}
            height={36}
            style={{
              objectFit: "contain",
              height: 36,
              width: "auto",
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="nhf-sb-nav">
          {NAV.map(({ group, items }) => (
            <div key={group} className="nhf-sb-group">

              {/* Group title */}
              <span className="nhf-sb-group-label">
                {group}
              </span>

              {items.map(({ label, href, icon: Icon }) => {

                const active =
                  pathname === href ||
                  (pathname?.startsWith(`${href}/`) &&
                    !NAV.flatMap((g) => g.items).some(
                      (item) =>
                        item.href !== href &&
                        pathname?.startsWith(item.href)
                    ));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nhf-sb-item${
                      active ? " active" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="nhf-sb-icon">
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />
                    </span>

                    <span className="nhf-sb-item-text">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* =====================================================
            SIDEBAR FOOTER
        ===================================================== */}
        <div className="nhf-sb-footer">

          <div className="nhf-sb-avatar">
            {initials}
          </div>

          <div className="nhf-sb-user-info">
            <div className="nhf-sb-uname">
              {user?.name ?? "Admin"}
            </div>

            <div className="nhf-sb-urole">
              Administrator
            </div>
          </div>

          <button
            className="nhf-sb-logout"
            onClick={async () => {
              await logout();
              window.location.href = "/admin/login";
            }}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut
              size={16}
              strokeWidth={1.8}
            />
          </button>

        </div>
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}
      {open && (
        <div
          className="nhf-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}
      <div className="nhf-main">

        {/* Topbar */}
        <header className="nhf-topbar">

          {/* Mobile menu */}
          <button
            className="nhf-topbar-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {open ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

          {/* Page title */}
          <div className="nhf-topbar-pagetitle">
            {currentLabel}
          </div>

          {/* User */}
          <div className="nhf-topbar-right">
            <div className="nhf-topbar-user">

              <div className="nhf-topbar-uavatar">
                {initials}
              </div>

              <span className="nhf-topbar-uname">
                {user?.name}
              </span>

            </div>
          </div>

        </header>

        {/* Page content */}
        <main className="nhf-page">
          {children}
        </main>

      </div>

      {/* =====================================================
          TEXT STYLE ONLY
          UI / LAYOUT SAME
      ===================================================== */}
      <style jsx global>{`

        /* -----------------------------------------
           SIDEBAR GROUP TITLES
        ----------------------------------------- */

        .nhf-sb-group-label {
          color: #ffffff !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          letter-spacing: 0.08em !important;
        }


        /* -----------------------------------------
           SIDEBAR ITEMS
        ----------------------------------------- */

        .nhf-sb-item {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 500 !important;
          letter-spacing: 0.01em !important;
        }

        .nhf-sb-item:hover {
          color: #ffffff !important;
        }

        .nhf-sb-item.active {
          color: #ffffff !important;
          font-weight: 600 !important;
        }


        /* -----------------------------------------
           SIDEBAR ICONS
        ----------------------------------------- */

        .nhf-sb-icon {
          color: #ffffff !important;
        }

        .nhf-sb-icon svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }


        /* -----------------------------------------
           SIDEBAR USER
        ----------------------------------------- */

        .nhf-sb-uname {
          color: #ffffff !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }

        .nhf-sb-urole {
          color: #ffffff !important;
          font-size: 14px !important;
          font-weight: 400 !important;
        }


        /* -----------------------------------------
           LOGOUT
        ----------------------------------------- */

        .nhf-sb-logout {
          color: #ffffff !important;
        }

        .nhf-sb-logout svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }


        /* -----------------------------------------
           TOPBAR
        ----------------------------------------- */

        .nhf-topbar-pagetitle {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }

        .nhf-topbar-uname {
          color: #ffffff !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }

        .nhf-topbar-uavatar {
          color: #ffffff !important;
        }

        .nhf-topbar-burger {
          color: #ffffff !important;
        }

        .nhf-topbar-burger svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }


        /* -----------------------------------------
           MOBILE
        ----------------------------------------- */

        @media (max-width: 768px) {

          .nhf-sb-item {
            font-size: 16px !important;
          }

          .nhf-sb-group-label {
            font-size: 13px !important;
          }

          .nhf-sb-uname {
            font-size: 14px !important;
          }

          .nhf-sb-urole {
            font-size: 12px !important;
          }

        }

      `}</style>

    </div>
  );
}