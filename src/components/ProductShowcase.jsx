"use client";

import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMG  = "/images/product/bedsheet.jpg";
const FALLBACK_NAME = "HAND BLOCK PERCALE PRINTED BEDSHEET";
const FALLBACK_SLUG = "#";

export default function ProductShowcase({ product = null }) {
  const bgImage   = product?.mainImage || FALLBACK_IMG;
  const cardImage = product?.mainImage || FALLBACK_IMG;
  const name      = product?.name?.toUpperCase() || FALLBACK_NAME;
  const slug      = product?.slug || FALLBACK_SLUG;

  return (
    <section className="showcase-section">

      {/* ── Full-width background image ── */}
      <div className="showcase-bg">
        <Image
          src={bgImage}
          alt={name}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>

      {/* ── Floating product card (left side) ── */}
      <div className="product-card">

        {/* Card image */}
        <div className="card-img-wrap">
          <Image
            src={cardImage}
            alt={name}
            fill
            sizes="420px"
            style={{ objectFit: "cover" }}
          />
          <button className="wishlist-btn" aria-label="Add to wishlist">♡</button>
        </div>

        {/* Card content */}
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
          <div className="card-actions">
            <Link href={`/enquiry1/${slug}`} className="price-btn">
              PRICE ENQUIRY →
            </Link>
            <Link href="/enquiry" className="bulk-btn">
              ✦ BULK CUSTOMIZATION
            </Link>
          </div>
        </div>

      </div>

      <style jsx>{`
        .showcase-section {
          position: relative;
          width: 100%;
          height: 700px;
          overflow: hidden;
          background: #FDFFF1;
        }
        .showcase-bg { position: absolute; inset: 0; z-index: 0; }
        .product-card {
          position: absolute;
          left: 60px;
          top: 70px;
          width: 380px;
          background: #FDFFF1;
          z-index: 10;
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10);
        }
        .card-img-wrap { position: relative; width: 100%; height: 360px; }
        .wishlist-btn {
          position: absolute;
          right: 14px;
          bottom: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #C4C3B2;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          color: #555;
          transition: background 0.2s, color 0.2s;
        }
        .wishlist-btn:hover { background: #7B7F5C; color: #fff; border-color: #7B7F5C; }
        .card-body { padding: 22px 24px 26px; }
        .card-title {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.5;
          color: #111;
          margin: 0 0 20px 0;
          letter-spacing: 0.01em;
        }
        .card-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .price-btn {
          background: #7B7F5C;
          color: #fff;
          border: none;
          padding: 13px 22px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
        }
        .price-btn:hover { background: #636749; }
        .bulk-btn {
          background: transparent;
          border: none;
          color: #111;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
          transition: color 0.2s;
          text-decoration: none;
        }
        .bulk-btn:hover { color: #7B7F5C; }
        @media (max-width: 1024px) {
          .showcase-section { height: 620px; }
          .product-card { left: 36px; top: 60px; width: 320px; }
          .card-img-wrap { height: 340px; }
        }
        @media (max-width: 768px) {
          .showcase-section { height: auto; display: flex; flex-direction: column; }
          .showcase-bg { position: relative; width: 100%; height: 55vw; min-height: 220px; max-height: 380px; flex-shrink: 0; }
          .product-card { position: relative; left: auto; top: auto; width: 88%; max-width: 320px; margin: -100px auto 0; }
          .card-img-wrap { height: 52vw; min-height: 180px; max-height: 240px; }
          .card-body { padding: 16px; }
          .card-title { font-size: 13px; margin-bottom: 14px; }
          .card-actions { flex-direction: column; gap: 10px; align-items: stretch; }
          .price-btn, .bulk-btn { width: 100%; font-size: 12px; }
        }
        @media (max-width: 480px) {
          .showcase-bg { height: 280px; }
          .card-img-wrap { height: 220px; }
          .card-body { padding: 18px 18px 22px; }
        }
        @media (min-width: 1440px) {
          .showcase-section { height: 700px; }
          .product-card { left: 80px; top: 70px; width: 420px; }
          .card-img-wrap { height: 360px; }
          .card-title { font-size: 16px; }
        }
        @media (min-width: 1920px) {
          .showcase-section { height: 980px; }
          .product-card { left: 100px; width: 460px; }
          .card-img-wrap { height: 520px; }
        }
      `}</style>
    </section>
  );
}
