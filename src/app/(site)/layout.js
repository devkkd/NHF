/**
 * (site)/layout.js
 * Wraps all public-facing pages with the site Header and Footer.
 * Admin routes live in (admin)/ and never hit this layout.
 */

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function SiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
