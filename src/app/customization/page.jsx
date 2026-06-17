"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function CustomizationPage() {
  return (
    <>
      <Header />

      <main className="customization-page">
        <section className="coming-soon-section">
          {/* Logo */}
          <div className="logo-wrap">
            <Image
              src="/images/Logo - Black 1.png"
              alt="Nikita Home Furnishings"
              width={70}
              height={70}
              className="logo"
            />
          </div>

          {/* Heading */}
          <h1 className="main-heading">
            Something Beautiful Is Being Crafted For You
          </h1>

          {/* Description */}
          <div className="description">
            <p>
              Soon, Nikita Home Furnishings Will Introduce A Dedicated
            </p>

            <p>✦ Customization Experience</p>

            <p>
              Where You Can Personalize Handcrafted Textiles, Garments,
              Home Décor, And Lifestyle Products Exactly The Way You Imagine.
            </p>

            <br />

            <p>
              Designed With Heritage Craftsmanship.
              Customized For Modern Living.
            </p>
          </div>

          {/* Button */}
          <button className="coming-btn">
            ✦ Coming Soon
          </button>
        </section>
      </main>

      

      <style jsx>{`
        .customization-page {
          background: #000;
          min-height: 100vh;
        }

        .coming-soon-section {
          min-height: 100vh;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 20px;
        }

        .logo-wrap {
          margin-bottom: 36px;
        }

        .logo {
          object-fit: contain;
        }

        .main-heading {
          max-width: 900px;
          margin: 0;
          color: #e9d5d7;
          font-family: "Tobias TRIAL", serif;
          font-weight: 600;
          font-size: 40px;
          line-height: 160%;
          letter-spacing: -0.02em;
        }

        .description {
          margin-top: 26px;
          max-width: 700px;
          color: #e9d5d7;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 400;
          line-height: 160%;
          opacity: 0.95;
        }

        .description p {
          margin: 0;
        }

        .coming-btn {
          margin-top: 48px;
          width: 260px;
          height: 70px;
          border: none;
          cursor: pointer;
          background: #43292c;
          color: #ffffff;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .coming-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .coming-soon-section {
            padding: 100px 24px;
          }

          .logo {
            width: 55px;
            height: 55px;
          }

          .main-heading {
            font-size: 28px;
            line-height: 150%;
          }

          .description {
            font-size: 15px;
            max-width: 100%;
          }

          .coming-btn {
            width: 220px;
            height: 58px;
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}