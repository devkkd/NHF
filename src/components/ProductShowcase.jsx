"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK = {
  productName: "HAND BLOCK PERCALE PRINTED BEDSHEET",
  bgImage:     "/images/product/bedsheet.jpg",
  cardImage:   "/images/product/bedsheet.jpg",
};

export default function ProductShowcase() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/showcase-banner`)
      .then((r) => r.json())
      .then(({ data }) => setData(data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showcase = data || FALLBACK;
  const bgImage   = showcase.bgImage;
  const cardImage = showcase.cardImage;
  const name      = showcase.productName?.toUpperCase();

  if (loading) {
    return <div className="showcase-section" style={{ background: "#FDFFF1" }} />;
  }

  return (
    <section className="showcase-section">

      {/* ── Full-width background image ── */}
      <div className="showcase-bg">
        <Image
          src={bgImage}
          alt={name}
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* ── Floating product card (left side) ── */}
      <div className="product-card">
        <div className="card-img-wrap">
          <Image
            src={cardImage}
            alt={name}
            fill
            sizes="420px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
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
          box-shadow: 0 4px 32px rgba(0,0,0,0.10);
        }
        .card-img-wrap { position: relative; width: 100%; height: 360px; }
        .card-body { padding: 22px 24px 26px; }
        .card-title {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.5;
          color: #111;
          margin: 0;
          letter-spacing: 0.01em;
        }
        @media (max-width: 1024px) {
          .showcase-section { height: 620px; }
          .product-card { left: 36px; top: 60px; width: 320px; }
          .card-img-wrap { height: 300px; }
        }
        @media (max-width: 768px) {
          .showcase-section { height: auto; display: flex; flex-direction: column; }
          .showcase-bg { position: relative; width: 100%; height: 55vw; min-height: 220px; max-height: 380px; flex-shrink: 0; }
          .product-card { position: relative; left: auto; top: auto; width: 88%; max-width: 320px; margin: -100px auto 0; }
          .card-img-wrap { height: 52vw; min-height: 180px; max-height: 240px; }
          .card-body { padding: 16px; }
          .card-title { font-size: 13px; }
        }
        @media (max-width: 480px) {
          .showcase-bg { height: 280px; }
          .card-img-wrap { height: 220px; }
        }
        @media (min-width: 1440px) {
          .showcase-section { height: 760px; }
          .product-card { left: 80px; top: 70px; width: 420px; }
          .card-img-wrap { height: 380px; }
          .card-title { font-size: 16px; }
        }
      `}</style>
    </section>
  );
}
