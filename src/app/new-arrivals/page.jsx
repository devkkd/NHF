"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const ACCENT = "#7b7f5c";
const BG = "#fdfff1";
const BORDER = "#c8cab4";
const LIMIT = 12;

async function fetchNewArrivals(page = 1) {
  try {
    const res = await fetch(
      `${BASE}/products?newArrivals=true&page=${page}&limit=${LIMIT}`
    );
    if (!res.ok) return { products: [], total: 0, pages: 1 };
    const body = await res.json();
    return body?.data ?? { products: [], total: 0, pages: 1 };
  } catch {
    return { products: [], total: 0, pages: 1 };
  }
}

export default function NewArrivalsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [wishlist, setWishlist] = useState({});

 useEffect(() => {
  const loadWishlist = async () => {
    try {
      const saved = await getWishlist();

      const map = {};

      saved.forEach((item) => {
        map[item.slug] = true;
      });

      setWishlist(map);
    } catch (err) {
      console.error(err);
    }
  };

  loadWishlist();
}, []);

  useEffect(() => {
    setLoading(true);
    fetchNewArrivals(page).then((data) => {
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setLoading(false);
    });
  }, [page]);

 const handleToggleWishlist = async (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  const nowSaved = await toggleWishlist(product);

  setWishlist((prev) => {
    const copy = { ...prev };

    if (nowSaved) copy[product.slug] = true;
    else delete copy[product.slug];

    return copy;
  });
};

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setQuantities((prev) => ({ ...prev, [product.slug]: 1 }));
  };

  const increaseQty = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = (quantities[product.slug] || 1) + 1;
  updateQty(product._id, qty);
    setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
  };

  const decreaseQty = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = (quantities[product.slug] || 1) - 1;
    if (qty <= 0) {
    updateQty(product._id, 0);

      setQuantities((prev) => { const c = { ...prev }; delete c[product.slug]; return c; });
    } else {
     updateQty(product._id, qty);

      setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
    }
  };

  const showing = Math.min(page * LIMIT, total);

  return (
    <main className="na-page">
      {/* ── Hero banner ── */}
      <div className="na-hero">
        <img src="/images/new-arrivals-hero.jpg" alt="New Arrivals" className="na-hero-img" />
        <div className="na-hero-overlay">
          <h1 className="na-hero-title">NEW ARRIVALS</h1>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="na-header">
        <h2 className="na-heading">New Arrivals</h2>
        <a href="/enquiry" className="na-bulk-link">Bulk Order Request →</a>
      </div>

      {/* ── Controls ── */}
      <div className="na-controls">
        <span className="na-count">{loading ? "Loading…" : `${total} Products`}</span>
      </div>

      {/* ── Grid ── */}
      <div className="na-grid">
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => <CardSkeleton key={i} />)
          : products.length === 0
            ? (
              <div className="na-empty">
                <p>No new arrivals yet.</p>
                <Link href="/" style={{ color: ACCENT, fontSize: 14 }}>← Back to Home</Link>
              </div>
            )
            : products.map((product) => (
              <Link href={`/products/${product.slug}`} key={product._id} className="na-card-link">
                <div className="na-card">
                  <div className="na-img-wrap">
                    {product.mainImage
                      ? <img src={product.mainImage} alt={product.name} className="na-img" />
                      : <div className="na-img-placeholder" />
                    }
                    <button
                      className={`na-wishlist${wishlist[product.slug] ? " active" : ""}`}
                      onClick={(e) => handleToggleWishlist(e, product)}
                      aria-label="Wishlist"
                    >
                      {wishlist[product.slug] ? "♥" : "♡"}
                    </button>
                  </div>
                 <div className="na-info">
  <h3 className="na-name">{product.name?.toUpperCase()}</h3>

  <p className="na-price">
    ₹{Number(product.price || 0).toLocaleString("en-IN")}
  </p>

  <div className="na-actions">
                      <button
                        className="na-btn-enquiry"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/enquiry1/${product.slug}`); }}
                      >
                        BULK PRICE ENQUIRY ↗
                      </button>
                      {!quantities[product.slug] ? (
                        <button className="na-btn-cart" onClick={(e) => handleAddToCart(e, product)}>
                          ● ADD TO CART
                        </button>
                      ) : (
                        <div className="na-qty" onClick={(e) => e.preventDefault()}>
                          <button onClick={(e) => decreaseQty(e, product)}>−</button>
                          <span>{quantities[product.slug]}</span>
                          <button onClick={(e) => increaseQty(e, product)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
        }
      </div>

      {/* ── Pagination ── */}
      {!loading && total > 0 && (
        <div className="na-pagination">
          <p className="na-showing">Showing 1 – {showing} of {total}</p>
          {page < pages && (
            <button className="na-see-more" onClick={() => setPage((p) => p + 1)}>
              SEE MORE
            </button>
          )}
          <button className="na-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ↑ BACK TO TOP
          </button>
        </div>
      )}

      <style jsx>{`
        .na-page { background: ${BG}; min-height: 100vh; }

        /* Hero */
        .na-hero { position: relative; width: 100%; height: 440px; overflow: hidden; }
        .na-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .na-hero-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.28);
          display: flex; align-items: center; justify-content: center;
        }
        .na-hero-title {
          font-family: "Tobias TRIAL", serif;
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 500; color: #fff; letter-spacing: 0.08em;
          margin: 0;
        }

        /* Header */
        .na-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 36px 60px 20px; gap: 16px;
        }
        .na-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 40px; font-weight: 500; color: ${ACCENT};
          letter-spacing: -0.02em; margin: 0;
        }
        .na-bulk-link {
          font-family: "Mona Sans", sans-serif;
          font-size: 16px; color: ${ACCENT};
          text-decoration: none; border-bottom: 1px solid ${ACCENT};
          padding-bottom: 2px; white-space: nowrap;
        }

        /* Controls */
        .na-controls {
          display: flex; justify-content: flex-end;
          padding: 0 60px 16px;
        }
        .na-count { font-family: "Mona Sans", sans-serif; font-size: 14px; color: #555; }

        /* Grid */
        .na-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px 20px;
          padding: 0 60px 40px;
        }
        .na-card-link { text-decoration: none; display: block; }
        .na-card { display: flex; flex-direction: column; }
        .na-img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/3;
          overflow: hidden; background: #e8e9da;
        }
        .na-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
        .na-card:hover .na-img { transform: scale(1.04); }
        .na-img-placeholder { width: 100%; height: 100%; background: #e8e9da; }
        .na-wishlist {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(255,255,255,0.85); border: none; border-radius: 50%;
          width: 30px; height: 30px; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${ACCENT};
        }
        .na-wishlist.active { color: #e0304a; }
        .na-info { padding: 10px 4px 0; }
        .na-name {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px; font-weight: 700; color: #0e0e0e;
          line-height: 1.45; margin: 0 0 10px;
          height: 38px; overflow: hidden;
          display: -webkit-box; -webkit-box-orient: vertical;
          -webkit-line-clamp: 2; text-overflow: ellipsis;
        }
        .na-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .na-btn-enquiry {
          font-family: "Mona Sans", sans-serif; font-size: 11px; font-weight: 600;
          background: ${ACCENT}; color: ${BG}; border: none;
          padding: 12px 18px; cursor: pointer; letter-spacing: 0.05em;
        }
        .na-btn-cart {
          font-family: "Mona Sans", sans-serif; font-size: 11px; font-weight: 500;
          background: transparent; color: #0e0e0e; border: 1px solid ${BORDER};
          padding: 6px 12px; cursor: pointer;
        }
        .na-qty {
          display: inline-flex; align-items: center; justify-content: space-between;
          gap: 10px; border: 1px solid ${BORDER}; padding: 6px 12px;
          min-width: 115px; height: 41px; font-size: 11px;
        }
        .na-qty button {
          border: none; background: transparent; cursor: pointer;
          font-size: 18px; width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center; padding: 0;
        }
        .na-qty span { font-weight: 600; text-align: center; min-width: 18px; }

        .na-price {
  font-family: "Mona Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0e0e0e;
  margin: 0 0 12px;
  letter-spacing: 0.02em;
}

        /* Pagination */
        .na-pagination {
          text-align: center; padding: 20px 60px 60px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .na-showing { font-family: "Mona Sans", sans-serif; font-size: 13px; color: #777; margin: 0; }
        .na-see-more {
          font-family: "Mona Sans", sans-serif; font-size: 13px; font-weight: 600;
          background: ${BG}; border: 1px solid ${BORDER};
          padding: 10px 40px; cursor: pointer; letter-spacing: 0.08em; color: #0e0e0e;
        }
        .na-back-top {
          font-family: "Mona Sans", sans-serif; font-size: 12px;
          color: ${ACCENT}; background: none; border: none; cursor: pointer;
          letter-spacing: 0.06em;
        }
        .na-empty { grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #555; }

        /* Responsive */
        @media (max-width: 900px) {
          .na-hero { height: 320px; }
          .na-header, .na-controls, .na-pagination { padding-left: 24px; padding-right: 24px; }
          .na-heading { font-size: 30px; }
          .na-grid { grid-template-columns: repeat(2, 1fr); padding: 0 24px 32px; gap: 20px 14px; }
        }
        @media (max-width: 560px) {
          .na-hero { height: 200px; }
          .na-hero-title { font-size: 28px; }
          .na-header { padding: 20px 16px 12px; flex-direction: column; align-items: flex-start; gap: 8px; }
          .na-heading { font-size: 26px; }
          .na-controls { padding: 0 16px 12px; }
          .na-grid { grid-template-columns: repeat(2, 1fr); padding: 0 16px 28px; gap: 16px 10px; }
          .na-img-wrap { aspect-ratio: 4/5; }
          .na-name { font-size: 11px; height: 32px; }
          .na-actions { flex-direction: column; gap: 8px; align-items: stretch; }
          .na-btn-enquiry, .na-btn-cart { width: 100%; padding: 10px; font-size: 9px; }
          .na-pagination { padding: 12px 16px 40px; }
          .na-price {
  font-size: 15px;
}
        }
      `}</style>
    </main>
  );
}

function CardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{
        width: "100%", aspectRatio: "4/3", background: "#e8e9da",
        position: "relative", overflow: "hidden", borderRadius: 2,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg,#e8e9da 25%,#f0f0e8 50%,#e8e9da 75%)",
          backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
        }} />
      </div>
      <div style={{ padding: "10px 4px 0" }}>
        <div style={{ height: 14, background: "#e8e9da", borderRadius: 3, marginBottom: 10, width: "80%" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ height: 38, background: "#e8e9da", borderRadius: 2, flex: 1 }} />
          <div style={{ height: 38, background: "#e8e9da", borderRadius: 2, width: 80 }} />
        </div>
      </div>
      <style jsx>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
