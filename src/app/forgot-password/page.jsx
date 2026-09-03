"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        setError("Please enter your email address.");
        return;
      }

      await forgotPassword({
        email: normalizedEmail,
      });

      setSuccess(
        "OTP sent successfully. Please check your email."
      );

      router.push(
        `/reset-password?email=${encodeURIComponent(
          normalizedEmail
        )}`
      );
    } catch (err) {
      console.error(
        "Forgot Password Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send OTP."
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* =====================================================
            TITLE
        ===================================================== */}

        <h1 className="text-3xl font-bold mb-6 text-center">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your registered email address and we&apos;ll
          send you an OTP to reset your password.
        </p>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ===================================================== */}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-0"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          {/* SEND OTP */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-medium transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

        {/* =====================================================
            BACK TO LOGIN
        ===================================================== */}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}