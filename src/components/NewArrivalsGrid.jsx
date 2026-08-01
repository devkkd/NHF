"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";

const FALLBACK = [
  { slug: "product-1", mainImage: "/images/product-1.jpg", name: "HAND BLOCK PERCALE PRINTED BEDSHEET" },
  { slug: "product-2", mainImage: "/images/product-2.jpg", name: "HAND BLOCK PERCALE PRINTED BEDSHEET" },
  { slug: "product-3", mainImage: "/images/product-3.jpg", name: "HAND BLOCK PERCALE PRINTED BEDSHEET" },
];

export default function NewArrivalsGrid({ products = [] }) {
  const router = useRouter();
const [quantities, setQuantities] = useState({});
const handleAddToCart = (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  addToCart(product, 1);

  setQuantities((prev) => ({
    ...prev,
    [product.slug]: 1,
  }));
};

const increaseQty = (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  const qty = (quantities[product.slug] || 1) + 1;

  updateQty(product._id, qty);

  setQuantities((prev) => ({
    ...prev,
    [product.slug]: qty,
  }));
};

const decreaseQty = (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  const qty = (quantities[product.slug] || 1) - 1;

  if (qty <= 0) {
    updateQty(product._id, 0);

    setQuantities((prev) => {
      const copy = { ...prev };
      delete copy[product.slug];
      return copy;
    });
  } else {
    updateQty(product._id, qty);

    setQuantities((prev) => ({
      ...prev,
      [product.slug]: qty,
    }));
  }
};
 const items =
  products?.length > 0
    ? products
        .filter((p) => p.showInNewArrivals)
        .slice(0, 3)
        .map((p) => ({
          _id: p._id,
          slug: p.slug,
          mainImage: p.mainImage || "/images/product-1.jpg",
          name: p.name?.toUpperCase() || "NEW ARRIVAL",
          price: p.price || 0,
        }))
    : FALLBACK;

  return (
    <section className="arrival-section">
      <div className="container">
        <h2 className="section-title">NEW ARRIVALS</h2>

        <div className="product-grid">
          {items.map((item, index) => (
            <Link key={item.slug || index} href={`/products/${item.slug}`} className="product-card-link">
              <div className="product-card">
                <div className="image-wrap">
                  <Image
                    src={item.mainImage}
                    alt={item.name}
                    fill
                    sizes="(max-width:480px) 50vw, (max-width:768px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <button
                    className="wishlist-btn"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Wishlist"
                  >
                    ♡
                  </button>
                </div>
<h3 className="product-title">{item.name}</h3>

<p className="product-price">
  ₹{Number(item.price || 0).toLocaleString("en-IN")}
</p>

<div className="action-row">
  <button
    className="price-btn"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/enquiry1/${item.slug}`);
    }}
  >
    BULK PRICE ENQUIRY ↗
  </button>

  {!quantities[item.slug] ? (
    <button
      className="cart-btn"
      onClick={(e) => handleAddToCart(e, item)}
    >
      ● ADD TO CART
    </button>
  ) : (
    <div
      className="qty-control"
      onClick={(e) => e.preventDefault()}
    >
      <button onClick={(e) => decreaseQty(e, item)}>−</button>

      <span>{quantities[item.slug]}</span>

      <button onClick={(e) => increaseQty(e, item)}>+</button>
    </div>
  )}
</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bottom-btn-wrap">
          <Link href="/new-arrivals" className="bottom-btn">
            SEE ALL NEW ARRIVALS →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .arrival-section {
          background: #FDFFF1;
          padding: 90px 40px;
          box-sizing: border-box;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .section-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 32px;
          font-weight: 500;
          line-height: 160%;
          letter-spacing: -0.02em;
          color: #7B7F5C;
          text-align: center;
          margin-bottom: 42px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .product-card-link { text-decoration: none; display: block; }
        .product-card { display: flex; flex-direction: column; }
        .image-wrap {
          position: relative;
          width: 100%;
          height: 430px;
          overflow: hidden;
        }
        .wishlist-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 34px;
          height: 34px;
          border: 1px solid #d3d3d3;
          background: #fff;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .product-title {
          margin-top: 16px;
          margin-bottom: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 700;
          line-height: 160%;
          color: #0E0E0E;
        }
          .product-price {
  margin: -8px 0 18px;
  font-family: "Mona Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #7B7F5C;
  line-height: 1.2;
}
        .action-row {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .price-btn {
          background: #7B7F5C;
          color: #fff;
          border: none;
          padding: 14px 28px;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          cursor: pointer;
          box-sizing: border-box;
        }
          .cart-btn {
  font-family: "Mona Sans", sans-serif;
  font-size: 11px;
  font-weight: 500;
  background: transparent;
  color: #0e0e0e;
  border: 1px solid #c8cab4;
  padding: 14px 28px;
  cursor: pointer;
  letter-spacing: .03em;
  box-sizing: border-box;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #c8cab4;
  padding: 6px 12px;
  min-width: 115px;
  height: 41px;
  box-sizing: border-box;
}

.qty-control button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.qty-control span {
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  font-family: "Mona Sans", sans-serif;
}
        .bulk-text {
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #0E0E0E;
        }
        .bottom-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 70px;
        }
        .bottom-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7B7F5C;
          padding-bottom: 10px;
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          color: #7B7F5C;
          cursor: pointer;
          text-decoration: none;
        }

        /* ---------- TABLET ---------- */
        @media (max-width: 1024px) {
          .arrival-section { padding: 70px 28px; }
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .image-wrap { height: 360px; }
        }

        /* ---------- MOBILE: 2 COLUMNS ---------- */
        @media (max-width: 768px) {
          .arrival-section { padding: 48px 14px; }
          .container { max-width: 100%; }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .image-wrap { height: 220px; }
          .section-title { font-size: 24px; margin-bottom: 26px; }
          .product-title {
            font-size: 12px;
            margin-top: 10px;
            margin-bottom: 6px;
            line-height: 1.4;
          }
          .product-price {
            font-size: 13px;
            margin: 0 0 10px;
          }
          .action-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .price-btn {
            width: 100%;
            padding: 10px 10px;
            font-size: 10px;
            text-align: center;
            letter-spacing: 0;
          }
          .cart-btn {
            width: 100%;
            padding: 10px 10px;
            font-size: 10px;
            text-align: center;
          }
          .qty-control {
            width: 100%;
            min-width: 100%;
            height: 38px;
            padding: 4px 12px;
          }
          .wishlist-btn {
            width: 28px;
            height: 28px;
            font-size: 13px;
            right: 8px;
            bottom: 8px;
          }
          .bottom-btn-wrap { margin-top: 36px; }
          .bottom-btn { font-size: 13px; }
        }

        /* ---------- SMALL MOBILE ---------- */
        @media (max-width: 400px) {
          .arrival-section { padding: 40px 10px; }
          .product-grid { gap: 10px; }
          .image-wrap { height: 190px; }
          .section-title { font-size: 20px; margin-bottom: 22px; }
          .product-title { font-size: 11px; }
          .product-price { font-size: 12px; }
          .price-btn, .cart-btn { font-size: 9px; padding: 9px 8px; }
          .qty-control { height: 34px; padding: 4px 8px; }
          .qty-control button { font-size: 15px; }
          .bottom-btn { font-size: 12px; }
        }
      `}</style>
    </section>
  );
}