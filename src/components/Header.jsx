"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "+ Customization", href: "/customization" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Home Furnished", href: "/collection" },
  { label: "Wardrobe", href: "/wardrobe" },
  { label: "Our Story", href: "/our-story" },
  { label: "Exhibition / Fair", href: "/exhibition" },
  { label: "Bulk Order", href: "/enquiry" },
  { label: "Contact Us", href: "/contact" },
];

const SOLID_BG = "#fdfdf4";
const SOLID_FG = "#8a9071";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const isSolid = !isHome || scrolled;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isSolid, menuOpen]);

  const isActiveLink = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const iconClass = isSolid
    ? "text-[#8a9071] hover:text-[#6f7459] transition-colors"
    : "text-white/80 hover:text-white transition-colors";

  const navLinkClass = (href) => {
    const active = isActiveLink(href);
  const base =
  "text-[10px] font-bold tracking-normal uppercase transition-colors duration-300 whitespace-nowrap border-b pb-0.5 font-['Mona_Sans']";

    if (isSolid) {
      return `${base} ${
        active
          ? "text-[#8a9071] border-[#8a9071]"
          : "text-[#8a9071] border-transparent hover:border-[#8a9071]/50"
      }`;
    }

    return `${base} ${
      active
        ? "text-white border-white"
        : "text-white border-transparent hover:text-white/70"
    }`;
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`w-full top-0 left-0 z-50 transition-all duration-300 ${
          isSolid ? "fixed shadow-sm" : "absolute"
        }`}
        style={{ backgroundColor: isSolid ? SOLID_BG : "transparent" }}
      >
        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <div
          className={`w-full px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ${
            isSolid ? "" : "bg-black/20 backdrop-blur-[2px]"
          }`}
        >
          {/* Left — Search */}
          <div
  className={`flex items-center transition-colors duration-300
  w-auto lg:w-[220px]
  ${
    isSolid
      ? "lg:border-b lg:border-[#8a9071]"
      : "lg:border-b lg:border-white/50"
  }`}
>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isSolid ? SOLID_FG : "white"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-80"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
           
              type="text"
              placeholder="SEARCH"
              className={`hidden lg:block bg-transparent text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase outline-none w-full font-light transition-colors duration-300 ${
                isSolid
                  ? "text-[#8a9071] placeholder-[#8a9071]/60"
                  : "text-white placeholder-white/70"
              }`}
            />
          </div>

          {/* Center — Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2"
          >
            <img
              src="/images/logo.png"
              alt="Nikita Home Furnishings"
              className={`h-auto transition-all duration-300 w-[160px] sm:w-[220px] lg:w-80 max-w-[min(320px,45vw)] ${
                isSolid ? "header-logo-solid" : ""
              }`}
            />
          </Link>

          {/* Right — Profile / Wishlist / Cart / Hamburger */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button aria-label="Account" className={`hidden sm:block ${iconClass}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            <button aria-label="Wishlist" className={`hidden sm:block ${iconClass}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button aria-label="Cart" className={iconClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>

            {/* Hamburger — visible below lg */}
            <button
              className={`lg:hidden ml-1 transition-colors ${iconClass}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Nav Bar — desktop only ───────────────────────────────── */}
        <nav
          className={`hidden lg:flex w-full items-center justify-center gap-6 xl:gap-8 py-3 px-10 transition-all duration-300 ${
            isSolid ? "" : "bg-black/20 backdrop-blur-[2px]"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Mobile Menu ─────────────────────────────────────────── */}
        {menuOpen && (
          <div
            className={`lg:hidden px-6 py-6 flex flex-col gap-4 transition-colors duration-300 ${
              isSolid
                ? "bg-[#fdfdf4] border-t border-[#8a9071]/20"
                : "bg-black/80 backdrop-blur-md"
            }`}
          >
            {/* Account + Wishlist shown here on mobile */}
            <div className="flex items-center gap-5 pb-3 border-b border-current/10 sm:hidden">
              <button aria-label="Account" className={iconClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              <button aria-label="Wishlist" className={iconClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[12px] tracking-[0.15em] uppercase font-light transition-colors ${
                  isSolid
                    ? isActiveLink(link.href)
                      ? "text-[#8a9071] border-b border-[#8a9071] pb-1 w-fit"
                      : "text-[#8a9071] hover:text-[#6f7459]"
                    : "text-white hover:text-white/70"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}