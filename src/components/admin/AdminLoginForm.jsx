"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminLoginForm() {
  const { login, user, isLoading } = useAdminAuthContext();
  const router = useRouter();

  const [fields,     setFields]     = useState({ email: "", password: "" });
  const [showPwd,    setShowPwd]    = useState(false);
  const [touched,    setTouched]    = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => setMounted(true), []);

  // Already logged in → straight to dashboard
  useEffect(() => {
    if (!isLoading && user) router.replace("/admin/dashboard");
  }, [isLoading, user, router]);

  const emailErr = touched.email    && !fields.email.trim()    ? "Email is required"    : "";
  const pwdErr   = touched.password && !fields.password.trim() ? "Password is required" : "";
  const disabled = submitting || !fields.email.trim() || !fields.password.trim();

  const onChange = (e) => setFields((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onBlur   = (e) => setTouched((p) => ({ ...p, [e.target.name]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!fields.email.trim() || !fields.password.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await login({
      email:    fields.email.trim(),
      password: fields.password,
    });

    if (!result.ok) {
      setError(result.error || "Login failed. Please try again.");
      setSubmitting(false);
    }
    // On success: the useEffect above handles the redirect
  };

  // Don't flash the form while checking existing session
  if (isLoading) return null;

  return (
    <>
      <div className={`admin-root ${mounted ? "admin-root--in" : ""}`}>

        {/* ── Left — brand panel ─────────────────────────────── */}
        <aside className="admin-left">
          <div className="al-glow al-glow--tl" />
          <div className="al-glow al-glow--br" />

          <div className="brand-logo">
            <Image
              src="/images/logo.png"
              alt="Nikita Home Furnishings"
              width={200} height={52}
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
              priority
            />
          </div>

          <div className="brand-quote">
            <div className="quote-line" />
            <blockquote>
              "Every thread carries a story,<br />make yours beautiful."
            </blockquote>
            <p className="brand-sub">
              Artisan home textiles &amp; lifestyle collections<br />
              crafted with hands that know the difference.
            </p>
            <div className="quote-line" />
          </div>

          <p className="brand-since">Est. 2006 · Jaipur, Rajasthan</p>
        </aside>

        {/* ── Right — form ───────────────────────────────────── */}
        <main className="admin-right">
          <div className="form-card">

            {/* Badge */}
            <div className="admin-badge">
              <span className="badge-dot" />
              ADMIN PANEL
            </div>

            {/* Heading */}
            <h1 className="form-title">Welcome back</h1>
            <p className="form-subtitle">Sign in to manage your store</p>

            {/* Error */}
            {error && (
              <div className="error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} noValidate>

              {/* Email */}
              <div className="field-group">
                <label htmlFor="adm-email" className="field-label">Email address</label>
                <div className={`input-wrap ${emailErr ? "input-error" : ""}`}>
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="adm-email" name="email" type="email"
                    autoComplete="email" placeholder="admin@nikitahf.com"
                    value={fields.email} onChange={onChange} onBlur={onBlur}
                    className="field-input"
                    aria-describedby={emailErr ? "email-err" : undefined}
                    aria-invalid={!!emailErr}
                  />
                </div>
                {emailErr && <p id="email-err" className="field-error-msg">{emailErr}</p>}
              </div>

              {/* Password */}
              <div className="field-group">
                <label htmlFor="adm-pwd" className="field-label">Password</label>
                <div className={`input-wrap ${pwdErr ? "input-error" : ""}`}>
                  <span className="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="adm-pwd" name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••"
                    value={fields.password} onChange={onChange} onBlur={onBlur}
                    className="field-input"
                    aria-describedby={pwdErr ? "pwd-err" : undefined}
                    aria-invalid={!!pwdErr}
                  />
                  <button type="button" className="toggle-password"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    tabIndex={-1}>
                    {showPwd ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {pwdErr && <p id="pwd-err" className="field-error-msg">{pwdErr}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={disabled} className="submit-btn">
                {submitting ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            <p className="form-footer">
              © {new Date().getFullYear()} Nikita Home Furnishings
            </p>
          </div>
        </main>
      </div>

      <style jsx>{`
        .admin-root {
          display: grid;
          grid-template-columns: 460px 1fr;
          min-height: 100vh;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .admin-root--in { opacity: 1; transform: none; }

        /* ── Left ── */
        .admin-left {
          position: relative;
          background: #7B7F5C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 52px 56px;
          overflow: hidden;
        }
        .al-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .al-glow--tl {
          width: 500px; height: 500px;
          top: -150px; left: -150px;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%);
        }
        .al-glow--br {
          width: 380px; height: 380px;
          bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(0,0,0,0.14) 0%, transparent 65%);
        }
        .brand-logo {
          position: relative; z-index: 1;
          filter: brightness(0) invert(1); opacity: 0.90;
        }
        .brand-quote {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 24px; text-align: center;
        }
        .quote-line {
          width: 40px; height: 1px;
          background: rgba(255,255,255,0.25);
        }
        blockquote {
          font-family: "Tobias", Georgia, serif;
          font-size: clamp(20px, 1.9vw, 27px);
          font-weight: 400; font-style: italic;
          color: #fff; line-height: 1.6; margin: 0;
        }
        .brand-sub {
          font-size: 13px; color: rgba(255,255,255,0.60);
          line-height: 1.85; margin: 0;
        }
        .brand-since {
          position: relative; z-index: 1;
          font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.30); margin: 0;
        }

        /* ── Right ── */
        .admin-right {
          background: #FDFDF4;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 32px;
        }
        .form-card { width: 100%; max-width: 400px; }

        /* badge */
        .admin-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.20em;
          text-transform: uppercase; color: #7B7F5C;
          border: 1px solid rgba(123,127,92,0.30);
          padding: 5px 12px 5px 10px; margin-bottom: 28px;
          background: rgba(123,127,92,0.05);
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7B7F5C; flex-shrink: 0;
          box-shadow: 0 0 0 2.5px rgba(123,127,92,0.20);
          animation: bdpulse 2.5s ease-in-out infinite;
        }
        @keyframes bdpulse {
          0%,100% { box-shadow: 0 0 0 2.5px rgba(123,127,92,0.20); }
          50%      { box-shadow: 0 0 0 5px rgba(123,127,92,0.08); }
        }

        /* heading */
        .form-title {
          font-family: "Tobias", Georgia, serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 500; color: #2C2C2C;
          letter-spacing: -0.025em; line-height: 1.15;
          margin: 0 0 10px 0;
        }
        .form-subtitle {
          font-size: 14px; color: #999;
          margin: 0 0 32px 0; line-height: 1.5;
        }

        /* error */
        .error-banner {
          display: flex; align-items: flex-start; gap: 9px;
          background: #fff5f5; border-left: 3px solid #e05252;
          color: #b91c1c; font-size: 13px; line-height: 1.5;
          padding: 12px 14px; margin-bottom: 22px;
        }
        .error-banner svg { margin-top: 1px; flex-shrink: 0; }

        /* fields */
        .field-group { margin-bottom: 20px; }
        .field-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: #6b6b6b; margin-bottom: 8px;
        }
        .input-wrap {
          display: flex; align-items: center;
          border: 1.5px solid #E0DBD3; background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .input-wrap:focus-within {
          border-color: #7B7F5C;
          box-shadow: 0 0 0 3px rgba(123,127,92,0.10);
        }
        .input-error {
          border-color: #e05252 !important;
          box-shadow: 0 0 0 3px rgba(224,82,82,0.08) !important;
        }
        .input-icon {
          display: flex; align-items: center;
          padding: 0 12px 0 14px; color: #C0BAB0; flex-shrink: 0;
        }
        .field-input {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 13px 12px 13px 0; font-size: 14px; color: #2C2C2C;
          font-family: "Tobias", Georgia, serif; min-width: 0;
        }
        .field-input::placeholder { color: #C8C2B8; }
        .toggle-password {
          display: flex; align-items: center; padding: 0 14px;
          background: none; border: none; cursor: pointer;
          color: #C0BAB0; transition: color 0.15s; flex-shrink: 0;
        }
        .toggle-password:hover { color: #7B7F5C; }
        .field-error-msg { font-size: 11.5px; color: #e05252; margin: 6px 0 0 0; }

        /* submit */
        .submit-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; margin-top: 8px; padding: 15px 24px;
          background: #7B7F5C; color: #fff; border: none;
          font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          font-family: "Tobias", Georgia, serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(123,127,92,0.22);
        }
        .submit-btn:hover:not(:disabled) {
          background: #636749;
          box-shadow: 0 4px 20px rgba(123,127,92,0.32);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        .btn-loading {
          display: flex; align-items: center;
          justify-content: center; gap: 10px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.30);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.65s linear infinite; flex-shrink: 0;
        }

        .form-footer {
          margin-top: 40px; font-size: 11.5px;
          color: #C8C2B8; text-align: center; letter-spacing: 0.03em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-root { grid-template-columns: 380px 1fr; }
        }
        @media (max-width: 768px) {
          .admin-root { grid-template-columns: 1fr; }
          .admin-left {
            flex-direction: row; flex-wrap: wrap;
            justify-content: center; gap: 20px;
            padding: 32px 28px; min-height: auto;
          }
          .brand-sub, .brand-since { display: none; }
          blockquote { font-size: 18px; }
          .admin-right { padding: 40px 24px; }
        }
        @media (max-width: 480px) {
          .admin-left { padding: 24px 20px; }
          .brand-quote { display: none; }
          .admin-right { padding: 32px 20px; }
        }
      `}</style>
    </>
  );
}
