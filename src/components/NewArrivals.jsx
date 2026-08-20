"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK = {
  heading:   "A HOME IS A FEELING,\nWE HELP YOU BUILD IT.",
  paragraph: `The morning light through a window. The weight of a good quilt. The quiet ritual of a bed made beautifully. A scarf chosen not because it was convenient but because it felt exactly right. These are the small, significant details that separate a house from a home and a life from a lifestyle. At Nikita, we make the things that fill those moments: bedcovers that you'll reach for every single night, throws that live on your sofa like old friends, kaftans that make you feel dressed even when you're completely at ease.`,
  cardImage:  "/images/product/new2.png",
  cardTitle:  "HAND BLOCK PERCALE PRINTED BEDSHEET",
  bigImage:   "/images/product/new1.png",
};

export default function NewArrivals() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/new-arrivals-section`)
      .then((r) => r.json())
      .then(({ data }) => { if (data) setData(data); })
      .catch(() => {});
  }, []);

  const d = data || FALLBACK;

  // Support \n in heading
  const headingLines = d.heading?.split("\n") || [];

  return (
    <section className="arrival-section">

      {/* ── TOP: Heading left + Paragraph right ── */}
      <div className="top-row">
        <div className="top-left">
          <h2 className="main-heading">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
        </div>
        <div className="top-right">
          <p className="main-para">{d.paragraph}</p>
        </div>
      </div>

      {/* ── BOTTOM: Product card left + Big image right ── */}
      <div className="bottom-row">

        {/* Left — product card */}
        <div className="product-card">
          <div className="card-img-wrap">
            <Image
              src={d.cardImage}
              alt={d.cardTitle}
              fill
              sizes="(max-width:768px) 100vw, 440px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="card-body">
            <h4 className="card-title">{d.cardTitle?.toUpperCase()}</h4>
          </div>
        </div>

        {/* Right — big showcase image */}
        <div className="big-img-wrap">
          <Image
            src={d.bigImage}
            alt={d.cardTitle}
            fill
            sizes="60vw"
            style={{ objectFit: "cover" }}
          />
        </div>

      </div>

      <style jsx>{`
        .arrival-section { background: #FDFFF1; padding: 72px 80px; }
        .top-row { display: grid; grid-template-columns: 420px 1fr; gap: 80px; align-items: start; margin-bottom: 56px; }
        .main-heading { font-family: "Tobias TRIAL", serif; font-size: clamp(28px, 3.2vw, 46px); font-weight: 600; line-height: 1.25; color: #7B7F5C; margin: 0; }
        .main-para { font-family: "Mona Sans", sans-serif; font-size: 15px; line-height: 1.9; color: #111; margin: 0; }
        .bottom-row { display: grid; grid-template-columns: 440px 1fr; gap: 95px; align-items: stretch; }
        .product-card { display: flex; flex-direction: column; background: transparent; }
        .card-img-wrap { position: relative; width: 100%; height: 380px; overflow: hidden; background: #f0f0eb; }
        .card-body { padding: 22px 0 0; }
        .card-title { font-family: "Mona Sans", sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.5; color: #0E0E0E; margin: 0; }
        .big-img-wrap { position: relative; width: calc(100% + 120px); margin-right: -120px; min-height: 460px; overflow: hidden; }
        @media (max-width: 1180px) {
          .arrival-section { padding: 56px 40px; }
          .top-row { grid-template-columns: 1fr 1fr; gap: 48px; }
          .bottom-row { grid-template-columns: 360px 1fr; gap: 24px; }
          .card-img-wrap { height: 320px; }
          .big-img-wrap { min-height: 400px; width: 100%; margin-right: 0; }
        }
        @media (max-width: 900px) {
          .top-row { grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px; }
          .bottom-row { grid-template-columns: 1fr; gap: 0; }
          .big-img-wrap { width: 100%; min-height: 380px; margin-top: 24px; margin-right: 0; }
        }
        @media (max-width: 768px) {
          .arrival-section { padding: 44px 20px; }
          .top-row { grid-template-columns: 1fr; gap: 20px; margin-bottom: 32px; }
          .main-heading { font-size: clamp(24px, 7vw, 32px); }
          .bottom-row { grid-template-columns: 1fr; gap: 0; }
          .card-img-wrap { height: 280px; }
          .big-img-wrap { width: 100%; min-height: 280px; margin-top: 20px; margin-right: 0; }
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
