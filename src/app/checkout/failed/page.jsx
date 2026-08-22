"use client";

import Link from "next/link";

export default function CheckoutFailedPage() {
  return (
    <main className="failed-page">
      <div className="failed-card">

        {/* Error Icon */}
        <div
          className="failed-icon"
          aria-label="Payment failed"
        >
          ✕
        </div>

        {/* Status */}
        <p className="failed-tag">
          PAYMENT FAILED
        </p>

        {/* Heading */}
        <h1>
          Payment Was Not Completed
        </h1>

        {/* Message */}
        <p className="failed-text">
          Your payment could not be completed.
          <br />
          If any amount was deducted, it will be
          reconciled or refunded according to the
          payment status. You can try again.
        </p>

        {/* Actions */}
        <div className="failed-actions">

          <Link
            href="/checkout"
            className="primary-btn"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="secondary-btn"
          >
            Continue Shopping
          </Link>

        </div>
      </div>

      <style jsx>{`
        .failed-page {
          min-height: 100vh;
          background: #fefff5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: "Mona Sans", sans-serif;
        }

        .failed-card {
          max-width: 620px;
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          padding: 60px 40px;
          text-align: center;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.06);
        }

        .failed-icon {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #fdeaea;
          color: #d32f2f;

          font-size: 42px;
          font-weight: 700;
        }

        .failed-tag {
          margin: 25px 0 0;

          color: #d32f2f;

          font-size: 13px;
          font-weight: 700;

          letter-spacing: 0.15em;
        }

        .failed-card h1 {
          margin: 18px 0 0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            serif;

          font-size: 38px;
          line-height: 1.2;
          font-weight: 500;

          color: #111111;
        }

        .failed-text {
          margin: 18px 0 0;

          color: #666666;

          line-height: 1.8;
          font-size: 15px;
        }

        .failed-actions {
          margin-top: 40px;

          display: flex;
          justify-content: center;
          align-items: center;

          gap: 15px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 48px;

          padding: 14px 32px;

          border-radius: 999px;

          font-size: 14px;
          font-weight: 600;

          text-decoration: none;

          transition:
            background 0.3s ease,
            color 0.3s ease,
            border-color 0.3s ease,
            transform 0.2s ease;
        }

        .primary-btn {
          background: #111111;
          color: #ffffff;
          border: 1px solid #111111;
        }

        .primary-btn:hover {
          background: #7b7f5c;
          border-color: #7b7f5c;
          transform: translateY(-1px);
        }

        .secondary-btn {
          background: transparent;
          color: #111111;
          border: 1px solid #111111;
        }

        .secondary-btn:hover {
          background: #111111;
          color: #ffffff;
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .failed-page {
            padding: 24px 16px;
          }

          .failed-card {
            padding: 42px 24px;
            border-radius: 16px;
          }

          .failed-icon {
            width: 76px;
            height: 76px;
            font-size: 34px;
          }

          .failed-card h1 {
            font-size: 30px;
          }

          .failed-text {
            font-size: 14px;
          }

          .failed-actions {
            flex-direction: column;
            width: 100%;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}