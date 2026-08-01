"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { registerUser } from "@/lib/authApi";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

    try {
      setLoading(true);
      setError("");

      const { data } = await registerUser(form);

      router.push(
        `/verify-otp?email=${encodeURIComponent(form.email)}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google Registration Failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdf4] py-10">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          Create Account
        </h1>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 text-red-600 p-3">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-3"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-3"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-3"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-white font-semibold transition hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="my-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError("Google Login Failed")}
          />
        </div>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}