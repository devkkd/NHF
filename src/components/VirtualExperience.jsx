"use client";

import Image from "next/image";

export default function VirtualExperience() {
  return (
    <section className="virtual-section">
      <div className="virtual-container">

        <h2 className="virtual-title">
          Nikita Home Furnishing - Luxury Store 360° Virtual Experience
        </h2>

        <p className="virtual-description">
          Step inside a world of refined interiors, timeless elegance,
          and premium home furnishing craftsmanship.
        </p>

        <div className="virtual-image-wrap">
          <Image
            src="/images/product/nikita.png"
            alt="Nikita Home Furnishing Virtual Experience"
            fill
            priority
            style={{
              objectFit: "cover",
            }}
          />
        </div>

      </div>

      <style jsx>{`
        .virtual-section {
          background: #fdfff1;
          padding: 80px 0px 60px;
        }

        .virtual-container {
            width: 100%;
          margin: 0 auto;
        }

        .virtual-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 42px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.02em;
          color: #7b7f5c;
          text-align: center;
          margin-bottom: 22px;
        }

        .virtual-description {
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 400;
          line-height: 1.7;
          color: #0e0e0e;
          text-align: center;
          max-width: 900px;
          margin: 0 auto 50px;
        }

        .virtual-image-wrap {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
        }

        @media (max-width: 1200px) {
          .virtual-title {
            font-size: 36px;
          }

          .virtual-image-wrap {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .virtual-section {
            padding: 60px 0px 40px;
          }

          .virtual-title {
            font-size: 28px;
            line-height: 1.5;
          }

          .virtual-description {
            font-size: 15px;
            margin-bottom: 30px;
          }

          .virtual-image-wrap {
            height: 320px;
          }
        }

        @media (max-width: 480px) {
          .virtual-title {
            font-size: 24px;
          }

          .virtual-description {
            font-size: 14px;
          }

          .virtual-image-wrap {
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}