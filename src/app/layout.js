/**
 * Root layout — ONLY html/body shell.
 * Header and Footer live in (site)/layout.js so they never
 * appear on admin routes.
 */

import "./globals.css";

export const metadata = {
  title: "Nikita Home Furnishings",
  description:
    "Timeless furniture crafted for modern living. Explore our curated collections of premium home furnishings from Jaipur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
