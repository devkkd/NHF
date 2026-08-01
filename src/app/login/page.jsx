"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { googleLogin } from "@/lib/authApi";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

     await login(form);

window.location.href = "/";
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const { data } = await googleLogin({
        idToken: credentialResponse.credential,
      });

    localStorage.setItem(
  "accessToken",
  data.accessToken
);

window.location.href = "/";
    } catch (err) {
      console.log(err);
      alert("Google Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdf4]">

      <div className="w-full max-w-md bg-[#ffffff] rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-3"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-3"
            value={form.password}
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3"
          >
            {loading ? "Please Wait..." : "Login"}
          </button>

        </form>

        <div className="my-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => alert("Google Login Failed")}
          />
        </div>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-blue-600"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-4">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600"
          >
            Register
          </Link>
        </div>

      </div>

    </div>
  );
}