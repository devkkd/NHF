"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";
import { getWishlist, removeFromWishlist } from "@/lib/wishlist";

// Same theme values used across the category pages — adjust if your
// brand colors live elsewhere (e.g. a shared theme/constants file).
const THEME = {
  bg: "#faf7ec",
  accent: "#3f4a2b",
  border: "#c8cab4",
};

export default function SavedPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProducts(getWishlist());
    setIsLoading(false);
  }, []);

  const handleRemove = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(slug);
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setQuantities((prev) => ({ ...prev, [product.slug]: 1 }));
  };

  const increaseQty = (product) => {
    const qty = (quantities[product.slug] || 1) + 1;
    updateQty(product.slug, qty);
    setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
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
    setQuantities((prev) => ({ ...prev, [product.slug]: qty }));
  };

  return (
    <>
      <Header />

      <main className="cat-page" style={{ backgroundColor: THEME.bg }}>
        {/* ============ SECTION HEADER ============ */}
        <div className="cat-section-header">
          <h2 className="cat-section-title">Saved Products</h2>
        </div>

        {/* ============ PRODUCT GRID ============ */}
        {!isLoading && products.length === 0 && (
          <div className="cat-empty-state">
            <p>You haven't saved any products yet.</p>
            <Link href="/" className="cat-back-to-top">
              ← Continue Browsing
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="cat-product-grid">
            {products.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.slug} className="cat-product-card-link">
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
                      className="cat-wishlist-btn cat-wishlist-btn-active"
                      aria-label="Remove from wishlist"
                      onClick={(e) => handleRemove(e, product.slug)}
                    >
                      ♥
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
                            padding: "6px 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            boxSizing: "border-box",
                            minWidth: "115px",
                            height: "41px",
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
                          <span style={{ minWidth: "18px", textAlign: "center", fontWeight: 600 }}>
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
        )}
      </main>

      <style>{`
        /* ===================== LAYOUT (same as category page) ===================== */
        .cat-page {
          min-height: 100vh;
        }
.cat-section-header {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  padding: 120px 45px 0;
}
        .cat-section-title {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 30px;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: ${THEME.accent};
        }

        .cat-empty-state {
          text-align: center;
          padding: 60px 24px 100px;
          font-family: "Mona Sans", "Inter", sans-serif;
          color: #555;
        }
        .cat-empty-state p {
          margin: 0 0 12px;
          font-size: 15px;
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
        .cat-product-card {
          display: flex;
          flex-direction: column;
          align-items: center;
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
          color: ${THEME.accent};
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .cat-wishlist-btn-active {
          color: #e0304a; /* red heart, already saved */
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
          background: ${THEME.accent};
          color: ${THEME.bg};
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

        .cat-back-to-top {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          color: ${THEME.accent};
          text-decoration: none;
          letter-spacing: 0.06em;
        }
        .cat-back-to-top:hover {
          text-decoration: underline;
        }

        /* ===================== RESPONSIVE (same breakpoints) ===================== */
        @media (max-width: 900px) {
          .cat-section-header{
    padding:80px 24px 24px;
  }

          .cat-section-title {
            font-size: 30px;
          }
          .cat-product-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 24px 24px 32px;
            gap: 20px 14px;
          }
        }

      @media (max-width:560px){

  *{
    box-sizing:border-box;
  }

  .cat-page{
    overflow-x:hidden;
  }

  /* ---------- Heading ---------- */

  .cat-section-header{
    padding:80px 16px 18px;
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:8px;
  }

  .cat-section-title{
    font-size:26px;
    line-height:1.2;
    letter-spacing:-0.02em;
  }

  /* ---------- Grid ---------- */

  .cat-product-grid{
    grid-template-columns:repeat(2,1fr);
    gap:18px 12px;
    padding:0 16px 32px;
  }

  .cat-product-card{
    width:100%;
    display:flex;
    flex-direction:column;
    height:100%;
}

  /* ---------- Image ---------- */

  .cat-product-img-wrapper{
    aspect-ratio:4/5;
    border-radius:4px;
    overflow:hidden;
  }

  .cat-product-img{
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .cat-wishlist-btn{
    width:30px;
    height:30px;
    right:8px;
    bottom:8px;
    font-size:16px;
  }

  /* ---------- Product ---------- */

  .cat-product-info{
    padding-top:10px;
  }

 .cat-product-name{
    font-size:12px;
    line-height:1.45;

    height:34px;

    margin-bottom:10px;

    overflow:hidden;

    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:2;

    text-overflow:ellipsis;
}

  /* ---------- Buttons ---------- */

  .cat-product-actions{
    display:flex;
    flex-direction:column;
    gap:8px;
    width:100%;
  }

  .cat-btn-enquiry,
  .cat-btn-bulk{
    width:100%;
    height:42px;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0 8px;
    font-size:10px;
    font-weight:600;
    text-align:center;
    letter-spacing:.04em;
  }

  /* ---------- Quantity ---------- */

  .cat-product-actions > div{
    width:100% !important;
    min-width:100% !important;
    height:42px !important;
    padding:0 12px !important;
    display:flex !important;
    align-items:center;
    justify-content:space-between;
  }

  .cat-product-actions > div button{
    width:18px !important;
    height:18px !important;
    font-size:18px !important;
  }

  .cat-product-actions > div span{
    font-size:13px !important;
    font-weight:600;
  }

  /* ---------- Empty State ---------- */

  .cat-empty-state{
    padding:60px 20px 80px;
  }

  .cat-empty-state p{
    font-size:14px;
    line-height:1.6;
  }

  .cat-back-to-top{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    margin-top:8px;
    font-size:12px;
  }

}
      `}</style>
    </>
  );
}