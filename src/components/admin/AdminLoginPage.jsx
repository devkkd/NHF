"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login, user, isLoading } = useAdminAuthContext();
  const router = useRouter();

  const [fields,  setFields]  = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Already logged in → go to dashboard
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

    const result = await login({ email: fields.email.trim(), password: fields.password });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Success — redirect handled by the useEffect above
  };

  // Don't flash the form while checking an existing session
  if (isLoading) return null;

  return (
    <>
      <div className={`page ${mounted ? "page--in" : ""}`}>

        {/* ══ LEFT — brand panel ══════════════════════════════ */}
        <aside className="brand-panel">
          <div className="bp-glow bp-glow--tl" />
          <div className="bp-glow bp-glow--br" />

          <div className="bp-logo">
            <Image
              src="/images/logo.png"
              alt="Nikita Home Furnishings"
              width={200} height={52}
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
              priority
            />
          </div>

          <div className="bp-center">
            <span className="bp-eyebrow">Est. 2006 · Jaipur</span>
            <div className="bp-rule" />
            <blockquote className="bp-quote">
              "Every thread carries a story,<br />make yours beautiful."
            </blockquote>
            <div className="bp-rule" />
            <p className="bp-body">
              Artisan home textiles &amp; lifestyle collections<br />
              crafted with hands that know the difference.
            </p>
          </div>

          <p className="bp-bottom">Nikita Home Furnishings · Admin</p>
        </aside>

        {/* ══ RIGHT — form ════════════════════════════════════ */}
        <main className="form-panel">
          <div className="form-wrap">

            {/* badge */}
            <div className="f-badge">
              <span className="f-dot" />
              ADMIN PANEL
            </div>

            <h1 className="f-heading">Welcome back</h1>
            <p className="f-sub">Sign in to manage your store</p>

            {/* error */}
            {error && (
              <div className="f-error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>

              {/* email */}
              <div className="f-field">
                <label htmlFor="adm-email" className="f-label">Email address</label>
                <div className={`f-box ${emailErr ? "f-box--err" : ""}`}>
                  <span className="f-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="adm-email" name="email" type="email"
                    autoComplete="email" placeholder="admin@nikitahf.com"
                    value={fields.email} onChange={onChange} onBlur={onBlur}
                    className="f-input"
                    aria-describedby={emailErr ? "adm-email-err" : undefined}
                    aria-invalid={!!emailErr}
                  />
                </div>
                {emailErr && <p id="adm-email-err" className="f-errtxt">{emailErr}</p>}
              </div>

              {/* password */}
              <div className="f-field">
                <label htmlFor="adm-pwd" className="f-label">Password</label>
                <div className={`f-box ${pwdErr ? "f-box--err" : ""}`}>
                  <span className="f-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="adm-pwd" name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••"
                    value={fields.password} onChange={onChange} onBlur={onBlur}
                    className="f-input"
                    aria-describedby={pwdErr ? "adm-pwd-err" : undefined}
                    aria-invalid={!!pwdErr}
                  />
                  <button type="button" className="f-eye"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    tabIndex={-1}>
                    {showPwd ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {pwdErr && <p id="adm-pwd-err" className="f-errtxt">{pwdErr}</p>}
              </div>

              {/* submit */}
              <button type="submit" disabled={disabled} className="f-submit">
                {submitting ? (
                  <><span className="f-spinner" aria-hidden="true" /> Signing in…</>
                ) : (
                  <>Sign In
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="f-footer">© {new Date().getFullYear()} Nikita Home Furnishings</p>
          </div>
        </main>
      </div>

      <style jsx>{`
        .page {
          display: grid;
          grid-template-columns: 460px 1fr;
          min-height: 100vh;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .page--in { opacity: 1; transform: none; }

        /* ── Brand panel ── */
        .brand-panel {
          position: relative;
          background: #7B7F5C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 52px 56px;
          overflow: hidden;
        }
        .bp-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .bp-glow--tl {
          width: 500px; height: 500px;
          top: -150px; left: -150px;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%);
        }
        .bp-glow--br {
          width: 380px; height: 380px;
          bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(0,0,0,0.14) 0%, transparent 65%);
        }
        .bp-logo {
          position: relative; z-index: 1;
          filter: brightness(0) invert(1);
          opacity: 0.90;
        }
        .bp-center {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 26px;
          text-align: center;
        }
        .bp-eyebrow {
          font-size: 11px; letter-spacing: 0.20em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48); font-weight: 500;
        }
        .bp-rule {
          width: 40px; height: 1px;
          background: rgba(255,255,255,0.22);
        }
        .bp-quote {
          font-family: "Tobias", Georgia, serif;
          font-size: clamp(19px, 1.9vw, 27px);
          font-weight: 400; font-style: italic;
          color: #fff; line-height: 1.6;
          margin: 0; letter-spacing: -0.01em;
        }
        .bp-body {
          font-size: 13px; line-height: 1.85;
          color: rgba(255,255,255,0.58); margin: 0;
        }
        .bp-bottom {
          position: relative; z-index: 1;
          font-size: 10.5px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.30); margin: 0;
        }

        /* ── Form panel ── */
        .form-panel {
          background: #FDFDF4;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 32px;
        }
        .form-wrap { width: 100%; max-width: 400px; }

        .f-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.20em; text-transform: uppercase;
          color: #7B7F5C;
          border: 1px solid rgba(123,127,92,0.30);
          padding: 5px 12px 5px 10px; margin-bottom: 28px;
          background: rgba(123,127,92,0.05);
        }
        .f-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7B7F5C; flex-shrink: 0;
          box-shadow: 0 0 0 2.5px rgba(123,127,92,0.20);
          animation: pulse 2.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 2.5px rgba(123,127,92,0.20); }
          50%       { box-shadow: 0 0 0 5px rgba(123,127,92,0.10); }
        }

        .f-heading {
          font-family: "Tobias", Georgia, serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 500; color: #2C2C2C;
          letter-spacing: -0.025em; line-height: 1.15;
          margin: 0 0 10px 0;
        }
        .f-sub {
          font-size: 14px; color: #999;
          margin: 0 0 32px 0; line-height: 1.5;
        }

        /* error */
        .f-error {
          display: flex; align-items: flex-start; gap: 9px;
          background: #fff5f5;
          border-left: 3px solid #e05252;
          color: #b91c1c; font-size: 13px;
          line-height: 1.5; padding: 12px 14px;
          margin-bottom: 22px;
        }
        .f-error svg { margin-top: 1px; flex-shrink: 0; }

        /* field */
        .f-field { margin-bottom: 20px; }
        .f-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: #6b6b6b; margin-bottom: 8px;
        }
        .f-box {
          display: flex; align-items: center;
          border: 1.5px solid #E0DBD3; background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .f-box:focus-within {
          border-color: #7B7F5C;
          box-shadow: 0 0 0 3px rgba(123,127,92,0.10);
        }
        .f-box--err {
          border-color: #e05252 !important;
          box-shadow: 0 0 0 3px rgba(224,82,82,0.08) !important;
        }
        .f-icon {
          display: flex; align-items: center;
          padding: 0 12px 0 14px;
          color: #C0BAB0; flex-shrink: 0;
        }
        .f-input {
          flex: 1; border: none; outline: none;
          background: transparent;
          padding: 13px 12px 13px 0;
          font-size: 14px; color: #2C2C2C;
          font-family: "Tobias", Georgia, serif;
          min-width: 0;
        }
        .f-input::placeholder { color: #C8C2B8; }
        .f-eye {
          display: flex; align-items: center;
          padding: 0 14px; background: none; border: none;
          cursor: pointer; color: #C0BAB0;
          transition: color 0.15s; flex-shrink: 0;
        }
        .f-eye:hover { color: #7B7F5C; }
        .f-errtxt {
          font-size: 11.5px; color: #e05252; margin: 6px 0 0 0;
        }

        /* submit */
        .f-submit {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%; margin-top: 8px;
          padding: 15px 24px;
          background: #7B7F5C; color: #fff; border: none;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer;
          font-family: "Tobias", Georgia, serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(123,127,92,0.22);
        }
        .f-submit:hover:not(:disabled) {
          background: #636749;
          box-shadow: 0 4px 20px rgba(123,127,92,0.32);
          transform: translateY(-1px);
        }
        .f-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .f-submit:disabled {
          opacity: 0.45; cursor: not-allowed; box-shadow: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .f-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.30);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.65s linear infinite; flex-shrink: 0;
        }

        .f-footer {
          margin-top: 40px; font-size: 11.5px;
          color: #C8C2B8; text-align: center; letter-spacing: 0.03em;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .page { grid-template-columns: 380px 1fr; }
          .brand-panel { padding: 44px 44px; }
        }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .brand-panel {
            flex-direction: row; flex-wrap: wrap;
            justify-content: center; gap: 20px;
            padding: 32px 28px; min-height: auto;
          }
          .bp-body, .bp-bottom { display: none; }
          .bp-quote { font-size: 18px; }
          .form-panel { padding: 40px 24px; }
        }
        @media (max-width: 480px) {
          .brand-panel { padding: 24px 20px; }
          .bp-center { display: none; }
          .form-panel { padding: 32px 20px; }
        }
      `}</style>
    </>
  );
}
