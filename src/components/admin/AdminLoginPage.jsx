"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login } = useAdminAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="nhf-login-page">
      <div className="nhf-login-card">
        <div className="nhf-login-logo">
          <Image
            src="/images/logo.png"
            alt="Nikita Home Furnishing"
            width={120}
            height={48}
            style={{ objectFit: "contain", height: 48, width: "auto" }}
            priority
          />
        </div>

        <h1 className="nhf-login-title">Admin Panel</h1>
        <p className="nhf-login-sub">Sign in to manage your store</p>

        {error && <div className="nhf-login-error" role="alert">{error}</div>}

        <form className="nhf-login-form" onSubmit={handleSubmit} noValidate>
          <div className="nhf-form-group">
            <label htmlFor="email" className="nhf-form-label">
              Email
            </label>
            <input
              id="email"
              className="nhf-form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nikitahf.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="nhf-form-group">
            <label htmlFor="password" className="nhf-form-label">
              Password
            </label>
            <input
              id="password"
              className="nhf-form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="nhf-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
