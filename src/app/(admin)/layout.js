/**
 * app/(admin)/layout.js
 * Completely isolated from the main site — no Header, no Footer.
 * Body-level reset so the admin shell can own the full viewport.
 */

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import "@/styles/admin.css";

export const metadata = {
  title: "Admin — Nikita Home Furnishings",
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
