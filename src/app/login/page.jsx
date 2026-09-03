"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/authApi";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const [loginMode, setLoginMode] = useState("password");
  // password | otp

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     SWITCH LOGIN MODE
  ========================================================= */

  const switchMode = (mode) => {
    setLoginMode(mode);
    setError("");
    setSuccess("");
    setOtpSent(false);
    setOtp("");
  };

  /* =========================================================
     NORMAL PASSWORD LOGIN
  ========================================================= */

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password;

      if (!email || !password) {
        setError("Please enter email and password.");
        return;
      }

      await login({
        email,
        password,
      });

      window.location.href = "/";
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEND LOGIN OTP
  ========================================================= */

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setError("");
    setSuccess("");

    try {
      const email = form.email.trim().toLowerCase();

      if (!email) {
        setError("Please enter your email first.");
        return;
      }

      const API = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5001/api/v1"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${API}/auth/login-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to send login OTP."
        );
      }

      setOtpSent(true);
      setSuccess(
        "Login OTP sent successfully. Please check your email."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send login OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* =========================================================
     VERIFY LOGIN OTP
  ========================================================= */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const email = form.email.trim().toLowerCase();

      if (!email) {
        setError("Please enter your email.");
        return;
      }

      if (!otp.trim()) {
        setError("Please enter the OTP.");
        return;
      }

      const API = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5001/api/v1"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${API}/auth/verify-login-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "OTP verification failed."
        );
      }

      if (data?.accessToken) {
        localStorage.setItem(
          "accessToken",
          data.accessToken
        );
      }

      setSuccess("Login successful.");

      window.location.href = "/";
    } catch (err) {
      setError(
        err?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const handleGoogle = async (
    credentialResponse
  ) => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      if (!credentialResponse?.credential) {
        throw new Error(
          "Google credential not received."
        );
      }

      const { data } = await googleLogin({
        idToken: credentialResponse.credential,
      });

      if (data?.accessToken) {
        localStorage.setItem(
          "accessToken",
          data.accessToken
        );
      }

      window.location.href = "/";
    } catch (err) {
      console.error(
        "Google Login Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Google Login Failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdf4] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* =====================================================
            TITLE
        ===================================================== */}

        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ===================================================== */}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* =====================================================
            LOGIN MODE SWITCH
        ===================================================== */}

        <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 p-1 rounded-lg">

          <button
            type="button"
            onClick={() =>
              switchMode("password")
            }
            className={`py-2.5 rounded-md text-sm font-medium transition ${
              loginMode === "password"
                ? "bg-white shadow text-black"
                : "text-gray-500"
            }`}
          >
            Password Login
          </button>

          <button
            type="button"
            onClick={() =>
              switchMode("otp")
            }
            className={`py-2.5 rounded-md text-sm font-medium transition ${
              loginMode === "otp"
                ? "bg-white shadow text-black"
                : "text-gray-500"
            }`}
          >
            OTP Login
          </button>

        </div>

        {/* =====================================================
            PASSWORD LOGIN
        ===================================================== */}

        {loginMode === "password" && (
          <form
            onSubmit={handlePasswordLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please Wait..."
                : "Login"}
            </button>

          </form>
        )}

        {/* =====================================================
            OTP LOGIN
        ===================================================== */}

        {loginMode === "otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* SEND OTP */}

            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpLoading
                  ? "Sending OTP..."
                  : "Send Login OTP"}
              </button>
            )}

            {/* OTP */}

            {otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6 digit OTP"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-[0.4em] outline-none focus:border-black"
                    value={otp}
                    onChange={(e) => {
                      const value =
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                      setOtp(value);
                      setError("");
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP & Login"}
                </button>

                {/* RESEND */}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full border border-gray-300 rounded-lg py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
                >
                  {otpLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              </>
            )}

          </form>
        )}

        {/* =====================================================
            GOOGLE LOGIN
        ===================================================== */}

        {/*
        <div className="my-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() =>
              setError("Google Login Failed")
            }
          />
        </div>
        */}

        {/* =====================================================
            FORGOT PASSWORD
        ===================================================== */}

        <div className="text-center mt-6">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        {/* =====================================================
            REGISTER
        ===================================================== */}

        <div className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </div>

      </div>
    </div>
  );
}