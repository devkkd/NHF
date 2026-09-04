"use client";

import Link from "next/link";

export default function ReturnPolicy() {
  return (
    <section className="return-policy-section">
      <div className="return-policy-container">

        {/* HEADER */}
        <div className="return-policy-header">
          <h1>RETURN POLICY</h1>
          <h2>We Care About What Reaches You</h2>
          <p className="return-policy-intro">
            Every piece from Nikita Home Furnishings is carefully checked and
            packed before dispatch. Returns are accepted only in case the
            product is received damaged.
          </p>
        </div>

        {/* DAMAGE RETURN */}
        <div className="return-policy-block">
          <span className="return-policy-number">01</span>

          <div>
            <h3>Damaged Product Returns</h3>

            <p>
              If your order arrives damaged, you may request a return for the
              damaged product. We recommend checking your package and product
              carefully immediately after delivery.
            </p>

            <p>
              If you notice any damage, please contact our team as soon as
              possible and share clear photographs or videos showing the
              damage and the product packaging.
            </p>

            <p>
              Our team will review the details and guide you through the next
              steps for the damaged product.
            </p>
          </div>
        </div>

        <div className="return-policy-divider" />

        {/* WHAT IS NOT RETURNABLE */}
        <div className="return-policy-block">
          <span className="return-policy-number">02</span>

          <div>
            <h3>Other Products & Returns</h3>

            <p>
              Products that are not damaged are not eligible for return under
              our standard return policy.
            </p>

            <p>
              Returns will not be accepted simply because of a change of mind,
              personal preference, or incorrect selection.
            </p>

            <p>
              If you have any concern regarding your order or product, please
              contact our team and we will be happy to assist you.
            </p>
          </div>
        </div>

        <div className="return-policy-divider" />

        {/* IMPORTANT */}
        <div className="return-policy-block">
          <span className="return-policy-number">03</span>

          <div>
            <h3>Important Information</h3>

            <ul>
              <li>
                Please inspect the product carefully when your order is
                delivered.
              </li>

              <li>
                Report any visible damage to our team as soon as possible.
              </li>

              <li>
                Clear photographs or videos of the damaged product and
                packaging may be required for verification.
              </li>

              <li>
                Please retain the original packaging until the issue has been
                reviewed and resolved.
              </li>

              <li>
                Return requests are subject to verification and approval by
                our team.
              </li>
            </ul>
          </div>
        </div>

        {/* NOTE BOX */}
        <div className="return-policy-note">
          <div className="return-policy-note-title">
            Received Your Order Damaged?
          </div>

          <p>
            Don't worry. Contact our team with your order details and clear
            photos/videos of the damage. We will review the issue and assist
            you with the return process.
          </p>
        </div>

        {/* CONTACT */}
        <div className="return-policy-contact">
          <div>
            <h3>Need Help With Your Order?</h3>

            <p>
              For damaged products or any other concern regarding your order,
              please get in touch with our team.
            </p>
          </div>

          <div className="return-policy-actions">
            <Link href="/contact" className="return-policy-button">
              CONTACT US
            </Link>

            <Link href="/enquiry" className="return-policy-button secondary">
              SEND AN ENQUIRY
            </Link>
          </div>
        </div>

      </div>

      <style jsx>{`
        .return-policy-section {
          background: #fdfff1;
          min-height: 100vh;
          padding: 100px 60px;
        }

        .return-policy-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        /* HEADER */

        .return-policy-header {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 85px;
        }

        .return-policy-header h1 {
          margin: 0 0 18px;
          font-family: "Tobias TRIAL", serif;
          font-size: 30px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #7b7f5c;
        }

        .return-policy-header h2 {
          margin: 0 0 30px;
          font-family: "Tobias TRIAL", serif;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 400;
          color: #7b7f5c;
        }

        .return-policy-intro {
          margin: 0 auto;
          max-width: 780px;
          font-family: "Mona Sans", sans-serif;
          font-size: 20px;
          line-height: 1.7;
          color: #222;
        }

        /* BLOCKS */

        .return-policy-block {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 45px;
          align-items: start;
          padding: 20px 0 55px;
        }

        .return-policy-number {
          font-family: "Tobias TRIAL", serif;
          font-size: 22px;
          color: #7b7f5c;
          letter-spacing: 0.08em;
          padding-top: 8px;
        }

        .return-policy-block h3 {
          margin: 0 0 22px;
          font-family: "Tobias TRIAL", serif;
          font-size: 42px;
          line-height: 1.15;
          font-weight: 400;
          color: #7b7f5c;
        }

        .return-policy-block p {
          margin: 0 0 18px;
          max-width: 900px;
          font-family: "Mona Sans", sans-serif;
          font-size: 19px;
          line-height: 1.75;
          color: #222;
        }

        .return-policy-block p:last-child {
          margin-bottom: 0;
        }

        .return-policy-divider {
          width: 100%;
          height: 1px;
          background: #d8d8cc;
        }

        /* LIST */

        .return-policy-block ul {
          margin: 0;
          padding: 0 0 0 22px;
          max-width: 900px;
        }

        .return-policy-block li {
          margin-bottom: 15px;
          padding-left: 8px;
          font-family: "Mona Sans", sans-serif;
          font-size: 19px;
          line-height: 1.7;
          color: #222;
        }

        .return-policy-block li:last-child {
          margin-bottom: 0;
        }

        /* NOTE */

        .return-policy-note {
          margin: 55px 0 70px;
          padding: 35px 40px;
          border: 1px solid #d8d8cc;
          background: rgba(255, 255, 255, 0.35);
        }

        .return-policy-note-title {
          margin-bottom: 12px;
          font-family: "Tobias TRIAL", serif;
          font-size: 28px;
          color: #7b7f5c;
        }

        .return-policy-note p {
          margin: 0;
          max-width: 950px;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          line-height: 1.7;
          color: #222;
        }

        /* CONTACT */

        .return-policy-contact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          padding: 45px 0 0;
          border-top: 1px solid #d8d8cc;
        }

        .return-policy-contact h3 {
          margin: 0 0 12px;
          font-family: "Tobias TRIAL", serif;
          font-size: 32px;
          font-weight: 400;
          color: #7b7f5c;
        }

        .return-policy-contact p {
          margin: 0;
          max-width: 650px;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          line-height: 1.6;
          color: #222;
        }

        .return-policy-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .return-policy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          background: #858763;
          color: #fff;
          text-decoration: none;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          transition: opacity 0.2s ease;
        }

        .return-policy-button:hover {
          opacity: 0.85;
        }

        .return-policy-button.secondary {
          background: transparent;
          color: #7b7f5c;
          border: 1px solid #858763;
        }

        /* TABLET */

        @media (max-width: 991px) {
          .return-policy-section {
            padding: 75px 35px;
          }

          .return-policy-block {
            grid-template-columns: 70px 1fr;
            gap: 30px;
          }

          .return-policy-block h3 {
            font-size: 36px;
          }

          .return-policy-contact {
            align-items: flex-start;
            flex-direction: column;
          }

          .return-policy-actions {
            width: 100%;
          }
        }

        /* MOBILE */

        @media (max-width: 767px) {
          .return-policy-section {
            padding: 60px 20px;
          }

          .return-policy-header {
            margin-bottom: 60px;
          }

          .return-policy-header h1 {
            font-size: 26px;
            margin-bottom: 14px;
          }

          .return-policy-header h2 {
            font-size: 26px;
            margin-bottom: 22px;
          }

          .return-policy-intro {
            font-size: 17px;
            line-height: 1.65;
          }

          .return-policy-block {
            display: block;
            padding: 10px 0 42px;
          }

          .return-policy-number {
            display: block;
            margin-bottom: 15px;
            font-size: 18px;
          }

          .return-policy-block h3 {
            font-size: 32px;
            margin-bottom: 18px;
          }

          .return-policy-block p {
            font-size: 17px;
            line-height: 1.7;
            margin-bottom: 15px;
          }

          .return-policy-block li {
            font-size: 17px;
            line-height: 1.65;
            margin-bottom: 12px;
          }

          .return-policy-note {
            margin: 42px 0 50px;
            padding: 28px 24px;
          }

          .return-policy-note-title {
            font-size: 25px;
          }

          .return-policy-note p {
            font-size: 16px;
            line-height: 1.65;
          }

          .return-policy-contact {
            padding-top: 35px;
            gap: 25px;
          }

          .return-policy-contact h3 {
            font-size: 29px;
          }

          .return-policy-contact p {
            font-size: 16px;
          }

          .return-policy-actions {
            flex-direction: column;
          }

          .return-policy-button {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .return-policy-section {
            padding: 48px 20px;
          }

          .return-policy-header h1 {
            font-size: 24px;
          }

          .return-policy-header h2 {
            font-size: 24px;
          }

          .return-policy-block h3 {
            font-size: 29px;
          }
        }
      `}</style>
    </section>
  );
}