"use client";

/**
 * components/admin/AdminGuard.jsx
 *
 * Wraps every protected admin page.
 * - While checking session → shows a branded loading screen
 * - If no session → redirects to /admin (login page)
 * - If session exists → renders children
 *
 * Usage:
 *   export default function DashboardPage() {
 *     return <AdminGuard><Dashboard /></AdminGuard>;
 *   }
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminGuard({ children }) {
  const { user, isLoading } = useAdminAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/admin");
    }
  }, [isLoading, user, router]);

  // Full-screen branded loader while session is being restored
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FDFDF4",
        gap: "20px",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "2.5px solid rgba(123,127,92,0.20)",
          borderTop: "2.5px solid #7B7F5C",
          borderRadius: "50%",
          animation: "nhf-spin 0.7s linear infinite",
        }} />
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: "13px",
          color: "#7B7F5C",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Authenticating…
        </p>
        <style>{`
          @keyframes nhf-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Not logged in — render nothing while redirect happens
  if (!user) return null;

  return children;
}
