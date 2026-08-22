"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getCart,
  updateQty,
  removeFromCart,
  formatPrice,
  CART_EVENT,
} from "@/lib/cart";

import { addToWishlist } from "@/lib/wishlist";


// ======================================================
// CART PAGE
// ======================================================

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD CART
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        setError("");

        const data =
          await getCart();

        if (!mounted) {
          return;
        }

        setCart(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load cart:",
          error
        );

        if (mounted) {
          setCart([]);
          setError(
            "Unable to load your cart. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    sync();

    const handleCartUpdated =
      () => {
        sync();
      };

    const handleStorage =
      () => {
        sync();
      };

    window.addEventListener(
      CART_EVENT,
      handleCartUpdated
    );

    window.addEventListener(
      "CART_UPDATED",
      handleCartUpdated
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        CART_EVENT,
        handleCartUpdated
      );

      window.removeEventListener(
        "CART_UPDATED",
        handleCartUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  // ====================================================
  // SUBTOTAL
  // ====================================================

  /*
   * IMPORTANT:
   * Backend cart already contains populated
   * item.product.
   *
   * Calculate subtotal directly from
   * current cart state.
   */

  const subtotal =
    useMemo(() => {
      return cart.reduce(
        (
          total,
          item
        ) => {
          const product =
            item?.product ||
            {};

          const price =
            Number(
              product?.price ??
                item?.price ??
                0
            );

          const quantity =
            Number(
              item?.quantity || 1
            );

          return (
            total +
            price * quantity
          );
        },
        0
      );
    }, [cart]);


  // ====================================================
  // TOTAL
  // ====================================================

  /*
   * Abhi shipping aur tax zero hain.
   * Checkout page par final charges
   * calculate honge.
   */

  const total = subtotal;


  // ====================================================
  // CART ITEM COUNT
  // ====================================================

  const itemCount =
    useMemo(() => {
      return cart.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item?.quantity || 0
          ),
        0
      );
    }, [cart]);


  // ====================================================
  // GET PRODUCT ID
  // ====================================================

  const getProductId =
    (item) => {
      return (
        item?.product?._id ||
        item?.product?.id ||
        item?.productId ||
        null
      );
    };


  // ====================================================
  // UPDATE QUANTITY
  // ====================================================

  const handleQty =
    async (
      productId,
      quantity
    ) => {
      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const nextQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          nextQuantity
        )
      ) {
        return;
      }

      const actionKey =
        `qty-${productId}`;

      try {
        setError("");
        setActionLoading(
          actionKey
        );

        await updateQty(
          productId,
          nextQuantity
        );

        const data =
          await getCart();

        setCart(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to update cart quantity:",
          error
        );

        setError(
          error?.message ||
            "Failed to update cart."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };


  // ====================================================
  // REMOVE ITEM
  // ====================================================

  const handleRemove =
    async (
      productId
    ) => {
      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const actionKey =
        `remove-${productId}`;

      try {
        setError("");
        setActionLoading(
          actionKey
        );

        await removeFromCart(
          productId
        );

        const data =
          await getCart();

        setCart(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to remove item:",
          error
        );

        setError(
          error?.message ||
            "Failed to remove item."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };


  // ====================================================
  // SAVE FOR LATER
  // ====================================================

  const handleSaveForLater =
    async (
      item
    ) => {
      const productId =
        getProductId(item);

      const product =
        item?.product;

      if (
        !product ||
        !productId
      ) {
        setError(
          "Unable to save this product."
        );
        return;
      }

      const actionKey =
        `save-${productId}`;

      try {
        setError("");
        setActionLoading(
          actionKey
        );

        /*
         * Wishlist first.
         */
        await addToWishlist(
          product
        );

        /*
         * Then remove from cart.
         */
        await removeFromCart(
          productId
        );

        const data =
          await getCart();

        setCart(
          Array.isArray(data)
            ? data
            : []
        );

        router.push(
          "/saved"
        );
      } catch (error) {
        console.error(
          "Save for later failed:",
          error
        );

        setError(
          error?.message ||
            "Could not save the item for later."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };


  // ====================================================
  // CHECKOUT
  // ====================================================

  const handleCheckout =
    () => {
      if (
        cart.length === 0
      ) {
        return;
      }

      router.push(
        "/checkout"
      );
    };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <ProtectedRoute>
      <>
        <Header />

        <main className="crt-page-bg">
          <div className="crt-outer-wrap">

            <h1 className="crt-title">
              Shopping Cart ({itemCount})
            </h1>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (
              <div
                className="crt-error"
                role="alert"
              >
                {error}
              </div>
            )}


            {/* =========================================
                LOADING
            ========================================= */}

            {!loaded ? (
              <div className="crt-loading">
                Loading your cart...
              </div>
            ) : cart.length === 0 ? (

              /* =======================================
                 EMPTY CART
              ======================================= */

              <div className="crt-empty">

                <div className="crt-empty-icon">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>

                <p>
                  Your cart is empty.
                </p>

                <Link
                  href="/"
                  className="crt-continue-link"
                >
                  Continue Shopping →
                </Link>
              </div>

            ) : (

              /* =======================================
                 CART CONTENT
              ======================================= */

              <div className="crt-layout">

                {/* ====================================
                    LEFT COLUMN
                ==================================== */}

                <div className="crt-items-col">

                  <div className="crt-hr" />

                  {cart.map(
                    (
                      item,
                      index
                    ) => {
                      const product =
                        item?.product ||
                        {};

                      const productId =
                        getProductId(
                          item
                        );

                      const key =
                        productId
                          ? `cart-product-${productId}`
                          : `cart-item-${index}`;

                      const quantity =
                        Number(
                          item?.quantity ||
                            1
                        );

                      const price =
                        Number(
                          product?.price ??
                            item?.price ??
                            0
                        );

                      const lineTotal =
                        price *
                        quantity;

                      const image =
                        product?.mainImage ||
                        product?.image ||
                        item?.images?.[0] ||
                        "/placeholder-product.png";

                      const isUpdating =
                        actionLoading ===
                          `qty-${productId}`;

                      const isRemoving =
                        actionLoading ===
                          `remove-${productId}`;

                      const isSaving =
                        actionLoading ===
                          `save-${productId}`;

                      return (
                        <div
                          key={key}
                          className="crt-item-row"
                        >

                          {/* IMAGE */}

                          <div className="crt-item-image">

                            <img
                              src={image}
                              alt={
                                product?.name ||
                                "Product image"
                              }
                            />

                          </div>


                          {/* BODY */}

                          <div className="crt-item-body">

                            <div className="crt-item-top">

                              <h2 className="crt-item-name">
                                {product?.name ||
                                  "Unnamed Product"}
                              </h2>

                              <p className="crt-item-price">
                                {formatPrice(
                                  lineTotal
                                )}
                              </p>

                            </div>


                            {product?.item && (
                              <p className="crt-item-desc">
                                {product.item}
                              </p>
                            )}


                            <div className="crt-item-controls">

                              {/* QTY */}

                              <div className="crt-qty-box">

                                <button
                                  type="button"
                                  className="crt-qty-btn"
                                  aria-label={`Decrease quantity of ${
                                    product?.name ||
                                    "product"
                                  }`}
                                  disabled={
                                    isUpdating ||
                                    isRemoving ||
                                    isSaving
                                  }
                                  onClick={() =>
                                    handleQty(
                                      productId,
                                      quantity - 1
                                    )
                                  }
                                >
                                  −
                                </button>

                                <span className="crt-qty-value">
                                  {isUpdating
                                    ? "..."
                                    : quantity}
                                </span>

                                <button
                                  type="button"
                                  className="crt-qty-btn"
                                  aria-label={`Increase quantity of ${
                                    product?.name ||
                                    "product"
                                  }`}
                                  disabled={
                                    isUpdating ||
                                    isRemoving ||
                                    isSaving
                                  }
                                  onClick={() =>
                                    handleQty(
                                      productId,
                                      quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>

                              </div>


                              {/* REMOVE */}

                              <button
                                type="button"
                                className="crt-text-link"
                                disabled={
                                  isUpdating ||
                                  isRemoving ||
                                  isSaving
                                }
                                onClick={() =>
                                  handleRemove(
                                    productId
                                  )
                                }
                              >
                                {isRemoving
                                  ? "Removing..."
                                  : "Remove"}
                              </button>


                              {/* SAVE FOR LATER */}

                              <button
                                type="button"
                                className="crt-text-link"
                                disabled={
                                  isUpdating ||
                                  isRemoving ||
                                  isSaving
                                }
                                onClick={() =>
                                  handleSaveForLater(
                                    item
                                  )
                                }
                              >
                                {isSaving
                                  ? "Saving..."
                                  : "Save for Later"}
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}


                  <div className="crt-hr" />

                  <Link
                    href="/"
                    className="crt-text-link crt-continue-bottom"
                  >
                    ← Continue Shopping
                  </Link>

                </div>


                {/* ====================================
                    RIGHT COLUMN
                ==================================== */}

                <div className="crt-summary-col">

                  <div className="crt-hr" />


                  <div className="crt-summary-line">
                    <span>
                      Estimated Subtotal
                    </span>

                    <span>
                      {formatPrice(
                        subtotal
                      )}
                    </span>
                  </div>


                  <div className="crt-summary-line">
                    <span>
                      Complimentary Express Delivery
                    </span>

                    <span>
                      {formatPrice(0)}
                    </span>
                  </div>


                  <div className="crt-summary-line">
                    <span>
                      Estimated Tax
                    </span>

                    <span>
                      {formatPrice(0)}
                    </span>
                  </div>


                  <div className="crt-hr" />


                  <div className="crt-summary-total">
                    <span>
                      Estimated Total
                    </span>

                    <span>
                      {formatPrice(
                        total
                      )}
                    </span>
                  </div>


                  <p className="crt-summary-note">
                    Complimentary Delivery
                    with Effortless Returns
                  </p>


                  <button
                    type="button"
                    className="crt-checkout-btn"
                    onClick={
                      handleCheckout
                    }
                    disabled={
                      cart.length ===
                      0
                    }
                  >
                    CHECKOUT
                  </button>

                </div>

              </div>
            )}

          </div>
        </main>

        <Footer />


        {/* =========================================
            STYLES
        ========================================= */}

        <style jsx>{`
          .crt-page-bg {
            background-color: #fdfff1;
            min-height: 100vh;
            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;
            color: #0e0e0e;
          }

          .crt-outer-wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 120px 48px 80px;
            box-sizing: border-box;
          }

          .crt-title {
            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-weight: 700;
            font-size: 32px;
            line-height: 1.2;

            text-align: center;

            margin: 0 0 48px;

            color: #0e0e0e;
          }

          .crt-error {
            width: 100%;

            margin: 0 0 24px;

            padding: 12px 16px;

            border: 1px solid #e7b2b2;

            background: #fff5f5;

            color: #a52d2d;

            font-size: 13px;

            text-align: center;
          }

          .crt-loading {
            text-align: center;

            padding: 80px 20px;

            color: #777;

            font-size: 14px;
          }

          .crt-empty {
            text-align: center;

            padding: 80px 20px;
          }

          .crt-empty-icon {
            width: 82px;
            height: 82px;

            margin: 0 auto 18px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: #f0f2de;

            color: #8a8d67;
          }

          .crt-empty p {
            margin: 0;

            font-size: 16px;

            color: #333;
          }

          .crt-continue-link {
            display: inline-block;

            margin-top: 16px;

            color: #8a8d67;

            font-weight: 600;

            text-decoration: none;
          }

          .crt-continue-link:hover {
            color: #747854;
          }

          .crt-layout {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              380px;

            gap: 48px;

            align-items: start;
          }

          .crt-hr {
            border: none;

            border-top:
              1px solid #c8cab4;

            margin:
              0 0 28px;
          }

          /* =========================================
             ITEMS
          ========================================= */

          .crt-item-row {
            display: flex;

            gap: 24px;

            margin-bottom: 32px;
          }

          .crt-item-image {
            width: 150px;
            height: 150px;

            flex-shrink: 0;

            background: #f0f2de;

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

            min-width: 0;

            display: flex;

            flex-direction: column;

            gap: 10px;
          }

          .crt-item-top {
            display: flex;

            justify-content:
              space-between;

            align-items:
              flex-start;

            gap: 16px;
          }

          .crt-item-name {
            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size: 19px;

            font-weight: 700;

            margin: 0;

            color: #0e0e0e;
          }

          .crt-item-price {
            font-size: 15px;

            font-weight: 700;

            color: #0e0e0e;

            margin: 0;

            white-space: nowrap;
          }

          .crt-item-desc {
            font-size: 13.5px;

            color: #888;

            margin: 0;

            line-height: 1.6;
          }

          .crt-item-controls {
            display: flex;

            align-items: center;

            gap: 24px;

            margin-top: 6px;

            flex-wrap: wrap;
          }

          .crt-qty-box {
            display: flex;

            align-items: center;

            border:
              1px solid #c8cab4;

            width: fit-content;
          }

          .crt-qty-btn {
            width: 32px;
            height: 36px;

            background: transparent;

            border: none;

            font-size: 15px;

            cursor: pointer;

            color: #0e0e0e;
          }

          .crt-qty-btn:hover:not(:disabled) {
            background: #f0f2de;
          }

          .crt-qty-btn:disabled {
            opacity: 0.45;

            cursor: not-allowed;
          }

          .crt-qty-value {
            min-width: 32px;

            text-align: center;

            font-size: 14px;

            font-weight: 600;
          }

          .crt-text-link {
            background: none;

            border: none;

            padding: 0;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 13px;

            font-weight: 600;

            color: #0e0e0e;

            text-decoration: underline;

            cursor: pointer;

            letter-spacing: 0.02em;
          }

          .crt-text-link:hover:not(:disabled) {
            color: #747854;
          }

          .crt-text-link:disabled {
            opacity: 0.45;

            cursor: not-allowed;
          }

          .crt-continue-bottom {
            display: inline-block;

            text-decoration: none;

            color: #8a8d67;
          }

          /* =========================================
             SUMMARY
          ========================================= */

          .crt-summary-col {
            position: sticky;

            top: 24px;
          }

          .crt-summary-line {
            display: flex;

            justify-content:
              space-between;

            gap: 16px;

            font-size: 14px;

            color: #333;

            margin-bottom: 16px;
          }

          .crt-summary-total {
            display: flex;

            justify-content:
              space-between;

            gap: 16px;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size: 19px;

            font-weight: 700;

            color: #0e0e0e;

            margin-bottom: 8px;
          }

          .crt-summary-note {
            font-size: 12.5px;

            color: #888;

            margin: 0 0 24px;

            line-height: 1.6;
          }

          .crt-checkout-btn {
            display: flex;

            align-items: center;

            justify-content: center;

            width: 100%;

            height: 56px;

            background: #8a8d67;

            color: #fff;

            border: none;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 14px;

            font-weight: 600;

            letter-spacing: 0.04em;

            cursor: pointer;

            transition:
              background 0.2s ease,
              opacity 0.2s ease;
          }

          .crt-checkout-btn:hover:not(:disabled) {
            background: #747854;
          }

          .crt-checkout-btn:disabled {
            opacity: 0.45;

            cursor: not-allowed;
          }


          /* =========================================
             TABLET
          ========================================= */

          @media (max-width: 960px) {
            .crt-outer-wrap {
              padding:
                90px
                24px
                60px;
            }

            .crt-layout {
              grid-template-columns:
                1fr;

              gap: 40px 0;
            }

            .crt-summary-col {
              position: static;
            }

            .crt-title {
              font-size: 26px;
            }
          }


          /* =========================================
             MOBILE
          ========================================= */

          @media (max-width: 560px) {
            .crt-outer-wrap {
              padding:
                88px
                18px
                50px;
            }

            .crt-title {
              font-size: 30px;

              line-height: 1.15;

              margin:
                0
                0
                34px;

              text-align: left;
            }

            .crt-layout {
              display: flex;

              flex-direction:
                column;

              gap: 42px;
            }

            .crt-item-row {
              display: flex;

              align-items:
                flex-start;

              gap: 16px;

              margin-bottom: 28px;

              padding-bottom: 24px;

              border-bottom:
                1px solid #e6e7d8;
            }

            .crt-item-image {
              width: 118px;
              height: 118px;
            }

            .crt-item-top {
              display: flex;

              flex-direction:
                column;

              gap: 6px;
            }

            .crt-item-name {
              font-size: 17px;

              line-height: 1.45;
            }

            .crt-item-price {
              font-size: 15px;
            }

            .crt-item-desc {
              display: none;
            }

            .crt-item-controls {
              display: grid;

              grid-template-columns:
                1fr
                1fr;

              gap: 10px;

              margin-top: 6px;
            }

            .crt-qty-box {
              grid-column:
                1 / span 2;

              width: 100%;

              height: 46px;

              display: flex;

              justify-content:
                space-between;

              align-items:
                center;
            }

            .crt-qty-btn {
              width: 46px;
              height: 46px;

              font-size: 20px;
            }

            .crt-qty-value {
              flex: 1;

              text-align: center;

              font-size: 15px;

              font-weight: 600;
            }

            .crt-text-link {
              width: 100%;

              min-height: 44px;

              display: flex;

              justify-content:
                center;

              align-items:
                center;

              border:
                1px solid #c8cab4;

              text-decoration: none;

              font-size: 12px;

              font-weight: 600;

              background: #fff;
            }

            .crt-continue-bottom {
              margin-top: 18px;

              display: inline-flex;

              min-height: auto;

              border: none;

              font-size: 13px;
            }

            .crt-summary-col {
              width: 100% !important;

              max-width: 100% !important;

              margin: 0 !important;

              padding:
                22px
                18px;

              border:
                1px solid #dcddce;

              background: #fff;

              position: static;
            }

            .crt-summary-line {
              display: flex;

              justify-content:
                space-between;

              gap: 16px;

              font-size: 13px;

              margin-bottom: 16px;
            }

            .crt-summary-total {
              font-size: 22px;

              margin:
                18px
                0
                8px;
            }

            .crt-summary-note {
              font-size: 12px;

              line-height: 1.7;

              margin-bottom: 22px;
            }

            .crt-checkout-btn {
              width: 100%;

              height: 52px;

              font-size: 13px;

              letter-spacing: 0.08em;
            }

            .crt-empty {
              padding: 70px 0;
            }
          }
        `}</style>
      </>
    </ProtectedRoute>
  );
}