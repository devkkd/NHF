"use client";

/**
 * context/AdminAuthContext.jsx
 *
 * Provides:
 *  - user        — the logged-in admin (null if logged out)
 *  - isLoading   — true while checking existing session on mount
 *  - login()     — calls /auth/login, stores access token in memory
 *  - logout()    — calls /auth/logout, clears everything
 *
 * On mount it silently calls /auth/refresh to restore a session
 * from the httpOnly cookie without needing localStorage.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  setAccessToken,
  clearAccessToken,
} from "@/lib/adminApi";

const AdminAuthContext = createContext(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function AdminAuthProvider({ children }) {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true); // checking existing session

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method:      "POST",
          credentials: "include",
        });
        if (res.ok) {
          const body = await res.json();
          // Backend returns { ok: true, data: { accessToken, user } }
          const data = body.data ?? body;
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
            setUser(data.user);
          }
        }
        // 401 here is expected (no cookie) — not an error
      } catch {
        // Network error — still fine, just no session
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email, password }),
    });

    const body = await res.json();

    if (!res.ok) {
      return { ok: false, error: body.error || "Login failed", code: body.code };
    }

    // Backend returns { ok: true, data: { accessToken, user } }
    const data = body.data ?? body;

    if (data?.user?.role !== "admin") {
      return { ok: false, error: "Access denied. Admins only.", code: "FORBIDDEN" };
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    return { ok: true };
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method:      "POST",
        credentials: "include",
      });
    } catch { /* ignore network errors on logout */ }

    clearAccessToken();
    setUser(null);
    router.replace("/admin");
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────
export function useAdminAuthContext() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuthContext must be used inside AdminAuthProvider");
  return ctx;
}
