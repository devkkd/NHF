"use client";

import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMG_CARD = "/images/product/new2.png";
const FALLBACK_IMG_BIG  = "/images/product/new1.png";
const FALLBACK_NAME     = "HAND BLOCK PERCALE PRINTED BEDSHEET";
const FALLBACK_SLUG     = "#";

export default function NewArrivals({ product = null }) {
  const cardImage = product?.mainImage || FALLBACK_IMG_CARD;
  const bigImage  = product?.galleryImages?.[0] || product?.mainImage || FALLBACK_IMG_BIG;
  const name      = product?.name?.toUpperCase() || FALLBACK_NAME;
  const slug      = product?.slug || FALLBACK_SLUG;

  return (
    <section className="arrival-section">

      {/* ── TOP: Heading left + Paragraph right ── */}
      <div className="top-row">
        <div className="top-left">
          <h2 className="main-heading">
            A HOME IS A FEELING,<br />
            WE HELP YOU BUILD IT.
          </h2>
        </div>
        <div className="top-right">
          <p className="main-para">
            The morning light through a window. The weight of a good quilt.
            The quiet ritual of a bed made beautifully. A scarf chosen not
            because it was convenient but because it felt exactly right.
            These are the small, significant details that separate a house
            from a home and a life from a lifestyle. At Nikita, we make the
            things that fill those moments: bedcovers that you&apos;ll reach for
            every single night, throws that live on your sofa like old
            friends, kaftans that make you feel dressed even when you&apos;re
            completely at ease.
          </p>
        </div>
      </div>

      {/* ── BOTTOM: Product card left + Big image right ── */}
      <div className="bottom-row">

        {/* Left — product card */}
        <div className="product-card">
          <div className="card-img-wrap">
            <Image
              src={cardImage}
              alt={name}
              fill
              sizes="(max-width:768px) 100vw, 440px"
              style={{ objectFit: "cover" }}
            />
            <button className="wishlist-btn" aria-label="Wishlist">♡</button>
          </div>
          <div className="card-body">
            <h4 className="card-title">{name}</h4>
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

        {/* Right — big showcase image */}
        <div className="big-img-wrap">
          <Image
            src={bigImage}
            alt={name}
            fill
            sizes="60vw"
            style={{ objectFit: "cover" }}
          />
        </div>

      </div>

      <style jsx>{`
        .arrival-section {
          background: #FDFFF1;
          padding: 72px 80px;
        }
        .top-row {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 80px;
          align-items: start;
          margin-bottom: 56px;
        }
        .main-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: clamp(28px, 3.2vw, 46px);
          font-weight: 600;
          line-height: 1.25;
          color: #7B7F5C;
          margin: 0;
        }
        .main-para {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          line-height: 1.9;
          color: #111;
          margin: 0;
        }
        .bottom-row {
          display: grid;
          grid-template-columns: 440px 1fr;
          gap: 95px;
          align-items: stretch;
        }
        .product-card { display: flex; flex-direction: column; background: transparent; }
        .card-img-wrap {
          position: relative;
          width: 100%;
          height: 380px;
          overflow: hidden;
          background: #f0f0eb;
        }
        .wishlist-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #C4C3B2;
          background: #fff;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          transition: background 0.2s, color 0.2s;
        }
        .wishlist-btn:hover { background: #7B7F5C; color: #fff; border-color: #7B7F5C; }
        .card-body { padding: 22px 0 0; }
        .card-title {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.5;
          color: #0E0E0E;
          margin: 0 0 20px 0;
        }
        .card-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .price-btn {
          background: #7B7F5C;
          color: #fff;
          border: none;
          padding: 13px 24px;
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
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s;
          text-decoration: none;
        }
        .bulk-btn:hover { color: #7B7F5C; }
        .big-img-wrap {
          position: relative;
          width: calc(100% + 120px);
          margin-right: -120px;
          min-height: 460px;
          overflow: hidden;
        }
        @media (max-width: 1180px) {
          .arrival-section { padding: 56px 40px; }
          .top-row { grid-template-columns: 1fr 1fr; gap: 48px; }
          .bottom-row { grid-template-columns: 360px 1fr; gap: 24px; }
          .card-img-wrap { height: 320px; }
          .big-img-wrap { min-height: 400px; width: 100%; }
        }
        @media (max-width: 900px) {
          .top-row { grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px; }
          .bottom-row { grid-template-columns: 1fr; gap: 0; }
          .big-img-wrap { width: 100%; min-height: 380px; margin-top: 24px; }
        }
        @media (max-width: 768px) {
          .arrival-section { padding: 44px 20px; }
          .top-row { grid-template-columns: 1fr; gap: 20px; margin-bottom: 32px; }
          .main-heading { font-size: clamp(24px, 7vw, 32px); }
          .bottom-row { grid-template-columns: 1fr; gap: 0; }
          .card-img-wrap { height: 280px; }
          .big-img-wrap { width: 100%; min-height: 280px; margin-top: 20px; }
          .card-actions { flex-direction: column; align-items: stretch; gap: 12px; }
          .price-btn { width: 100%; text-align: center; }
          .bulk-btn { text-align: center; }
        }
        @media (min-width: 1440px) {
          .arrival-section { padding: 80px 120px; }
          .top-row { grid-template-columns: 480px 1fr; gap: 100px; }
          .bottom-row { grid-template-columns: 480px 1fr; }
          .card-img-wrap { height: 420px; }
          .big-img-wrap { min-height: 220px; }
        }
      `}</style>
    </section>
  );
}
