"use client";

/**
 * hooks/useAdminAuth.js
 *
 * Re-exports from AdminAuthContext so components don't need to
 * import the context directly.
 *
 * Usage:
 *   const { login, logout, user, isLoading } = useAdminAuth();
 */

export { useAdminAuthContext as useAdminAuth } from "@/context/AdminAuthContext";
