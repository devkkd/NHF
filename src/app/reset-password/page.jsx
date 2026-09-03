"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/authApi";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Email not found. Please restart the password reset process."
      );
      return;
    }

    if (form.otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email: email.trim().toLowerCase(),
        otp: form.otp.trim(),
        password: form.password,
      });

      setSuccess(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Reset Password Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdf4] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold mb-3 text-center">
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the OTP sent to your email and create a new password.
        </p>

        {email && (
          <div className="mb-5 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600 break-all">
            <strong>Email:</strong> {email}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* OTP */}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              OTP
            </label>

            <input
              type="text"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-[0.35em] outline-none focus:border-black"
              value={form.otp}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setForm((prev) => ({
                  ...prev,
                  otp: value,
                }));

                setError("");
                setSuccess("");
              }}
              required
              disabled={loading}
            />
          </div>

          {/* NEW PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              New Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-5">
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fdfdf4]">
          <p className="text-sm text-gray-600">
            Loading...
          </p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}