"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/authApi";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!email) {
      return setError("Email not found. Please restart the password reset process.");
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword({
        email,
        otp: form.otp,
        newPassword: form.password,
      });

      alert("Password Reset Successfully");

      router.push("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Reset Password
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 rounded p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="otp"
            placeholder="OTP"
            className="w-full border rounded-lg px-4 py-3"
            value={form.otp}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="New Password"
            className="w-full border rounded-lg px-4 py-3"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-4 py-3"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

        </form>
      </div>
    </div>
  );
}


/* =========================================================
   PAGE WRAPPER
   useSearchParams component is inside Suspense
   ========================================================= */

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
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