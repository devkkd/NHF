"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { addToCart, updateQty } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const ACCENT = "#7b7f5c";
const BG = "#fdfff1";
const BORDER = "#c8cab4";
const LIMIT = 12;
const SORT_OPTIONS = ["Recommended", "Newest", "Name A–Z", "Name Z–A"];
const SKELETON_COUNT = 9;

async function fetchCategoryBySlug(slug) {
  try {
    const res = await fetch(`${BASE}/categories/${slug}`);
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data?.category ?? null;
  } catch { return null; }
}

async function fetchProductsByCategory(categoryId, page = 1, sort = "Recommended") {
  try {
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (categoryId) params.set("category", categoryId);

    // Map sort to API params
    if (sort === "Newest") params.set("sort", "newest");

    const res = await fetch(`${BASE}/products?${params}`);
    if (!res.ok) return { products: [], total: 0, pages: 1 };
    const body = await res.json();
    return body?.data ?? { products: [], total: 0, pages: 1 };
  } catch { return { products: [], total: 0, pages: 1 }; }
}

export default function CategoryPage() {
  const { category: slug } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recommended");
  const [quantities, setQuantities] = useState({});
  const [wishlist, setWishlist] = useState({});

  // Load wishlist
  useEffect(() => {
    const saved = getWishlist();
    const map = {};
    saved.forEach((item) => { map[item.slug] = true; });
    setWishlist(map);
  }, []);

  // Load category on slug change
  useEffect(() => {
    if (!slug) return;
    setLoadingCat(true);
    setNotFound(false);
    setPage(1);
    fetchCategoryBySlug(slug).then((cat) => {
      if (!cat) setNotFound(true);
      setCategory(cat);
      setLoadingCat(false);
    });
  }, [slug]);

  // Load products when category or page/sort changes
  useEffect(() => {
    if (loadingCat) return;
    if (notFound) return;
    setLoadingProducts(true);
    fetchProductsByCategory(category?._id ?? null, page, selectedSort).then((data) => {
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setLoadingProducts(false);
    });
  }, [category, page, selectedSort, loadingCat, notFound]);

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWishlist(product);
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
    updateQty(product.slug, qty);
    setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
  };

  const decreaseQty = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = (quantities[product.slug] || 1) - 1;
    if (qty <= 0) {
      updateQty(product.slug, 0);
      setQuantities((prev) => { const c = { ...prev }; delete c[product.slug]; return c; });
    } else {
      updateQty(product.slug, qty);
      setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
    }
  };

  const isLoading = loadingCat || loadingProducts;
  const showing = Math.min(page * LIMIT, total);

  // ── Not found ──
  if (!loadingCat && notFound) {
    return (
      <main style={{ background: BG, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Tobias TRIAL', serif", color: ACCENT, marginBottom: 12 }}>
            Category not found
          </h2>
          <Link href="/collection" style={{ color: ACCENT, fontSize: 14, textDecoration: "none", borderBottom: `1px solid ${ACCENT}` }}>
            ← Browse all categories
          </Link>
        </div>
      </main>
    );
  }

  const heroImage = category?.image || "/images/new-arrivals-hero.jpg";
  const heading = loadingCat ? "" : (category?.name ?? slug?.replace(/-/g, " ").toUpperCase());

  return (
    <main className="cat-page">

      {/* ── Hero ── */}
      <div className="cat-hero-banner">
        {isLoading && !category ? (
          <HeroSkeleton />
        ) : (
          <img src={heroImage} alt={heading} className="cat-hero-img" />
        )}
      </div>

      {/* ── Top label ── */}
      <div className="cat-top-label">
        {loadingCat
          ? <span className="cat-skel cat-skel-label" />
          : <p>COLLECTION</p>
        }
      </div>

      {/* ── Section header ── */}
      <div className="cat-section-header">
        {loadingCat ? (
          <>
            <span className="cat-skel cat-skel-title" />
            <span className="cat-skel cat-skel-link" />
          </>
        ) : (
          <>
            <h2 className="cat-section-title">{heading}</h2>
            <a href="/enquiry" className="cat-bulk-order-link">Bulk Order Request →</a>
          </>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="cat-controls-bar">
        {isLoading ? (
          <>
            <span className="cat-skel cat-skel-sortbtn" />
            <span className="cat-skel cat-skel-count" />
            <span className="cat-skel cat-skel-sortbtn" />
          </>
        ) : (
          <>
            <div className="cat-sort-wrapper">
              <button className="cat-sort-btn" onClick={() => setSortOpen((v) => !v)}>
                SORT BY: {selectedSort} ▾
              </button>
              {sortOpen && (
                <div className="cat-sort-dropdown">
                  {SORT_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      className={`cat-sort-option${selectedSort === opt ? " active" : ""}`}
                      onClick={() => { setSelectedSort(opt); setSortOpen(false); setPage(1); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="cat-product-count">{total} Products</span>
            <button className="cat-filters-btn">FILTERS ⇅</button>
          </>
        )}
      </div>

      {/* ── Product Grid ── */}
      <div className="cat-product-grid">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)
          : products.length === 0
            ? (
              <div className="cat-empty">
                <p>No products found in this category.</p>
                <Link href="/collection" style={{ color: ACCENT, fontSize: 14, textDecoration: "none", borderBottom: `1px solid ${ACCENT}` }}>
                  ← Browse all categories
                </Link>
              </div>
            )
            : products.map((product) => (
              <Link href={`/products/${product.slug}`} key={product._id} className="cat-product-card-link">
                <div className="cat-product-card">
                  <div className="cat-product-img-wrapper">
                    {product.mainImage ? (
                      <img src={product.mainImage} alt={product.name} className="cat-product-img" />
                    ) : (
                      <div className="cat-product-img-placeholder" />
                    )}
                    <button
                      className={`cat-wishlist-btn${wishlist[product.slug] ? " cat-wishlist-btn-active" : ""}`}
                      aria-label="Wishlist"
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
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/enquiry1/${product.slug}`); }}
                      >
                        BULK PRICE ENQUIRY ↗
                      </button>
                      {!quantities[product.slug] ? (
                        <button
                          className="cat-btn-bulk"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          ● ADD TO CART
                        </button>
                      ) : (
                        <div className="cat-qty-control" onClick={(e) => e.preventDefault()}>
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
      {!isLoading && total > 0 && (
        <div className="cat-pagination-area">
          <p className="cat-showing-text">Showing 1 – {showing} of {total}</p>
          {page < pages && (
            <button
              className="cat-see-more-btn"
              onClick={() => setPage((p) => p + 1)}
            >
              SEE MORE
            </button>
          )}
          <button
            className="cat-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ BACK TO TOP
          </button>
        </div>
      )}

      <style>{`
        .cat-page { background: ${BG}; min-height: 100vh; }

        .cat-hero-banner { width: 100%; overflow: hidden; }
        .cat-hero-img { width: 100%; height: 440px; object-fit: cover; display: block; }

        .cat-top-label { text-align: center; padding: 32px 0 20px; }
        .cat-top-label p {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 30px; font-weight: 500; line-height: 160%;
          color: ${ACCENT}; letter-spacing: -0.02em;
        }

        .cat-section-header {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; padding: 0 60px 20px;
        }
        .cat-section-title {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 40px; font-weight: 500; letter-spacing: -0.02em;
          line-height: 1.2; color: ${ACCENT};
        }
        .cat-bulk-order-link {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 16px; color: ${ACCENT}; text-decoration: none;
          border-bottom: 1px solid ${ACCENT}; padding-bottom: 2px; white-space: nowrap;
        }
        .cat-bulk-order-link:hover { opacity: 0.75; }

        .cat-controls-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 60px; position: relative;
        }
        .cat-sort-wrapper { position: relative; }
        .cat-sort-btn, .cat-filters-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px; font-weight: 600; color: #0e0e0e;
          background: ${BG}; border: 1px solid ${BORDER};
          padding: 7px 16px; cursor: pointer; letter-spacing: 0.04em;
        }
        .cat-sort-btn:hover, .cat-filters-btn:hover { background: #f0f2de; }
        .cat-sort-dropdown {
          position: absolute; top: 110%; left: 0;
          background: #fff; border: 1px solid ${BORDER};
          min-width: 180px; z-index: 99;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .cat-sort-option {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px; padding: 10px 16px; cursor: pointer; color: #0e0e0e;
        }
        .cat-sort-option:hover, .cat-sort-option.active { background: #f0f2de; color: ${ACCENT}; }
        .cat-product-count { font-family: "Mona Sans", "Inter", sans-serif; font-size: 14px; color: #555; }

        .cat-product-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 28px 20px; padding: 0 60px 40px;
        }
        .cat-product-card-link { text-decoration: none; }
        .cat-product-card { display: flex; flex-direction: column; height: 100%; }
        .cat-product-img-wrapper {
          position: relative; width: 100%; aspect-ratio: 4/3;
          overflow: hidden; background: #e8e9da;
        }
        .cat-product-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.35s ease;
        }
        .cat-product-card:hover .cat-product-img { transform: scale(1.04); }
        .cat-product-img-placeholder { width: 100%; height: 100%; background: #e8e9da; }
        .cat-wishlist-btn {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(255,255,255,0.85); border: none; border-radius: 50%;
          width: 30px; height: 30px; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${ACCENT}; transition: color 0.15s ease, transform 0.15s ease;
        }
        .cat-wishlist-btn-active { color: #e0304a; }
        .cat-wishlist-btn:active { transform: scale(0.9); }
        .cat-product-info { width: 100%; padding: 10px 4px 0; display: flex; flex-direction: column; flex: 1; }
        .cat-product-name {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px; font-weight: 700; color: #0e0e0e;
          line-height: 1.45; margin: 0 0 10px; text-transform: uppercase;
          height: 38px; overflow: hidden;
          display: -webkit-box; -webkit-box-orient: vertical;
          -webkit-line-clamp: 2; text-overflow: ellipsis;
        }
        .cat-product-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .cat-btn-enquiry {
          font-family: "Mona Sans", "Inter", sans-serif; font-size: 11px; font-weight: 600;
          background: ${ACCENT}; color: ${BG}; border: none;
          padding: 12px 18px; cursor: pointer; letter-spacing: 0.05em;
        }
        .cat-btn-bulk {
          font-family: "Mona Sans", "Inter", sans-serif; font-size: 11px; font-weight: 500;
          background: transparent; color: #0e0e0e; border: 1px solid ${BORDER};
          padding: 6px 12px; cursor: pointer; letter-spacing: 0.03em;
        }
        .cat-qty-control {
          display: inline-flex; align-items: center; justify-content: space-between;
          gap: 10px; border: 1px solid ${BORDER}; padding: 6px 12px;
          min-width: 115px; height: 41px; font-size: 11px;
        }
        .cat-qty-control button {
          border: none; background: transparent; cursor: pointer; font-size: 18px;
          width: 18px; height: 18px; display: flex; align-items: center;
          justify-content: center; padding: 0;
        }
        .cat-qty-control span { font-weight: 600; text-align: center; min-width: 18px; }

        .cat-pagination-area {
          text-align: center; padding: 20px 60px 60px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .cat-showing-text { font-family: "Mona Sans", sans-serif; font-size: 13px; color: #777; margin: 0; }
        .cat-see-more-btn {
          font-family: "Mona Sans", sans-serif; font-size: 13px; font-weight: 600;
          background: ${BG}; border: 1px solid ${BORDER}; padding: 10px 40px;
          cursor: pointer; letter-spacing: 0.08em; color: #0e0e0e;
        }
        .cat-back-to-top {
          font-family: "Mona Sans", sans-serif; font-size: 12px;
          color: ${ACCENT}; background: none; border: none;
          cursor: pointer; letter-spacing: 0.06em;
        }
        .cat-empty {
          grid-column: 1/-1; text-align: center; padding: 80px 20px;
          font-family: "Mona Sans", sans-serif; color: #888;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }

        /* Skeleton */
        .cat-skel {
          display: block; position: relative; overflow: hidden; background: rgba(0,0,0,0.08);
          border-radius: 4px;
        }
        .cat-skel::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
          animation: cat-shimmer 1.4s infinite;
        }
        @keyframes cat-shimmer { 100% { transform: translateX(100%); } }
        .cat-hero-skel { width: 100%; height: 440px; border-radius: 0; }
        .cat-skel-label { width: 220px; height: 30px; margin: 0 auto; }
        .cat-skel-title { width: 260px; height: 40px; }
        .cat-skel-link { width: 140px; height: 20px; }
        .cat-skel-sortbtn { width: 110px; height: 34px; }
        .cat-skel-count { width: 90px; height: 18px; }
        .cat-card-skel-img { width: 100%; aspect-ratio: 4/3; border-radius: 0; }
        .cat-card-skel-name { width: 80%; height: 14px; margin: 10px 0; }
        .cat-card-skel-actions { display: flex; gap: 10px; }
        .cat-card-skel-btn1 { width: 110px; height: 34px; }
        .cat-card-skel-btn2 { width: 90px; height: 26px; }

        /* Responsive */
        @media (max-width: 900px) {
          .cat-hero-img, .cat-hero-skel { height: 320px; }
          .cat-section-header, .cat-controls-bar, .cat-pagination-area { padding-left: 24px; padding-right: 24px; }
          .cat-section-title, .cat-skel-title { font-size: 30px; }
          .cat-product-grid { grid-template-columns: repeat(2, 1fr); padding: 24px 24px 32px; gap: 20px 14px; }
        }
        @media (max-width: 560px) {
          .cat-hero-img, .cat-hero-skel { height: 170px; }
          .cat-top-label { padding: 20px 16px 12px; }
          .cat-top-label p { font-size: 22px; }
          .cat-section-header { padding: 18px 16px 16px; flex-direction: column; align-items: flex-start; gap: 10px; }
          .cat-section-title { font-size: 24px; }
          .cat-controls-bar { padding: 0 16px 18px; flex-wrap: wrap; gap: 10px; }
          .cat-sort-btn, .cat-filters-btn { font-size: 10px; padding: 7px 10px; }
          .cat-product-grid { grid-template-columns: repeat(2, 1fr); padding: 0 16px 28px; gap: 18px 12px; }
          .cat-product-img-wrapper { aspect-ratio: 4/5; }
          .cat-product-name { font-size: 11px; height: 32px; }
          .cat-product-actions { flex-direction: column; gap: 8px; align-items: stretch; }
          .cat-btn-enquiry, .cat-btn-bulk { width: 100%; font-size: 9px; }
          .cat-qty-control { width: 100%; min-width: 100%; height: 36px; padding: 4px 10px; }
          .cat-pagination-area { padding: 8px 16px 40px; }
          .cat-see-more-btn { width: 100%; }
        }
      `}</style>
    </main>
  );
}

function HeroSkeleton() {
  return <span className="cat-skel cat-hero-skel" />;
}

function CardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="cat-skel cat-card-skel-img" />
      <div style={{ padding: "10px 4px 0" }}>
        <span className="cat-skel cat-card-skel-name" />
        <div className="cat-card-skel-actions">
          <span className="cat-skel cat-card-skel-btn1" />
          <span className="cat-skel cat-card-skel-btn2" />
        </div>
      </div>
    </div>
  );
}
