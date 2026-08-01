"use client";

import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="success-page">
      <div className="success-card">
        <div className="success-icon">
          ✓
        </div>

        <p className="success-tag">
          PAYMENT SUCCESSFUL
        </p>

        <h1>
          Thank You For Your Order
        </h1>

        <p className="success-text">
          Your payment has been received successfully.
          <br />
          We've started processing your order and you'll receive
          an order confirmation shortly.
        </p>

        <div className="success-actions">
          <Link href="/profile/orders" className="primary-btn">
            View My Orders
          </Link>

          <Link href="/" className="secondary-btn">
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
          max-width: 620px;
          width: 100%;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,.06);
        }

        .success-icon {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9f8ee;
          color: #2e7d32;
          font-size: 42px;
          font-weight: bold;
        }

        .success-tag {
          margin-top: 25px;
          color: #2e7d32;
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

        .success-text {
          margin-top: 18px;
          color: #666;
          line-height: 1.8;
          font-size: 15px;
        }

        .success-actions {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .primary-btn {
          background: #111;
          color: white;
          padding: 14px 32px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          transition: .3s;
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
          transition: .3s;
        }

        .secondary-btn:hover {
          background: #111;
          color: white;
        }

        @media(max-width:600px){

          .success-card{
            padding:40px 25px;
          }

          h1{
            font-size:30px;
          }

          .success-actions{
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