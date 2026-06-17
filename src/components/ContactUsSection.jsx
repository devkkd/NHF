"use client";

import Image from "next/image";

export default function ContactUsSection() {
  return (
    <section className="contact-section">

      {/* Header */}

      <div className="header">
        <h2 className="main-title">CONTACT US</h2>

        <h3 className="sub-title">
            We&apos;d Love To Hear From You
        </h3>

        <p className="intro-text">
          Whether You Have A Question About A Product, Want To Discuss A
          Custom Order, Or Are A Buyer Interested In Wholesale The Nikita
          Team Is Here, And We Answer Every Message Personally.
        </p>
      </div>

      {/* Contact + Bulk */}

      <div className="contact-grid">

        <div className="left-col">
          <h3 className="section-heading">
            Contact Details
          </h3>

          <div className="contact-content">
            <p>
              <strong>Phone:</strong> +91 9460387858
              <br />
              Available Mon–Sat, 9am–6pm IST. Call or WhatsApp,
              we&apos;re responsive on both.
            </p>

            <p>
              <strong>Email:</strong> nikitahomefurnishings@yahoo.com
              <br />
              For all product enquiries, custom orders,
              and wholesale conversations.
            </p>

            <p>
              <strong>Studio Address:</strong>
              <br />
              38, Gupta Garden, Govind Nagar West
              <br />
              Behind Amer City Heritage Hotel
              <br />
              Amer Road, Jaipur – 302002
              <br />
              Rajasthan, India
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="right-col">
          <h3 className="section-heading">
            Bulk & Export Enquiries
          </h3>

          <div className="bulk-content">
            <p>
              Nikita supplies home décor boutiques, lifestyle retailers,
              and wholesale buyers across more than 30 countries.
            </p>

            <p>
                If you&apos;re interested in carrying our collection or placing
              labelling please reach out directly.
            </p>

            <p>
              We handle every export enquiry with the same personal
              attention as our individual orders.
            </p>

            <button className="primary-btn">
              BULK ORDER →
            </button>
          </div>
        </div>

      </div>

      {/* Studio */}

      <div className="studio-grid">

        <div className="studio-content">
          <h3 className="section-heading">
            Visit Our Studio
          </h3>

          <p>
            Our studio in Jaipur is open to buyers, curators,
            and anyone who wants to see how we work.
          </p>

          <p>
            You&apos;ll find the production area where pieces are
            hand-printed and assembled, the sample room where
            new designs are tested, and a full display of the
            current collection.
          </p>

          <p>
            Studio visits are by appointment simply call ahead
            or send us a message, and we&apos;ll arrange everything.
            There&apos;s always a pot of chai on.
          </p>

          <button className="primary-btn">
            BOOK A STUDIO VISIT →
          </button>
        </div>

        {/* Clickable Map */}

        <div className="map-wrap">
  <iframe
    src="https://www.google.com/maps?q=38,Gupta%20Garden,Govind%20Nagar%20West,Amer%20Road,Jaipur,Rajasthan%20302002&output=embed"
    loading="lazy"
    allowFullScreen
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>

      </div>

      <style jsx>{`
        .contact-section {
          background: #FDFFF1;
          padding: 90px 60px;
        }

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
          margin-bottom: 18px;
           margin-top: 18px;
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .divider {
          background: #D8D8CC;
          width: 1px;
        }

        .section-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 42px;
          color: #7B7F5C;
          margin-bottom: 32px;
        }

        .contact-content,
        .bulk-content,
        .studio-content {
          font-family: "Mona Sans", sans-serif;
          color: #222;
          font-size: 17px;
          line-height: 1.9;
        }

        .contact-content p,
        .bulk-content p,
        .studio-content p {
          margin-bottom: 28px;
        }

        .primary-btn {
          margin-top: 20px;
          background: #858763;
          color: #fff;
          border: none;
          padding: 18px 40px;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          cursor: pointer;
          min-width: 280px;
        }

        .studio-grid {
          border-top: 1px solid #D8D8CC;
          padding-top: 70px;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }

        .map-wrap {
          position: relative;
          width: 100%;
          height: 420px;
          display: block;
          overflow: hidden;
        }
.map-wrap iframe {
  width: 100%;
  height: 100%;
  border: none;
}
        @media (max-width: 991px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .divider {
            display: none;
          }

          .studio-grid {
            grid-template-columns: 1fr;
          }

          .map-wrap {
            height: 380px;
          }
        }

        @media (max-width: 768px) {
          .contact-section {
            padding: 60px 20px;
          }

          .main-title {
            font-size: 28px;
          }

          .sub-title {
            font-size: 24px;
          }

          .section-heading {
            font-size: 32px;
          }

          .intro-text {
            font-size: 17px;
          }

          .primary-btn {
            width: 100%;
            min-width: auto;
          }

          .map-wrap {
            height: 300px;
          }
        }
      `}</style>
    </section>
  );
}