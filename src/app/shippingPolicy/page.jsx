"use client";

import Link from "next/link";

export default function ShippingPolicy() {
  return (
    <section className="shipping-section">

      {/* =========================
          HEADER
      ========================= */}

      <div className="header">
        <h2 className="main-title">
          SHIPPING POLICY
        </h2>

        <h3 className="sub-title">
          Thoughtfully Packed, Carefully Delivered
        </h3>

        <p className="intro-text">
          At Nikita Home Furnishings, every piece is prepared with care
          before it leaves our studio in Jaipur. Whether you are placing
          an individual order or enquiring about a larger wholesale or
          export requirement, we work to ensure your collection reaches
          you safely and on time.
        </p>
      </div>


      {/* =========================
          SHIPPING OVERVIEW
      ========================= */}

      <div className="policy-grid">

        <div className="policy-column">
          <h3 className="section-heading">
            Order Processing
          </h3>

          <div className="policy-content">

            <p>
              Orders are generally processed within{" "}
              <strong>2–5 business days</strong> after payment has been
              successfully received.
            </p>

            <p>
              Products that are made, finished, or prepared specifically
              for your order may require additional processing time.
              If there is any expected delay, our team will contact you
              directly.
            </p>

            <p>
              Once your order has been dispatched, you will receive the
              available shipment or tracking details by email or through
              the contact information provided at checkout.
            </p>

          </div>
        </div>


        <div className="divider" />


        <div className="policy-column">
          <h3 className="section-heading">
            Domestic Shipping
          </h3>

          <div className="policy-content">

            <p>
              We currently ship orders across India through reliable
              courier and logistics partners.
            </p>

            <p>
              Standard domestic deliveries generally take around{" "}
              <strong>3–7 business days</strong> after dispatch,
              depending on the destination and courier service.
            </p>

            <p>
              Remote locations, weather conditions, public holidays,
              or courier delays may occasionally extend the delivery
              timeline.
            </p>

          </div>
        </div>

      </div>


      {/* =========================
          INTERNATIONAL
      ========================= */}

      <div className="full-policy">

        <h3 className="section-heading">
          International & Export Shipping
        </h3>

        <div className="policy-content">

          <p>
            Nikita Home Furnishings works with buyers, boutiques,
            lifestyle retailers, designers, and wholesale partners
            across international markets.
          </p>

          <p>
            International shipping arrangements depend on the order
            size, destination, product requirements, and shipping
            method selected. For larger wholesale or export orders,
            our team will provide shipping details and a quotation
            separately.
          </p>

          <p>
            International delivery timelines can vary depending on
            destination, customs clearance, documentation, and the
            logistics partner handling the shipment.
          </p>

          <p>
            Any customs duties, import taxes, local clearance charges,
            or other destination-specific fees, where applicable,
            are the responsibility of the buyer unless otherwise
            agreed in writing.
          </p>

        </div>

      </div>


      {/* =========================
          BULK ORDERS
      ========================= */}

      <div className="bulk-grid">

        <div className="bulk-content">

          <h3 className="section-heading">
            Bulk & Wholesale Orders
          </h3>

          <p>
            For bulk, wholesale, hospitality, or export requirements,
            shipping is arranged according to the nature and volume
            of the order.
          </p>

          <p>
            Larger orders may be shipped in consolidated consignments
            or through freight partners depending on the destination
            and requirement.
          </p>

          <p>
            Before dispatch, our team will coordinate the shipment
            details with the buyer and share the relevant information
            regarding packaging, dispatch, and transportation.
          </p>

          <Link
            href="/enquiry"
            className="primary-btn"
          >
            BULK & EXPORT ENQUIRY →
          </Link>

        </div>


        <div className="bulk-note">

          <div className="note-box">

            <span className="note-label">
              A NOTE FROM OUR STUDIO
            </span>

            <p>
              Because many of our pieces are handcrafted and prepared
              with individual attention, we take particular care with
              packaging before dispatch.
            </p>

            <p>
              Our goal is simple: your order should arrive in the same
              beautiful condition in which it left our Jaipur studio.
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          DELIVERY INFORMATION
      ========================= */}

      <div className="delivery-section">

        <h3 className="section-heading">
          Delivery Information
        </h3>

        <div className="delivery-grid">

          <div className="delivery-item">
            <span className="number">
              01
            </span>

            <h4>
              Accurate Address
            </h4>

            <p>
              Please make sure your delivery address, phone number,
              and other contact details are correct before completing
              your order.
            </p>
          </div>


          <div className="delivery-item">
            <span className="number">
              02
            </span>

            <h4>
              Receiving Your Order
            </h4>

            <p>
              Please inspect the outer packaging when receiving your
              parcel. If there appears to be significant damage,
              please notify the delivery partner and contact us
              as soon as possible.
            </p>
          </div>


          <div className="delivery-item">
            <span className="number">
              03
            </span>

            <h4>
              Delayed Deliveries
            </h4>

            <p>
              If your shipment is delayed beyond the expected delivery
              window, please contact our team and we will assist with
              the shipment status.
            </p>
          </div>

        </div>

      </div>


      {/* =========================
          CONTACT
      ========================= */}

      <div className="contact-strip">

        <div>
          <h3 className="section-heading">
            Need Help With Your Shipment?
          </h3>

          <p>
            For questions regarding an existing order, delivery,
            international shipping, or a wholesale shipment, our team
            is happy to assist.
          </p>
        </div>

        <Link
          href="/contact"
          className="primary-btn"
        >
          CONTACT US →
        </Link>

      </div>


      {/* =========================
          STYLES
      ========================= */}

      <style jsx>{`

        /* =========================================
           MAIN
        ========================================= */

        .shipping-section {
          background: #FDFFF1;
          padding: 90px 60px;
          color: #222;
        }


        /* =========================================
           HEADER
        ========================================= */

        .header {
          text-align: center;
          max-width: 1100px;
          margin: 0 auto 80px;
        }

        .main-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 30px;
          font-weight: 600;
          color: #7B7F5C;
          margin: 18px 0;
        }

        .sub-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 28px;
          font-weight: 500;
          color: #7B7F5C;
          margin-bottom: 24px;
        }

        .intro-text {
          font-family: "Mona Sans", sans-serif;
          font-size: 20px;
          line-height: 1.7;
          color: #0E0E0E;
          max-width: 1000px;
          margin: 0 auto;
        }


        /* =========================================
           TWO COLUMN POLICY
        ========================================= */

        .policy-grid {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .divider {
          width: 1px;
          background: #D8D8CC;
        }

        .section-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 42px;
          font-weight: 500;
          line-height: 1.2;
          color: #7B7F5C;
          margin: 0 0 32px;
        }

        .policy-content,
        .bulk-content,
        .note-box,
        .delivery-item,
        .contact-strip {
          font-family: "Mona Sans", sans-serif;
          font-size: 19px;
          line-height: 1.9;
          color: #222;
        }

        .policy-content p,
        .bulk-content p,
        .note-box p,
        .delivery-item p,
        .contact-strip p {
          margin: 0 0 28px;
        }

        .policy-content strong {
          font-weight: 600;
          color: #0E0E0E;
        }


        /* =========================================
           FULL WIDTH POLICY
        ========================================= */

        .full-policy {
          border-top: 1px solid #D8D8CC;
          padding-top: 70px;
          margin-bottom: 80px;
        }

        .full-policy .policy-content {
          max-width: 1100px;
        }


        /* =========================================
           BULK SECTION
        ========================================= */

        .bulk-grid {
          border-top: 1px solid #D8D8CC;
          padding-top: 70px;
          margin-bottom: 80px;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }

        .bulk-content {
          max-width: 650px;
        }

        .bulk-note {
          display: flex;
          justify-content: center;
        }

        .note-box {
          border: 1px solid #D8D8CC;
          padding: 45px;
          max-width: 520px;
          width: 100%;
        }

        .note-label {
          display: block;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: #7B7F5C;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .note-box p:last-child {
          margin-bottom: 0;
        }


        /* =========================================
           BUTTON
        ========================================= */

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          margin-top: 10px;

          background: #858763;
          color: #fff;

          border: none;

          padding: 18px 40px;

          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;

          text-decoration: none;

          cursor: pointer;

          min-width: 280px;

          transition: opacity 0.25s ease;
        }

        .primary-btn:hover {
          opacity: 0.85;
        }


        /* =========================================
           DELIVERY
        ========================================= */

        .delivery-section {
          border-top: 1px solid #D8D8CC;
          padding-top: 70px;
          margin-bottom: 80px;
        }

        .delivery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .delivery-item {
          border-top: 2px solid #7B7F5C;
          padding-top: 24px;
        }

        .number {
          display: block;

          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;

          color: #7B7F5C;

          margin-bottom: 18px;
        }

        .delivery-item h4 {
          font-family: "Tobias TRIAL", serif;
          font-size: 28px;
          font-weight: 500;
          color: #7B7F5C;
          margin: 0 0 18px;
        }


        /* =========================================
           CONTACT STRIP
        ========================================= */

        .contact-strip {
          border-top: 1px solid #D8D8CC;

          padding-top: 70px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 60px;
        }

        .contact-strip > div {
          max-width: 800px;
        }

        .contact-strip .section-heading {
          margin-bottom: 20px;
        }

        .contact-strip p {
          margin-bottom: 0;
        }


        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 991px) {

          .shipping-section {
            padding: 70px 30px;
          }

          .policy-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }

          .divider {
            display: none;
          }

          .bulk-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }

          .bulk-content {
            max-width: none;
          }

          .bulk-note {
            justify-content: flex-start;
          }

          .delivery-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .contact-strip {
            flex-direction: column;
            align-items: flex-start;
          }

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 768px) {

          .shipping-section {
            padding: 60px 20px;
          }


          /* Header */

          .header {
            margin-bottom: 60px;
          }

          .main-title {
            font-size: 28px;
            margin-top: 10px;
            margin-bottom: 16px;
          }

          .sub-title {
            font-size: 24px;
            line-height: 1.3;
            margin-bottom: 20px;
          }

          .intro-text {
            font-size: 17px;
            line-height: 1.7;
          }


          /* Headings */

          .section-heading {
            font-size: 32px;
            line-height: 1.25;
            margin-bottom: 24px;
          }


          /* Body */

          .policy-content,
          .bulk-content,
          .note-box,
          .delivery-item,
          .contact-strip {
            font-size: 17px;
            line-height: 1.75;
          }

          .policy-content p,
          .bulk-content p,
          .note-box p,
          .delivery-item p {
            margin-bottom: 22px;
          }


          /* Full section */

          .full-policy {
            padding-top: 50px;
            margin-bottom: 60px;
          }


          /* Bulk */

          .bulk-grid {
            padding-top: 50px;
            margin-bottom: 60px;
            gap: 40px;
          }

          .note-box {
            padding: 30px 24px;
          }


          /* Delivery */

          .delivery-section {
            padding-top: 50px;
            margin-bottom: 60px;
          }

          .delivery-grid {
            gap: 35px;
          }

          .delivery-item h4 {
            font-size: 25px;
          }


          /* Button */

          .primary-btn {
            width: 100%;
            min-width: auto;
            padding: 16px 25px;
            font-size: 13px;
          }


          /* Contact */

          .contact-strip {
            padding-top: 50px;
            gap: 30px;
          }

        }


        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 480px) {

          .shipping-section {
            padding: 48px 20px;
          }

          .header {
            margin-bottom: 48px;
          }

          .main-title {
            font-size: 26px;
          }

          .sub-title {
            font-size: 22px;
          }

          .intro-text {
            font-size: 16px;
          }

          .section-heading {
            font-size: 29px;
          }

          .policy-content,
          .bulk-content,
          .note-box,
          .delivery-item,
          .contact-strip {
            font-size: 16px;
            line-height: 1.7;
          }

          .note-box {
            padding: 25px 20px;
          }

          .delivery-item h4 {
            font-size: 23px;
          }

          .number {
            font-size: 11px;
          }

        }

      `}</style>

    </section>
  );
}