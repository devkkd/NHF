"use client";

import {
  useCallback,
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
  getWishlist,
  toggleWishlist,
} from "@/lib/wishlist";

/* =========================================================
   CONFIG
========================================================= */

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

const LIMIT = 20;

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

async function fetchNewArrivals() {
  try {
    const response = await fetch(
      `${BASE}/products?newArrivals=true&page=1&limit=${LIMIT}`,
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
        `Failed to fetch products: ${response.status}`
      );
    }

    const body = await response.json();

    return Array.isArray(
      body?.data?.products
    )
      ? body.data.products
      : [];
  } catch (error) {
    console.error(
      "NEW ARRIVALS ERROR:",
      error
    );

    return [];
  }
}

/* =========================================================
   LOGIN
========================================================= */

function isLoggedIn() {
  if (
    typeof window === "undefined"
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

function getColors(product) {
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

function getSizes(product) {
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

function getProductImages(product) {
  const images = [];

  if (
    typeof product?.mainImage ===
      "string" &&
    product.mainImage.trim()
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
          typeof image === "string" &&
          image.trim() &&
          !images.includes(image)
        ) {
          images.push(image);
        }
      }
    );
  }

  return images;
}

/* =========================================================
   PRICE
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
    (
      (actual - selling) /
      actual
    ) *
      100
  );
}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(value) {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount)
  ) {
    return "₹0";
  }

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NewArrivalsGrid() {
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
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     VARIANTS
  ======================================================= */

  const [
    selectedColors,
    setSelectedColors,
  ] = useState({});

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
     IMAGE HOVER
  ======================================================= */

  const [
    hoveredProducts,
    setHoveredProducts,
  ] = useState({});

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        setLoading(true);

        const result =
          await fetchNewArrivals();

        if (mounted) {
          setProducts(
            result
          );

          setLoading(
            false
          );
        }
      };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadWishlist =
      async () => {
        try {
          if (
            !isLoggedIn()
          ) {
            if (
              mounted
            ) {
              setWishlist(
                {}
              );
            }

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
        } catch (error) {
          console.error(
            "WISHLIST LOAD ERROR:",
            error
          );
        }
      };

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOGIN REDIRECT
  ======================================================= */

  const redirectToLogin =
    (redirect = "/") => {
      router.push(
        `/login?redirect=${encodeURIComponent(
          redirect
        )}`
      );
    };

  /* =======================================================
     SAVE PENDING ACTION
  ======================================================= */

  const savePendingAction =
    (
      type,
      product
    ) => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const redirectPath =
        window.location.pathname +
        window.location.search;

      if (
        type === "cart"
      ) {
        sessionStorage.setItem(
          "pendingCartProduct",
          JSON.stringify({
            product,
            quantity: 1,
          })
        );

        sessionStorage.setItem(
          "pendingCartRedirect",
          redirectPath
        );
      }

      if (
        type === "wishlist"
      ) {
        sessionStorage.setItem(
          "pendingWishlistProduct",
          JSON.stringify({
            product,
          })
        );

        sessionStorage.setItem(
          "pendingWishlistRedirect",
          redirectPath
        );
      }
    };

  /* =======================================================
     COLOUR
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
       * Variant change:
       * reset displayed quantity.
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
     SIZE
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
       * Variant change:
       * reset displayed quantity.
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
     BUILD CART PRODUCT
  ======================================================= */

  const buildCartProduct =
    (product) => {
      const sizes =
        getSizes(
          product
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
              size?.name ||
                ""
            )
              .trim()
              .toLowerCase() ===
            String(
              selectedSizeName ||
                ""
            )
              .trim()
              .toLowerCase()
        ) || null;

      const pricing =
        getPricing(
          product,
          selectedSize
        );

      return {
        ...product,

        selectedColor,

        selectedColorName:
          selectedColor,

        selectedSize:
          selectedSize
            ? selectedSize.name
            : "",

        selectedVariant:
          selectedSize,

        selectedSizeActualPrice:
          pricing.actualPrice,

        selectedSizeSellingPrice:
          pricing.sellingPrice,

        selectedSellingPrice:
          pricing.sellingPrice,

        selectedActualPrice:
          pricing.actualPrice,

        selectedShippingCost:
          Number(
            product.shippingCost ||
              0
          ),

        /*
         * Preserve price fields
         * for existing cart helpers.
         */

        price:
          pricing.sellingPrice,

        sellingPrice:
          pricing.sellingPrice,

        actualPrice:
          pricing.actualPrice,
      };
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
        colors.length > 0 &&
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
        sizes.length > 0 &&
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
        const pending =
          buildCartProduct(
            product
          );

        savePendingAction(
          "cart",
          pending
        );

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
          redirectToLogin(
            window.location.pathname +
              window.location.search
          );
        }, 450);

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
          "Added to cart",
          {
            duration:
              1600,
            position:
              "top-right",
          }
        );
      } catch (error) {
        console.error(
          "ADD TO CART ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to add to cart.",
          {
            duration:
              2200,
            position:
              "top-right",
          }
        );
      }
    };

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQty =
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

      const currentQty =
        Number(
          quantities[
            product.slug
          ] || 1
        );

      const nextQty =
        currentQty + 1;

      try {
        await updateQty(
          product._id,
          nextQty
        );

        setQuantities(
          (current) => ({
            ...current,
            [product.slug]:
              nextQty,
        })
        );
      } catch (error) {
        console.error(
          "INCREASE ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to update quantity.",
          {
            duration:
              1800,
            position:
              "top-right",
          }
        );
      }
    };

  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQty =
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

        return;
      }

      const currentQty =
        Number(
          quantities[
            product.slug
          ] || 1
        );

      const nextQty =
        currentQty - 1;

      try {
        await updateQty(
          product._id,
          Math.max(
            nextQty,
            0
          )
        );

        if (
          nextQty <= 0
        ) {
          setQuantities(
            (current) => {
              const copy = {
                ...current,
              };

              delete copy[
                product.slug
              ];

              return copy;
            }
          );

          return;
        }

        setQuantities(
          (current) => ({
            ...current,
            [product.slug]:
              nextQty,
        })
        );
      } catch (error) {
        console.error(
          "DECREASE ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to update quantity.",
          {
            duration:
              1800,
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
        savePendingAction(
          "wishlist",
          product
        );

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
          redirectToLogin(
            window.location.pathname +
              window.location.search
          );
        }, 450);

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

        toast.success(
          result
            ? "Added to wishlist"
            : "Removed from wishlist",
          {
            duration:
              1500,
            position:
              "top-right",
          }
        );
      } catch (error) {
        console.error(
          "WISHLIST ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to update wishlist.",
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
        (current) => {
          const copy = {
            ...current,
          };

          delete copy[
            product.slug
          ];

          return copy;
        }
      );
    };

  /* =======================================================
     TOUCH IMAGE
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
            !current[
              product.slug
            ],
        })
      );
    };

  /* =======================================================
     PRODUCT DETAIL
  ======================================================= */

  const openProductDetails =
    (
      event,
      product
    ) => {
      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }

      /*
       * Links handle themselves.
       * This makes empty/card area clickable.
       */

      if (
        product?.slug
      ) {
        router.push(
          `/products/${product.slug}`
        );
      }
    };

  /* =======================================================
     PRODUCTS MEMO
  ======================================================= */

  const visibleProducts =
    useMemo(
      () =>
        products.slice(
          0,
          LIMIT
        ),
      [products]
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <section className="new-arrivals-section">

        <div className="new-arrivals-container">

          <h2 className="section-title">
            NEW ARRIVALS
          </h2>

          <div className="product-grid">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="product-skeleton-card"
                >
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
              )
            )}

          </div>

        </div>

        <style jsx>{`

          .new-arrivals-section {
            width: 100%;
            background: ${COLORS.page};
            padding:
              58px 24px;
            box-sizing:
              border-box;
          }

          .new-arrivals-container {
            width: 100%;
            max-width:
              1420px;
            margin:
              0 auto;
          }

          .section-title {
            margin:
              0 0 28px;

            text-align:
              center;

            color:
              ${COLORS.accent};

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size:
              30px;

            line-height:
              1.2;

            font-weight:
              500;
          }

          .product-grid {
            display:
              grid;

            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              18px;
          }

          .product-skeleton-card {
            overflow:
              hidden;

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

            background:
              ${COLORS.page};
          }

          .product-skeleton-image {
            width:
              100%;

            aspect-ratio:
              1 / 0.90;

            background:
              #e8e9da;

            animation:
              skeletonPulse
              1.4s
              ease-in-out
              infinite;
          }

          .product-skeleton-content {
            padding:
              13px;
          }

          .product-skeleton-colors {
            display:
              flex;

            gap:
              7px;

            margin-bottom:
              9px;
          }

          .product-skeleton-colors span {
            width:
              20px;

            height:
              20px;

            border-radius:
              50%;

            background:
              #e4e5db;
          }

          .product-skeleton-name {
            width:
              70%;

            height:
              17px;

            margin-bottom:
              11px;

            border-radius:
              4px;

            background:
              #e4e5db;
          }

          .product-skeleton-price {
            width:
              40%;

            height:
              20px;

            margin-bottom:
              12px;

            border-radius:
              4px;

            background:
              #e4e5db;
          }

          .product-skeleton-button {
            width:
              100%;

            height:
              40px;

            border-radius:
              6px;

            background:
              #e4e5db;
          }

          @keyframes skeletonPulse {
            0%,
            100% {
              opacity:
                0.55;
            }

            50% {
              opacity:
                1;
            }
          }

          @media (max-width: 700px) {

            .new-arrivals-section {
              padding:
                42px 8px;
            }

            .section-title {
              margin-bottom:
                22px;

              font-size:
                23px;
            }

            .product-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(
                    0,
                    1fr
                  )
                );

              gap:
                9px;
            }

          }

        `}</style>

      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    visibleProducts.length ===
    0
  ) {
    return (
      <section className="new-arrivals-section">

        <div className="empty-products">
          No new arrivals available.
        </div>

        <style jsx>{`

          .new-arrivals-section {
            width: 100%;
            background: ${COLORS.page};
            padding:
              60px 20px;
          }

          .empty-products {
            min-height:
              180px;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            color:
              ${COLORS.muted};

            font-family:
              "Mona Sans",
              Arial,
              sans-serif;

            font-size:
              14px;
          }

        `}</style>

      </section>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <section className="new-arrivals-section">

      <div className="new-arrivals-container">

        {/* =================================================
            TITLE
        ================================================= */}

        <h2 className="section-title">
          NEW ARRIVALS
        </h2>

        {/* =================================================
            GRID
        ================================================= */}

        <div className="product-grid">

          {visibleProducts.map(
            (
              product,
              index
            ) => {

              /* =============================================
                 DATA
              ============================================= */

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
                      size?.name ||
                        ""
                    )
                      .trim()
                      .toLowerCase() ===
                    String(
                      selectedSizeName ||
                        ""
                    )
                      .trim()
                      .toLowerCase()
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

              /* =============================================
                 CARD
              ============================================= */

              return (
                <article
                  key={
                    product._id ||
                    product.slug ||
                    index
                  }
                  className="product-card"
                  onClick={(event) =>
                    openProductDetails(
                      event,
                      product
                    )
                  }
                >

                  {/* ========================================
                      IMAGE
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
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
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
                              draggable={
                                false
                              }
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
                                draggable={
                                  false
                                }
                              />
                            )}
                          </>
                        ) : (
                          <div className="product-image-placeholder" />
                        )}

                        {/* DISCOUNT TOP */}

                        {discount >
                          0 && (
                          <span className="product-discount-top">
                            {discount}% OFF
                          </span>
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
                          aria-label={
                            wishlist[
                              product.slug
                            ]
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          {wishlist[
                            product.slug
                          ]
                            ? "♥"
                            : "♡"}
                        </button>

                      </div>

                    </Link>

                  </div>

                  {/* ========================================
                      CONTENT
                  ======================================== */}

                  <div className="product-content">

                    {/* ======================================
                        COLOUR
                    ====================================== */}

                    {colors.length >
                      0 && (
                      <div
                        className={`product-colours-block${
                          needsColor
                            ? " missing"
                            : ""
                        }`}
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

                          <span
                            className={
                              selectedColor
                                ? "product-selected"
                                : "product-required"
                            }
                          >
                            {selectedColor
                              ? "Selected"
                              : "Select"}
                          </span>

                        </div>

                        <div className="product-colours">

                          {colors.map(
                            (
                              color,
                              colorIndex
                            ) => {

                              const colorValue =
                                String(
                                  color
                                ).trim();

                              const selected =
                                String(
                                  selectedColor
                                ).toLowerCase() ===
                                colorValue.toLowerCase();

                              return (
                                <button
                                  key={`${product._id}-color-${colorIndex}`}
                                  type="button"
                                  className={`product-color${
                                    selected
                                      ? " selected"
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor:
                                      colorValue,
                                  }}
                                  onClick={(
                                    event
                                  ) =>
                                    handleColorSelect(
                                      event,
                                      product,
                                      colorValue
                                    )
                                  }
                                  title={
                                    colorValue
                                  }
                                  aria-label={
                                    `Select colour ${colorValue}`
                                  }
                                />
                              );
                            }
                          )}

                        </div>

                      </div>
                    )}

                    {/* ======================================
                        PRODUCT NAME
                    ====================================== */}

                    <Link
                      href={`/products/${product.slug}`}
                      className="product-name"
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      {product.name}
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
                            ? " missing"
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
                              sizeIndex
                            ) => {

                              const sizeName =
                                String(
                                  size?.name ||
                                    ""
                                ).trim();

                              const selected =
                                String(
                                  selectedSizeName ||
                                    ""
                                )
                                  .trim()
                                  .toLowerCase() ===
                                sizeName
                                  .toLowerCase();

                              return (
                                <button
                                  key={`${product._id}-size-${sizeIndex}`}
                                  type="button"
                                  className={`product-size-button${
                                    selected
                                      ? " selected"
                                      : ""
                                  }`}
                                  onClick={(
                                    event
                                  ) =>
                                    handleSizeSelect(
                                      event,
                                      product,
                                      sizeName
                                    )
                                  }
                                  title={`${sizeName} — ${formatPrice(
                                    size?.sellingPrice
                                  )}`}
                                >
                                  {sizeName}
                                </button>
                              );
                            }
                          )}

                        </div>

                      </div>
                    )}

                    {/* ======================================
                        ACTIONS
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

                      {/* ADD / QUANTITY */}

                      {quantity > 0 ? (
                        <div className="product-quantity">

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
                            {quantity}
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

                      {/* BULK */}

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
          )}

        </div>

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx global>{`

        /* ==================================================
           PAGE
        ================================================== */

        .new-arrivals-section {
          width: 100%;
          background:
            ${COLORS.page};

          padding:
            55px 24px 65px;

          box-sizing:
            border-box;

          overflow-x:
            hidden;
        }

        .new-arrivals-container {
          width:
            100%;

          max-width:
            1420px;

          margin:
            0 auto;
        }

        /* ==================================================
           TITLE
        ================================================== */

        .section-title {
          margin:
            0 0 28px;

          text-align:
            center;

          color:
            ${COLORS.accent};

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            30px;

          line-height:
            1.15;

          font-weight:
            500;

          letter-spacing:
            -0.02em;
        }

        /* ==================================================
           GRID
           DESKTOP = 4
        ================================================== */

        .product-grid {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap:
            18px;

          align-items:
            stretch;
        }

        /* ==================================================
           CARD
        ================================================== */

        .product-card {
          width:
            100%;

          min-width:
            0;

          min-height:
            0;

          display:
            flex;

          flex-direction:
            column;

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

          border-radius:
            12px;

          overflow:
            hidden;

          box-shadow:
            0 2px 9px
              rgba(
                40,
                45,
                25,
                0.05
              );

          cursor:
            pointer;

          transition:
            transform
              0.2s ease,
            box-shadow
              0.2s ease;
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
          position:
            relative;

          width:
            100%;

          display:
            block;
        }

        .product-image-link-inner {
          display:
            block;

          width:
            100%;

          text-decoration:
            none;
        }

        .product-image-box {
          position:
            relative;

          width:
            100%;

          /*
           * Compact but still premium image.
           */
          aspect-ratio:
            1 / 0.90;

          overflow:
            hidden;

          background:
            ${COLORS.page};
        }

        .product-image {
          position:
            absolute;

          inset:
            0;

          width:
            100%;

          height:
            100%;

          display:
            block;

          object-fit:
            cover;

          transition:
            opacity
              0.35s ease,
            transform
              0.42s ease;
        }

        .product-image-main {
          z-index:
            1;

          opacity:
            1;
        }

        .product-image-hover {
          z-index:
            2;

          opacity:
            0;
        }

        .product-image-main.image-hidden {
          opacity:
            0;
        }

        .product-image-hover.image-visible {
          opacity:
            1;
        }

        .product-image-box:hover
          .product-image-hover.image-visible {
          transform:
            scale(
              1.025
            );
        }

        .product-image-placeholder {
          position:
            absolute;

          inset:
            0;

          background:
            #ecece2;
        }

        /* ==================================================
           DISCOUNT
           TOP LEFT
        ================================================== */

        .product-discount-top {
          position:
            absolute;

          top:
            10px;

          left:
            10px;

          z-index:
            8;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            27px;

          padding:
            0 8px;

          border:
            1px solid
            rgba(
              123,
              127,
              92,
              0.18
            );

          border-radius:
            7px;

          background:
            rgba(
              253,
              255,
              241,
              0.97
            );

          color:
            #38602d;

          box-shadow:
            0 4px 12px
              rgba(
                0,
                0,
                0,
                0.06
              );

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
        }

        /* ==================================================
           WISHLIST
        ================================================== */

        .product-wishlist {
          position:
            absolute;

          top:
            10px;

          right:
            10px;

          z-index:
            10;

          width:
            38px;

          height:
            38px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            0;

          border:
            1px solid
            #d4d4d4;

          border-radius:
            50%;

          background:
            ${COLORS.page};

          color:
            #777777;

          font-size:
            21px;

          line-height:
            1;

          cursor:
            pointer;

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
        ================================================== */

        .product-content {
          flex:
            1;

          width:
            100%;

          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          padding:
            11px 12px
            12px;

          box-sizing:
            border-box;

          background:
            ${COLORS.page};
        }

        /* ==================================================
           COLOURS
        ================================================== */

        .product-colours-block {
          width:
            100%;

          margin-bottom:
            7px;
        }

        .product-colour-header {
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            7px;

          margin-bottom:
            5px;
        }

        .product-colour-label {
          color:
            #555555;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.2;

          font-weight:
            600;
        }

        .product-required,
        .product-selected {
          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            7px;

          line-height:
            1.2;

          font-weight:
            700;

          text-transform:
            uppercase;
        }

        .product-required {
          color:
            #888888;
        }

        .product-selected {
          color:
            ${COLORS.accent};
        }

        .product-colours {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            7px;
        }

        .product-color {
          width:
            21px;

          height:
            21px;

          padding:
            0;

          border:
            1px solid
            #9d9d9d;

          border-radius:
            50%;

          outline:
            none;

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

          width:
            100%;

          min-height:
            40px;

          margin:
            0 0 6px;

          color:
            #111111;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            16px;

          line-height:
            1.25;

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
          width:
            100%;

          margin-bottom:
            7px;
        }

        .product-price-row {
          width:
            100%;

          display:
            flex;

          align-items:
            baseline;

          flex-wrap:
            wrap;

          gap:
            6px;
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
            1.1;

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
            11px;

          line-height:
            1;

          font-weight:
            500;

          text-decoration:
            line-through;
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
            9px;

          line-height:
            1.3;

          font-weight:
            500;
        }

        /* ==================================================
           SIZE
        ================================================== */

        .product-size-section {
          width:
            100%;

          margin-bottom:
            7px;

          padding:
            7px;

          background:
            rgba(
              255,
              255,
              255,
              0.20
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
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            7px;

          margin-bottom:
            5px;

          color:
            #333333;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            9px;

          line-height:
            1.2;

          font-weight:
            700;
        }

        .product-size-header small {
          color:
            ${COLORS.accent};

          font-size:
            8px;

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
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            5px;
        }

        .product-size-button {
          min-width:
            34px;

          min-height:
            27px;

          padding:
            0 7px;

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
            8px;

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
           ACTION AREA
        ================================================== */

        .product-action-area {
          width:
            100%;

          margin-top:
            auto;

          display:
            flex;

          flex-direction:
            column;

          gap:
            6px;
        }

        /* ==================================================
           ADD TO CART
        ================================================== */

        .product-add-cart {
          width:
            100%;

          min-height:
            40px;

          padding:
            0 10px;

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
              0.18s ease,
            border-color
              0.18s ease;
        }

        .product-add-cart:hover {
          background:
            #111111;

          border-color:
            #111111;

          color:
            #ffffff;
        }

        /* ==================================================
           QUANTITY
        ================================================== */

        .product-quantity {
          width:
            100%;

          min-height:
            40px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          border:
            1px solid
            #111111;

          border-radius:
            6px;

          background:
            ${COLORS.page};
        }

        .product-quantity button {
          width:
            35px;

          height:
            38px;

          padding:
            0;

          border:
            none;

          background:
            transparent;

          color:
            #111111;

          font-size:
            18px;

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
            11px;

          line-height:
            1;

          font-weight:
            700;
        }

        /* ==================================================
           BULK ENQUIRY
        ================================================== */

        .product-bulk-button {
          width:
            100%;

          min-height:
            37px;

          padding:
            0 10px;

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
            9px;

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
           TABLET
           3 CARDS
        ================================================== */

        @media (max-width: 1100px) {

          .new-arrivals-section {
            padding:
              48px 18px 55px;
          }

          .product-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              14px;
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

          .new-arrivals-section {
            padding:
              42px 8px 45px;
          }

          .section-title {
            font-size:
              23px;

            margin-bottom:
              22px;
          }

          .product-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              9px;
          }

          .product-card {
            border-radius:
              8px;
          }

          .product-image-box {
            aspect-ratio:
              1 / 0.92;
          }

          /* DISCOUNT */

          .product-discount-top {
            top:
              7px;

            left:
              7px;

            min-height:
              22px;

            padding:
              0 6px;

            border-radius:
              5px;

            font-size:
              7px;
          }

          /* WISHLIST */

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

          /* CONTENT */

          .product-content {
            padding:
              8px;
          }

          /* COLOUR */

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
              6px;
          }

          .product-colours {
            gap:
              5px;
          }

          .product-color {
            width:
              17px;

            height:
              17px;
          }

          /* NAME */

          .product-name {
            min-height:
              30px;

            margin-bottom:
              5px;

            font-size:
              11px;

            line-height:
              1.25;
          }

          /* PRICE */

          .product-price-area {
            margin-bottom:
              6px;
          }

          .product-selling-price {
            font-size:
              14px;
          }

          .product-actual-price {
            font-size:
              8px;
          }

          .product-shipping {
            margin-top:
              3px;

            font-size:
              7px;
          }

          /* SIZE */

          .product-size-section {
            padding:
              6px;

            margin-bottom:
              6px;
          }

          .product-size-header {
            margin-bottom:
              4px;

            font-size:
              8px;
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
              24px;

            padding:
              0 5px;

            font-size:
              7px;
          }

          /* ACTIONS */

          .product-action-area {
            gap:
              5px;
          }

          .product-add-cart {
            min-height:
              37px;

            font-size:
              8px;
          }

          .product-bulk-button {
            min-height:
              35px;

            font-size:
              7px;
          }

          .product-quantity {
            min-height:
              37px;
          }

          .product-quantity button {
            width:
              30px;

            height:
              35px;

            font-size:
              17px;
          }

          .product-quantity span {
            font-size:
              10px;
          }

        }

        /* ==================================================
           VERY SMALL MOBILE
        ================================================== */

        @media (max-width: 380px) {

          .new-arrivals-section {
            padding:
              38px 7px 42px;
          }

          .product-grid {
            gap:
              7px;
          }

          .product-content {
            padding:
              7px;
          }

          .product-name {
            font-size:
              10px;
          }

          .product-selling-price {
            font-size:
              13px;
          }

          .product-actual-price {
            font-size:
              7px;
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
              23px;

            font-size:
              6.5px;
          }

          .product-add-cart {
            min-height:
              35px;

            font-size:
              7px;
          }

          .product-bulk-button {
            min-height:
              33px;

            font-size:
              6px;
          }

        }

      `}</style>

    </section>
  );
}