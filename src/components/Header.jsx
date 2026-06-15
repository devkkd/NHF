"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "+ Customization", href: "/customization" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Collection", href: "/collection" },
  { label: "Wardrobe", href: "/wardrobe" },
  { label: "Our Story", href: "/our-story" },
  { label: "Exhibition / Fair", href: "/exhibition" },
  { label: "Bulk Order", href: "/bulk-order" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full absolute top-0 left-0 z-50">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="w-full px-6 lg:px-10 py-3 flex items-center justify-between bg-black/20 backdrop-blur-[2px]">
        {/* Left — Search */}
        <div className="w-[220px] flex items-center gap-2 border-b border-white/50 pb-1">
          {/* Search icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
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
            className="bg-transparent text-white text-[11px] tracking-[0.22em] uppercase placeholder-white/70 outline-none w-full font-light"
          />
        </div>

        {/* Center — Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2"
        >
          {/* Logo Icon — monogram N */}
          <img src="/images/logo.png" className="w-80"/>
        </Link>

        {/* Right — Profile / Wishlist / Cart */}
        <div className="flex items-center gap-5">

          {/* Account */}
          <button aria-label="Account" className="text-white/80 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          {/* Wishlist */}
          <button aria-label="Wishlist" className="text-white/80 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          {/* Cart / Bag */}
          <button aria-label="Cart" className="text-white/80 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white ml-1"
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

      {/* ── Nav Bar ─────────────────────────────────────────────── */}
      <nav className="hidden lg:flex w-full items-center justify-center gap-8 bg-black/20 backdrop-blur-[2px] py-3 px-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-white text-[11.5px] tracking-[0.12em] uppercase font-light hover:text-white/70 transition-colors duration-200 whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div className="lg:hidden bg-black/80 backdrop-blur-md px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white text-[12px] tracking-[0.15em] uppercase font-light hover:text-white/70 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
