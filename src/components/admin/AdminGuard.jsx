"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminGuard({ children }) {
  const { user, loading } = useAdminAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#FAFAF6",
        gap: 10,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        color: "#7B7F5C"
      }}>
        <svg
          className="nhf-spinner"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return children;
}
