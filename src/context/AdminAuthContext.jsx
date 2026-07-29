"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAccessToken, clearAccessToken, apiFetch } from "@/lib/adminApi";
import { useRouter } from "next/navigation";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const init = useCallback(async () => {
    const res = await apiFetch("/auth/refresh", { method: "POST" });
    if (res.ok && res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
      const me = await apiFetch("/auth/me");
      if (me.ok) setUser(me.data?.data?.user ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error(res.data?.error || "Login failed");
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAccessToken();
    setUser(null);
    router.push("/admin/login");
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAdminAuthContext = () => useContext(Ctx);
