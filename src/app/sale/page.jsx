"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  addToCart,
  updateQty,
} from "@/lib/cart";

import {
  toggleWishlist,
  getWishlist,
} from "@/lib/wishlist";

/* =========================================================
   CONFIG
========================================================= */

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

const LIMIT = 12;

const COLORS = {
  page: "#FDFFF1",
  text: "#111111",
  muted: "#666666",
  accent: "#7B7F5C",
  border: "#C8CAB4",
};

/* =========================================================
   FETCH SALE PRODUCTS
========================================================= */

async function fetchSaleProducts(page = 1) {
  try {
    const response = await fetch(
      `${BASE}/products?sale=true&page=${page}&limit=${LIMIT}`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch sale products."
      );
    }

    const body =
      await response.json();

    return {
      products:
        Array.isArray(
          body?.data?.products
        )
          ? body.data.products
          : [],

      total: Number(
        body?.data?.total || 0
      ),

      pages: Math.max(
        1,
        Number(
          body?.data?.pages || 1
        )
      ),
    };
  } catch (error) {
    console.error(
      "SALE PRODUCTS ERROR:",
      error
    );

    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }
}

/* =========================================================
   LOGIN
========================================================= */

function isLoggedIn() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return Boolean(
    localStorage.getItem(
      "accessToken"
    )
  );
}

/* =========================================================
   COLORS
========================================================= */

function getColors(
  product
) {
  if (
    !Array.isArray(
      product?.colors
    )
  ) {
    return [];
  }

  return product.colors.filter(
    (color) =>
      String(
        color || ""
      ).trim()
  );
}

/* =========================================================
   SIZES
========================================================= */

function getSizes(
  product
) {
  if (
    !Array.isArray(
      product?.sizes
    )
  ) {
    return [];
  }

  return product.sizes.filter(
    (size) =>
      String(
        size?.name || ""
      ).trim()
  );
}

/* =========================================================
   IMAGES
========================================================= */

function getProductImages(
  product
) {
  const images = [];

  if (
    product?.mainImage
  ) {
    images.push(
      product.mainImage
    );
  }

  if (
    Array.isArray(
      product?.galleryImages
    )
  ) {
    product.galleryImages.forEach(
      (image) => {
        if (
          image &&
          !images.includes(
            image
          )
        ) {
          images.push(
            image
          );
        }
      }
    );
  }

  return images;
}

/* =========================================================
   PRICING
========================================================= */

function getPricing(
  product,
  selectedSize
) {
  if (selectedSize) {
    return {
      actualPrice:
        Number(
          selectedSize.actualPrice ||
            0
        ),

      sellingPrice:
        Number(
          selectedSize.sellingPrice ||
            0
        ),
    };
  }

  return {
    actualPrice:
      Number(
        product?.actualPrice ??
          product?.price ??
          0
      ),

    sellingPrice:
      Number(
        product?.sellingPrice ??
          product?.price ??
          0
      ),
  };
}

/* =========================================================
   DISCOUNT
========================================================= */

function getDiscount(
  actualPrice,
  sellingPrice
) {
  const actual =
    Number(
      actualPrice || 0
    );

  const selling =
    Number(
      sellingPrice || 0
    );

  if (
    actual <= 0 ||
    selling <= 0 ||
    selling >= actual
  ) {
    return 0;
  }

  return Math.round(
    ((actual -
      selling) /
      actual) *
      100
  );
}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(
  value
) {
  const amount =
    Number(
      value || 0
    );

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "₹0";
  }

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <article className="product-skeleton">
      <div className="skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton-line skeleton-small" />
        <div className="skeleton-line skeleton-large" />
        <div className="skeleton-line skeleton-medium" />
        <div className="skeleton-button" />
      </div>
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SalePage() {
  const router =
    useRouter();

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    pages,
    setPages,
  ] = useState(1);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     SELECTED COLOURS
  ======================================================= */

  const [
    selectedColors,
    setSelectedColors,
  ] = useState({});

  /* =======================================================
     SELECTED SIZES
  ======================================================= */

  const [
    selectedSizes,
    setSelectedSizes,
  ] = useState({});

  /* =======================================================
     QUANTITY
  ======================================================= */

  const [
    quantities,
    setQuantities,
  ] = useState({});

  /* =======================================================
     WISHLIST
  ======================================================= */

  const [
    wishlist,
    setWishlist,
  ] = useState({});

  /* =======================================================
     HOVER IMAGES
  ======================================================= */

  const [
    hoveredProducts,
    setHoveredProducts,
  ] = useState({});

  /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadWishlist() {
      try {
        if (
          !isLoggedIn()
        ) {
          return;
        }

        const result =
          await getWishlist();

        if (
          !Array.isArray(
            result
          )
        ) {
          return;
        }

        const map = {};

        result.forEach(
          (item) => {
            if (
              item?.slug
            ) {
              map[
                item.slug
              ] = true;
            }
          }
        );

        if (
          mounted
        ) {
          setWishlist(
            map
          );
        }
      } catch (
        error
      ) {
        console.error(
          "WISHLIST LOAD ERROR:",
          error
        );
      }
    }

    loadWishlist();

    return () => {
      mounted =
        false;
    };
  }, []);

  /* =======================================================
     LOAD SALE PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    fetchSaleProducts(
      page
    ).then(
      (result) => {
        if (
          !mounted
        ) {
          return;
        }

        setProducts(
          result.products
        );

        setTotal(
          result.total
        );

        setPages(
          result.pages
        );

        setLoading(false);

        setHoveredProducts(
          {}
        );

        setQuantities(
          {}
        );

        setSelectedColors(
          {}
        );

        setSelectedSizes(
          {}
        );
      }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return () => {
      mounted =
        false;
    };
  }, [page]);

  /* =======================================================
     IMAGE HOVER
  ======================================================= */

  const handleImageEnter =
    (product) => {
      const images =
        getProductImages(
          product
        );

      if (
        images.length < 2
      ) {
        return;
      }

      setHoveredProducts(
        (current) => ({
          ...current,

          [product.slug]:
            true,
        })
      );
    };

  const handleImageLeave =
    (product) => {
      setHoveredProducts(
        (current) => ({
          ...current,

          [product.slug]:
            false,
        })
      );
    };

  /* =======================================================
     MOBILE IMAGE TOUCH
  ======================================================= */

  const handleImageTouch =
    (
      event,
      product
    ) => {
      event.stopPropagation();

      const images =
        getProductImages(
          product
        );

      if (
        images.length < 2
      ) {
        return;
      }

      setHoveredProducts(
        (current) => ({
          ...current,

          [product.slug]:
            true,
        })
      );
    };

  /* =======================================================
     COLOUR SELECT
  ======================================================= */

  const handleColorSelect =
    (
      event,
      product,
      color
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setSelectedColors(
        (current) => ({
          ...current,

          [product.slug]:
            color,
        })
      );

      setQuantities(
        (current) => ({
          ...current,

          [product.slug]:
            0,
        })
      );
    };

  /* =======================================================
     SIZE SELECT
  ======================================================= */

  const handleSizeSelect =
    (
      event,
      product,
      sizeName
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setSelectedSizes(
        (current) => ({
          ...current,

          [product.slug]:
            sizeName,
        })
      );

      setQuantities(
        (current) => ({
          ...current,

          [product.slug]:
            0,
        })
      );
    };

  /* =======================================================
     VALIDATE PRODUCT
  ======================================================= */

  const validateProduct =
    (product) => {
      const colors =
        getColors(
          product
        );

      const sizes =
        getSizes(
          product
        );

      const selectedColor =
        selectedColors[
          product.slug
        ];

      const selectedSize =
        selectedSizes[
          product.slug
        ];

      if (
        colors.length >
          0 &&
        !selectedColor
      ) {
        toast.error(
          "Please select colour first.",
          {
            duration:
              1800,

            position:
              "top-right",
          }
        );

        return false;
      }

      if (
        sizes.length >
          0 &&
        !selectedSize
      ) {
        toast.error(
          "Please select size first.",
          {
            duration:
              1800,

            position:
              "top-right",
          }
        );

        return false;
      }

      return true;
    };

  /* =======================================================
     BUILD CART PRODUCT
  ======================================================= */

  const buildCartProduct =
    (product) => {
      const sizes =
        getSizes(
          product
        );

      const selectedSizeName =
        selectedSizes[
          product.slug
        ] || "";

      const selectedSize =
        sizes.find(
          (size) =>
            String(
              size.name
            ).trim() ===
            String(
              selectedSizeName
            ).trim()
        ) || null;

      const pricing =
        getPricing(
          product,
          selectedSize
        );

      return {
        ...product,

        selectedColor:
          selectedColors[
            product.slug
          ] || "",

        selectedSize:
          selectedSize
            ? selectedSize.name
            : "",

        selectedSizeActualPrice:
          pricing.actualPrice,

        selectedSizeSellingPrice:
          pricing.sellingPrice,

        selectedShippingCost:
          Number(
            product.shippingCost ||
              0
          ),
      };
    };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !validateProduct(
          product
        )
      ) {
        return;
      }

      if (
        !isLoggedIn()
      ) {
        if (
          typeof window !==
          "undefined"
        ) {
          sessionStorage.setItem(
            "pendingCartProduct",
            JSON.stringify({
              product:
                buildCartProduct(
                  product
                ),

              quantity: 1,
            })
          );

          sessionStorage.setItem(
            "pendingCartRedirect",
            window.location.pathname
          );
        }

        toast.error(
          "Please login first.",
          {
            duration:
              1800,

            position:
              "top-right",
          }
        );

        setTimeout(() => {
          router.push(
            `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`
          );
        }, 500);

        return;
      }

      try {
        const cartProduct =
          buildCartProduct(
            product
          );

        await addToCart(
          cartProduct,
          1
        );

        setQuantities(
          (current) => ({
            ...current,

            [product.slug]:
              1,
          })
        );

        toast.success(
          "Added to cart.",
          {
            duration:
              1600,

            position:
              "top-right",
          }
        );
      } catch (
        error
      ) {
        console.error(
          "ADD TO CART ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to add to cart.",
          {
            duration:
              2000,

            position:
              "top-right",
          }
        );
      }
    };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        toast.error(
          "Please login first.",
          {
            duration:
              1800,

            position:
              "top-right",
          }
        );

        router.push(
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`
        );

        return;
      }

      try {
        const result =
          await toggleWishlist(
            product
          );

        setWishlist(
          (current) => {
            const copy = {
              ...current,
            };

            if (
              result
            ) {
              copy[
                product.slug
              ] = true;
            } else {
              delete copy[
                product.slug
              ];
            }

            return copy;
          }
        );
      } catch (
        error
      ) {
        console.error(
          "WISHLIST ERROR:",
          error
        );
      }
    };

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQuantity =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !validateProduct(
          product
        )
      ) {
        return;
      }

      if (
        !isLoggedIn()
      ) {
        return;
      }

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
          (state) => ({
            ...state,

            [product.slug]:
              next,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "INCREASE ERROR:",
          error
        );
      }
    };

  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQuantity =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        return;
      }

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
          Math.max(
            next,
            0
          )
        );

        setQuantities(
          (state) => {
            const copy = {
              ...state,
            };

            if (
              next <= 0
            ) {
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
      } catch (
        error
      ) {
        console.error(
          "DECREASE ERROR:",
          error
        );
      }
    };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const pageNumbers =
    useMemo(() => {
      if (
        pages <= 1
      ) {
        return [1];
      }

      const numbers = [];

      let start =
        Math.max(
          1,
          page - 2
        );

      let end =
        Math.min(
          pages,
          page + 2
        );

      if (
        page <= 2
      ) {
        start = 1;

        end =
          Math.min(
            pages,
            5
          );
      }

      if (
        page >=
        pages - 1
      ) {
        start =
          Math.max(
            1,
            pages - 4
          );

        end =
          pages;
      }

      for (
        let i = start;
        i <= end;
        i++
      ) {
        numbers.push(
          i
        );
      }

      return numbers;
    }, [
      page,
      pages,
    ]);

  const from =
    total === 0
      ? 0
      : (page - 1) *
          LIMIT +
        1;

  const to =
    Math.min(
      page * LIMIT,
      total
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="sale-page">

      {/* ==================================================
          PREMIUM SALE HEADING
      ================================================== */}

      <section className="sale-intro">
        <div className="sale-intro-inner">

          <span className="sale-kicker">
            CURATED OFFERS
          </span>

          <h1 className="sale-shimmer-text">
            SALE
          </h1>

          <div className="sale-divider" />

          <p>
            Discover selected pieces at exceptional prices.
          </p>

        </div>
      </section>

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="sale-heading">
        <div>
          {/* <h2>
            Sale
          </h2> */}

          <p>
            {loading
              ? "Loading..."
              : `${total} products`}
          </p>
        </div>

        {/* <Link
          href="/enquiry"
          className="sale-bulk-link"
        >
          Bulk Order Request →
        </Link> */}
      </section>

      {/* ==================================================
          PRODUCT GRID
      ================================================== */}

      <section className="sale-grid">

        {loading ? (
          Array.from({
            length: LIMIT,
          }).map(
            (_, index) => (
              <ProductSkeleton
                key={index}
              />
            )
          )
        ) : products.length ===
          0 ? (
          <div className="empty-products">

            <div className="empty-sale-icon">
              %
            </div>

            <h3>
              No Sale Products
            </h3>

            <p>
              There are no products on sale right now.
            </p>

            <Link
              href="/"
              className="empty-sale-link"
            >
              ← Continue Shopping
            </Link>

          </div>
        ) : (
          products.map(
            (
              product
            ) => {

              const colors =
                getColors(
                  product
                );

              const sizes =
                getSizes(
                  product
                );

              const images =
                getProductImages(
                  product
                );

              const mainImage =
                images[0] ||
                "";

              const hoverImage =
                images[1] ||
                mainImage;

              const isHovered =
                Boolean(
                  hoveredProducts[
                    product.slug
                  ]
                );

              const selectedColor =
                selectedColors[
                  product.slug
                ] || "";

              const selectedSizeName =
                selectedSizes[
                  product.slug
                ] || "";

              const selectedSize =
                sizes.find(
                  (size) =>
                    String(
                      size.name
                    ).trim() ===
                    String(
                      selectedSizeName
                    ).trim()
                ) || null;

              const pricing =
                getPricing(
                  product,
                  selectedSize
                );

              const discount =
                getDiscount(
                  pricing.actualPrice,
                  pricing.sellingPrice
                );

              const needsColor =
                colors.length >
                  0 &&
                !selectedColor;

              const needsSize =
                sizes.length >
                  0 &&
                !selectedSize;

              const quantity =
                quantities[
                  product.slug
                ] || 0;

              return (
                <article
                  key={
                    product._id
                  }
                  className="product-card"
                >

                  {/* ========================================
                      PRODUCT IMAGE
                  ======================================== */}

                  <div
                    className="product-image-link"
                    onMouseEnter={() =>
                      handleImageEnter(
                        product
                      )
                    }
                    onMouseLeave={() =>
                      handleImageLeave(
                        product
                      )
                    }
                    onTouchStart={(
                      event
                    ) =>
                      handleImageTouch(
                        event,
                        product
                      )
                    }
                  >

                    <Link
                      href={`/products/${product.slug}`}
                      className="product-image-link-inner"
                    >

                      <div className="product-image-box">

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
                              className={`product-image product-image-main${
                                isHovered &&
                                images.length >
                                  1
                                  ? " image-hidden"
                                  : ""
                              }`}
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
                                className={`product-image product-image-hover${
                                  isHovered
                                    ? " image-visible"
                                    : ""
                                }`}
                              />
                            )}
                          </>
                        ) : (
                          <div className="product-image-placeholder" />
                        )}

                        {/* SALE BADGE */}

                        <span className="sale-badge">
                          SALE
                        </span>

                        {/* WISHLIST */}

                        <button
                          type="button"
                          className={`product-wishlist${
                            wishlist[
                              product.slug
                            ]
                              ? " active"
                              : ""
                          }`}
                          onClick={(
                            event
                          ) =>
                            handleWishlist(
                              event,
                              product
                            )
                          }
                          aria-label="Wishlist"
                        >
                          {
                            wishlist[
                              product.slug
                            ]
                              ? "♥"
                              : "♡"
                          }
                        </button>

                        {/* IMAGE INDICATOR */}

                        {/* {images.length >
                          1 && (
                          <span className="image-hover-indicator">
                            HOVER TO VIEW
                          </span>
                        )} */}

                      </div>

                    </Link>

                  </div>

                  {/* ========================================
                      PRODUCT CONTENT
                  ======================================== */}

                  <div className="product-content">

                    {/* ======================================
                        COLOUR
                    ====================================== */}

                    {colors.length >
                      0 && (
                      <div
                        className="product-colours-block"
                        onClick={(
                          event
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >

                        <div className="product-colour-header">

                          <span className="product-colour-label">
                            Colour
                          </span>

                          {!selectedColor && (
                            <span className="product-required">
                              Select
                            </span>
                          )}

                          {selectedColor && (
                            <span className="product-selected">
                              Selected
                            </span>
                          )}

                        </div>

                        <div className="product-colours">

                          {colors.map(
                            (
                              color,
                              index
                            ) => (
                              <button
                                key={`${product._id}-color-${index}`}
                                type="button"
                                className={`product-color${
                                  selectedColor ===
                                  color
                                    ? " selected"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                                onClick={(
                                  event
                                ) =>
                                  handleColorSelect(
                                    event,
                                    product,
                                    color
                                  )
                                }
                                aria-label={`Select colour ${
                                  index +
                                  1
                                }`}
                              />
                            )
                          )}

                        </div>

                      </div>
                    )}

                    {/* ======================================
                        NAME
                    ====================================== */}

                    <Link
                      href={`/products/${product.slug}`}
                      className="product-name"
                    >
                      {
                        product.name
                      }
                    </Link>

                    {/* ======================================
                        PRICE
                    ====================================== */}

                    <div className="product-price-area">

                      <div className="product-price-row">

                        <span className="product-selling-price">
                          {sizes.length >
                            0 &&
                          !selectedSize
                            ? `From ${formatPrice(
                                pricing.sellingPrice
                              )}`
                            : formatPrice(
                                pricing.sellingPrice
                              )}
                        </span>

                        {pricing.actualPrice >
                          0 &&
                          pricing.actualPrice !==
                            pricing.sellingPrice && (
                          <span className="product-actual-price">
                            {formatPrice(
                              pricing.actualPrice
                            )}
                          </span>
                        )}

                        {discount >
                          0 && (
                          <span className="product-discount">
                            {discount}%
                            OFF
                          </span>
                        )}

                      </div>

                      <p className="product-shipping">
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

                    {/* ======================================
                        SIZE
                    ====================================== */}

                    {sizes.length >
                      0 && (
                      <div
                        className={`product-size-section${
                          needsSize
                            ? " required"
                            : ""
                        }`}
                        onClick={(
                          event
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >

                        <div className="product-size-header">

                          <span>
                            Size
                          </span>

                          {selectedSize ? (
                            <small className="product-size-selected">
                              {
                                selectedSize.name
                              }
                            </small>
                          ) : (
                            <small className="product-size-required">
                              Select
                            </small>
                          )}

                        </div>

                        <div className="product-size-list">

                          {sizes.map(
                            (
                              size,
                              index
                            ) => (
                              <button
                                key={`${product._id}-size-${index}`}
                                type="button"
                                className={`product-size-button${
                                  selectedSizeName ===
                                  size.name
                                    ? " selected"
                                    : ""
                                }`}
                                onClick={(
                                  event
                                ) =>
                                  handleSizeSelect(
                                    event,
                                    product,
                                    size.name
                                  )
                                }
                              >
                                {
                                  size.name
                                }
                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    {/* ======================================
                        ACTION AREA
                    ====================================== */}

                    <div
                      className="product-action-area"
                      onClick={(
                        event
                      ) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >

                      {/* ADD TO CART / QUANTITY */}

                      {quantity >
                        0 ? (
                        <div className="product-quantity">

                          <button
                            type="button"
                            onClick={(
                              event
                            ) =>
                              decreaseQuantity(
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
                              increaseQuantity(
                                event,
                                product
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`product-add-cart${
                            needsColor ||
                            needsSize
                              ? " requires-selection"
                              : ""
                          }`}
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
                      )}

                      {/* BULK ENQUIRY */}

                      <button
                        type="button"
                        className="product-bulk-button"
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

                    </div>

                  </div>

                </article>
              );
            }
          )
        )}

      </section>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      {!loading &&
        total > 0 && (
          <section className="products-pagination">

            <div className="pagination-info">
              Showing{" "}
              {from} –{" "}
              {to} of{" "}
              {total}
            </div>

            {pages >
              1 && (
              <div className="pagination-buttons">

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={
                    page ===
                    1
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {pageNumbers[0] >
                  1 && (
                  <>
                    <button
                      type="button"
                      className="pagination-number"
                      onClick={() =>
                        setPage(1)
                      }
                    >
                      1
                    </button>

                    {pageNumbers[0] >
                      2 && (
                      <span className="pagination-ellipsis">
                        …
                      </span>
                    )}
                  </>
                )}

                {pageNumbers.map(
                  (
                    number
                  ) => (
                    <button
                      key={
                        number
                      }
                      type="button"
                      className={`pagination-number${
                        page ===
                        number
                          ? " active"
                          : ""
                      }`}
                      onClick={() =>
                        setPage(
                          number
                        )
                      }
                    >
                      {
                        number
                      }
                    </button>
                  )
                )}

                {pageNumbers[
                  pageNumbers.length -
                    1
                ] <
                  pages && (
                  <>
                    {pageNumbers[
                      pageNumbers.length -
                        1
                    ] <
                      pages - 1 && (
                      <span className="pagination-ellipsis">
                        …
                      </span>
                    )}

                    <button
                      type="button"
                      className="pagination-number"
                      onClick={() =>
                        setPage(
                          pages
                        )
                      }
                    >
                      {
                        pages
                      }
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={
                    page ===
                    pages
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.min(
                          pages,
                          current +
                            1
                        )
                    )
                  }
                  aria-label="Next page"
                >
                  ›
                </button>

              </div>
            )}

            <button
              type="button"
              className="back-top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                })
              }
            >
              ↑ BACK TO TOP
            </button>

          </section>
        )}

      {/* ==================================================
          GLOBAL CSS
      ================================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: ${COLORS.page};
        }

        body {
          overflow-x: hidden;
        }

        /* ==================================================
           PAGE
        ================================================== */

        .sale-page {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: ${COLORS.page};
          color: ${COLORS.text};
          overflow-x: hidden;
        }

        /* ==================================================
           PREMIUM SALE INTRO
        ================================================== */

        .sale-intro {
          width: 100%;
          padding: 120px 32px 48px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(123, 127, 92, 0.11),
              transparent 58%
            ),
            ${COLORS.page};
          border-bottom: 1px solid
            rgba(123, 127, 92, 0.16);
        }

        .sale-intro-inner {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }

        .sale-kicker {
          display: inline-block;
          margin-bottom: 14px;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 14px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        .sale-intro h1 {
          margin: 0;
          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;
          font-size: clamp(
            56px,
            7vw,
            92px
          );
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: 0.09em;
        }

        /* Slow, subtle light sweeping across the SALE headline */

        .sale-shimmer-text {
          background: linear-gradient(
            100deg,
            ${COLORS.accent} 30%,
            #e9e2b8 44%,
            #fdf9e2 50%,
            #e9e2b8 56%,
            ${COLORS.accent} 70%
          );
          background-size: 260% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: ${COLORS.accent};
          animation: saleHeadlineShine 5.5s ease-in-out infinite;
        }

        @keyframes saleHeadlineShine {
          0% {
            background-position: 130% 0;
          }

          50% {
            background-position: 0% 0;
          }

          100% {
            background-position: -130% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sale-shimmer-text {
            animation: none;
            background-position: 0% 0;
          }
        }

        .sale-divider {
          width: 58px;
          height: 1px;
          margin: 21px auto 17px;
          background: ${COLORS.accent};
          opacity: 0.68;
        }

        .sale-intro p {
          margin: 0;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 15px;
          line-height: 1.5;
          letter-spacing: 0.025em;
        }

        /* ==================================================
           HEADER
        ================================================== */

        .sale-heading {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 32px 22px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .sale-heading h2 {
          margin: 0;
          color: ${COLORS.accent};
          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;
          font-size: 40px;
          line-height: 1.1;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .sale-heading p {
          margin: 7px 0 0;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 14px;
          line-height: 1.4;
        }

        .sale-bulk-link {
          color: ${COLORS.text};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-decoration: none;
          white-space: nowrap;
          padding-bottom: 4px;
          border-bottom: 1px solid
            rgba(17, 17, 17, 0.3);
          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .sale-bulk-link:hover {
          color: ${COLORS.accent};
          border-color: ${COLORS.accent};
        }

        /* ==================================================
           GRID
        ================================================== */

        .sale-grid {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px 50px;
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          column-gap: 20px;
          row-gap: 28px;
          align-items: stretch;
        }

        /* ==================================================
           CARD
        ================================================== */

        .product-card {
          width: 100%;
          height: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: ${COLORS.page};
          border: 1px solid
            rgba(
              123,
              127,
              92,
              0.19
            );
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 2px 9px
              rgba(
                40,
                45,
                25,
                0.05
              );
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 9px 24px
              rgba(
                40,
                45,
                25,
                0.09
              );
        }

        /* ==================================================
           IMAGE
        ================================================== */

        .product-image-link {
          position: relative;
          display: block;
          width: 100%;
          cursor: pointer;
          touch-action:
            manipulation;
        }

        .product-image-link-inner {
          display: block;
          width: 100%;
          text-decoration: none;
          color: inherit;
        }

        .product-image-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: ${COLORS.page};
        }

        .product-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            opacity 0.35s ease,
            transform 0.45s ease;
        }

        .product-image-main {
          opacity: 1;
          z-index: 1;
        }

        .product-image-hover {
          opacity: 0;
          z-index: 2;
        }

        .product-image-main.image-hidden {
          opacity: 0;
        }

        .product-image-hover.image-visible {
          opacity: 1;
        }

        .product-image-placeholder {
          width: 100%;
          height: 100%;
          background: ${COLORS.page};
        }

        .product-image-box:hover
          .product-image-hover.image-visible {
          transform:
            scale(1.025);
        }

        /* ==================================================
           SALE BADGE
        ================================================== */

        .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 8;
          min-height: 28px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #111111;
          color: #ffffff;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        /* ==================================================
           HOVER INDICATOR
        ================================================== */

        .image-hover-indicator {
          position: absolute;
          left: 50%;
          bottom: 11px;
          transform:
            translateX(-50%);
          z-index: 7;
          pointer-events: none;
          padding: 5px 8px;
          border-radius: 5px;
          background:
            rgba(
              17,
              17,
              17,
              0.74
            );
          color: #ffffff;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 8px;
          line-height: 1.2;
          font-weight: 600;
          opacity: 0;
          transition:
            opacity 0.2s ease;
        }

        .product-image-box:hover
          .image-hover-indicator {
          opacity: 1;
        }

        /* ==================================================
           WISHLIST
        ================================================== */

        .product-wishlist {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid #d4d4d4;
          border-radius: 50%;
          background: ${COLORS.page};
          color: #777777;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          line-height: 1;
          cursor: pointer;
          z-index: 10;
          transition:
            transform 0.15s ease,
            color 0.15s ease;
        }

        .product-wishlist:hover {
          transform:
            scale(1.06);
          color: ${COLORS.accent};
        }

        .product-wishlist.active {
          color: #b4002e;
        }

        /* ==================================================
           CONTENT
        ================================================== */

        .product-content {
          width: 100%;
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 14px;
          background: ${COLORS.page};
        }

        /* ==================================================
           COLOURS
        ================================================== */

        .product-colours-block {
          width: 100%;
          margin-bottom: 9px;
        }

        .product-colour-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }

        .product-colour-label {
          color: #555555;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 600;
        }

        .product-required,
        .product-selected {
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 8px;
          line-height: 1.2;
          font-weight: 700;
          text-transform:
            uppercase;
        }

        .product-required {
          color: #888888;
        }

        .product-selected {
          color: ${COLORS.accent};
        }

        .product-colours {
          width: 100%;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-color {
          width: 22px;
          height: 22px;
          padding: 0;
          border: 1px solid #9d9d9d;
          border-radius: 50%;
          outline: none;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .product-color:hover {
          transform:
            scale(1.08);
        }

        .product-color.selected {
          border: 2px solid #111111;
          box-shadow:
            0 0 0 2px
              ${COLORS.page},
            0 0 0 3px #111111;
        }

        /* ==================================================
           NAME
        ================================================== */

        .product-name {
          display:
            -webkit-box;
          width: 100%;
          margin: 0 0 9px;
          color: #111111;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 16px;
          line-height: 1.3;
          font-weight: 700;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-name:hover {
          text-decoration: underline;
        }

        /* ==================================================
           PRICE
        ================================================== */

        .product-price-area {
          width: 100%;
          margin-bottom: 9px;
        }

        .product-price-row {
          width: 100%;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
        }

        .product-selling-price {
          color: #111111;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 20px;
          line-height: 1.15;
          font-weight: 700;
        }

        .product-actual-price {
          color: #666666;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
          line-height: 1;
          font-weight: 500;
          text-decoration: line-through;
        }

        .product-discount {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 21px;
          padding: 0 6px;
          border-radius: 4px;
          background: #111111;
          color: #ffffff;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
        }

        .product-shipping {
          margin: 5px 0 0;
          color: #666666;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 10px;
          line-height: 1.35;
          font-weight: 500;
        }

        /* ==================================================
           SIZE
        ================================================== */

        .product-size-section {
          width: 100%;
          margin-bottom: 9px;
          padding: 8px;
          background:
            rgba(
              255,
              255,
              255,
              0.18
            );
          border: 1px solid
            rgba(
              123,
              127,
              92,
              0.22
            );
          border-radius: 7px;
        }

        .product-size-section.required {
          border-color:
            rgba(
              123,
              127,
              92,
              0.42
            );
        }

        .product-size-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
          color: #333333;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 10px;
          line-height: 1.2;
          font-weight: 700;
        }

        .product-size-header small {
          color: ${COLORS.accent};
          font-size: 9px;
          font-weight: 700;
        }

        .product-size-required {
          color: #888888 !important;
          text-transform:
            uppercase;
        }

        .product-size-list {
          width: 100%;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .product-size-button {
          min-width: 35px;
          min-height: 26px;
          padding: 0 8px;
          border: 1px solid #c9c9c9;
          border-radius: 5px;
          background: ${COLORS.page};
          color: #111111;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }

        .product-size-button:hover {
          border-color:
            ${COLORS.accent};
        }

        .product-size-button.selected {
          background:
            ${COLORS.accent};
          border-color:
            ${COLORS.accent};
          color: #ffffff;
        }

        /* ==================================================
           ACTIONS
        ================================================== */

        .product-action-area {
          width: 100%;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-add-cart {
          width: 100%;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid #111111;
          border-radius: 6px;
          background: #111111;
          color: #ffffff;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 10px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .product-add-cart:hover {
          background:
            ${COLORS.accent};
          border-color:
            ${COLORS.accent};
        }

        .product-add-cart.requires-selection {
          background:
            ${COLORS.accent};
          border-color:
            ${COLORS.accent};
        }

        .product-quantity {
          width: 100%;
          min-height: 42px;
          display: grid;
          grid-template-columns:
            42px 1fr 42px;
          border: 1px solid #111111;
          border-radius: 6px;
          overflow: hidden;
          background: #111111;
        }

        .product-quantity button {
          border: none;
          background: #111111;
          color: #ffffff;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
        }

        .product-quantity button:hover {
          background:
            ${COLORS.accent};
        }

        .product-quantity span {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
          font-weight: 700;
          border-left: 1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
          border-right: 1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
        }

        .product-bulk-button {
          width: 100%;
          min-height: 36px;
          padding: 0 10px;
          border: 1px solid
            rgba(
              123,
              127,
              92,
              0.34
            );
          border-radius: 6px;
          background: transparent;
          color: ${COLORS.text};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.055em;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .product-bulk-button:hover {
          background:
            rgba(
              123,
              127,
              92,
              0.08
            );
          border-color:
            ${COLORS.accent};
        }

        /* ==================================================
           EMPTY
        ================================================== */

        .empty-products {
          grid-column: 1 / -1;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }

        .empty-sale-icon {
          width: 64px;
          height: 64px;
          border: 1px solid
            ${COLORS.border};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.accent};
          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;
          font-size: 28px;
          margin-bottom: 20px;
        }

        .empty-products h3 {
          margin: 0;
          color: ${COLORS.text};
          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;
          font-size: 30px;
          font-weight: 500;
        }

        .empty-products p {
          margin: 8px 0 18px;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 13px;
        }

        .empty-sale-link {
          color: ${COLORS.accent};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.04em;
        }

        /* ==================================================
           SKELETON
        ================================================== */

        .product-skeleton {
          width: 100%;
          overflow: hidden;
          border: 1px solid
            rgba(
              123,
              127,
              92,
              0.14
            );
          border-radius: 12px;
          background: ${COLORS.page};
        }

        .skeleton-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          background:
            linear-gradient(
              90deg,
              rgba(
                0,
                0,
                0,
                0.04
              ) 25%,
              rgba(
                0,
                0,
                0,
                0.08
              ) 50%,
              rgba(
                0,
                0,
                0,
                0.04
              ) 75%
            );
          background-size:
            200% 100%;
          animation:
            saleSkeleton 1.4s
            infinite;
        }

        .skeleton-content {
          padding: 14px;
        }

        .skeleton-line {
          height: 10px;
          margin-bottom: 10px;
          border-radius: 999px;
          background:
            rgba(
              0,
              0,
              0,
              0.06
            );
          animation:
            saleSkeleton 1.4s
            infinite;
        }

        .skeleton-small {
          width: 30%;
        }

        .skeleton-medium {
          width: 55%;
        }

        .skeleton-large {
          width: 78%;
          height: 14px;
        }

        .skeleton-button {
          width: 100%;
          height: 40px;
          margin-top: 16px;
          border-radius: 6px;
          background:
            rgba(
              0,
              0,
              0,
              0.06
            );
          animation:
            saleSkeleton 1.4s
            infinite;
        }

        @keyframes saleSkeleton {
          0% {
            background-position:
              200% 0;
          }

          100% {
            background-position:
              -200% 0;
          }
        }

        /* ==================================================
           PAGINATION
        ================================================== */

        .products-pagination {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 18px;
        }

        .pagination-info {
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 11px;
          line-height: 1.3;
          font-weight: 500;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .pagination-arrow,
        .pagination-number {
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid
            ${COLORS.border};
          border-radius: 6px;
          background:
            ${COLORS.page};
          color: ${COLORS.text};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .pagination-ellipsis {
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 12px;
        }

        .pagination-arrow:hover:not(
            :disabled
          ),
        .pagination-number:hover {
          border-color:
            ${COLORS.accent};
          color:
            ${COLORS.accent};
        }

        .pagination-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pagination-number.active {
          background:
            ${COLORS.accent};
          border-color:
            ${COLORS.accent};
          color: #ffffff;
        }

        .back-top {
          min-height: 34px;
          padding: 0 14px;
          border: none;
          background: transparent;
          color: ${COLORS.muted};
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition:
            color 0.2s ease;
        }

        .back-top:hover {
          color:
            ${COLORS.accent};
        }

        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 1100px) {
          .sale-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 820px) {
          .sale-intro {
            padding:
              56px 20px
              38px;
          }

          .sale-heading {
            padding:
              30px 20px
              18px;
          }

          .sale-grid {
            padding:
              0 20px 40px;
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
            gap: 14px;
          }

          .products-pagination {
            padding:
              0 20px 45px;
          }
        }

        @media (max-width: 560px) {
          .sale-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .sale-heading h2 {
            font-size: 34px;
          }

          .sale-heading p {
            margin-top: 5px;
            font-size: 12px;
          }

          .sale-bulk-link {
            font-size: 10px;
          }

          .sale-grid {
            padding:
              0 20px 35px;
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
            column-gap: 10px;
            row-gap: 16px;
          }

          .product-content {
            padding: 10px;
          }

          .product-name {
            font-size: 13px;
          }

          .product-selling-price {
            font-size: 16px;
          }

          .product-actual-price {
            font-size: 10px;
          }

          .product-discount {
            min-height: 18px;
            font-size: 8px;
          }

          .product-wishlist {
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            font-size: 18px;
          }

          .sale-badge {
            top: 8px;
            left: 8px;
            min-height: 24px;
            padding: 0 8px;
            font-size: 8px;
          }

          .product-add-cart {
            min-height: 38px;
            font-size: 9px;
          }

          .product-bulk-button {
            min-height: 34px;
            font-size: 8px;
          }

          .product-quantity {
            min-height: 38px;
            grid-template-columns:
              36px 1fr 36px;
          }

          .product-size-section {
            padding: 7px;
          }

          .product-size-button {
            min-width: 31px;
            min-height: 24px;
            padding: 0 6px;
          }

          .sale-intro h1 {
            font-size: 48px;
          }

          .sale-intro p {
            font-size: 11px;
          }

          .pagination-arrow,
          .pagination-number {
            width: 34px;
            height: 34px;
            font-size: 11px;
          }

          .empty-products {
            min-height: 300px;
          }

          .empty-products h3 {
            font-size: 25px;
          }
        }
      `}</style>
    </main>
  );
}