"use client";

import Link from "next/link";

export default function CheckoutFailedPage() {
  return (
    <main className="failed-page">
      <div className="failed-card">
        <div className="failed-icon">
          ✕
        </div>

        <p className="failed-tag">
          PAYMENT FAILED
        </p>

        <h1>
          Payment Was Not Completed
        </h1>

        <p className="failed-text">
          Your payment could not be completed.
          <br />
          Don't worry, no amount will be deducted if the transaction failed.
          You can try again.
        </p>

        <div className="failed-actions">
          <button
            onClick={() => window.history.back()}
            className="primary-btn"
          >
            Try Again
          </button>

          <Link href="/" className="secondary-btn">
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
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,.06);
        }

        .failed-icon {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fdeaea;
          color: #d32f2f;
          font-size: 42px;
          font-weight: bold;
        }

        .failed-tag {
          margin-top: 25px;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: .15em;
        }

        h1 {
          margin-top: 18px;
          font-size: 38px;
          font-weight: 600;
          color: #111;
        }

        .failed-text {
          margin-top: 18px;
          color: #666;
          line-height: 1.8;
          font-size: 15px;
        }

        .failed-actions {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .primary-btn {
          background: #111;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
        }

        .primary-btn:hover {
          background: #7b7f5c;
        }

        .secondary-btn {
          border: 1px solid #111;
          color: #111;
          padding: 14px 32px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
        }

        .secondary-btn:hover {
          background: #111;
          color: #fff;
        }

        @media (max-width:600px) {

          .failed-card{
            padding:40px 25px;
          }

          h1{
            font-size:30px;
          }

          .failed-actions{
            flex-direction:column;
          }

          .primary-btn,
          .secondary-btn{
            width:100%;
          }

        }
      `}</style>
    </main>
  );
}