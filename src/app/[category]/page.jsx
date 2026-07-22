"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getCategory } from "@/lib/categoryData";
import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist"; // NEW

const sortOptions = ["Recommended", "Price Ascending", "Price Descending", "Newest"];

// how many skeleton cards to paint while data loads
// (grid is responsive, so desktop shows 3-col rows and mobile shows 2-col
// rows out of the SAME count -> they naturally look different per device)
const SKELETON_CARD_COUNT = 9;

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const data = getCategory(category);

  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recommended");
  const [quantities, setQuantities] = useState({});

  // NEW: which product slugs are currently saved/wishlisted
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    // load whatever is already saved (e.g. from a previous visit)
    const saved = getWishlist();
    const map = {};
    saved.forEach((item) => {
      map[item.slug] = true;
    });
    setWishlist(map);
  }, []);

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWishlist(product);
    setWishlist((prev) => {
      const copy = { ...prev };
      if (nowSaved) {
        copy[product.slug] = true;
      } else {
        delete copy[product.slug];
      }
      return copy;
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);

    setQuantities((prev) => ({
      ...prev,
      [product.slug]: 1,
    }));
  };
  const increaseQty = (product) => {
    const qty = (quantities[product.slug] || 1) + 1;

    updateQty(product.slug, qty);

    setQuantities((prev) => ({
      ...prev,
      [product.slug]: qty,
    }));
  };

  const decreaseQty = (product) => {
    const qty = (quantities[product.slug] || 1) - 1;

    if (qty <= 0) {
      updateQty(product.slug, 0);

      setQuantities((prev) => {
        const copy = { ...prev };
        delete copy[product.slug];
        return copy;
      });

      return;
    }

    updateQty(product.slug, qty);

    setQuantities((prev) => ({
      ...prev,
      [product.slug]: qty,
    }));
  };
  const handlePriceEnquiry = (slug) => {
    router.push(`/enquiry1/${slug}`);
  };
  // ---- LOADING STATE -------------------------------------------------
  // Replace this simulated delay with your real fetch/loading condition
  // (e.g. isLoading from SWR / React Query / an API call in getCategory).
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [category]);
  // ---------------------------------------------------------------------

  if (!data) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Category not found.</p>
        </main>
      </>
    );
  }

  const isGridFull = data.variant === "grid-full";

  return (
    <>
      <Header />

      <main className="cat-page" style={{ backgroundColor: data.bg }}>
        {/* ============ HERO ============ */}
        {isLoading ? (
          <HeroSkeleton />
        ) : (
          <div className="cat-hero-banner">
            <img src={data.heroImage} alt={`${data.heading} Banner`} className="cat-hero-img" />
          </div>
        )}

        {/* ============ TOP LABEL (simple variant only) ============ */}
        {!isGridFull && !isLoading && (
          <div className="cat-top-label">
            <p>{data.topLabel}</p>
          </div>
        )}
        {!isGridFull && isLoading && (
          <div className="cat-top-label">
            <span className="cat-skel cat-skel-label" />
          </div>
        )}

        {/* ============ SECTION HEADER ============ */}
        <div className="cat-section-header">
          {isLoading ? (
            <>
              <span className="cat-skel cat-skel-title" />
              <span className="cat-skel cat-skel-link" />
            </>
          ) : (
            <>
              <h2 className="cat-section-title">{data.heading}</h2>
              <a href={data.bulkOrderHref} className="cat-bulk-order-link">
                Bulk Order Request {isGridFull ? "›" : "→"}
              </a>
            </>
          )}
        </div>

        {/* ============ CONTROLS BAR (grid-full variant only) ============ */}
        {isGridFull && !isLoading && (
          <div className="cat-controls-bar">
            <div className="cat-sort-wrapper">
              <button className="cat-sort-btn" onClick={() => setSortOpen((prev) => !prev)}>
                SORT BY ▾
              </button>
              {sortOpen && (
                <div className="cat-sort-dropdown">
                  {sortOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`cat-sort-option ${selectedSort === opt ? "active" : ""}`}
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

            <span className="cat-product-count">{data.totalCount} Products</span>

            <button className="cat-filters-btn">FILTERS ⇅</button>
          </div>
        )}
        {isGridFull && isLoading && (
          <div className="cat-controls-bar">
            <span className="cat-skel cat-skel-sortbtn" />
            <span className="cat-skel cat-skel-count" />
            <span className="cat-skel cat-skel-sortbtn" />
          </div>
        )}

        {/* ============ PRODUCT GRID ============ */}
        <div className="cat-product-grid">
          {isLoading
            ? Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => <CardSkeleton key={i} />)
            : data.products.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.id} className="cat-product-card-link">
                <div className="cat-product-card">
                  <div className="cat-product-img-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cat-product-img"
                      onError={(e) => {
                        e.target.style.backgroundColor = "#e0ddd5";
                        e.target.style.height = "100%";
                        e.target.removeAttribute("src");
                      }}
                    />
                    <button
                      className={`cat-wishlist-btn ${wishlist[product.slug] ? "cat-wishlist-btn-active" : ""}`}
                      aria-label={wishlist[product.slug] ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => handleToggleWishlist(e, product)}
                    >
                      {wishlist[product.slug] ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="cat-product-info">
                    <h6 className="cat-product-name">{product.name}</h6>
                    <div className="cat-product-actions">
                  <button
  className="cat-btn-enquiry"
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/enquiry1/${product.slug}`);
  }}
>
  BULK PRICE ENQUIRY ↗
</button>
                      {!quantities[product.slug] ? (
                        <button
                          className="cat-btn-bulk"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                        >
                          ● ADD TO CART
                        </button>
                      ) : (
                        <div
                          onClick={(e) => e.preventDefault()}
                          style={{
                            fontFamily: '"Mona Sans", "Inter", sans-serif',
                            fontSize: "11px",
                            fontWeight: 500,
                            background: "transparent",
                            color: "#0e0e0e",
                            border: "1px solid #c8cab4",
                            padding: "6px 12px",      // same as ADD TO CART
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            boxSizing: "border-box",
                            minWidth: "115px",        // same visual width
                            height: "41px",           // same visual height
                          }}
                        >
                          <button
                            onClick={() => decreaseQty(product)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "18px",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                            }}
                          >
                            −
                          </button>

                          <span
                            style={{
                              minWidth: "18px",
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            {quantities[product.slug]}
                          </span>

                          <button
                            onClick={() => increaseQty(product)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "18px",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* ============ PAGINATION (grid-full variant only) ============ */}
        {isGridFull && !isLoading && (
          <div className="cat-pagination-area">
            <p className="cat-showing-text">
              Showing 1 – {data.products.length} of {data.totalCount}
            </p>
            <button className="cat-see-more-btn">SEE MORE</button>
            <a href="#" className="cat-back-to-top">
              ↑ BACK TO TOP
            </a>
          </div>
        )}
      </main>

     

      <style>{`
        /* ===================== LAYOUT ===================== */
        .cat-page {
          min-height: 100vh;
        }

        .cat-hero-banner {
          width: 100%;
          overflow: hidden;
        }
        .cat-hero-img {
          width: 100%;
          height: 440px;
          object-fit: cover;
          display: block;
        }

        .cat-top-label {
          text-align: center;
          padding-top: 32px;
          padding-bottom: 20px;
        }
        .cat-top-label p {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 30px;
          font-weight: 500;
          line-height: 160%;
          color: ${data.accent};
          letter-spacing: -0.02em;
        }

        .cat-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 36px 60px 20px;
        }
        .cat-section-title {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 40px;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: ${data.accent};
        }
        .cat-bulk-order-link {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 16px;
          color: ${data.accent};
          text-decoration: none;
          border-bottom: 1px solid ${data.accent};
          padding-bottom: 2px;
          white-space: nowrap;
        }
        .cat-bulk-order-link:hover {
          opacity: 0.75;
        }

        /* ===================== CONTROLS BAR ===================== */
        .cat-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 60px;
          position: relative;
        }
        .cat-sort-wrapper {
          position: relative;
        }
        .cat-sort-btn,
        .cat-filters-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0e0e0e;
          background: ${data.bg};
          border: 1px solid ${data.border};
          padding: 7px 16px;
          cursor: pointer;
          letter-spacing: 0.04em;
        }
        .cat-sort-btn:hover,
        .cat-filters-btn:hover {
          background: #f0f2de;
        }
        .cat-sort-dropdown {
          position: absolute;
          top: 110%;
          left: 0;
          background: #fff;
          border: 1px solid ${data.border};
          min-width: 180px;
          z-index: 99;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .cat-sort-option {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          padding: 10px 16px;
          cursor: pointer;
          color: #0e0e0e;
        }
        .cat-sort-option:hover,
        .cat-sort-option.active {
          background-color: #f0f2de;
          color: ${data.accent};
        }
        .cat-product-count {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 14px;
          color: #555;
        }

        /* ===================== PRODUCT GRID (shared card design) ===================== */
        .cat-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px 20px;
          padding: 32px 60px 40px;
        }
        .cat-product-card-link {
          text-decoration: none;
        }
       .cat-product-card{
  display:flex;
  flex-direction:column;
  height:100%;
}
        .cat-product-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #e8e9da;
        }
        .cat-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .cat-product-card:hover .cat-product-img {
          transform: scale(1.04);
        }
        .cat-wishlist-btn {
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
          color: ${data.accent};
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .cat-wishlist-btn-active {
          color: #e0304a; /* red heart once saved */
        }
        .cat-wishlist-btn:active {
          transform: scale(0.9);
        }
        .cat-product-info{
  width:100%;
  padding:10px 4px 0;
  text-align:left;

  display:flex;
  flex-direction:column;
  flex:1;
}
       .cat-product-name{
  font-family:"Mona Sans","Inter",sans-serif;
  font-size:13px;
  font-weight:700;
  color:#0e0e0e;

  line-height:1.45;

  margin:0 0 10px;

  text-transform:uppercase;

  height:38px;

  overflow:hidden;

  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;

  text-overflow:ellipsis;
}
        .cat-product-actions {
          display: flex;
          justify-content: left;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cat-btn-enquiry {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 11px;
          font-weight: 600;
          background: ${data.accent};
          color: ${data.bg};
          border: none;
          padding: 12px 18px;
          cursor: pointer;
          letter-spacing: 0.05em;
        }
       .cat-btn-bulk {
  font-family: "Mona Sans", "Inter", sans-serif;
  font-size: 11px;
  font-weight: 500;
  background: transparent;
  color: #0e0e0e;
  border: 1px solid #c8cab4;
  padding: 6px 12px;
  cursor: pointer;
  letter-spacing: 0.03em;
}

        /* ===================== PAGINATION ===================== */
        .cat-pagination-area {
          text-align: center;
          padding: 20px 60px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .cat-showing-text {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          color: #777;
          margin: 0;
        }
        .cat-see-more-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: ${data.bg};
          border: 1px solid ${data.border};
          padding: 10px 40px;
          cursor: pointer;
          letter-spacing: 0.08em;
          color: #0e0e0e;
        }
        .cat-back-to-top {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          color: ${data.accent};
          text-decoration: none;
          letter-spacing: 0.06em;
        }
        .cat-back-to-top:hover {
          text-decoration: underline;
        }

        /* ===================== SKELETON (shared shimmer) ===================== */
        .cat-skel {
          display: block;
          position: relative;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.08);
        }
        .cat-skel::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: cat-shimmer 1.4s infinite;
        }
        @keyframes cat-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .cat-hero-skel {
          width: 100%;
          height: 440px;
        }

        .cat-skel-label {
          width: 220px;
          height: 30px;
          margin: 0 auto;
        }
        .cat-skel-title {
          width: 260px;
          height: 40px;
        }
        .cat-skel-link {
          width: 140px;
          height: 20px;
        }
        .cat-skel-sortbtn {
          width: 110px;
          height: 34px;
        }
        .cat-skel-count {
          width: 90px;
          height: 18px;
        }

        .cat-card-skel-img {
          width: 100%;
          aspect-ratio: 4 / 3;
        }
        .cat-card-skel-name {
          width: 80%;
          height: 14px;
          margin: 10px 0 10px;
        }
        .cat-card-skel-actions {
          display: flex;
          gap: 10px;
        }
        .cat-card-skel-btn1 {
          width: 110px;
          height: 34px;
        }
        .cat-card-skel-btn2 {
          width: 90px;
          height: 26px;
        }

        /* ===================== RESPONSIVE ===================== */
        @media (max-width: 900px) {
          .cat-hero-img,
          .cat-hero-skel {
            height: 320px;
          }
          .cat-section-header,
          .cat-controls-bar,
          .cat-pagination-area {
            padding-left: 24px;
            padding-right: 24px;
          }
          .cat-section-title,
          .cat-skel-title {
            font-size: 30px;
          }
          .cat-product-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 24px 24px 32px;
            gap: 20px 14px;
          }
        }

       @media (max-width: 560px) {

  /* ---------- Hero ---------- */

  .cat-hero-img,
  .cat-hero-skel{
    height:170px;
  }

  .cat-top-label{
    padding:20px 16px 12px;
  }

  .cat-top-label p{
    font-size:22px;
    line-height:1.3;
  }

  /* ---------- Heading ---------- */

  .cat-section-header{
    padding:18px 16px 16px;
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:10px;
  }

  .cat-section-title,
  .cat-skel-title{
    font-size:24px;
    line-height:1.2;
  }

  .cat-bulk-order-link{
    font-size:12px;
  }

  /* ---------- Controls ---------- */

  .cat-controls-bar{
    padding:0 16px 18px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    flex-wrap:wrap;
  }

  .cat-sort-btn,
  .cat-filters-btn{
    font-size:10px;
    padding:7px 10px;
  }

  .cat-product-count{
    font-size:11px;
  }

  /* ---------- Grid ---------- */

  .cat-product-grid{
    grid-template-columns:repeat(2,1fr);
    gap:18px 12px;
    padding:0 16px 28px;
  }

  /* ---------- Card ---------- */

  .cat-product-img-wrapper{
    aspect-ratio:4/5;
  }

  .cat-wishlist-btn{
    width:26px;
    height:26px;
    bottom:8px;
    right:8px;
    font-size:14px;
  }

  .cat-product-info{
    padding-top:8px;
  }

 .cat-product-name{
  font-size:11px;
  line-height:1.45;

  height:32px;

  margin-bottom:10px;

  overflow:hidden;

  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;

  text-overflow:ellipsis;
}

  .cat-product-actions{
    display:flex;
    flex-direction:column;
    gap:8px;
    align-items:stretch;
  }

  .cat-btn-enquiry{
    width:100%;
    padding:10px;
    font-size:9px;
    letter-spacing:.04em;
  }

  .cat-btn-bulk{
    width:100%;
    padding:9px;
    font-size:9px;
  }

  /* ---------- Quantity ---------- */

  .cat-product-actions > div{
    width:100% !important;
    min-width:100% !important;
    height:36px !important;
    padding:4px 10px !important;
    font-size:10px !important;
  }

  .cat-product-actions > div button{
    font-size:15px !important;
    width:16px !important;
    height:16px !important;
  }

  /* ---------- Pagination ---------- */

  .cat-pagination-area{
    padding:8px 16px 30px;
    gap:10px;
  }

  .cat-showing-text{
    font-size:11px;
  }

  .cat-see-more-btn{
    width:100%;
    padding:11px;
    font-size:10px;
  }

  .cat-back-to-top{
    font-size:10px;
  }

}
      `}</style>
    </>
  );
}

// ============================================================
// Skeleton pieces — CSS media queries make desktop vs mobile
// look different automatically (hero height + grid columns
// change), so no device-detection JS is needed.
// ============================================================

function HeroSkeleton() {
  return (
    <div className="cat-hero-banner">
      <span className="cat-skel cat-hero-skel" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="cat-product-card">
      <span className="cat-skel cat-card-skel-img" />
      <div className="cat-product-info">
        <span className="cat-skel cat-card-skel-name" />
        <div className="cat-card-skel-actions">
          <span className="cat-skel cat-card-skel-btn1" />
          <span className="cat-skel cat-card-skel-btn2" />
        </div>
      </div>
    </div>
  );
}