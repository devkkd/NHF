"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
   FETCH SALE PRODUCTS
========================================================= */

async function fetchSaleProducts() {
  try {
    const response = await fetch(
      `${BASE}/products?sale=true&page=1&limit=${LIMIT}`,
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
        `Failed to fetch sale products: ${response.status}`
      );
    }

    const body =
      await response.json();

    return Array.isArray(
      body?.data?.products
    )
      ? body.data.products
      : [];
  } catch (error) {
    console.error(
      "SALE PRODUCTS ERROR:",
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
   COMPONENT
========================================================= */

export default function SaleProductsGrid() {
  const router =
    useRouter();

  const scrollRef =
    useRef(null);

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
     SCROLL
  ======================================================= */

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(false);

  /* =======================================================
     DRAG
  ======================================================= */

  const dragging =
    useRef(false);

  const dragStartX =
    useRef(0);

  const dragStartScroll =
    useRef(0);

  const hasDragged =
    useRef(false);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        setLoading(true);

        const result =
          await fetchSaleProducts();

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
        } catch (
          error
        ) {
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
     UPDATE SCROLL BUTTONS
  ======================================================= */

  const updateScrollButtons =
    useCallback(() => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      setCanScrollLeft(
        element.scrollLeft >
          5
      );

      setCanScrollRight(
        element.scrollLeft +
          element.clientWidth <
          element.scrollWidth -
            5
      );
    }, []);

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollButtons();

    const handleScroll = () => {
      updateScrollButtons();
    };

    element.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateScrollButtons
    );

    return () => {
      element.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        updateScrollButtons
      );
    };
  }, [
    products,
    updateScrollButtons,
  ]);

  /* =======================================================
     SCROLL SLIDER
  ======================================================= */

  const scrollSlider =
    (direction) => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      const amount =
        Math.max(
          element.clientWidth *
            0.86,
          300
        );

      element.scrollBy({
        left:
          direction === "next"
            ? amount
            : -amount,

        behavior: "smooth",
      });
    };

  /* =======================================================
     DRAG START
  ======================================================= */

  const handlePointerDown =
    (event) => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      if (
        event.target.closest(
          "button, a"
        )
      ) {
        return;
      }

      dragging.current =
        true;

      hasDragged.current =
        false;

      dragStartX.current =
        event.clientX;

      dragStartScroll.current =
        element.scrollLeft;

      element.setPointerCapture?.(
        event.pointerId
      );
    };

  /* =======================================================
     DRAG MOVE
  ======================================================= */

  const handlePointerMove =
    (event) => {
      if (
        !dragging.current
      ) {
        return;
      }

      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      const distance =
        event.clientX -
        dragStartX.current;

      if (
        Math.abs(distance) >
        5
      ) {
        hasDragged.current =
          true;
      }

      element.scrollLeft =
        dragStartScroll.current -
        distance;
    };

  /* =======================================================
     DRAG END
  ======================================================= */

  const handlePointerUp =
    (event) => {
      const element =
        scrollRef.current;

      if (
        element
      ) {
        try {
          element.releasePointerCapture?.(
            event.pointerId
          );
        } catch {
          // Ignore pointer capture errors.
        }
      }

      dragging.current =
        false;
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
              size?.name || ""
            )
              .trim()
              .toLowerCase() ===
            String(
              selectedSizeName
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
     LOGIN REDIRECT
  ======================================================= */

  const redirectToLogin =
    (
      redirect = "/"
    ) => {
      router.push(
        `/login?redirect=${encodeURIComponent(
          redirect
        )}`
      );
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
      } catch (
        error
      ) {
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
      } catch (
        error
      ) {
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
      } catch (
        error
      ) {
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
     VISIBLE PRODUCTS
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

  if (loading) {
    return (
      <section className="sale-section">
        <div className="sale-container">

          <div className="sale-heading-wrap">


            <h2 className="section-title sale-shimmer-text">
              SALE
            </h2>

            <div className="sale-divider" />


          </div>

          <div className="product-slider-shell">

            <button
              type="button"
              className="slider-arrow disabled"
              aria-label="Previous products"
              disabled
            >
              ‹
            </button>

            <div className="product-grid loading-grid">
              {Array.from({
                length: 4,
              }).map(
                (_, index) => (
                  <div
                    key={
                      index
                    }
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

            <button
              type="button"
              className="slider-arrow disabled"
              aria-label="Next products"
              disabled
            >
              ›
            </button>

          </div>

        </div>

        <style jsx>{`
          .sale-section {
            width: 100%;
            background: ${COLORS.page};
            padding: 58px 24px;
            box-sizing: border-box;
            overflow: hidden;
          }

          .sale-container {
            width: 100%;
            max-width: 1420px;
            margin: 0 auto;
          }

          .sale-heading-wrap {
            text-align: center;
            margin-bottom: 30px;
          }

          .sale-kicker {
            display: inline-block;
            margin-bottom: 11px;
            color: ${COLORS.muted};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 9px;
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0.24em;
          }

          .section-title {
            margin: 0;
            color: ${COLORS.accent};
            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;
            font-size: 33px;
            line-height: 1.1;
            font-weight: 500;
            letter-spacing: 0.02em;
          }

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
            width: 48px;
            height: 1px;
            margin: 13px auto 11px;
            background: ${COLORS.accent};
            opacity: 0.62;
          }

          .sale-subtitle {
            margin: 0;
            color: ${COLORS.muted};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 11px;
            line-height: 1.45;
          }

          .product-slider-shell {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .product-grid {
            width: 100%;
            display: grid;
            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );
            gap: 18px;
          }

          .loading-grid {
            overflow: hidden;
          }

          .slider-arrow {
            flex: 0 0 42px;
            width: 42px;
            height: 42px;
            border: 1px solid
              ${COLORS.border};
            border-radius: 50%;
            background:
              ${COLORS.page};
            color:
              ${COLORS.text};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            line-height: 1;
          }

          .slider-arrow.disabled {
            opacity: 0.3;
          }

          .product-skeleton-card {
            overflow: hidden;
            border: 1px solid
              rgba(
                123,
                127,
                92,
                0.15
              );
            border-radius: 12px;
            background:
              ${COLORS.page};
          }

          .product-skeleton-image {
            width: 100%;
            aspect-ratio: 1 / 0.9;
            background:
              #e8e9da;
            animation:
              skeletonPulse 1.4s
              ease-in-out
              infinite;
          }

          .product-skeleton-content {
            padding: 13px;
          }

          .product-skeleton-colors {
            display: flex;
            gap: 7px;
            margin-bottom: 9px;
          }

          .product-skeleton-colors span {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background:
              #e4e5db;
          }

          .product-skeleton-name {
            width: 70%;
            height: 17px;
            margin-bottom: 11px;
            border-radius: 4px;
            background:
              #e4e5db;
          }

          .product-skeleton-price {
            width: 40%;
            height: 20px;
            margin-bottom: 12px;
            border-radius: 4px;
            background:
              #e4e5db;
          }

          .product-skeleton-button {
            width: 100%;
            height: 40px;
            border-radius: 6px;
            background:
              #e4e5db;
          }

          @keyframes skeletonPulse {
            0%,
            100% {
              opacity: 0.55;
            }

            50% {
              opacity: 1;
            }
          }

          @media (max-width: 900px) {
            .product-slider-shell {
              gap: 8px;
            }

            .slider-arrow {
              flex-basis: 36px;
              width: 36px;
              height: 36px;
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
              gap: 10px;
            }
          }

          @media (max-width: 700px) {
            .sale-section {
              padding: 42px 8px;
            }

            .sale-heading-wrap {
              margin-bottom: 22px;
            }

            .section-title {
              font-size: 27px;
            }

            .sale-kicker {
              font-size: 8px;
              letter-spacing: 0.19em;
            }

            .sale-subtitle {
              font-size: 10px;
            }

            .slider-arrow {
              display: none;
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
              gap: 9px;
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
      <section className="sale-section">

        <div className="sale-container">

          <div className="sale-heading-wrap">


            <h2 className="section-title sale-shimmer-text">
              SALE
            </h2>



          </div>

          <div className="empty-sale">
            <div className="empty-sale-icon">
              %
            </div>

            <p>
              No sale products
              available right now.
            </p>

            <Link
              href="/"
              className="empty-sale-link"
            >
              Continue Shopping →
            </Link>
          </div>

        </div>

        <style jsx>{`
          .sale-section {
            width: 100%;
            background:
              ${COLORS.page};
            padding:
              55px 20px
              65px;
          }

          .sale-container {
            width: 100%;
            max-width:
              1420px;
            margin: 0 auto;
          }

          .sale-heading-wrap {
            text-align:
              center;
            margin-bottom:
              28px;
          }

          .sale-kicker {
            display: inline-block;
            margin-bottom:
              11px;
            color:
              ${COLORS.muted};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing:
              0.24em;
          }

          .section-title {
            margin: 0;
            color:
              ${COLORS.accent};
            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;
            font-size: 33px;
            font-weight: 500;
          }

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
            width: 48px;
            height: 1px;
            margin:
              13px auto
              11px;
            background:
              ${COLORS.accent};
          }

          .sale-subtitle {
            margin: 0;
            color:
              ${COLORS.muted};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 11px;
          }

          .empty-sale {
            min-height:
              230px;
            display: flex;
            flex-direction:
              column;
            align-items:
              center;
            justify-content:
              center;
            text-align:
              center;
          }

          .empty-sale-icon {
            width: 58px;
            height: 58px;
            border:
              1px solid
                ${COLORS.border};
            border-radius:
              50%;
            display: flex;
            align-items:
              center;
            justify-content:
              center;
            color:
              ${COLORS.accent};
            font-family:
              "Tobias TRIAL",
              Georgia,
              serif;
            font-size: 26px;
            margin-bottom:
              16px;
          }

          .empty-sale p {
            margin: 0 0 12px;
            color:
              ${COLORS.muted};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 13px;
          }

          .empty-sale-link {
            color:
              ${COLORS.accent};
            font-family:
              "Mona Sans",
              Arial,
              sans-serif;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="sale-section">

      <div className="sale-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sale-heading-wrap">



          <h2 className="section-title sale-shimmer-text">
            SALE
          </h2>

          <div className="sale-divider" />



        </div>

        {/* =================================================
            SLIDER
        ================================================= */}

        <div className="slider-wrapper">

          {/* LEFT */}

          <button
            type="button"
            className="slider-arrow slider-arrow-left"
            disabled={
              !canScrollLeft
            }
            onClick={() =>
              scrollSlider(
                "prev"
              )
            }
            aria-label="Previous sale products"
          >
            ‹
          </button>

          {/* PRODUCTS */}

          <div
            ref={scrollRef}
            className="sale-slider"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              handlePointerUp
            }
            onPointerCancel={
              handlePointerUp
            }
            onPointerLeave={(
              event
            ) => {
              if (
                dragging.current
              ) {
                handlePointerUp(
                  event
                );
              }
            }}
          >

            {visibleProducts.map(
              (
                product,
                index
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

                return (
                  <article
                    key={
                      product._id ||
                      product.slug ||
                      index
                    }
                    className="product-card"
                  >

                    {/* ==================================
                        IMAGE
                    ================================== */}

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
                        ) => {
                          if (
                            hasDragged.current
                          ) {
                            event.preventDefault();
                          }

                          event.stopPropagation();
                        }}
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

                          {/* SALE */}

                          <span className="sale-badge">
                            SALE
                          </span>

                          {/* DISCOUNT */}

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

                    {/* ==================================
                        CONTENT
                    ================================== */}

                    <div className="product-content">

                      {/* COLOUR */}

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
                                  )
                                    .toLowerCase() ===
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
                                    aria-label={`Select colour ${colorValue}`}
                                  />
                                );
                              }
                            )}

                          </div>

                        </div>
                      )}

                      {/* NAME */}

                      <Link
                        href={`/products/${product.slug}`}
                        className="product-name"
                      >
                        {
                          product.name
                        }
                      </Link>

                      {/* PRICE */}

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

                      {/* SIZE */}

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
                                    {
                                      sizeName
                                    }
                                  </button>
                                );
                              }
                            )}

                          </div>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div
                        className="product-action-area"
                        onClick={(
                          event
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >

                        {quantity >
                          0 ? (
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

                        {/* <button
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
                        </button> */}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

          {/* RIGHT */}

          <button
            type="button"
            className="slider-arrow slider-arrow-right"
            disabled={
              !canScrollRight
            }
            onClick={() =>
              scrollSlider(
                "next"
              )
            }
            aria-label="Next sale products"
          >
            ›
          </button>

        </div>

        {/* =================================================
            SEE ALL
        ================================================= */}

        <div className="sale-see-all-wrap">
          <Link
            href="/sale"
            
            rel="noopener noreferrer"
            className="sale-see-all-button"
          >
            See All Sale Products
          </Link>
        </div>

      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx global>{`

        /* ==================================================
           SECTION
        ================================================== */

        .sale-section {
          width: 100%;
          background:
            ${COLORS.page};
          padding:
            58px 24px 65px;
          box-sizing:
            border-box;
          overflow:
            hidden;
        }

        .sale-container {
          width: 100%;
          max-width:
            1420px;
          margin:
            0 auto;
        }

        /* ==================================================
           HEADING
        ================================================== */

        .sale-heading-wrap {
          text-align:
            center;
          margin-bottom:
            30px;
        }

        .sale-kicker {
          display:
            inline-block;

          margin-bottom:
            11px;

          color:
            ${COLORS.muted};

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
            0.24em;
        }

        .section-title {
          margin:
            0;

          color:
            ${COLORS.accent};

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            32px;

          line-height:
            1.15;

          font-weight:
            500;

          letter-spacing:
            0.02em;
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
          width:
            50px;

          height:
            1px;

          margin:
            14px auto
            11px;

          background:
            ${COLORS.accent};

          opacity:
            0.62;
        }

        .sale-subtitle {
          margin:
            0;

          color:
            ${COLORS.muted};

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            11px;

          line-height:
            1.5;

          letter-spacing:
            0.015em;
        }

        /* ==================================================
           SLIDER WRAPPER
        ================================================== */

        .slider-wrapper {
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          gap:
            14px;
        }

        .sale-slider {
          width:
            100%;

          min-width:
            0;

          display:
            grid;

          grid-auto-flow:
            column;

          grid-auto-columns:
            calc(
              (
                100% -
                54px
              ) / 4
            );

          gap:
            18px;

          overflow-x:
            auto;

          overflow-y:
            hidden;

          scroll-behavior:
            smooth;

          scrollbar-width:
            none;

          cursor:
            grab;

          user-select:
            none;

          overscroll-behavior-x:
            contain;

          touch-action:
            pan-y;
        }

        .sale-slider::-webkit-scrollbar {
          display:
            none;
        }

        .sale-slider:active {
          cursor:
            grabbing;
        }

        /* ==================================================
           ARROWS
        ================================================== */

        .slider-arrow {
          flex:
            0 0 42px;

          width:
            42px;

          height:
            42px;

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
            ${COLORS.text};

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            25px;

          line-height:
            1;

          cursor:
            pointer;

          transition:
            background
              0.2s ease,
            color
              0.2s ease,
            border-color
              0.2s ease,
            transform
              0.2s ease;
        }

        .slider-arrow:hover:not(
          :disabled
        ) {
          background:
            ${COLORS.accent};

          border-color:
            ${COLORS.accent};

          color:
            #ffffff;

          transform:
            scale(
              1.04
            );
        }

        .slider-arrow:disabled {
          opacity:
            0.28;

          cursor:
            not-allowed;
        }

        /* ==================================================
           SEE ALL BUTTON
        ================================================== */

        .sale-see-all-wrap {
          width:
            100%;

          display:
            flex;

          justify-content:
            center;

          margin-top:
            36px;
        }

        .sale-see-all-button {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            48px;

          padding:
            0 30px;

          border:
            1px solid
            #111111;

          border-radius:
            999px;

          background:
            #111111;

          color:
            #ffffff;

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

          letter-spacing:
            0.08em;

          text-decoration:
            none;

          cursor:
            pointer;

          transition:
            background
              0.2s ease,
            border-color
              0.2s ease,
            transform
              0.2s ease;
        }

        .sale-see-all-button:hover {
          background:
            ${COLORS.accent};

          border-color:
            ${COLORS.accent};

          transform:
            translateY(-1px);
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
           IMAGE
        ================================================== */

        .product-image-link {
          position:
            relative;

          width:
            100%;

          display:
            block;

          touch-action:
            manipulation;
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
           SALE BADGE
        ================================================== */

        .sale-badge {
          position:
            absolute;

          top:
            10px;

          left:
            10px;

          z-index:
            8;

          min-height:
            27px;

          padding:
            0 9px;

          border-radius:
            7px;

          background:
            #111111;

          color:
            #ffffff;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

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
            0.12em;
        }

        /* ==================================================
           DISCOUNT
        ================================================== */

        .product-discount-top {
          position:
            absolute;

          top:
            10px;

          left:
            64px;

          z-index:
            8;

          min-height:
            27px;

          padding:
            0 8px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

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

        .product-colours-block.missing {
          border-radius:
            6px;
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

        .product-size-section.missing {
          border-color:
            rgba(
              123,
              127,
              92,
              0.42
            );
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

        .product-add-cart {
          width:
            100%;

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
            #111111;

          color:
            #ffffff;

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
            0.08em;

          cursor:
            pointer;

          transition:
            background
              0.2s ease,
            border-color
              0.2s ease;
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
          width:
            100%;

          min-height:
            40px;

          display:
            grid;

          grid-template-columns:
            40px
            1fr
            40px;

          border:
            1px solid
            #111111;

          border-radius:
            6px;

          overflow:
            hidden;

          background:
            #111111;
        }

        .product-quantity button {
          border:
            none;

          background:
            #111111;

          color:
            #ffffff;

          font-size:
            18px;

          line-height:
            1;

          cursor:
            pointer;
        }

        .product-quantity button:hover {
          background:
            ${COLORS.accent};
        }

        .product-quantity span {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            #ffffff;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            12px;

          font-weight:
            700;

          border-left:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          border-right:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
        }

        .product-bulk-button {
          width:
            100%;

          min-height:
            35px;

          padding:
            0 10px;

          border:
            1px solid
            rgba(
              123,
              127,
              92,
              0.34
            );

          border-radius:
            6px;

          background:
            transparent;

          color:
            ${COLORS.text};

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
            0.055em;

          cursor:
            pointer;

          transition:
            background
              0.2s ease,
            border-color
              0.2s ease;
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
           RESPONSIVE
        ================================================== */

        @media (max-width: 1100px) {
          .sale-slider {
            grid-auto-columns:
              calc(
                (
                  100% -
                  18px
                ) / 2
              );
          }
        }

        @media (max-width: 900px) {
          .slider-wrapper {
            gap:
              8px;
          }

          .slider-arrow {
            flex-basis:
              36px;

            width:
              36px;

            height:
              36px;
          }

          .sale-slider {
            grid-auto-columns:
              calc(
                (
                  100% -
                  10px
                ) / 2
              );

            gap:
              10px;
          }
        }

        @media (max-width: 700px) {
          .sale-section {
            padding:
              42px 8px
              50px;
          }

          .sale-heading-wrap {
            margin-bottom:
              22px;
          }

          .section-title {
            font-size:
              27px;
          }

          .sale-kicker {
            font-size:
              8px;

            letter-spacing:
              0.19em;
          }

          .sale-subtitle {
            font-size:
              10px;
          }

          .slider-arrow {
            display:
              none;
          }

          .sale-slider {
            grid-auto-columns:
              calc(
                (
                  100% -
                  9px
                ) / 2
              );

            gap:
              9px;
          }

          .product-content {
            padding:
              9px;
          }

          .product-name {
            font-size:
              13px;
            min-height:
              34px;
          }

          .product-selling-price {
            font-size:
              16px;
          }

          .product-actual-price {
            font-size:
              10px;
          }

          .product-wishlist {
            top:
              7px;

            right:
              7px;

            width:
              32px;

            height:
              32px;

            font-size:
              18px;
          }

          .sale-badge {
            top:
              7px;

            left:
              7px;

            min-height:
              23px;

            padding:
              0 7px;

            font-size:
              8px;
          }

          .product-discount-top {
            top:
              7px;

            left:
              54px;

            min-height:
              23px;

            font-size:
              8px;

            padding:
              0 6px;
          }

          .product-add-cart {
            min-height:
              36px;

            font-size:
              9px;
          }

          .product-bulk-button {
            min-height:
              32px;

            font-size:
              8px;
          }

          .product-quantity {
            min-height:
              36px;

            grid-template-columns:
              34px
              1fr
              34px;
          }

          .product-size-button {
            min-width:
              31px;

            min-height:
              24px;

            padding:
              0 6px;
          }

          .sale-see-all-wrap {
            margin-top:
              26px;
          }

          .sale-see-all-button {
            min-height:
              44px;

            padding:
              0 24px;

            font-size:
              11px;
          }
        }

      `}</style>

    </section>
  );
}