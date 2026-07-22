"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getCart,
  updateQty,
  removeFromCart,
  getCartSubtotal,
  formatPrice,
  CART_EVENT,
} from "@/lib/cart";
import { addToWishlist } from "@/lib/wishlist";
import { useRouter } from "next/navigation";

export default function CartPage() {

  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    setLoaded(true);
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const subtotal = getCartSubtotal(cart);
  const total = subtotal; // delivery + tax = 0 for now

  const handleQty = (slug, qty) => {
    updateQty(slug, qty);
    setCart(getCart());
  };

  const handleRemove = (slug) => {
    removeFromCart(slug);
    setCart(getCart());
  };
  const handleSaveForLater = (item) => {
  addToWishlist(item);

  removeFromCart(item.slug);

  setCart(getCart());

  router.push("/saved");
};

  return (
    <>
      <Header />

      <main className="crt-page-bg">
        <div className="crt-outer-wrap">
          <h1 className="crt-title">Shopping Cart ({cart.length})</h1>

          {!loaded ? null : cart.length === 0 ? (
            <div className="crt-empty">
              <p>Your cart is empty.</p>
              <Link href="/" className="crt-continue-link">
                Continue Shopping →
              </Link>
            </div>
          ) : (
            <div className="crt-layout">
              {/* ── LEFT: Cart items ── */}
              <div className="crt-items-col">
                <div className="crt-hr" />

                {cart.map((item) => (
                  <div className="crt-item-row" key={item.slug}>
                    <div className="crt-item-image">
                      {item.image && (
                        <img src={item.image} alt={item.name} />
                      )}
                    </div>

                    <div className="crt-item-body">
                      <div className="crt-item-top">
                        <h2 className="crt-item-name">{item.name}</h2>
                        <p className="crt-item-price">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>

                      {item.description && (
                        <p className="crt-item-desc">{item.description}</p>
                      )}

                      <div className="crt-item-controls">
                        <div className="crt-qty-box">
                          <button
                            className="crt-qty-btn"
                            aria-label="Decrease quantity"
                            onClick={() => handleQty(item.slug, item.qty - 1)}
                          >
                            −
                          </button>
                          <span className="crt-qty-value">{item.qty}</span>
                          <button
                            className="crt-qty-btn"
                            aria-label="Increase quantity"
                            onClick={() => handleQty(item.slug, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="crt-text-link"
                          onClick={() => handleRemove(item.slug)}
                        >
                          Remove
                        </button>

                    <button
  className="crt-text-link"
  onClick={() => handleSaveForLater(item)}
>
  Save for Later
</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="crt-hr" />

                <Link href="/" className="crt-text-link crt-continue-bottom">
                  ← Continue Shopping
                </Link>
              </div>

              {/* ── RIGHT: Order summary ── */}
              <div className="crt-summary-col">
                <div className="crt-hr" />

                <div className="crt-summary-line">
                  <span>Estimated Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="crt-summary-line">
                  <span>Complimentary Express Delivery</span>
                  <span>$0.00</span>
                </div>
                <div className="crt-summary-line">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>

                <div className="crt-hr" />

                <div className="crt-summary-total">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="crt-summary-note">
                  Complimentary Delivery with Effortless Returns
                </p>

                <button className="crt-checkout-btn">CHECKOUT</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .crt-page-bg {
          background-color: #FDFFF1;
          min-height: 100vh;
          font-family: "Mona Sans", "Inter", sans-serif;
          color: #0E0E0E;
        }

        .crt-outer-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 120px 48px 80px;
        }

        .crt-title {
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-weight: 700;
          font-size: 32px;
          text-align: center;
          margin: 0 0 48px;
          color: #0E0E0E;
        }

        .crt-empty {
          text-align: center;
          padding: 60px 0;
          font-size: 15px;
          color: #333333;
        }

        .crt-continue-link {
          display: inline-block;
          margin-top: 16px;
          color: #8A8D67;
          font-weight: 600;
          text-decoration: none;
        }
        .crt-continue-link:hover { color: #747854; }

        .crt-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 0 48px;
          align-items: start;
        }

        .crt-hr {
          border: none;
          border-top: 1px solid #C8CAB4;
          margin: 0 0 28px;
        }

        /* ── Items column ── */
        .crt-item-row {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
        }

        .crt-item-image {
          width: 150px;
          height: 150px;
          flex-shrink: 0;
          background: #F0F2DE;
          overflow: hidden;
        }
        .crt-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .crt-item-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .crt-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .crt-item-name {
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 19px;
          font-weight: 700;
          margin: 0;
          color: #0E0E0E;
        }

        .crt-item-price {
          font-size: 15px;
          font-weight: 700;
          color: #0E0E0E;
          margin: 0;
          white-space: nowrap;
        }

        .crt-item-desc {
          font-size: 13.5px;
          color: #888888;
          margin: 0;
          line-height: 1.6;
        }

        .crt-item-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 6px;
        }

        .crt-qty-box {
          display: flex;
          align-items: center;
          border: 1px solid #C8CAB4;
          width: fit-content;
        }
        .crt-qty-btn {
          width: 32px;
          height: 36px;
          background: transparent;
          border: none;
          font-size: 15px;
          cursor: pointer;
          color: #0E0E0E;
        }
        .crt-qty-btn:hover { background: #F0F2DE; }
        .crt-qty-value {
          width: 32px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        .crt-text-link {
          background: none;
          border: none;
          padding: 0;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0E0E0E;
          text-decoration: underline;
          cursor: pointer;
          letter-spacing: 0.02em;
        }
        .crt-text-link:hover { color: #747854; }

        .crt-continue-bottom {
          display: inline-block;
          text-decoration: none;
          color: #8A8D67;
        }

        /* ── Summary column ── */
        .crt-summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #333333;
          margin-bottom: 16px;
        }

        .crt-summary-total {
          display: flex;
          justify-content: space-between;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 19px;
          font-weight: 700;
          color: #0E0E0E;
          margin-bottom: 8px;
        }

        .crt-summary-note {
          font-size: 12.5px;
          color: #888888;
          margin: 0 0 24px;
        }

        .crt-checkout-btn {
          width: 100%;
          height: 56px;
          background: #8A8D67;
          color: #FFFFFF;
          border: none;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .crt-checkout-btn:hover { background: #747854; }

        /* ── Responsive: Tablet ── */
        @media (max-width: 960px) {
          .crt-outer-wrap {
            padding: 90px 24px 60px;
          }
          .crt-layout {
            grid-template-columns: 1fr;
            gap: 40px 0;
          }
          .crt-title { font-size: 26px; }
        }

        /* ── Responsive: Mobile ── */
     @media (max-width:560px){

*{
  box-sizing:border-box;
}

html,
body{
  overflow-x:hidden;
}

.crt-page-bg{
  overflow-x:hidden;
}

/* ================= PAGE ================= */

.crt-outer-wrap{
  padding:88px 18px 50px;
}

.crt-title{
  font-size:30px;
  line-height:1.15;
  margin:0 0 34px;
  text-align:left;
}

/* ================= LAYOUT ================= */

.crt-layout{
  display:flex;
  flex-direction:column;
  gap:42px;
}

/* ================= PRODUCT ================= */

.crt-item-row{
  display:flex;
  align-items:flex-start;
  gap:16px;
  margin-bottom:28px;
  padding-bottom:24px;
  border-bottom:1px solid #E6E7D8;
}

.crt-item-image{
  width:118px;
  height:118px;
  flex-shrink:0;
  background:#F4F4EC;
}

.crt-item-image img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.crt-item-body{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.crt-item-top{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.crt-item-name{
  font-size:17px;
  line-height:1.45;
  margin:0;
}

.crt-item-price{
  font-size:15px;
  font-weight:700;
  margin:0;
}

.crt-item-desc{
  display:none;
}

/* ================= BUTTONS ================= */

.crt-item-controls{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:6px;
}

.crt-qty-box{
  grid-column:1 / span 2;
  width:100%;
  height:46px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  border:1px solid #C8CAB4;
}

.crt-qty-btn{
  width:46px;
  height:46px;
  font-size:20px;
}

.crt-qty-value{
  flex:1;
  text-align:center;
  font-size:15px;
  font-weight:600;
}

.crt-text-link{
  width:100%;
  height:44px;
  display:flex;
  justify-content:center;
  align-items:center;

  border:1px solid #C8CAB4;
  text-decoration:none;

  font-size:12px;
  font-weight:600;

  background:#fff;
}

.crt-continue-bottom{
  margin-top:18px;
  display:inline-flex;
  font-size:13px;
}

/* ================= SUMMARY ================= */

.crt-summary-col{
    width:100% !important;
    max-width:100% !important;
    margin:0 !important;

    padding:22px 18px;

    border:1px solid #DCDDCE;
    background:#fff;
}

.crt-summary-line{

  display:flex;
  justify-content:space-between;

  gap:16px;

  font-size:13px;

  margin-bottom:16px;

}

.crt-summary-total{

  font-size:22px;

  margin:18px 0 8px;

}

.crt-summary-note{

  font-size:12px;

  line-height:1.7;

  margin-bottom:22px;

}

.crt-checkout-btn{

  width:100%;

  height:52px;

  font-size:13px;

  letter-spacing:.08em;

}

/* ================= EMPTY ================= */

.crt-empty{

  padding:70px 0;

}

.crt-empty p{

  font-size:15px;

  margin-bottom:18px;

}

.crt-continue-link{

  font-size:13px;

}

}
      `}</style>
    </>
  );
}