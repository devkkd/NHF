"use client";

import Link from "next/link";

const footerLinks = {
  Collections: [
    { label: "Living Room", href: "/collections/living-room" },
    { label: "Bedroom", href: "/collections/bedroom" },
    { label: "Dining Room", href: "/collections/dining-room" },
    { label: "Office", href: "/collections/office" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Craftsmanship", href: "/craftsmanship" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Careers", href: "/careers" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Care Guide", href: "/care" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-[#FAF8F5]">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[20px] tracking-[0.12em] uppercase font-normal">
              Nikita
            </p>
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#8B7355] font-light mt-1">
              Home Furnishing
            </p>
          </div>
          <p className="text-[13px] leading-7 text-[#B0A898] max-w-xs">
            Crafting timeless furniture that transforms houses into homes.
            Quality materials, enduring design.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-2">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B0A898] hover:text-[#FAF8F5] transition-colors"
            >
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
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://pinterest.com"
              aria-label="Pinterest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B0A898] hover:text-[#FAF8F5] transition-colors"
            >
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
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.265.641 1.265 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.136-1.867 3.136-4.563 0-2.386-1.715-4.054-4.163-4.054-2.837 0-4.5 2.127-4.5 4.326 0 .856.33 1.775.741 2.276a.3.3 0 0 1 .069.284c-.076.311-.243.995-.276 1.134-.044.183-.146.222-.338.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B0A898] hover:text-[#FAF8F5] transition-colors"
            >
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
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className="flex flex-col gap-4">
            <h3 className="text-[11px] tracking-[0.22em] uppercase text-[#8B7355]">
              {section}
            </h3>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#B0A898] hover:text-[#FAF8F5] tracking-wide transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter Strip */}
      <div className="border-t border-[#3E3E3E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[14px] tracking-[0.08em] text-[#FAF8F5]">
              Join our world
            </p>
            <p className="text-[12px] text-[#B0A898] mt-1">
              New collections, design stories & exclusive offers.
            </p>
          </div>
          <form
            className="flex w-full md:w-auto gap-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              required
              className="w-full md:w-72 bg-transparent border border-[#3E3E3E] text-[#FAF8F5] placeholder-[#6B6B6B] text-[12px] tracking-wide px-4 py-3 outline-none focus:border-[#8B7355] transition-colors"
            />
            <button
              type="submit"
              className="text-[11px] tracking-[0.18em] uppercase bg-[#8B7355] text-[#FAF8F5] px-6 py-3 hover:bg-[#7A6449] transition-colors duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#3E3E3E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#6B6B6B] tracking-wide">
            © {new Date().getFullYear()} Nikita Home Furnishing. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[11px] text-[#6B6B6B] hover:text-[#B0A898] tracking-wide transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-[#6B6B6B] hover:text-[#B0A898] tracking-wide transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
