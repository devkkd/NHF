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
   FETCH PRODUCTS
========================================================= */

async function fetchNewArrivals(
  page = 1
) {
  try {
    const response =
      await fetch(
        `${BASE}/products?newArrivals=true&page=${page}&limit=${LIMIT}`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch products."
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
      "NEW ARRIVALS ERROR:",
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
   MAIN PAGE
========================================================= */

export default function NewArrivalsPage() {
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

     true = gallery/secondary image
     false = main image
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
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    fetchNewArrivals(
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

        /*
         * Reset hover states after
         * pagination change.
         */

        setHoveredProducts(
          {}
        );

        /*
         * Reset quantity states
         * for newly fetched page.
         */

        setQuantities(
          {}
        );

        /*
         * Keep selected colour/size
         * only for currently useful
         * page items.
         */

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

  /*
   * Mobile/touch support.
   *
   * Finger touches image -> alternate image.
   */

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

      /*
       * Variant change means
       * current displayed quantity
       * should reset.
       */

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

      /*
       * Variant change means
       * current displayed quantity
       * should reset.
       */

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

      /*
       * Required variant
       * must be selected first.
       */

      if (
        !validateProduct(
          product
        )
      ) {
        return;
      }

      /*
       * Login check
       */

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

        end = Math.min(
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
    <main className="new-arrivals-page">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="new-arrivals-hero">
        <img
          src="/images/new-arrivals-hero.jpg"
          alt="New Arrivals"
          className="new-arrivals-hero-image"
        />

        <div className="new-arrivals-hero-overlay">
          <h1>
            NEW ARRIVALS
          </h1>
        </div>
      </section>

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="new-arrivals-heading">
        <div>
          <h2>
            New Arrivals
          </h2>

          <p>
            {loading
              ? "Loading..."
              : `${total} products`}
          </p>
        </div>
      </section>

      {/* ==================================================
          PRODUCT GRID
      ================================================== */}

      <section className="new-arrivals-grid">

        {loading ? (
          Array.from({
            length:
              LIMIT,
          }).map(
            (_, index) => (
              <ProductSkeleton
                key={
                  index
                }
              />
            )
          )
        ) : products.length ===
          0 ? (
          <div className="empty-products">
            <p>
              No new arrivals
              available.
            </p>
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

              /*
               * First image = main image
               * Second image = hover image
               *
               * If gallery doesn't exist,
               * main image remains.
               */

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
                            {/* MAIN IMAGE */}

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

                            {/* HOVER IMAGE */}

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

                      {/* ====================================
                          ADD TO CART / QUANTITY
                      ==================================== */}

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

                      {/* ====================================
                          BULK PRICE ENQUIRY
                      ==================================== */}

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
                window.scrollTo(
                  {
                    top: 0,
                    behavior:
                      "smooth",
                  }
                )
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

        .new-arrivals-page {
          width: 100%;
          min-height: 100vh;

          margin: 0;
          padding: 0;

          background:
            ${COLORS.page};

          color:
            ${COLORS.text};

          overflow-x: hidden;
        }

        /* ==================================================
           HERO
        ================================================== */

        .new-arrivals-hero {
          position: relative;

          width: 100%;
          height: 440px;

          overflow: hidden;

          background:
            ${COLORS.page};
        }

        .new-arrivals-hero-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .new-arrivals-hero-overlay {
          position: absolute;
          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(
              0,
              0,
              0,
              0.24
            );
        }

        .new-arrivals-hero-overlay h1 {
          margin: 0;

          color: #ffffff;

          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;

          font-size:
            clamp(
              34px,
              5vw,
              64px
            );

          line-height: 1;

          font-weight: 500;

          letter-spacing:
            0.08em;

          text-align: center;
        }

        /* ==================================================
           HEADER
        ================================================== */

        .new-arrivals-heading {
          width: 100%;
          max-width: 1500px;

          margin: 0 auto;

          padding:
            38px 44px
            22px;
        }

        .new-arrivals-heading h2 {
          margin: 0;

          color:
            ${COLORS.accent};

          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;

          font-size: 40px;

          line-height: 1.1;

          font-weight: 500;
        }

        .new-arrivals-heading p {
          margin:
            7px 0 0;

          color:
            ${COLORS.muted};

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size: 14px;

          line-height: 1.4;
        }

        /* ==================================================
           GRID
           
           DESKTOP = 4
           
           align-items: stretch so every card in a row
           takes on the height of the tallest card —
           this is what makes card sizes uniform.
        ================================================== */

        .new-arrivals-grid {
          width: 100%;
          max-width: 1500px;

          margin: 0 auto;

          padding:
            0 44px 50px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          column-gap: 18px;

          row-gap: 22px;

          align-items: stretch;
        }

        /* ==================================================
           CARD
           
           PAGE BACKGROUND
           
           height: 100% + flex column so the card fills
           the stretched grid cell and its content can
           push the action buttons to the bottom evenly.
        ================================================== */

        .product-card {
          width: 100%;
          height: 100%;
          min-width: 0;

          display: flex;
          flex-direction: column;

          background:
            ${COLORS.page};

          border:
            1px solid
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
            transform
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .product-card:hover {
          transform:
            translateY(
              -2px
            );

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
           IMAGE WRAPPER
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

          text-decoration:
            none;

          color: inherit;
        }

        .product-image-box {
          position: relative;

          width: 100%;

          aspect-ratio:
            1 / 1;

          overflow: hidden;

          background:
            ${COLORS.page};
        }

        /*
         * Both images occupy EXACTLY
         * same position.
         */

        .product-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition:
            opacity
              0.35s ease,
            transform
              0.45s ease;
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

          background:
            ${COLORS.page};
        }

        /*
         * Slight zoom on hover only
         * for secondary image.
         */

        .product-image-box:hover
          .product-image-hover.image-visible {
          transform:
            scale(
              1.025
            );
        }

        /* ==================================================
           HOVER IMAGE TEXT
        ================================================== */

        .image-hover-indicator {
          position: absolute;

          left: 50%;
          bottom: 11px;

          transform:
            translateX(
              -50%
            );

          z-index: 7;

          pointer-events:
            none;

          padding:
            5px 8px;

          border-radius:
            5px;

          background:
            rgba(
              17,
              17,
              17,
              0.74
            );

          color:
            #ffffff;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            8px;

          line-height:
            1.2;

          font-weight:
            600;

          opacity: 0;

          transition:
            opacity
              0.2s ease;
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

          border:
            1px solid
              #d4d4d4;

          border-radius:
            50%;

          background:
            ${COLORS.page};

          color: #777777;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            21px;

          line-height:
            1;

          cursor:
            pointer;

          z-index: 10;

          transition:
            transform
              0.15s ease,
            color
              0.15s ease;
        }

        .product-wishlist:hover {
          transform:
            scale(
              1.06
            );

          color:
            ${COLORS.accent};
        }

        .product-wishlist.active {
          color:
            #b4002e;
        }

        /* ==================================================
           CONTENT
           
           flex: 1 + flex column so this area grows to
           fill the remaining stretched card height, and
           the action area (margin-top: auto, below) is
           pinned to the bottom of every card.
        ================================================== */

        .product-content {
          width: 100%;
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;

          padding:
            11px;

          background:
            ${COLORS.page};
        }

        /* ==================================================
           COLOUR
        ================================================== */

        .product-colours-block {
          width: 100%;

          margin-bottom:
            7px;
        }

        .product-colour-header {
          width: 100%;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 8px;

          margin-bottom:
            6px;
        }

        .product-colour-label {
          color:
            #555555;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            11px;

          line-height:
            1.2;

          font-weight:
            600;
        }

        .product-required {
          color:
            #888888;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            8px;

          line-height:
            1.2;

          font-weight:
            700;

          text-transform:
            uppercase;
        }

        .product-selected {
          color:
            ${COLORS.accent};

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            8px;

          line-height:
            1.2;

          font-weight:
            700;

          text-transform:
            uppercase;
        }

        .product-colours {
          width: 100%;

          display: flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap: 8px;
        }

        .product-color {
          width: 22px;
          height: 22px;

          padding: 0;

          border:
            1px solid
              #9d9d9d;

          border-radius:
            50%;

          outline: none;

          cursor:
            pointer;

          transition:
            transform
              0.15s ease,
            box-shadow
              0.15s ease;
        }

        .product-color:hover {
          transform:
            scale(
              1.08
            );
        }

        .product-color.selected {
          border:
            2px solid
              #111111;

          box-shadow:
            0 0 0 2px
              ${COLORS.page},
            0 0 0 3px
              #111111;
        }

        /* ==================================================
           NAME
        ================================================== */

        .product-name {
          display:
            -webkit-box;

          width: 100%;

          margin:
            0 0 7px;

          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            16px;

          line-height:
            1.3;

          font-weight:
            700;

          text-decoration:
            none;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          -webkit-line-clamp:
            2;

          -webkit-box-orient:
            vertical;
        }

        .product-name:hover {
          text-decoration:
            underline;
        }

        /* ==================================================
           PRICE
        ================================================== */

        .product-price-area {
          width: 100%;

          margin-bottom:
            7px;
        }

        .product-price-row {
          width: 100%;

          display: flex;

          align-items:
            baseline;

          flex-wrap:
            wrap;

          gap: 6px;
        }

        .product-selling-price {
          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            20px;

          line-height:
            1.15;

          font-weight:
            700;
        }

        .product-actual-price {
          color:
            #666666;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            12px;

          line-height:
            1;

          font-weight:
            500;

          text-decoration:
            line-through;
        }

        .product-discount {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            21px;

          padding:
            0 6px;

          border-radius:
            4px;

          background:
            #dfe8cc;

          color:
            #38602d;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            9px;

          line-height:
            1;

          font-weight:
            700;
        }

        .product-shipping {
          margin:
            4px 0 0;

          color:
            #666666;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.35;

          font-weight:
            500;
        }

        /* ==================================================
           SIZE
        ================================================== */

        .product-size-section {
          width: 100%;

          margin-bottom:
            7px;

          padding:
            7px;

          background:
            rgba(
              255,
              255,
              255,
              0.18
            );

          border:
            1px solid
              rgba(
                123,
                127,
                92,
                0.22
              );

          border-radius:
            7px;
        }

        .product-size-header {
          width: 100%;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 8px;

          margin-bottom:
            6px;

          color:
            #333333;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.2;

          font-weight:
            700;
        }

        .product-size-header small {
          color:
            ${COLORS.accent};

          font-size:
            9px;

          font-weight:
            700;
        }

        .product-size-required {
          color:
            #888888 !important;

          text-transform:
            uppercase;
        }

        .product-size-list {
          width: 100%;

          display: flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap: 5px;
        }

        .product-size-button {
          min-width:
            35px;

          min-height:
            26px;

          padding:
            0 8px;

          border:
            1px solid
              #c9c9c9;

          border-radius:
            5px;

          background:
            ${COLORS.page};

          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            9px;

          line-height:
            1;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            background
              0.15s ease,
            color
              0.15s ease,
            border-color
              0.15s ease;
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

          color:
            #ffffff;
        }

        /* ==================================================
           ACTIONS
           
           margin-top: auto pins this block to the bottom
           of the flex-column card, regardless of whether
           colour/size sections above are present.
        ================================================== */

        .product-action-area {
          width: 100%;

          margin-top: auto;

          display: flex;

          flex-direction:
            column;

          gap:
            6px;
        }

        /* ==================================================
           ADD TO CART
        ================================================== */

        .product-add-cart {
          width: 100%;

          min-height:
            40px;

          padding:
            0 12px;

          border:
            1px solid
              #111111;

          border-radius:
            6px;

          background:
            ${COLORS.page};

          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            11px;

          line-height:
            1;

          font-weight:
            700;

          letter-spacing:
            0.03em;

          cursor:
            pointer;

          transition:
            background
              0.18s ease,
            color
              0.18s ease,
            border-color
              0.18s ease;
        }

        /*
         * IMPORTANT:
         * Hover text remains visible.
         */

        .product-add-cart:hover {
          background:
            #111111;

          border-color:
            #111111;

          color:
            #ffffff;
        }

        .product-add-cart.requires-selection {
          background:
            ${COLORS.page};

          color:
            #111111;
        }

        /* ==================================================
           BULK PRICE ENQUIRY
           
           BELOW ADD TO CART
        ================================================== */

        .product-bulk-button {
          width: 100%;

          min-height:
            37px;

          padding:
            0 12px;

          border:
            1px solid
              ${COLORS.accent};

          border-radius:
            6px;

          background:
            ${COLORS.page};

          color:
            ${COLORS.accent};

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1;

          font-weight:
            700;

          letter-spacing:
            0.03em;

          cursor:
            pointer;

          transition:
            background
              0.18s ease,
            color
              0.18s ease;
        }

        .product-bulk-button:hover {
          background:
            ${COLORS.accent};

          color:
            #ffffff;
        }

        /* ==================================================
           QUANTITY
        ================================================== */

        .product-quantity {
          width: 100%;

          min-height:
            40px;

          border:
            1px solid
              #111111;

          border-radius:
            6px;

          background:
            ${COLORS.page};

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;
        }

        .product-quantity button {
          width:
            38px;

          height:
            38px;

          padding: 0;

          border:
            none;

          background:
            transparent;

          color:
            #111111;

          font-size:
            19px;

          line-height:
            1;

          cursor:
            pointer;
        }

        .product-quantity span {
          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            12px;

          line-height:
            1;

          font-weight:
            700;
        }

        /* ==================================================
           PAGINATION
        ================================================== */

        .products-pagination {
          width: 100%;

          max-width:
            1500px;

          margin:
            0 auto;

          padding:
            10px 44px
            60px;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            14px;
        }

        .pagination-info {
          color:
            #666666;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            12px;
        }

        .pagination-buttons {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          flex-wrap:
            wrap;

          gap:
            6px;
        }

        .pagination-number,
        .pagination-arrow {
          width:
            36px;

          height:
            36px;

          padding:
            0;

          border:
            1px solid
              ${COLORS.border};

          border-radius:
            50%;

          background:
            ${COLORS.page};

          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            12px;

          line-height:
            1;

          font-weight:
            600;

          cursor:
            pointer;
        }

        .pagination-number:hover,
        .pagination-arrow:hover:not(
          :disabled
        ) {
          border-color:
            ${COLORS.accent};
        }

        .pagination-number.active {
          background:
            ${COLORS.accent};

          border-color:
            ${COLORS.accent};

          color:
            #ffffff;
        }

        .pagination-arrow {
          font-size:
            17px;
        }

        .pagination-arrow:disabled {
          opacity:
            0.3;

          cursor:
            not-allowed;
        }

        .back-top {
          border:
            none;

          background:
            transparent;

          color:
            ${COLORS.accent};

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.3;

          font-weight:
            700;

          cursor:
            pointer;
        }

        /* ==================================================
           EMPTY
        ================================================== */

        .empty-products {
          grid-column:
            1 / -1;

          padding:
            80px 20px;

          text-align:
            center;

          color:
            #666666;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            14px;
        }

        /* ==================================================
           SKELETON
           
           Kept same flex/height rules as .product-card
           so skeleton placeholders line up evenly too.
        ================================================== */

        .product-skeleton-card {
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;

          background:
            ${COLORS.page};

          border:
            1px solid
              rgba(
                123,
                127,
                92,
                0.15
              );

          border-radius:
            12px;

          overflow:
            hidden;
        }

        .product-skeleton-image {
          width: 100%;

          aspect-ratio:
            1 / 1;

          background:
            linear-gradient(
              90deg,
              #efefe5 25%,
              #f7f7ef 50%,
              #efefe5 75%
            );

          background-size:
            200% 100%;

          animation:
            naSkeleton
            1.4s
            infinite;
        }

        .product-skeleton-content {
          flex: 1;

          display: flex;
          flex-direction: column;

          padding:
            11px;
        }

        .product-skeleton-colors {
          display:
            flex;

          gap:
            7px;

          margin-bottom:
            10px;
        }

        .product-skeleton-colors span {
          width:
            20px;

          height:
            20px;

          border-radius:
            50%;

          background:
            #e6e6dc;
        }

        .product-skeleton-name {
          width:
            75%;

          height:
            18px;

          margin-bottom:
            10px;

          border-radius:
            4px;

          background:
            #e6e6dc;
        }

        .product-skeleton-price {
          width:
            38%;

          height:
            20px;

          margin-bottom:
            12px;

          border-radius:
            4px;

          background:
            #e6e6dc;
        }

        .product-skeleton-button {
          width:
            100%;

          height:
            40px;

          margin-top:
            auto;

          border-radius:
            6px;

          background:
            #e6e6dc;
        }

        @keyframes naSkeleton {
          0% {
            background-position:
              200%
              0;
          }

          100% {
            background-position:
              -200%
              0;
          }
        }

        /* ==================================================
           TABLET
           3 CARDS
        ================================================== */

        @media (max-width: 1100px) {
          .new-arrivals-heading {
            padding-left:
              28px;

            padding-right:
              28px;
          }

          .new-arrivals-grid {
            padding-left:
              28px;

            padding-right:
              28px;

            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            column-gap:
              14px;

            row-gap:
              20px;
          }

          .products-pagination {
            padding-left:
              28px;

            padding-right:
              28px;
          }

          .product-name {
            font-size:
              15px;
          }

          .product-selling-price {
            font-size:
              18px;
          }
        }

        /* ==================================================
           MOBILE
           EXACTLY 2 CARDS
        ================================================== */

        @media (max-width: 700px) {
          .new-arrivals-hero {
            height:
              220px;
          }

          .new-arrivals-hero-overlay h1 {
            font-size:
              29px;
          }

          .new-arrivals-heading {
            padding:
              23px 14px
              15px;
          }

          .new-arrivals-heading h2 {
            font-size:
              28px;
          }

          .new-arrivals-heading p {
            font-size:
              11px;
          }

          .new-arrivals-grid {
            width:
              100%;

            padding:
              0 10px 35px;

            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            column-gap:
              8px;

            row-gap:
              14px;
          }

          .product-card {
            border-radius:
              8px;
          }

          .product-image-box {
            aspect-ratio:
              1 / 1.04;
          }

          .product-wishlist {
            top:
              7px;

            right:
              7px;

            width:
              31px;

            height:
              31px;

            font-size:
              17px;
          }

          /*
           * Hide hover helper on mobile.
           * Touch still swaps image.
           */

          .image-hover-indicator {
            display:
              none;
          }

          .product-content {
            padding:
              8px;
          }

          .product-colours-block {
            margin-bottom:
              6px;
          }

          .product-colour-label {
            font-size:
              8px;
          }

          .product-required,
          .product-selected {
            font-size:
              7px;
          }

          .product-colours {
            gap:
              6px;
          }

          .product-color {
            width:
              17px;

            height:
              17px;
          }

          .product-name {
            margin-bottom:
              6px;

            font-size:
              12px;

            line-height:
              1.28;
          }

          .product-selling-price {
            font-size:
              15px;
          }

          .product-actual-price {
            font-size:
              8px;
          }

          .product-discount {
            min-height:
              17px;

            padding:
              0 4px;

            font-size:
              7px;
          }

          .product-shipping {
            margin-top:
              3px;

            font-size:
              8px;
          }

          .product-price-area {
            margin-bottom:
              6px;
          }

          .product-size-section {
            padding:
              6px;

            margin-bottom:
              6px;
          }

          .product-size-header {
            font-size:
              8px;

            margin-bottom:
              5px;
          }

          .product-size-header small {
            font-size:
              7px;
          }

          .product-size-list {
            gap:
              4px;
          }

          .product-size-button {
            min-width:
              27px;

            min-height:
              23px;

            padding:
              0 5px;

            font-size:
              7px;
          }

          .product-action-area {
            gap:
              5px;
          }

          .product-add-cart {
            min-height:
              35px;

            font-size:
              8px;
          }

          .product-bulk-button {
            min-height:
              33px;

            font-size:
              7px;
          }

          .product-quantity {
            min-height:
              35px;
          }

          .product-quantity button {
            width:
              30px;

            height:
              33px;

            font-size:
              17px;
          }

          .product-quantity span {
            font-size:
              10px;
          }

          .products-pagination {
            padding:
              7px 14px
              40px;
          }

          .pagination-info {
            font-size:
              10px;
          }

          .pagination-number,
          .pagination-arrow {
            width:
              31px;

            height:
              31px;

            font-size:
              10px;
          }

          .pagination-arrow {
            font-size:
              15px;
          }

          .back-top {
            font-size:
              8px;
          }
        }

        /* ==================================================
           VERY SMALL MOBILE
        ================================================== */

        @media (max-width: 380px) {
          .new-arrivals-grid {
            padding-left:
              7px;

            padding-right:
              7px;

            column-gap:
              7px;
          }

          .product-content {
            padding:
              7px;
          }

          .product-name {
            font-size:
              11px;
          }

          .product-selling-price {
            font-size:
              14px;
          }

          .product-color {
            width:
              16px;

            height:
              16px;
          }

          .product-size-button {
            min-width:
              25px;

            min-height:
              22px;

            padding:
              0 4px;

            font-size:
              7px;
          }

          .product-add-cart {
            min-height:
              34px;

            font-size:
              7px;
          }

          .product-bulk-button {
            min-height:
              32px;

            font-size:
              6.5px;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="product-skeleton-card">

      <div className="product-skeleton-image" />

      <div className="product-skeleton-content">

        <div className="product-skeleton-colors">
          <span />
          <span />
          <span />
        </div>

        <div className="product-skeleton-name" />

        <div className="product-skeleton-price" />

        <div className="product-skeleton-button" />

      </div>

    </div>
  );
}