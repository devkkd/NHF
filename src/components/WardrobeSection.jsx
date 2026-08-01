"use client";

import Image from "next/image";
import Link from "next/link";

const FALLBACK = [
  { title: "Kaftans",  image: "/images/wardrobe/1.png", slug: "kaftans" },
  { title: "Jackets",  image: "/images/wardrobe/2.png", slug: "jackets-bathrobes" },
  { title: "Bags",     image: "/images/wardrobe/3.png", slug: "bags-pouches" },
];

export default function WardrobeSection({ categories = [] }) {
  const items = categories.length > 0
    ? categories.slice(0, 3).map((c, i) => ({
        title: c.name,
        image: c.image || `/images/wardrobe/${(i % 3) + 1}.png`,
        slug:  c.slug,
      }))
    : FALLBACK;

  return (
    <section className="wardrobe-section">
      <div className="wardrobe-container">
        <h2 className="wardrobe-heading">
          THE WARDROBE
        </h2>

        <div className="wardrobe-grid">
          {items.map((item) => (
            <Link key={item.slug} href={`/${item.slug}`} className="wardrobe-card-link">
              <div className="wardrobe-card">
                <div className="image-wrapper">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h5>{item.title} →</h5>
              </div>
            </Link>
          ))}
        </div>

        <div className="wardrobe-btn-wrap">
          <Link href="/wardrobe" className="wardrobe-btn">
            SEE FULL OUR WARDROBE →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .wardrobe-section {
          background: #FDFFF1;
          padding: 90px 40px;
          box-sizing: border-box;
        }
        .wardrobe-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .wardrobe-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 40px;
          font-weight: 400;
          line-height: 160%;
          letter-spacing: -0.02em;
          color: #7B7F5C;
          text-align: center;
          margin: 0 0 40px;
        }
        .wardrobe-card-link { text-decoration: none; display: block; }
        .wardrobe-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .wardrobe-card { text-align: center; }
        .image-wrapper {
          position: relative;
          width: 100%;
          max-width: 580px;
          height: 460px;
          overflow: hidden;
          margin: 0 auto;
        }
        .wardrobe-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
        }
        .wardrobe-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }
        .wardrobe-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7b7f5c;
          padding-bottom: 8px;
          color: #7b7f5c;
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          cursor: pointer;
          letter-spacing: 0.02em;
          text-decoration: none;
        }

        /* ---------- TABLET ---------- */
        @media (max-width: 1024px) {
          .wardrobe-section { padding: 70px 28px; }
          .wardrobe-heading { font-size: 34px; margin-bottom: 32px; }
          .wardrobe-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .image-wrapper { height: 380px; }
        }

        /* ---------- MOBILE ---------- */
        @media (max-width: 768px) {
          .wardrobe-section { padding: 56px 20px; }
          .wardrobe-heading { font-size: 28px; margin-bottom: 28px; }
          .wardrobe-grid { grid-template-columns: fr; gap: 32px; }
          .image-wrapper { height: 320px; width: 100%; max-width: 100%; }
          .wardrobe-card h5 { font-size: 20px; margin-top: 14px; }
          .wardrobe-btn-wrap { margin-top: 32px; }
          .wardrobe-btn { font-size: 14px; }
        }

        /* ---------- SMALL MOBILE ---------- */
        @media (max-width: 480px) {
          .wardrobe-section { padding: 44px 16px; }
          .wardrobe-heading { font-size: 24px; margin-bottom: 22px; }
          .image-wrapper { height: 280px; }
          .wardrobe-card h5 { font-size: 17px; }
          .wardrobe-btn { font-size: 13px; }
        }
      `}</style>
    </section>
  );
}