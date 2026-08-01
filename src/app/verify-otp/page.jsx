"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP } from "@/lib/authApi";
import { useAuth } from "@/hooks/useAuth";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { setUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await verifyOTP({
        email,
        otp,
      });

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      setUser(data.user);

      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email });

      setTimer(60);

      alert("OTP Sent Successfully");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to resend OTP"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mb-6">
          OTP sent to
          <br />
          <strong>{email}</strong>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-5">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6 digit OTP"
          className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-[10px]"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 bg-black text-white rounded-lg py-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-6">

          {timer > 0 ? (
            <p>
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 font-semibold"
            >
              Resend OTP
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOTPContent />
    </Suspense>
  );
}