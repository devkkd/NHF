"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="success-page">
      <div className="success-card">

        {/* Success Icon */}
        <div
          className="success-icon"
          aria-label="Order placed successfully"
        >
          ✓
        </div>

        {/* Status */}
        <p className="success-tag">
          ORDER PLACED SUCCESSFULLY
        </p>

        {/* Heading */}
        <h1>
          Thank You For Your Order
        </h1>

        {/* Message */}
        <p className="success-text">
          {orderId ? (
            <>
              Your order has been placed successfully.
              <br />
              {`Order #${orderId}`}
              <br />
              Your order is currently awaiting confirmation from our team.
              <br />
              We&apos;ll update you as soon as your order is approved.
            </>
          ) : (
            <>
              Your order has been placed successfully.
              <br />
              Your order is currently awaiting confirmation from our team.
              <br />
              We&apos;ll update you as soon as your order is approved.
            </>
          )}
        </p>

        {/* Actions */}
        <div className="success-actions">
          <Link
            href="/profile/orders"
            className="primary-btn"
          >
            View My Orders
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
        .success-page {
          min-height: 100vh;
          background: #fefff5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: "Mona Sans", sans-serif;
        }

        .success-card {
          width: 100%;
          max-width: 620px;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
        }

        .success-icon {
          width: 90px;
          height: 90px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9f8ee;
          color: #2e7d32;
          font-size: 42px;
          font-weight: 700;
        }

        .success-tag {
          margin: 25px 0 0;
          color: #2e7d32;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }

        .success-card h1 {
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

        .success-text {
          margin: 18px 0 0;
          color: #666666;
          line-height: 1.8;
          font-size: 15px;
        }

        .success-actions {
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
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
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
          .success-page {
            padding: 24px 16px;
          }

          .success-card {
            padding: 42px 24px;
            border-radius: 16px;
          }

          .success-icon {
            width: 76px;
            height: 76px;
            font-size: 34px;
          }

          .success-card h1 {
            font-size: 30px;
          }

          .success-text {
            font-size: 14px;
          }

          .success-actions {
            flex-direction: column;
            width: 100%;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }
        }
      `}
      </style>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="success-page">
          <div className="success-card">
            <div className="success-icon">✓</div>

            <p className="success-tag">
              ORDER PLACED SUCCESSFULLY
            </p>

            <h1>
              Thank You For Your Order
            </h1>

            <p className="success-text">
              Your order has been placed successfully.
              <br />
              Your order is currently awaiting confirmation from our team.
              <br />
              We&apos;ll update you as soon as your order is approved.
            </p>

            <div className="success-actions">
              <Link
                href="/profile/orders"
                className="primary-btn"
              >
                View My Orders
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
            .success-page {
              min-height: 100vh;
              background: #fefff5;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              font-family: "Mona Sans", sans-serif;
            }

            .success-card {
              width: 100%;
              max-width: 620px;
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-radius: 18px;
              padding: 60px 40px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
            }

            .success-icon {
              width: 90px;
              height: 90px;
              margin: 0 auto;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #e9f8ee;
              color: #2e7d32;
              font-size: 42px;
              font-weight: 700;
            }

            .success-tag {
              margin: 25px 0 0;
              color: #2e7d32;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.15em;
            }

            .success-card h1 {
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

            .success-text {
              margin: 18px 0 0;
              color: #666666;
              line-height: 1.8;
              font-size: 15px;
            }

            .success-actions {
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
              text-decoration: none;
              font-size: 14px;
              font-weight: 600;
            }

            .primary-btn {
              background: #111111;
              color: #ffffff;
              border: 1px solid #111111;
            }

            .secondary-btn {
              background: transparent;
              color: #111111;
              border: 1px solid #111111;
            }

            @media (max-width: 600px) {
              .success-page {
                padding: 24px 16px;
              }

              .success-card {
                padding: 42px 24px;
              }

              .success-icon {
                width: 76px;
                height: 76px;
                font-size: 34px;
              }

              .success-card h1 {
                font-size: 30px;
              }

              .success-text {
                font-size: 14px;
              }

              .success-actions {
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
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}