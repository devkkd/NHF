"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addToCart,
  updateQty,
} from "@/lib/cart";
import {
  getWishlist,
  removeFromWishlist,
} from "@/lib/wishlist";
import ProtectedRoute from "@/components/ProtectedRoute";

const THEME = {
  bg: "#faf7ec",
  accent: "#3f4a2b",
  border: "#c8cab4",
};

/* =========================================================
   HELPERS
========================================================= */

function getProductImages(product) {
  const images = [];

  if (product?.mainImage) {
    images.push(product.mainImage);
  }

  if (Array.isArray(product?.galleryImages)) {
    product.galleryImages.forEach((image) => {
      if (image && !images.includes(image)) {
        images.push(image);
      }
    });
  }

  return images;
}

function getActualPrice(product) {
  const value =
    product?.actualPrice ??
    product?.price ??
    0;

  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function getSellingPrice(product) {
  const value =
    product?.sellingPrice ??
    product?.price ??
    0;

  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function getDiscount(product) {
  const actualPrice =
    getActualPrice(product);

  const sellingPrice =
    getSellingPrice(product);

  if (
    actualPrice <= 0 ||
    sellingPrice <= 0 ||
    sellingPrice >= actualPrice
  ) {
    return 0;
  }

  return Math.round(
    ((actualPrice - sellingPrice) /
      actualPrice) *
      100
  );
}

function formatPrice(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function SavedPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState([]);

  const [quantities, setQuantities] =
    useState({});

  const [hoveredProducts, setHoveredProducts] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(true);

   /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadWishlist = async (showLoader = false) => {
      try {
        if (showLoader && mounted) {
          setIsLoading(true);
        }

        const items = await getWishlist();

        if (!mounted) {
          return;
        }

        /*
         * Remove invalid/deleted products
         * and remove duplicate products.
         */
        const validProducts = Array.isArray(items)
          ? items.filter((product) => {
              return (
                product &&
                typeof product === "object" &&
                (product._id || product.slug)
              );
            })
          : [];

        const uniqueProducts = validProducts.filter(
          (product, index, array) => {
            const productKey =
              product._id?.toString() ||
              product.slug;

            return (
              array.findIndex((item) => {
                const itemKey =
                  item._id?.toString() ||
                  item.slug;

                return itemKey === productKey;
              }) === index
            );
          }
        );

        setProducts(uniqueProducts);
      } catch (err) {
        console.error(
          "WISHLIST LOAD ERROR:",
          err
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted && showLoader) {
          setIsLoading(false);
        }
      }
    };

    // Initial load
    loadWishlist(true);

    /*
     * Check again when user comes back to this tab.
     */
    const handleFocus = () => {
      loadWishlist(false);
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    /*
     * Keep Saved Products synced with backend.
     * If admin deletes a product, it disappears
     * from this page automatically.
     */
    const interval = setInterval(() => {
      loadWishlist(false);
    }, 10000);

    return () => {
      mounted = false;

      window.removeEventListener(
        "focus",
        handleFocus
      );

      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     IMAGE HOVER
  ======================================================= */

  const handleMouseEnter = (product) => {
    const images =
      getProductImages(product);

    if (images.length < 2) {
      return;
    }

    setHoveredProducts(
      (current) => ({
        ...current,
        [product.slug]: true,
      })
    );
  };

  const handleMouseLeave = (product) => {
    setHoveredProducts(
      (current) => ({
        ...current,
        [product.slug]: false,
      })
    );
  };

  /* =======================================================
     REMOVE FROM WISHLIST
  ======================================================= */

  const handleRemove = async (
    event,
    productId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await removeFromWishlist(
        productId
      );

      const items =
        await getWishlist();

      setProducts(
        Array.isArray(items)
          ? items
          : []
      );
    } catch (err) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        err
      );
    }
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = async (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await addToCart(
        product,
        1
      );

      setQuantities(
        (prev) => ({
          ...prev,
          [product.slug]: 1,
        })
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );
    }
  };

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQty = async (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const current =
      Number(
        quantities[
          product.slug
        ] || 1
      );

    const next =
      current + 1;

    try {
      await updateQty(
        product._id,
        next
      );

      setQuantities(
        (prev) => ({
          ...prev,
          [product.slug]: next,
        })
      );
    } catch (error) {
      console.error(
        "INCREASE QUANTITY ERROR:",
        error
      );
    }
  };

  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQty = async (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const current =
      Number(
        quantities[
          product.slug
        ] || 1
      );

    const next =
      current - 1;

    try {
      await updateQty(
        product._id,
        Math.max(next, 0)
      );

      setQuantities(
        (prev) => {
          const copy = {
            ...prev,
          };

          if (next <= 0) {
            delete copy[
              product.slug
            ];
          } else {
            copy[
              product.slug
            ] = next;
          }

          return copy;
        }
      );
    } catch (error) {
      console.error(
        "DECREASE QUANTITY ERROR:",
        error
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ProtectedRoute>
      <>
        <Header />

        <main
          className="saved-page"
          style={{
            backgroundColor:
              THEME.bg,
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="saved-heading">
            <h1 className="saved-title">
              Saved Products
            </h1>

            {!isLoading &&
              products.length > 0 && (
                <p className="saved-count">
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}
                </p>
              )}
          </section>

          {/* =================================================
              EMPTY
          ================================================= */}

          {!isLoading &&
            products.length === 0 && (
              <div className="saved-empty">
                <p>
                  You haven&apos;t saved any
                  products yet.
                </p>

                <Link
                  href="/"
                  className="saved-back-link"
                >
                  ← Continue Browsing
                </Link>
              </div>
            )}

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (
            <section className="saved-grid">
              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <SavedSkeleton
                    key={index}
                  />
                )
              )}
            </section>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {!isLoading &&
            products.length > 0 && (
              <section className="saved-grid">

                {products.map(
                  (product) => {
                    const images =
                      getProductImages(
                        product
                      );

                    const mainImage =
                      images[0] || "";

                    const hoverImage =
                      images[1] ||
                      mainImage;

                    const isHovered =
                      Boolean(
                        hoveredProducts[
                          product.slug
                        ]
                      );

                    const actualPrice =
                      getActualPrice(
                        product
                      );

                    const sellingPrice =
                      getSellingPrice(
                        product
                      );

                    const discount =
                      getDiscount(
                        product
                      );

                    const quantity =
                      quantities[
                        product.slug
                      ] || 0;

                    return (
                    <article
  key={
    product._id?.toString() ||
    product.slug
  }
  className="saved-product-card"
>

                        {/* =====================================
                            IMAGE
                        ===================================== */}

                        <div
                          className="saved-image-wrapper"
                          onMouseEnter={() =>
                            handleMouseEnter(
                              product
                            )
                          }
                          onMouseLeave={() =>
                            handleMouseLeave(
                              product
                            )
                          }
                        >

                          <Link
                            href={`/products/${product.slug}`}
                            className="saved-image-link"
                          >

                            {mainImage ? (
                              <>
                                <img
                                  src={
                                    mainImage
                                  }
                                  alt={
                                    product.name ||
                                    "Product"
                                  }
                                  className={`saved-product-image saved-main-image${
                                    isHovered &&
                                    images.length >
                                      1
                                      ? " hidden-image"
                                      : ""
                                  }`}
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                                {images.length >
                                  1 && (
                                  <img
                                    src={
                                      hoverImage
                                    }
                                    alt={
                                      product.name ||
                                      "Product preview"
                                    }
                                    className={`saved-product-image saved-hover-image${
                                      isHovered
                                        ? " visible-image"
                                        : ""
                                    }`}
                                  />
                                )}
                              </>
                            ) : (
                              <div className="saved-image-placeholder">
                                No Image
                              </div>
                            )}

                          </Link>

                          {/* DISCOUNT */}

                          {discount > 0 && (
                            <span className="saved-discount">
                              {discount}% OFF
                            </span>
                          )}

                          {/* WISHLIST */}

                          <button
                            type="button"
                            className="saved-wishlist-button"
                            onClick={(event) =>
                              handleRemove(
                                event,
                                product._id
                              )
                            }
                            aria-label="Remove from wishlist"
                          >
                            ♥
                          </button>

                        </div>

                        {/* =====================================
                            CONTENT
                        ===================================== */}

                        <div className="saved-product-content">

                          {/* NAME */}

                          <Link
                            href={`/products/${product.slug}`}
                            className="saved-product-name"
                          >
                            {product.name}
                          </Link>

                          {/* PRICE */}

                          <div className="saved-price-area">

                            <div className="saved-price-row">

                              <span className="saved-selling-price">
                                {formatPrice(
                                  sellingPrice
                                )}
                              </span>

                              {actualPrice >
                                0 &&
                                actualPrice !==
                                  sellingPrice && (
                                  <span className="saved-actual-price">
                                    {formatPrice(
                                      actualPrice
                                    )}
                                  </span>
                                )}

                            </div>

                            <p className="saved-shipping">
                              {Number(
                                product.shippingCost ||
                                  0
                              ) > 0
                                ? `Shipping ${formatPrice(
                                    product.shippingCost
                                  )}`
                                : "Free Shipping"}
                            </p>

                          </div>

                          {/* ACTIONS */}

                          <div className="saved-actions">

                            {/* BULK */}

                            <button
                              type="button"
                              className="saved-enquiry-button"
                              onClick={(
                                event
                              ) => {
                                event.preventDefault();
                                event.stopPropagation();

                                router.push(
                                  `/enquiry1/${product.slug}`
                                );
                              }}
                            >
                              BULK PRICE ENQUIRY ↗
                            </button>

                            {/* CART */}

                            {!quantity ? (
                              <button
                                type="button"
                                className="saved-cart-button"
                                onClick={(
                                  event
                                ) =>
                                  handleAddToCart(
                                    event,
                                    product
                                  )
                                }
                              >
                                ADD TO CART
                              </button>
                            ) : (
                              <div className="saved-quantity">

                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) =>
                                    decreaseQty(
                                      event,
                                      product
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>

                                <span>
                                  {
                                    quantity
                                  }
                                </span>

                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) =>
                                    increaseQty(
                                      event,
                                      product
                                    )
                                  }
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>

                              </div>
                            )}

                          </div>

                        </div>
                      </article>
                    );
                  }
                )}

              </section>
            )}

        </main>

     

        {/* =====================================================
            CSS
        ===================================================== */}

        <style>{`

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          /* =================================================
             PAGE
          ================================================= */

          .saved-page {
            width: 100%;
            min-height: 100vh;
            background: ${THEME.bg};
            overflow-x: hidden;
          }

          /* =================================================
             HEADER
          ================================================= */

          .saved-heading {
            width: 100%;
            max-width: 1500px;
            margin: 0 auto;

            padding:
              112px
              44px
              22px;

            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
          }

          .saved-title {
            margin: 0;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size: 38px;
            line-height: 1.05;
            font-weight: 500;

            letter-spacing: -0.02em;

            color: ${THEME.accent};
          }

          .saved-count {
            margin: 0;

            font-family:
              "Mona Sans",
              "Inter",
              Arial,
              sans-serif;

            font-size: 12px;
            line-height: 1;

            color: #666666;
          }

          /* =================================================
             GRID
             DESKTOP = 4
          ================================================= */

          .saved-grid {
            width: 100%;
            max-width: 1500px;

            margin: 0 auto;

            padding:
              0 44px 70px;

            display: grid;

            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );

            column-gap: 20px;
            row-gap: 28px;

            align-items: start;
          }

          /* =================================================
             CARD
             FIXED + COMPACT
          ================================================= */

          .saved-product-card {
            width: 100%;
            min-width: 0;

            height: 560px;
            min-height: 560px;
            max-height: 560px;

            display: flex;
            flex-direction: column;

            background:
              ${THEME.bg};

            border:
              1px solid
              rgba(
                63,
                74,
                43,
                0.16
              );

            border-radius: 10px;

            overflow: hidden;

            box-shadow:
              0
              2px
              9px
              rgba(
                40,
                45,
                25,
                0.045
              );

            transition:
              transform
              0.2s
              ease,
              box-shadow
              0.2s
              ease;
          }

          .saved-product-card:hover {
            transform:
              translateY(-2px);

            box-shadow:
              0
              8px
              20px
              rgba(
                40,
                45,
                25,
                0.08
              );
          }

          /* =================================================
             IMAGE
          ================================================= */

          .saved-image-wrapper {
            position: relative;

            width: 100%;

            height: 330px;
            min-height: 330px;
            max-height: 330px;

            flex: 0 0 330px;

            overflow: hidden;

            background:
              #e8e9da;
          }

          .saved-image-link {
            position: relative;

            display: block;

            width: 100%;
            height: 100%;

            text-decoration: none;
            color: inherit;
          }

          .saved-product-image {
            position: absolute;

            inset: 0;

            width: 100%;
            height: 100%;

            display: block;

            object-fit: cover;

            transition:
              opacity
              0.3s
              ease,
              transform
              0.4s
              ease;
          }

          .saved-main-image {
            opacity: 1;
            z-index: 1;
          }

          .saved-hover-image {
            opacity: 0;
            z-index: 2;
          }

          .saved-main-image.hidden-image {
            opacity: 0;
          }

          .saved-hover-image.visible-image {
            opacity: 1;
          }

          .saved-image-wrapper:hover
            .saved-hover-image.visible-image {
            transform:
              scale(1.025);
          }

          .saved-image-placeholder {
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 11px;

            color: #777777;

            background:
              #e8e9da;
          }

          /* =================================================
             DISCOUNT
          ================================================= */

          .saved-discount {
            position: absolute;

            left: 10px;
            top: 10px;

            z-index: 10;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            min-height: 23px;

            padding:
              0 7px;

            border-radius: 4px;

            background:
              #dfe8cc;

            color:
              #38602d;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 9px;

            line-height: 1;

            font-weight: 700;
          }

          /* =================================================
             WISHLIST
          ================================================= */

          .saved-wishlist-button {
            position: absolute;

            top: 10px;
            right: 10px;

            z-index: 20;

            width: 34px;
            height: 34px;

            padding: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border:
              1px solid
              #d1d1d1;

            border-radius: 50%;

            background:
              rgba(
                250,
                247,
                236,
                0.94
              );

            color:
              #c12640;

            font-size: 18px;
            line-height: 1;

            cursor: pointer;

            transition:
              transform
              0.15s
              ease,
              background
              0.15s
              ease;
          }

          .saved-wishlist-button:hover {
            transform:
              scale(1.06);

            background:
              #ffffff;
          }

          /* =================================================
             CONTENT
          ================================================= */

          .saved-product-content {
            width: 100%;
            min-width: 0;

            flex: 1 1 auto;

            min-height: 0;

            display: flex;
            flex-direction: column;

            padding:
              13px;
          }

          /* =================================================
             NAME
          ================================================= */

          .saved-product-name {
            display:
              -webkit-box;

            width: 100%;

            min-height: 44px;
            max-height: 44px;

            margin:
              0 0 8px;

            overflow: hidden;

            color:
              #0e0e0e;

            font-family:
              "Mona Sans",
              "Inter",
              Arial,
              sans-serif;

            font-size: 16px;

            line-height:
              1.35;

            font-weight: 700;

            text-decoration: none;

            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

            text-overflow: ellipsis;
          }

          .saved-product-name:hover {
            text-decoration:
              underline;
          }

          /* =================================================
             PRICE
          ================================================= */

          .saved-price-area {
            width: 100%;

            margin-bottom:
              10px;
          }

          .saved-price-row {
            width: 100%;

            display: flex;
            align-items: baseline;

            flex-wrap: wrap;

            gap: 7px;
          }

          .saved-selling-price {
            color:
              #111111;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 20px;

            line-height: 1.15;

            font-weight: 700;
          }

          .saved-actual-price {
            color:
              #777777;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 11px;

            line-height: 1;

            font-weight: 500;

            text-decoration:
              line-through;
          }

          .saved-shipping {
            margin:
              5px 0 0;

            color:
              #666666;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 9px;

            line-height: 1.3;

            font-weight: 500;
          }

          /* =================================================
             ACTION AREA
          ================================================= */

          .saved-actions {
            width: 100%;

            margin-top: auto;

            display: flex;
            flex-direction: column;

            gap: 6px;
          }

          /* =================================================
             ENQUIRY
          ================================================= */

          .saved-enquiry-button {
            width: 100%;

            height: 40px;
            min-height: 40px;

            padding: 0 10px;

            border:
              1px solid
              ${THEME.accent};

            border-radius: 6px;

            background:
              ${THEME.bg};

            color:
              ${THEME.accent};

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 9px;

            line-height: 1;

            font-weight: 700;

            letter-spacing:
              0.03em;

            cursor: pointer;

            transition:
              background
              0.18s
              ease,
              color
              0.18s
              ease;
          }

          .saved-enquiry-button:hover {
            background:
              ${THEME.accent};

            color:
              #ffffff;
          }

          /* =================================================
             CART
          ================================================= */

          .saved-cart-button {
            width: 100%;

            height: 41px;
            min-height: 41px;

            padding: 0 10px;

            border:
              1px solid
              #111111;

            border-radius: 6px;

            background:
              ${THEME.bg};

            color:
              #111111;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 10px;

            line-height: 1;

            font-weight: 700;

            letter-spacing:
              0.03em;

            cursor: pointer;

            transition:
              background
              0.18s
              ease,
              color
              0.18s
              ease;
          }

          .saved-cart-button:hover {
            background:
              #111111;

            color:
              #ffffff;
          }

          /* =================================================
             QUANTITY
          ================================================= */

          .saved-quantity {
            width: 100%;

            height: 41px;
            min-height: 41px;

            border:
              1px solid
              #111111;

            border-radius: 6px;

            background:
              ${THEME.bg};

            display: flex;

            align-items: center;

            justify-content:
              space-between;
          }

          .saved-quantity button {
            width: 38px;
            height: 39px;

            padding: 0;

            border: none;

            background:
              transparent;

            color:
              #111111;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 19px;

            line-height: 1;

            cursor: pointer;
          }

          .saved-quantity span {
            color:
              #111111;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 12px;

            line-height: 1;

            font-weight: 700;
          }

          /* =================================================
             EMPTY
          ================================================= */

          .saved-empty {
            width: 100%;

            padding:
              70px
              20px
              110px;

            text-align: center;
          }

          .saved-empty p {
            margin:
              0 0 14px;

            color:
              #555555;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 14px;
          }

          .saved-back-link {
            color:
              ${THEME.accent};

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size: 12px;

            text-decoration:
              none;

            letter-spacing:
              0.04em;
          }

          .saved-back-link:hover {
            text-decoration:
              underline;
          }

          /* =================================================
             SKELETON
          ================================================= */

          .saved-skeleton {
            width: 100%;

            height: 560px;

            background:
              ${THEME.bg};

            border:
              1px solid
              rgba(
                63,
                74,
                43,
                0.12
              );

            border-radius: 10px;

            overflow: hidden;
          }

          .saved-skeleton-image {
            width: 100%;

            height: 330px;

            background:
              linear-gradient(
                90deg,
                #efeee5 25%,
                #f8f7ef 50%,
                #efeee5 75%
              );

            background-size:
              200% 100%;

            animation:
              savedSkeletonAnimation
              1.4s
              infinite;
          }

          .saved-skeleton-content {
            padding: 13px;
          }

          .saved-skeleton-line {
            height: 13px;

            border-radius: 4px;

            margin-bottom: 10px;

            background:
              #e6e4d9;
          }

          .saved-skeleton-line.long {
            width: 80%;
          }

          .saved-skeleton-line.medium {
            width: 45%;
          }

          .saved-skeleton-button {
            width: 100%;

            height: 40px;

            margin-top: 22px;

            border-radius: 6px;

            background:
              #e6e4d9;
          }

          @keyframes savedSkeletonAnimation {
            0% {
              background-position:
                200% 0;
            }

            100% {
              background-position:
                -200% 0;
            }
          }

          /* =================================================
             TABLET
             3 CARDS
          ================================================= */

          @media (max-width: 1100px) {

            .saved-heading {
              padding-left:
                28px;

              padding-right:
                28px;
            }

            .saved-grid {
              padding-left:
                28px;

              padding-right:
                28px;

              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                );

              column-gap:
                14px;

              row-gap:
                22px;
            }

            .saved-product-card {
              height:
                540px;

              min-height:
                540px;

              max-height:
                540px;
            }

            .saved-skeleton {
              height:
                540px;
            }

            .saved-image-wrapper {
              height:
                315px;

              min-height:
                315px;

              max-height:
                315px;

              flex-basis:
                315px;
            }

            .saved-product-name {
              font-size:
                15px;
            }

            .saved-selling-price {
              font-size:
                18px;
            }

          }

          /* =================================================
             MOBILE
             EXACTLY 2 CARDS
          ================================================= */

          @media (max-width: 700px) {

            .saved-heading {
              padding:
                82px
                14px
                18px;

              align-items:
                flex-start;

              flex-direction:
                column;

              gap: 7px;
            }

            .saved-title {
              font-size:
                28px;
            }

            .saved-count {
              font-size:
                10px;
            }

            .saved-grid {
              width:
                100%;

              padding:
                0 10px 38px;

              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );

              column-gap:
                8px;

              row-gap:
                16px;
            }

            .saved-product-card {
              height:
                425px;

              min-height:
                425px;

              max-height:
                425px;

              border-radius:
                8px;
            }

            .saved-skeleton {
              height:
                425px;

              border-radius:
                8px;
            }

            .saved-image-wrapper {
              height:
                185px;

              min-height:
                185px;

              max-height:
                185px;

              flex-basis:
                185px;
            }

            .saved-discount {
              left: 6px;
              top: 6px;

              min-height:
                17px;

              padding:
                0 5px;

              font-size:
                7px;
            }

            .saved-wishlist-button {
              top: 6px;
              right: 6px;

              width:
                29px;

              height:
                29px;

              font-size:
                16px;
            }

            .saved-product-content {
              padding:
                8px;
            }

            .saved-product-name {
              min-height:
                32px;

              max-height:
                32px;

              margin-bottom:
                6px;

              font-size:
                11px;

              line-height:
                1.45;
            }

            .saved-price-area {
              margin-bottom:
                7px;
            }

            .saved-selling-price {
              font-size:
                15px;
            }

            .saved-actual-price {
              font-size:
                8px;
            }

            .saved-shipping {
              margin-top:
                3px;

              font-size:
                7px;
            }

            .saved-actions {
              gap:
                5px;
            }

            .saved-enquiry-button,
            .saved-cart-button {
              height:
                35px;

              min-height:
                35px;

              padding:
                0 5px;

              font-size:
                7px;

              border-radius:
                5px;
            }

            .saved-quantity {
              height:
                35px;

              min-height:
                35px;

              border-radius:
                5px;
            }

            .saved-quantity button {
              width:
                29px;

              height:
                33px;

              font-size:
                16px;
            }

            .saved-quantity span {
              font-size:
                10px;
            }

            .saved-empty {
              padding:
                50px
                20px
                80px;
            }

            .saved-empty p {
              font-size:
                13px;
            }

            .saved-skeleton-image {
              height:
                185px;
            }

            .saved-skeleton-content {
              padding:
                8px;
            }

            .saved-skeleton-button {
              height:
                35px;

              margin-top:
                20px;
            }
          }

          /* =================================================
             VERY SMALL MOBILE
          ================================================= */

          @media (max-width: 380px) {

            .saved-heading {
              padding:
                76px
                10px
                15px;
            }

            .saved-title {
              font-size:
                25px;
            }

            .saved-grid {
              padding:
                0 7px 32px;

              column-gap:
                7px;

              row-gap:
                14px;
            }

            .saved-product-card {
              height:
                405px;

              min-height:
                405px;

              max-height:
                405px;
            }

            .saved-skeleton {
              height:
                405px;
            }

            .saved-image-wrapper {
              height:
                172px;

              min-height:
                172px;

              max-height:
                172px;

              flex-basis:
                172px;
            }

            .saved-skeleton-image {
              height:
                172px;
            }

            .saved-product-content {
              padding:
                7px;
            }

            .saved-product-name {
              font-size:
                10px;
            }

            .saved-selling-price {
              font-size:
                14px;
            }

            .saved-enquiry-button,
            .saved-cart-button {
              height:
                34px;

              min-height:
                34px;

              font-size:
                6.5px;
            }

          }

        `}</style>
      </>
    </ProtectedRoute>
  );
}

/* =========================================================
   SKELETON COMPONENT
========================================================= */

function SavedSkeleton() {
  return (
    <div className="saved-skeleton">

      <div className="saved-skeleton-image" />

      <div className="saved-skeleton-content">

        <div className="saved-skeleton-line long" />

        <div className="saved-skeleton-line medium" />

        <div className="saved-skeleton-button" />

      </div>

    </div>
  );
}