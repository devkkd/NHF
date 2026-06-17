"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
const products = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  slug: `product-${i + 1}`,
  name: "HAND BLOCK PERCALE PRINTED BEDSHEET",
  image: `/images/product-${(i % 3) + 1}.jpg`,
}));

const sortOptions = [
  "Recommended",
  "Price Ascending",
  "Price Descending",
  "Newest",
];

export default function NewArrivalsPage() {
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recommended");

  return (
    <>
      <Header />

      <main style={{ backgroundColor: "#FDFFF1", minHeight: "100vh" }}>
        {/* Hero Banner */}
        <div className="hero-banner">
          <img
            src="/images/new-arrivals-hero.jpg"
            alt="New Arrivals Banner"
            className="hero-img"
          />
        </div>

        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">NEW ARRIVALS</h2>
          <a href="#" className="bulk-order-link">
            Bulk Order Request &rsaquo;
          </a>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          {/* Sort Dropdown */}
          <div className="sort-wrapper">
            <button
              className="sort-btn"
              onClick={() => setSortOpen((prev) => !prev)}
            >
              SORT BY ▾
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                {sortOptions.map((opt) => (
                  <div
                    key={opt}
                    className={`sort-option ${
                      selectedSort === opt ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedSort(opt);
                      setSortOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Count */}
          <span className="product-count">260 Products</span>

          {/* Filters */}
          <button className="filters-btn">FILTERS ⇅</button>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {products.map((product) => (
           <Link
  href={`/products/${product.slug}`}
  key={product.id}
  className="product-card-link"
>
  <div className="product-card">
              <div className="product-img-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-img"
                  onError={(e) => {
                    e.target.style.backgroundColor = "#e0ddd5";
                    e.target.style.height = "220px";
                    e.target.removeAttribute("src");
                  }}
                />
                <button className="wishlist-btn" aria-label="Add to wishlist">
                  ♡
                </button>
              </div>
              <div className="product-info">
                <h6 className="product-name">{product.name}</h6>
                <div className="product-actions">
                  <button className="btn-enquiry">PRICE ENQUIRY ↗</button>
                  <button className="btn-bulk">● BULK CUSTOMIZATION</button>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-area">
          <p className="showing-text">Showing 1 – 15 of 260</p>
          <button className="see-more-btn">SEE MORE</button>
          <a href="#" className="back-to-top">
            ↑ BACK TO TOP
          </a>
        </div>
      </main>

     

      <style jsx>{`
        /* ── Hero ── */
        .hero-banner {
          width: 100%;
          max-height: 4000px;
          overflow: hidden;
          
          
        }
        .hero-img {
          width: 100%;
          height: 440px;
          object-fit: cover;
          display: block;
        
          
        }

        /* ── Section Header ── */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 36px 60px 12px;
          background-color: #fdfff1;
        }
        .section-title {
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 36px;
          font-weight: 500;
          color: #7b7f5c;
          letter-spacing: -0.04em;
          line-height: 1.2;
          margin: 0;
        }
        .bulk-order-link {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 16px;
          color: #7b7f5c;
          text-decoration: none;
          border-bottom: 1px solid #7b7f5c;
          padding-bottom: 2px;
        }
        .bulk-order-link:hover {
          opacity: 0.75;
        }

        /* ── Controls Bar ── */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 60px;
          background-color: #fdfff1;

          position: relative;
        }
        .sort-wrapper {
          position: relative;
        }
        .sort-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0e0e0e;
          background: #fdfff1;
          border: 1px solid #c8cab4;
          padding: 7px 16px;
          cursor: pointer;
          letter-spacing: 0.04em;
        }
        .sort-btn:hover {
          background: #f0f2de;
        }
        .sort-dropdown {
          position: absolute;
          top: 110%;
          left: 0;
          background: #fff;
          border: 1px solid #c8cab4;
          min-width: 180px;
          z-index: 99;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .sort-option {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          padding: 10px 16px;
          cursor: pointer;
          color: #0e0e0e;
        }
        .sort-option:hover,
        .sort-option.active {
          background-color: #f0f2de;
          color: #7b7f5c;
        }
        .product-count {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 14px;
          color: #555;
        }
        .filters-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0e0e0e;
          background: #fdfff1;
          border: 1px solid #c8cab4;
          padding: 7px 16px;
          cursor: pointer;
          letter-spacing: 0.04em;
        }
        .filters-btn:hover {
          background: #f0f2de;
        }

        /* ── Product Grid ── */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px 20px;
          padding: 32px 60px 40px;
          background-color: #fdfff1;
        }

        /* ── Product Card ── */
        .product-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fdfff1;
        }
        .product-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #e8e9da;
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.04);
        }
        .wishlist-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.85);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7b7f5c;
        }
        .product-info {
          text-align: left;
          padding: 10px 4px 0;
          width: 100%;
        }
        .product-name {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #0e0e0e;
          letter-spacing: 0;
          line-height: 1.5;
          margin: 0 0 8px;
          text-transform: uppercase;
        }
        .product-actions {
          display: flex;
          justify-content: left;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn-enquiry {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 11px;
          font-weight: 600;
          background: #7b7f5c;
          color: #fdfff1;
          border: none;
          padding: 12px 18px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: background 0.2s;
        }
        .btn-enquiry:hover {
          background: #636649;
        }
        .btn-bulk {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 11px;
          font-weight: 500;
          background: transparent;
          color: #0e0e0e;
          border: 1px solid #c8cab4;
          padding: 6px 12px;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: background 0.2s;
        }
        .btn-bulk:hover {
          background: #f0f2de;
        }

        /* ── Pagination ── */
        .pagination-area {
          text-align: center;
          padding: 20px 60px 48px;
          background-color: #fdfff1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .showing-text {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          color: #777;
          margin: 0;
        }
        .see-more-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: #fdfff1;
          border: 1px solid #c8cab4;
          padding: 10px 40px;
          cursor: pointer;
          letter-spacing: 0.08em;
          color: #0e0e0e;
          transition: background 0.2s;
        }
        .see-more-btn:hover {
          background: #f0f2de;
        }
        .back-to-top {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          color: #7b7f5c;
          text-decoration: none;
          letter-spacing: 0.06em;
        }
        .back-to-top:hover {
          text-decoration: underline;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 24px 24px 32px;
          }
          .section-header,
          .controls-bar,
          .pagination-area {
            padding-left: 24px;
            padding-right: 24px;
          }
          .section-title {
            font-size: 30px;
          }
            .hero-banner {
          width: 100%;
          max-height: 350px;
          overflow: hidden;
        
        }
        }
        @media (max-width: 560px) {
          .product-grid {
            grid-template-columns: 1fr;
            padding: 16px 16px 24px;
          }
          .section-header,
          .controls-bar,
          .pagination-area {
            padding-left: 16px;
            padding-right: 16px;
          }
          .section-title {
            font-size: 24px;
          }
            .hero-banner {
          width: 100%;
          max-height: 300px;
          overflow: hidden;
          

        }
        }
      `}</style>
    </>
  );
}