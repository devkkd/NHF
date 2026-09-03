"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  use,
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

const RECOMMENDATION_LIMIT = 12;

/* =========================================================
   SAMPLE PRODUCT
   Only retained as fallback/testing data from existing page.
========================================================= */

const SAMPLE_PRODUCT = {
  name:
    "Percal Hand Block Cotton Double Bed Sheets with 2 pillow KING SIZE",

  slug: "block",

  sku: "HBEE 04",

  item:
    "100% HAND BLOCK COTTON PERCAL BEDSHEET WITH 2 PILLOW",

  threadCount: "210 TC",

  colors: [
    "#ffffff",
    "#7b7f5c",
    "#d8c4a9",
    "#9bb7d4",
    "#e3b5b5",
  ],

  sizes: [
    {
      name: "Single",
      actualPrice: 2499,
      sellingPrice: 1999,
    },
    {
      name: "Double",
      actualPrice: 2999,
      sellingPrice: 2399,
    },
    {
      name: "Queen",
      actualPrice: 3499,
      sellingPrice: 2799,
    },
    {
      name: "King",
      actualPrice: 3999,
      sellingPrice: 3199,
    },
  ],

  actualPrice: 3999,

  sellingPrice: 3199,

  shippingCost: 150,

  mainImage:
    "/images/product/bedsheet.jpg",

  galleryImages: [
    "/images/product/new1.png",
    "/images/product/new2.png",
    "/images/product-1.jpg",
    "/images/product-2.jpg",
    "/images/product-3.jpg",
  ],

  fabric: "Cotton",

  washType: "Hand Wash",

  material: "Cotton",

  packagingType:
    "Each Item Packed Separately",

  size: "90x108",

  type: "BEDSHEET",

  gsm: "210 TC",

  countryOfOrigin:
    "Made In India",

  usageApplication:
    "Home",

  bedSize: "Double",

  handmade: "Yes",

  design: "Printed",

  pattern: "Printed",

  description:
    "Each panel in this bedcover began as an individual block-printed cloth — selected for pattern, tone, and the way it sits alongside its neighbours. Assembled by hand into a patchwork that is both intentional and warmly imperfect, it is then layered and worked through with kantha running stitch from edge to edge. The result is something that rewards close looking; you'll find something new in it every time.\n\nAvailable in double and king sizes. The indigo-dominant colourway works equally well on light and dark lines, and across contemporary and classic bedroom aesthetics.",

  features: [
    "Hand block patchwork construction — each panel individually printed",
    "Traditional kantha running stitch throughout",
    "Adjustable sizing on request for custom orders",
    "Available as part of a coordinated set with matching cushion covers",
    "Suitable for dry-cleaning or gentle machine wash",
  ],

  materials: [
    "100% fine cotton — breathable, soft, and dye-receptive",
    "Natural pigment dyes — colourfast and skin-friendly",
    "Hand-carved wooden block printing — teak or sheesham blocks",
    "Cotton kantha thread throughout",
  ],

  careInstructions: [
    "Gentle machine wash at 30°C or cool hand wash",
    "Do not bleach — preserves natural dye integrity",
    "Dry flat in shade to protect colours",
    "Iron on medium heat from reverse — kantha stitch is delicate",
    "The fabric softens beautifully with every wash",
  ],

  moreInformation:
    "Hand block Allover Bedcover Soft and Cool Finish Luxurious 100% Cotton Bedding like those found in hotels and celebrity homes. Comfort, quality and opulence sets our luxury bedding class apart. You would resist any other fabric after using these rich and soft bed linens.\n\nThese finest luxury bed linens keep the bed cool and is soft to your skin. Product colour may vary and not appear exact as shown in the image.",
};

/* =========================================================
   FETCH SINGLE PRODUCT
========================================================= */

async function fetchProduct(slug) {
  try {
    const response = await fetch(
      `${BASE}/products/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const body =
      await response.json();

    return (
      body?.data?.product ||
      null
    );
  } catch (error) {
    console.error(
      "PRODUCT FETCH ERROR:",
      error
    );

    return null;
  }
}

/* =========================================================
   FETCH RECOMMENDATIONS
========================================================= */

async function fetchRecommendations(
  currentSlug
) {
  try {
    /*
     * Backend product listing.
     *
     * sort=-createdAt is supplied so controllers
     * that support sorting return latest products.
     *
     * Controllers that ignore unknown query params
     * still return normal products.
     */

    const response =
      await fetch(
        `${BASE}/products?sort=-createdAt&page=1&limit=${RECOMMENDATION_LIMIT + 4}`,
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return [];
    }

    const body =
      await response.json();

    const list =
      Array.isArray(
        body?.data?.products
      )
        ? body.data.products
        : Array.isArray(
            body?.products
          )
        ? body.products
        : Array.isArray(
            body?.data
          )
        ? body.data
        : [];

    return list
      .filter(
        (item) =>
          item?.slug &&
          item.slug !== currentSlug &&
          item?.isActive !== false
      )
      .slice(
        0,
        RECOMMENDATION_LIMIT
      );
  } catch (error) {
    console.error(
      "RECOMMENDATIONS FETCH ERROR:",
      error
    );

    return [];
  }
}

/* =========================================================
   PRICE HELPERS
========================================================= */

function calculateDiscount(
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
    ((actual - selling) /
      actual) *
      100
  );
}

function formatPrice(value) {
  const amount =
    Number(value || 0);

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
   PRODUCT IMAGES
========================================================= */

function getImages(product) {
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
   SIZE DATA
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
   COLOR DATA
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
   PAGE
========================================================= */

export default function ProductDetailPage({
  params,
}) {
  const { slug } =
    use(params);

  const router =
    useRouter();

  /* =======================================================
     MAIN PRODUCT STATE
  ======================================================= */

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    quantity,
    setQuantity,
  ] = useState(0);

  const [
    showMoreInfo,
    setShowMoreInfo,
  ] = useState(false);

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);

  const [
    activeColor,
    setActiveColor,
  ] = useState(0);

  const [
    activeSize,
    setActiveSize,
  ] = useState(0);

  /* =======================================================
     RECOMMENDATIONS
  ======================================================= */

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [
    recommendationsLoading,
    setRecommendationsLoading,
  ] = useState(true);

  const [
    recommendationIndex,
    setRecommendationIndex,
  ] = useState(0);

  const [
    recommendationQuantities,
    setRecommendationQuantities,
  ] = useState({});

  const [
    recommendationColors,
    setRecommendationColors,
  ] = useState({});

  const [
    recommendationSizes,
    setRecommendationSizes,
  ] = useState({});

  const [
    recommendationWishlist,
    setRecommendationWishlist,
  ] = useState({});

  /* =======================================================
     DESKTOP HOVER IMAGES
  ======================================================= */

  const [
    hoveredRecommendations,
    setHoveredRecommendations,
  ] = useState({});

  /* =======================================================
     RESPONSIVE
  ======================================================= */

  useEffect(() => {
    const check =
      () => {
        setIsMobile(
          window.innerWidth <=
            768
        );
      };

    check();

    window.addEventListener(
      "resize",
      check
    );

    return () => {
      window.removeEventListener(
        "resize",
        check
      );
    };
  }, []);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;

    setLoading(true);

    fetchProduct(slug).then(
      (result) => {
        if (!mounted) {
          return;
        }

        /*
         * Keep existing fallback behaviour.
         */

        setProduct(
          result || {
            ...SAMPLE_PRODUCT,
            slug,
          }
        );

        setActiveSize(0);
        setActiveImage(0);
        setActiveColor(0);
        setQuantity(0);

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* =======================================================
     LOAD RECOMMENDATIONS
  ======================================================= */

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;

    setRecommendationsLoading(
      true
    );

    fetchRecommendations(
      slug
    ).then((result) => {
      if (!mounted) {
        return;
      }

      setRecommendations(
        result
      );

      setRecommendationIndex(
        0
      );

      setRecommendationsLoading(
        false
      );
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* =======================================================
     LOAD RECOMMENDATION WISHLIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const load =
      async () => {
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

          if (mounted) {
            setRecommendationWishlist(
              map
            );
          }
        } catch (
          error
        ) {
          console.error(
            "RECOMMENDATION WISHLIST ERROR:",
            error
          );
        }
      };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOGIN
  ======================================================= */

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

  /* =======================================================
     LOGIN REQUIRED
  ======================================================= */

  const showLoginRequired =
    (
      type,
      pendingProduct = product
    ) => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const currentUrl =
        window.location.pathname +
        window.location.search;

      if (
        type === "cart"
      ) {
        sessionStorage.setItem(
          "pendingCartProduct",
          JSON.stringify({
            product:
              pendingProduct,
            quantity: 1,
          })
        );

        sessionStorage.setItem(
          "pendingCartRedirect",
          currentUrl
        );
      }

      if (
        type === "buy-now"
      ) {
        sessionStorage.setItem(
          "pendingBuyNowProduct",
          JSON.stringify({
            product:
              pendingProduct,
            quantity: 1,
          })
        );
      }

      toast.error(
        "Please login first",
        {
          duration:
            2200,

          position:
            "top-right",
        }
      );

      setTimeout(() => {
        router.push(
          `/login?redirect=${encodeURIComponent(
            type ===
              "buy-now"
              ? "/checkout"
              : currentUrl
          )}`
        );
      }, 450);
    };

  /* =======================================================
     MAIN PRODUCT IMAGES
  ======================================================= */

  const rawImages =
    product
      ? [
          product.mainImage,
          ...(product.galleryImages ||
            []),
        ].filter(Boolean)
      : [];

  const allImages =
    rawImages.length > 0
      ? rawImages
      : [
          SAMPLE_PRODUCT.mainImage,
          ...SAMPLE_PRODUCT.galleryImages,
        ];

  /* =======================================================
     MAIN PRODUCT SIZES
  ======================================================= */

  const availableSizes =
    useMemo(() => {
      if (
        !product ||
        !Array.isArray(
          product.sizes
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
    }, [product]);

  /* =======================================================
     SELECTED SIZE
  ======================================================= */

  const selectedSize =
    availableSizes.length >
    0
      ? availableSizes[
          Math.min(
            activeSize,
            availableSizes.length -
              1
          )
        ]
      : null;

  /* =======================================================
     MAIN DISPLAY PRICING
  ======================================================= */

  const displayActualPrice =
    selectedSize
      ? Number(
          selectedSize.actualPrice ||
            0
        )
      : Number(
          product?.actualPrice ??
            product?.price ??
            0
        );

  const displaySellingPrice =
    selectedSize
      ? Number(
          selectedSize.sellingPrice ||
            0
        )
      : Number(
          product?.sellingPrice ??
            product?.price ??
            0
        );

  const displayDiscount =
    calculateDiscount(
      displayActualPrice,
      displaySellingPrice
    );

  const shippingCost =
    Number(
      product?.shippingCost ||
        0
    );

  /* =======================================================
     MAIN PRODUCT SELECT SIZE
  ======================================================= */

  const handleSizeSelect =
    (index) => {
      setActiveSize(index);
    };

  /* =======================================================
     MAIN ADD TO CART
  ======================================================= */

  const handleAddToCart =
    async () => {
      if (!product) {
        return;
      }

      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "cart",
          {
            ...product,
            selectedSize:
              selectedSize
                ? selectedSize.name
                : "",

            selectedSizeActualPrice:
              displayActualPrice,

            selectedSizeSellingPrice:
              displaySellingPrice,

            selectedShippingCost:
              shippingCost,
          }
        );

        return;
      }

      const cartProduct = {
        ...product,

        slug:
          product.slug,

        selectedColor:
          product.colors?.[
            activeColor
          ] || "",

        selectedColorName:
          product.colors?.[
            activeColor
          ] || "",

        selectedSize:
          selectedSize
            ? selectedSize.name
            : "",

        selectedVariant:
          selectedSize,

        selectedSizeActualPrice:
          displayActualPrice,

        selectedSizeSellingPrice:
          displaySellingPrice,

        selectedSellingPrice:
          displaySellingPrice,

        selectedActualPrice:
          displayActualPrice,

        selectedShippingCost:
          shippingCost,

        price:
          displaySellingPrice,

        sellingPrice:
          displaySellingPrice,

        actualPrice:
          displayActualPrice,
      };

      try {
        await addToCart(
          cartProduct,
          1
        );

        setQuantity(1);

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
     BUY NOW
  ======================================================= */

  const handleBuyNow =
    async () => {
      if (!product) {
        return;
      }

      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "buy-now",
          {
            ...product,

            selectedColor:
              product.colors?.[
                activeColor
              ] || "",

            selectedSize:
              selectedSize
                ? selectedSize.name
                : "",

            selectedSizeActualPrice:
              displayActualPrice,

            selectedSizeSellingPrice:
              displaySellingPrice,

            selectedShippingCost:
              shippingCost,
          }
        );

        return;
      }

      const cartProduct = {
        ...product,

        slug:
          product.slug,

        selectedColor:
          product.colors?.[
            activeColor
          ] || "",

        selectedColorName:
          product.colors?.[
            activeColor
          ] || "",

        selectedSize:
          selectedSize
            ? selectedSize.name
            : "",

        selectedVariant:
          selectedSize,

        selectedSizeActualPrice:
          displayActualPrice,

        selectedSizeSellingPrice:
          displaySellingPrice,

        selectedSellingPrice:
          displaySellingPrice,

        selectedActualPrice:
          displayActualPrice,

        selectedShippingCost:
          shippingCost,

        price:
          displaySellingPrice,

        sellingPrice:
          displaySellingPrice,

        actualPrice:
          displayActualPrice,
      };

      try {
        await addToCart(
          cartProduct,
          1
        );

        router.push(
          "/cart"
        );
      } catch (
        error
      ) {
        console.error(
          "BUY NOW ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to continue.",
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
     MAIN QTY
  ======================================================= */

  const decreaseMainQty =
    async () => {
      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "cart"
        );

        return;
      }

      const next =
        quantity - 1;

      try {
        await updateQty(
          product?._id ||
            product?.slug,
          Math.max(
            next,
            0
          )
        );

        setQuantity(
          Math.max(
            next,
            0
          )
        );
      } catch (
        error
      ) {
        console.error(
          "MAIN DECREASE ERROR:",
          error
        );
      }
    };

  const increaseMainQty =
    async () => {
      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "cart"
        );

        return;
      }

      const next =
        quantity + 1;

      try {
        await updateQty(
          product?._id ||
            product?.slug,
          next
        );

        setQuantity(
          next
        );
      } catch (
        error
      ) {
        console.error(
          "MAIN INCREASE ERROR:",
          error
        );
      }
    };

  /* =======================================================
     MAIN IMAGE NAVIGATION
  ======================================================= */

  const handlePrevImage =
    (event) => {
      event?.stopPropagation();

      setActiveImage(
        (previous) =>
          previous === 0
            ? allImages.length -
              1
            : previous - 1
      );
    };

  const handleNextImage =
    (event) => {
      event?.stopPropagation();

      setActiveImage(
        (previous) =>
          previous ===
          allImages.length -
            1
            ? 0
            : previous + 1
      );
    };

  /* =======================================================
     SPECS
  ======================================================= */

  const builtSpecs =
    product
      ? [
          {
            label: "Fabric",
            value:
              product.fabric ||
              "",
          },

          {
            label: "Wash Type",
            value:
              product.washType ||
              "",
          },

          {
            label: "Material",
            value:
              product.material ||
              "",
          },

          {
            label: "Packaging Type",
            value:
              product.packagingType ||
              "",
          },

          {
            label: "Size (inch)",
            value:
              product.size ||
              "",
          },

          {
            label: "Type",
            value:
              product.type ||
              "",
          },

          {
            label: "GSM",
            value:
              product.gsm ||
              "",
          },

          {
            label:
              "Country of Origin",
            value:
              product.countryOfOrigin ||
              "",
          },

          {
            label:
              "Usage/Application",
            value:
              product.usageApplication ||
              "",
          },

          {
            label:
              "Bed Size",
            value:
              product.bedSize ||
              "",
          },

          {
            label:
              "Thread Count",
            value:
              product.threadCount ||
              "",
          },

          {
            label: "Pattern",
            value:
              product.pattern ||
              "",
          },

          {
            label: "Handmade",
            value:
              product.handmade ||
              "",
          },

          {
            label: "Design",
            value:
              product.design ||
              "",
          },

          ...(product.specs ||
            []),
        ].filter(
          (spec) =>
            Boolean(
              spec.value
            )
        )
      : [];

  /* =======================================================
     RECOMMENDATION HELPERS
  ======================================================= */

  const getRecommendationSelectedSize =
    (
      item
    ) => {
      const sizes =
        getSizes(item);

      const selectedName =
        recommendationSizes[
          item.slug
        ];

      return (
        sizes.find(
          (size) =>
            String(
              size?.name ||
                ""
            )
              .trim()
              .toLowerCase() ===
            String(
              selectedName ||
                ""
            )
              .trim()
              .toLowerCase()
        ) ||
        null
      );
    };

  const getRecommendationPricing =
    (
      item
    ) => {
      const selectedSize =
        getRecommendationSelectedSize(
          item
        );

      if (
        selectedSize
      ) {
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
            item?.actualPrice ??
              item?.price ??
              0
          ),

        sellingPrice:
          Number(
            item?.sellingPrice ??
              item?.price ??
              0
          ),
      };
    };

  /* =======================================================
     RECOMMENDATION CART PRODUCT
  ======================================================= */

  const buildRecommendationCartProduct =
    (item) => {
      const selectedSize =
        getRecommendationSelectedSize(
          item
        );

      const selectedColor =
        recommendationColors[
          item.slug
        ] || "";

      const pricing =
        getRecommendationPricing(
          item
        );

      return {
        ...item,

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
            item.shippingCost ||
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
     VALIDATE RECOMMENDATION
  ======================================================= */

  const validateRecommendation =
    (item) => {
      const colors =
        getColors(item);

      const sizes =
        getSizes(item);

      if (
        colors.length >
          0 &&
        !recommendationColors[
          item.slug
        ]
      ) {
        toast.error(
          "Please select colour first.",
          {
            duration:
              1700,
            position:
              "top-right",
          }
        );

        return false;
      }

      if (
        sizes.length >
          0 &&
        !recommendationSizes[
          item.slug
        ]
      ) {
        toast.error(
          "Please select size first.",
          {
            duration:
              1700,
            position:
              "top-right",
          }
        );

        return false;
      }

      return true;
    };

  /* =======================================================
     RECOMMENDATION COLOR
  ======================================================= */

  const selectRecommendationColor =
    (
      event,
      item,
      color
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setRecommendationColors(
        (current) => ({
          ...current,
          [item.slug]:
            color,
        })
      );

      setRecommendationQuantities(
        (current) => ({
          ...current,
          [item.slug]:
            0,
        })
      );
    };

  /* =======================================================
     RECOMMENDATION SIZE
  ======================================================= */

  const selectRecommendationSize =
    (
      event,
      item,
      sizeName
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setRecommendationSizes(
        (current) => ({
          ...current,
          [item.slug]:
            sizeName,
        })
      );

      setRecommendationQuantities(
        (current) => ({
          ...current,
          [item.slug]:
            0,
        })
      );
    };

  /* =======================================================
     RECOMMENDATION WISHLIST
  ======================================================= */

  const handleRecommendationWishlist =
    async (
      event,
      item
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "cart",
          item
        );

        return;
      }

      try {
        const saved =
          await toggleWishlist(
            item
          );

        setRecommendationWishlist(
          (current) => {
            const copy = {
              ...current,
            };

            if (saved) {
              copy[
                item.slug
              ] = true;
            } else {
              delete copy[
                item.slug
              ];
            }

            return copy;
          }
        );

        toast.success(
          saved
            ? "Added to wishlist"
            : "Removed from wishlist",
          {
            duration:
              1400,
            position:
              "top-right",
          }
        );
      } catch (
        error
      ) {
        console.error(
          "RECOMMENDATION WISHLIST ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to update wishlist.",
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
     RECOMMENDATION ADD CART
  ======================================================= */

  const handleRecommendationCart =
    async (
      event,
      item
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !validateRecommendation(
          item
        )
      ) {
        return;
      }

      if (
        !isLoggedIn()
      ) {
        showLoginRequired(
          "cart",
          buildRecommendationCartProduct(
            item
          )
        );

        return;
      }

      try {
        const cartProduct =
          buildRecommendationCartProduct(
            item
          );

        await addToCart(
          cartProduct,
          1
        );

        setRecommendationQuantities(
          (current) => ({
            ...current,
            [item.slug]:
              1,
        })
        );

        toast.success(
          "Added to cart",
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
          "RECOMMENDATION CART ERROR:",
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
     RECOMMENDATION QUANTITY
  ======================================================= */

  const increaseRecommendationQty =
    async (
      event,
      item
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !validateRecommendation(
          item
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
        recommendationQuantities[
          item.slug
        ] || 1;

      const next =
        current + 1;

      try {
        await updateQty(
          item._id ||
            item.slug,
          next
        );

        setRecommendationQuantities(
          (previous) => ({
            ...previous,
            [item.slug]:
              next,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "RECOMMENDATION INCREASE ERROR:",
          error
        );
      }
    };

  const decreaseRecommendationQty =
    async (
      event,
      item
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        return;
      }

      const current =
        recommendationQuantities[
          item.slug
        ] || 1;

      const next =
        current - 1;

      try {
        await updateQty(
          item._id ||
            item.slug,
          Math.max(
            next,
            0
          )
        );

        if (
          next <= 0
        ) {
          setRecommendationQuantities(
            (previous) => {
              const copy = {
                ...previous,
              };

              delete copy[
                item.slug
              ];

              return copy;
            }
          );

          return;
        }

        setRecommendationQuantities(
          (previous) => ({
            ...previous,
            [item.slug]:
              next,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "RECOMMENDATION DECREASE ERROR:",
          error
        );
      }
    };

  /* =======================================================
     RECOMMENDATION SLIDER
  ======================================================= */

  const visibleRecommendationCount =
    isMobile ? 2 : 4;

  const maxRecommendationIndex =
    Math.max(
      recommendations.length -
        visibleRecommendationCount,
      0
    );

  const nextRecommendations =
    () => {
      setRecommendationIndex(
        (current) =>
          current >=
          maxRecommendationIndex
            ? 0
            : current + 1
      );
    };

  const prevRecommendations =
    () => {
      setRecommendationIndex(
        (current) =>
          current <= 0
            ? maxRecommendationIndex
            : current - 1
      );
    };

  /* =======================================================
     AUTO SLIDE
  ======================================================= */

  useEffect(() => {
    if (
      recommendations.length <=
      visibleRecommendationCount
    ) {
      return;
    }

    const timer =
      setInterval(
        () => {
          setRecommendationIndex(
            (current) =>
              current >=
              maxRecommendationIndex
                ? 0
                : current + 1
          );
        },
        4200
      );

    return () => {
      clearInterval(
        timer
      );
    };
  }, [
    recommendations.length,
    visibleRecommendationCount,
    maxRecommendationIndex,
  ]);

  /* =======================================================
     LOADING MAIN PRODUCT
  ======================================================= */

  if (loading) {
    return (
      <div className="page-bg">

        <div className="outer-wrap">

          <div className="product-layout">

            <div
              className="loading-main"
            />

            <div className="loading-info">

              <div className="loading-title" />

              <div className="loading-line" />

              <div className="loading-box" />

              <div className="loading-box large" />

            </div>

          </div>

        </div>

        <style jsx>{`

          .page-bg {
            min-height:
              100vh;

            background:
              #fdfff1;
          }

          .outer-wrap {
            max-width:
              1380px;

            margin:
              0 auto;

            padding:
              110px 40px 80px;
          }

          .product-layout {
            display:
              grid;

            grid-template-columns:
              48% 52%;

            gap:
              0 44px;
          }

          .loading-main {
            width:
              100%;

            height:
              540px;

            border-radius:
              16px;

            background:
              #e8ebe0;
          }

          .loading-info {
            padding:
              20px 0;
          }

          .loading-title {
            width:
              75%;

            height:
              32px;

            background:
              #e8ebe0;

            border-radius:
              5px;

            margin-bottom:
              20px;
          }

          .loading-line {
            width:
              35%;

            height:
              20px;

            background:
              #e8ebe0;

            border-radius:
              5px;

            margin-bottom:
              25px;
          }

          .loading-box {
            width:
              100%;

            height:
              70px;

            background:
              #e8ebe0;

            border-radius:
              8px;

            margin-bottom:
              15px;
          }

          .loading-box.large {
            height:
              140px;
          }

          @media (max-width: 768px) {

            .outer-wrap {
              padding:
                80px 16px 45px;
            }

            .product-layout {
              grid-template-columns:
                1fr;
            }

            .loading-main {
              height:
                320px;
            }

          }

        `}</style>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="page-bg">

      <div className="outer-wrap">

        <div className="product-layout">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="left-col">

            <div className="gallery-container">

              {/* THUMBNAILS */}

              <div className="thumbnails-column">

                {allImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`thumb-box ${
                        activeImage ===
                        index
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                      aria-label={`View image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={
                          image
                        }
                        alt={`Thumbnail ${
                          index + 1
                        }`}
                        className="thumb-img"
                      />
                    </button>
                  )
                )}

              </div>

              {/* MAIN IMAGE */}

              <div className="main-image-viewport">

                <img
                  src={
                    allImages[
                      activeImage
                    ] ||
                    allImages[0]
                  }
                  alt={
                    product.name
                  }
                  className="main-display-img"
                />

                {allImages.length >
                  1 && (
                  <>
                    <button
                      type="button"
                      className="nav-arrow nav-arrow--left"
                      onClick={
                        handlePrevImage
                      }
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      className="nav-arrow nav-arrow--right"
                      onClick={
                        handleNextImage
                      }
                    >
                      ›
                    </button>
                  </>
                )}

              </div>

            </div>

            {/* =================================================
                MORE INFORMATION
            ================================================= */}

            {product.moreInformation && (
              <div className="more-info-col">

                <h2 className="detail-heading">
                  More Information
                </h2>

                <div
                  className={`more-info-content ${
                    showMoreInfo ||
                    !isMobile
                      ? "expanded"
                      : ""
                  }`}
                >
                  {product.moreInformation
                    .split("\n\n")
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                          className="detail-para"
                        >
                          {
                            paragraph
                          }
                        </p>
                      )
                    )}
                </div>

                {isMobile && (
                  <button
                    type="button"
                    className="see-more-btn"
                    onClick={() =>
                      setShowMoreInfo(
                        (value) =>
                          !value
                      )
                    }
                  >
                    {showMoreInfo
                      ? "See Less"
                      : "See More"}
                  </button>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="info-col">

            {/* TITLE */}

            <h1 className="product-title">
              {
                product.name
              }
            </h1>

            {/* PRICE */}

            <div className="product-price-block">

              <div className="price-main-row">

                <span className="product-price">
                  {formatPrice(
                    displaySellingPrice
                  )}
                </span>

                {displayActualPrice >
                  0 &&
                  displayActualPrice !==
                    displaySellingPrice && (
                  <span className="product-actual-price">
                    {formatPrice(
                      displayActualPrice
                    )}
                  </span>
                )}

                {displayDiscount >
                  0 && (
                  <span className="product-discount">
                    {displayDiscount}%
                    {" "}
                    OFF
                  </span>
                )}

              </div>

              <p className="shipping-line">
                {shippingCost >
                0
                  ? `Shipping: ${formatPrice(
                      shippingCost
                    )}`
                  : "Free Shipping"}
              </p>

            </div>

            {/* SKU */}

            <p className="sku-line">
              SKU :{" "}
              {product.sku ||
                ""}
            </p>

            {/* META */}

            <div className="meta-lines">

              {product.item && (
                <p>
                  <strong>
                    ITEM :
                  </strong>{" "}
                  {
                    product.item
                  }
                </p>
              )}

              {product.threadCount && (
                <p>
                  <strong>
                    THREAD COUNT :
                  </strong>{" "}
                  {
                    product.threadCount
                  }
                </p>
              )}

            </div>

            {/* COLOURS */}

            <div className="colors-section">

              <div className="colors-label">
                Colour :
              </div>

              <div className="colors-list">

                {getColors(
                  product
                ).map(
                  (
                    color,
                    index
                  ) => (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveColor(
                          index
                        )
                      }
                      className={`color-swatch ${
                        activeColor ===
                        index
                          ? "active"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          color,
                      }}
                      title={`Colour ${
                        index + 1
                      }`}
                    />
                  )
                )}

              </div>

            </div>

            {/* SIZES */}

            {availableSizes.length >
              0 && (
              <div className="sizes-section">

                <div className="sizes-header">

                  <div className="sizes-label">
                    Size :
                  </div>

                  {selectedSize?.name && (
                    <span className="selected-size-text">
                      Selected:{" "}
                      {
                        selectedSize.name
                      }
                    </span>
                  )}

                </div>

                <div className="sizes-list">

                  {availableSizes.map(
                    (
                      size,
                      index
                    ) => (
                      <button
                        key={`${size.name}-${index}`}
                        type="button"
                        onClick={() =>
                          handleSizeSelect(
                            index
                          )
                        }
                        className={`size-option ${
                          activeSize ===
                          index
                            ? "active"
                            : ""
                        }`}
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

            {/* CTA */}

            <div className="cta-grid">

              <Link
                href={`/enquiry1/${product.slug}`}
                className="btn-filled"
              >
                BULK PRICE ENQUIRY ›
              </Link>

              <Link
                href="/enquiry"
                className="btn-outline"
              >
                ✦ BULK CUSTOMIZATION
              </Link>

              <button
                type="button"
                className="btn-filled"
                onClick={
                  handleBuyNow
                }
              >
                BUY NOW
              </button>

              {quantity ===
              0 ? (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={
                    handleAddToCart
                  }
                >
                  ADD TO CART
                </button>
              ) : (
                <div className="qty-control">

                  <button
                    type="button"
                    onClick={
                      decreaseMainQty
                    }
                  >
                    −
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseMainQty
                    }
                  >
                    +
                  </button>

                </div>
              )}

            </div>

            {/* SPECS */}

            {builtSpecs.length >
              0 && (
              <div className="specs-table-wrap">

                <table className="specs-table">

                  <tbody>

                    {Array.from(
                      {
                        length:
                          Math.ceil(
                            builtSpecs.length /
                              2
                          ),
                      }
                    ).map(
                      (
                        _,
                        row
                      ) => {

                        const left =
                          builtSpecs[
                            row *
                              2
                          ];

                        const right =
                          builtSpecs[
                            row *
                              2 +
                              1
                          ];

                        return (
                          <tr
                            key={
                              row
                            }
                          >

                            <td className="spec-label">
                              {
                                left?.label
                              }
                            </td>

                            <td className="spec-value">
                              {
                                left?.value
                              }
                            </td>

                            {right ? (
                              <>
                                <td className="spec-label">
                                  {
                                    right.label
                                  }
                                </td>

                                <td className="spec-value">
                                  {
                                    right.value
                                  }
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="spec-label" />
                                <td className="spec-value" />
                              </>
                            )}

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

            {/* DETAILS */}

            <div className="right-details">

              {product.description && (
                <>
                  <h2 className="detail-heading">
                    Description
                  </h2>

                  {product.description
                    .split("\n\n")
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                          className="detail-para"
                        >
                          {
                            paragraph
                          }
                        </p>
                      )
                    )}

                  <hr className="divider" />
                </>
              )}

              {product.features?.length >
                0 && (
                <>
                  <h2 className="detail-heading">
                    Features
                  </h2>

                  <ul className="detail-list">
                    {product.features.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            item
                          }
                        </li>
                      )
                    )}
                  </ul>

                  <hr className="divider" />
                </>
              )}

              {product.materials?.length >
                0 && (
                <>
                  <h2 className="detail-heading">
                    Materials
                  </h2>

                  <ul className="detail-list">
                    {product.materials.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            item
                          }
                        </li>
                      )
                    )}
                  </ul>

                  <hr className="divider" />
                </>
              )}

              {product.careInstructions?.length >
                0 && (
                <>
                  <h2 className="detail-heading">
                    Care Instructions
                  </h2>

                  <ul className="detail-list">
                    {product.careInstructions.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            item
                          }
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            YOU MAY ALSO LIKE
        ===================================================== */}

        {recommendationsLoading ? (
          <section className="recommendation-section">

            <div className="recommendation-heading-row">

              <div>
                <span className="recommendation-eyebrow">
                  DISCOVER MORE
                </span>

                <h2 className="recommendation-title">
                  YOU MAY ALSO LIKE
                </h2>
              </div>

            </div>

            <div className="recommendation-loading">
              <div />
              <div />
              <div />
              <div />
            </div>

          </section>
        ) : (
          recommendations.length >
            0 && (
            <section className="recommendation-section">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="recommendation-heading-row">

                <div>

                  <span className="recommendation-eyebrow">
                    DISCOVER MORE
                  </span>

                  <h2 className="recommendation-title">
                    YOU MAY ALSO LIKE
                  </h2>

                </div>

                {recommendations.length >
                  visibleRecommendationCount && (
                  <div className="recommendation-arrows">

                    <button
                      type="button"
                      onClick={
                        prevRecommendations
                      }
                      aria-label="Previous products"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={
                        nextRecommendations
                      }
                      aria-label="Next products"
                    >
                      ›
                    </button>

                  </div>
                )}

              </div>

              {/* =================================================
                  SLIDER
              ================================================= */}

              <div className="recommendation-viewport">

                <div
                  className="recommendation-track"
                  style={{
                    "--recommendation-index":
                      recommendationIndex,
                    "--recommendation-count":
                      visibleRecommendationCount,
                  }}
                >

                  {recommendations.map(
                    (
                      item,
                      index
                    ) => {

                      const images =
                        getImages(
                          item
                        );

                      const firstImage =
                        images[0] ||
                        "";

                      const secondImage =
                        images[1] ||
                        firstImage;

                      const isHovered =
                        Boolean(
                          hoveredRecommendations[
                            item.slug
                          ]
                        );

                      const colors =
                        getColors(
                          item
                        );

                      const sizes =
                        getSizes(
                          item
                        );

                      const pricing =
                        getRecommendationPricing(
                          item
                        );

                      const discount =
                        calculateDiscount(
                          pricing.actualPrice,
                          pricing.sellingPrice
                        );

                      const selectedColor =
                        recommendationColors[
                          item.slug
                        ] || "";

                      const selectedSize =
                        recommendationSizes[
                          item.slug
                        ] || "";

                      const quantity =
                        recommendationQuantities[
                          item.slug
                        ] || 0;

                      return (
                        <article
                          key={
                            item._id ||
                            item.slug ||
                            index
                          }
                          className="recommendation-card"
                        >

                          {/* ==================================
                              IMAGE
                          ================================== */}

                          <div
                            className="recommendation-image-wrap"
                            onMouseEnter={() => {
                              if (
                                images.length >
                                1
                              ) {
                                setHoveredRecommendations(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [item.slug]:
                                      true,
                                  })
                                );
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredRecommendations(
                                (
                                  current
                                ) => {
                                  const copy =
                                    {
                                      ...current,
                                    };

                                  delete copy[
                                    item.slug
                                  ];

                                  return copy;
                                }
                              );
                            }}
                          >

                            <Link
                              href={`/products/${item.slug}`}
                              className="recommendation-image-link"
                            >

                              {firstImage ? (
                                <>
                                  <img
                                    src={
                                      firstImage
                                    }
                                    alt={
                                      item.name ||
                                      "Product"
                                    }
                                    className={`recommendation-image${
                                      isHovered &&
                                      images.length >
                                        1
                                        ? " image-hide"
                                        : ""
                                    }`}
                                  />

                                  {images.length >
                                    1 && (
                                    <img
                                      src={
                                        secondImage
                                      }
                                      alt={
                                        item.name ||
                                        "Product preview"
                                      }
                                      className={`recommendation-image recommendation-second-image${
                                        isHovered
                                          ? " image-show"
                                          : ""
                                      }`}
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="recommendation-placeholder">
                                  NO IMAGE
                                </div>
                              )}

                            </Link>

                            {/* DISCOUNT */}

                            {discount >
                              0 && (
                              <span className="recommendation-discount">
                                {discount}% OFF
                              </span>
                            )}

                            {/* WISHLIST */}

                            <button
                              type="button"
                              className={`recommendation-wishlist${
                                recommendationWishlist[
                                  item.slug
                                ]
                                  ? " active"
                                  : ""
                              }`}
                              onClick={(
                                event
                              ) =>
                                handleRecommendationWishlist(
                                  event,
                                  item
                                )
                              }
                              aria-label="Wishlist"
                            >
                              {recommendationWishlist[
                                item.slug
                              ]
                                ? "♥"
                                : "♡"}
                            </button>

                          </div>

                          {/* ==================================
                              CONTENT
                          ================================== */}

                          <div className="recommendation-content">

                            {/* COLOUR */}

                            {colors.length >
                              0 && (
                              <div
                                className="recommendation-variant"
                                onClick={(
                                  event
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                              >

                                <div className="recommendation-variant-header">

                                  <span>
                                    Colour
                                  </span>

                                  <small>
                                    {selectedColor
                                      ? "Selected"
                                      : "Select"}
                                  </small>

                                </div>

                                <div className="recommendation-colors">

                                  {colors
                                    .slice(
                                      0,
                                      7
                                    )
                                    .map(
                                      (
                                        color,
                                        colorIndex
                                      ) => {

                                        const selected =
                                          String(
                                            selectedColor
                                          ).toLowerCase() ===
                                          String(
                                            color
                                          ).toLowerCase();

                                        return (
                                          <button
                                            key={`${item.slug}-color-${colorIndex}`}
                                            type="button"
                                            className={`recommendation-color${
                                              selected
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
                                              selectRecommendationColor(
                                                event,
                                                item,
                                                color
                                              )
                                            }
                                            title={
                                              String(
                                                color
                                              )
                                            }
                                          />
                                        );
                                      }
                                    )}

                                </div>

                              </div>
                            )}

                            {/* NAME */}

                            <Link
                              href={`/products/${item.slug}`}
                              className="recommendation-name"
                            >
                              {
                                item.name
                              }
                            </Link>

                            {/* PRICE */}

                            <div className="recommendation-price-area">

                              <div className="recommendation-price-row">

                                <span className="recommendation-selling-price">

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
                                  pricing.sellingPrice && (
                                  <span className="recommendation-old-price">
                                    {
                                      formatPrice(
                                        pricing.actualPrice
                                      )
                                    }
                                  </span>
                                )}

                              </div>

                              <span className="recommendation-shipping">

                                {Number(
                                  item.shippingCost ||
                                    0
                                ) > 0
                                  ? `Shipping ${formatPrice(
                                      item.shippingCost
                                    )}`
                                  : "Free Shipping"}

                              </span>

                            </div>

                            {/* SIZE */}

                            {sizes.length >
                              0 && (
                              <div
                                className="recommendation-variant recommendation-size"
                                onClick={(
                                  event
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                              >

                                <div className="recommendation-variant-header">

                                  <span>
                                    Size
                                  </span>

                                  <small>
                                    {selectedSize ||
                                      "Select"}
                                  </small>

                                </div>

                                <div className="recommendation-size-list">

                                  {sizes
                                    .slice(
                                      0,
                                      7
                                    )
                                    .map(
                                      (
                                        size,
                                        sizeIndex
                                      ) => {

                                        const name =
                                          String(
                                            size?.name ||
                                              ""
                                          ).trim();

                                        const active =
                                          String(
                                            selectedSize
                                          ).toLowerCase() ===
                                          name.toLowerCase();

                                        return (
                                          <button
                                            key={`${item.slug}-size-${sizeIndex}`}
                                            type="button"
                                            className={`recommendation-size-button${
                                              active
                                                ? " active"
                                                : ""
                                            }`}
                                            onClick={(
                                              event
                                            ) =>
                                              selectRecommendationSize(
                                                event,
                                                item,
                                                name
                                              )
                                            }
                                          >
                                            {
                                              name
                                            }
                                          </button>
                                        );
                                      }
                                    )}

                                </div>

                              </div>
                            )}

                            {/* ACTIONS */}

                            <div className="recommendation-actions">

                              {quantity > 0 ? (
                                <div className="recommendation-quantity">

                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) =>
                                      decreaseRecommendationQty(
                                        event,
                                        item
                                      )
                                    }
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
                                      increaseRecommendationQty(
                                        event,
                                        item
                                      )
                                    }
                                  >
                                    +
                                  </button>

                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="recommendation-cart"
                                  onClick={(
                                    event
                                  ) =>
                                    handleRecommendationCart(
                                      event,
                                      item
                                    )
                                  }
                                >
                                  ADD TO CART
                                </button>
                              )}

                              <button
                                type="button"
                                className="recommendation-enquiry"
                                onClick={() =>
                                  router.push(
                                    `/enquiry1/${item.slug}`
                                  )
                                }
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

            </section>
          )
        )}

      </div>

      {/* =====================================================
          PAGE CSS
      ===================================================== */}

      <style jsx>{`

        /* ==================================================
           PAGE
        ================================================== */

        .page-bg {
          background-color:
            #fdfff1;

          min-height:
            100vh;

          font-family:
            "Mona Sans",
            "Inter",
            -apple-system,
            sans-serif;

          color:
            #0e0e0e;
        }

        .outer-wrap {
          max-width:
            1380px;

          margin:
            0 auto;

          padding:
            0 40px 80px;
        }

        /* ==================================================
           MAIN PRODUCT
        ================================================== */

        .product-layout {
          display:
            grid;

          grid-template-columns:
            48% 52%;

          gap:
            0 44px;

          padding-top:
            110px;

          align-items:
            start;
        }

        .left-col {
          display:
            flex;

          flex-direction:
            column;

          gap:
            40px;
        }

        .gallery-container {
          display:
            flex;

          gap:
            16px;

          align-items:
            flex-start;

          width:
            100%;
        }

        .thumbnails-column {
          display:
            flex;

          flex-direction:
            column;

          gap:
            12px;

          max-height:
            560px;

          overflow-y:
            auto;

          padding-right:
            4px;

          scrollbar-width:
            thin;
        }

        .thumbnails-column::-webkit-scrollbar {
          width:
            4px;
        }

        .thumbnails-column::-webkit-scrollbar-thumb {
          background:
            #c8cab4;

          border-radius:
            4px;
        }

        .thumb-box {
          width:
            76px;

          height:
            76px;

          min-width:
            76px;

          min-height:
            76px;

          padding:
            0;

          border-radius:
            10px;

          border:
            2px solid
            transparent;

          background:
            #f4f4ec;

          overflow:
            hidden;

          cursor:
            pointer;

          transition:
            border-color
              0.2s ease,
            transform
              0.15s ease;

          outline:
            none;
        }

        .thumb-box:hover {
          transform:
            translateY(-2px);

          border-color:
            #c8cab4;
        }

        .thumb-box.active {
          border-color:
            #0e0e0e;

          box-shadow:
            0 0 0 2px
              #fff,
            0 0 0 4px
              #7b7f5c;
        }

        .thumb-img {
          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          display:
            block;
        }

        .main-image-viewport {
          position:
            relative;

          flex:
            1;

          height:
            540px;

          border-radius:
            16px;

          overflow:
            hidden;

          background:
            #f4f4ec;

          box-shadow:
            0 6px 20px
              rgba(
                0,
                0,
                0,
                0.04
              );
        }

        .main-display-img {
          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          display:
            block;
        }

        .nav-arrow {
          position:
            absolute;

          top:
            50%;

          transform:
            translateY(-50%);

          width:
            42px;

          height:
            42px;

          border-radius:
            50%;

          background:
            rgba(
              14,
              14,
              14,
              0.7
            );

          color:
            #ffffff;

          border:
            none;

          font-size:
            22px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          cursor:
            pointer;

          z-index:
            5;
        }

        .nav-arrow:hover {
          background:
            #0e0e0e;
        }

        .nav-arrow--left {
          left:
            14px;
        }

        .nav-arrow--right {
          right:
            14px;
        }

        /* ==================================================
           PRODUCT INFO
        ================================================== */

        .info-col {
          display:
            flex;

          flex-direction:
            column;

          gap:
            16px;
        }

        .product-title {
          margin:
            0;

          font-family:
            "Tobias TRIAL",
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            25px;

          font-weight:
            700;

          line-height:
            1.35;

          letter-spacing:
            -0.2px;
        }

        .product-price-block {
          margin:
            4px 0 2px;
        }

        .price-main-row {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            10px;
        }

        .product-price {
          margin:
            0;

          font-size:
            28px;

          font-weight:
            700;

          line-height:
            1;

          color:
            #7b7f5c;
        }

        .product-actual-price {
          font-size:
            17px;

          color:
            #777;

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
            28px;

          padding:
            0 9px;

          border-radius:
            6px;

          background:
            #e7e9d7;

          color:
            #5f6247;

          font-size:
            12px;

          font-weight:
            700;
        }

        .shipping-line {
          margin:
            7px 0 0;

          color:
            #777;

          font-size:
            12px;
        }

        .sku-line {
          margin:
            -3px 0 4px;

          color:
            #777;

          font-size:
            13px;
        }

        .meta-lines {
          display:
            flex;

          flex-direction:
            column;

          gap:
            4px;

          color:
            #111;

          font-size:
            13.5px;
        }

        .meta-lines p {
          margin:
            0;

          line-height:
            1.5;
        }

        .meta-lines strong {
          font-weight:
            700;
        }

        /* ==================================================
           COLORS
        ================================================== */

        .colors-section {
          margin:
            4px 0;
        }

        .colors-label {
          margin-bottom:
            8px;

          color:
            #333;

          font-size:
            13.5px;

          font-weight:
            600;
        }

        .colors-list {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            12px;
        }

        .color-swatch {
          width:
            26px;

          height:
            26px;

          padding:
            0;

          border:
            1px solid
            #c8cab4;

          border-radius:
            50%;

          cursor:
            pointer;

          outline:
            none;

          transition:
            transform
              0.15s ease,
            box-shadow
              0.15s ease;
        }

        .color-swatch:hover {
          transform:
            scale(
              1.1
            );
        }

        .color-swatch.active {
          border:
            2px solid
            #7b7f5c;

          box-shadow:
            0 0 0 2px
              #fff,
            0 0 0 4px
              #7b7f5c;
        }

        /* ==================================================
           SIZES
        ================================================== */

        .sizes-section {
          margin:
            2px 0 6px;
        }

        .sizes-header {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            12px;

          margin-bottom:
            9px;
        }

        .sizes-label {
          color:
            #333;

          font-size:
            13.5px;

          font-weight:
            600;
        }

        .selected-size-text {
          color:
            #7b7f5c;

          font-size:
            12px;

          font-weight:
            500;
        }

        .sizes-list {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            9px;
        }

        .size-option {
          min-width:
            48px;

          min-height:
            38px;

          padding:
            0 13px;

          border:
            1px solid
            #c8cab4;

          border-radius:
            8px;

          background:
            #ffffff;

          color:
            #0e0e0e;

          font-size:
            13px;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            background
              0.2s ease,
            border-color
              0.2s ease,
            color
              0.2s ease;
        }

        .size-option:hover {
          border-color:
            #7b7f5c;
        }

        .size-option.active {
          background:
            #7b7f5c;

          border-color:
            #7b7f5c;

          color:
            #ffffff;

          box-shadow:
            0 0 0 2px
              #fff,
            0 0 0 3px
              #7b7f5c;
        }

        /* ==================================================
           CTA
        ================================================== */

        .cta-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              1fr
            );

          gap:
            12px;

          margin:
            8px 0 16px;
        }

        .btn-filled,
        .btn-outline {
          height:
            52px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          box-sizing:
            border-box;

          padding:
            0 16px;

          font-family:
            inherit;

          font-size:
            13px;

          font-weight:
            600;

          letter-spacing:
            0.5px;

          text-decoration:
            none;

          text-transform:
            uppercase;

          cursor:
            pointer;
        }

        .btn-filled {
          border:
            1px solid
            #7b7f5c;

          background:
            #7b7f5c;

          color:
            #ffffff;
        }

        .btn-filled:hover {
          background:
            #676a4c;
        }

        .btn-outline {
          border:
            1px solid
            #c8cab4;

          background:
            transparent;

          color:
            #0e0e0e;
        }

        .btn-outline:hover {
          background:
            #f4f6e6;

          border-color:
            #7b7f5c;
        }

        .qty-control {
          height:
            52px;

          border:
            1px solid
            #c8cab4;

          background:
            #ffffff;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 18px;
        }

        .qty-control button {
          width:
            34px;

          height:
            38px;

          padding:
            0;

          border:
            none;

          background:
            transparent;

          color:
            #0e0e0e;

          font-size:
            20px;

          cursor:
            pointer;
        }

        .qty-control span {
          font-size:
            15px;

          font-weight:
            600;
        }

        /* ==================================================
           SPECS
        ================================================== */

        .specs-table-wrap {
          margin-bottom:
            20px;

          overflow-x:
            auto;
        }

        .specs-table {
          width:
            100%;

          border-collapse:
            collapse;

          font-size:
            13px;

          border:
            1px solid
            #e0e2cc;

          background:
            #fafbf4;
        }

        .specs-table tr {
          border-bottom:
            1px solid
            #e0e2cc;
        }

        .spec-label {
          padding:
            8px 12px;

          width:
            22%;

          color:
            #444;

          font-weight:
            400;

          border-right:
            1px solid
            #e0e2cc;
        }

        .spec-value {
          padding:
            8px 12px;

          width:
            28%;

          color:
            #0e0e0e;

          font-weight:
            700;

          border-right:
            1px solid
            #e0e2cc;
        }

        /* ==================================================
           DETAILS
        ================================================== */

        .right-details,
        .more-info-col {
          display:
            flex;

          flex-direction:
            column;
        }

        .detail-heading {
          margin:
            12px 0 8px;

          color:
            #0e0e0e;

          font-family:
            "Tobias TRIAL",
            Georgia,
            serif;

          font-size:
            18px;

          font-weight:
            700;
        }

        .detail-para {
          margin:
            0 0 10px;

          color:
            #333;

          font-size:
            13.5px;

          line-height:
            1.7;
        }

        .detail-list {
          margin:
            0 0 10px;

          padding-left:
            20px;
        }

        .detail-list li {
          margin-bottom:
            4px;

          color:
            #333;

          font-size:
            13.5px;

          line-height:
            1.75;
        }

        .divider {
          border:
            none;

          border-top:
            1px solid
            #e0e2cc;

          margin:
            16px 0;
        }

        .see-more-btn {
          margin-top:
            12px;

          padding:
            0;

          border:
            none;

          background:
            transparent;

          color:
            #7b7f5c;

          font-size:
            13px;

          font-weight:
            600;

          cursor:
            pointer;
        }

        /* ==================================================
           YOU MAY ALSO LIKE
        ================================================== */

        .recommendation-section {
          width:
            100%;

          margin-top:
            72px;

          padding-top:
            50px;

          border-top:
            1px solid
            #dfe1ce;
        }

        .recommendation-heading-row {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            24px;

          margin-bottom:
            27px;
        }

        .recommendation-eyebrow {
          display:
            block;

          margin-bottom:
            7px;

          color:
            #7b7f5c;

          font-size:
            10px;

          line-height:
            1.2;

          font-weight:
            700;

          letter-spacing:
            0.12em;
        }

        .recommendation-title {
          margin:
            0;

          color:
            #111111;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            31px;

          line-height:
            1.15;

          font-weight:
            500;

          letter-spacing:
            -0.02em;
        }

        .recommendation-arrows {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;
        }

        .recommendation-arrows button {
          width:
            39px;

          height:
            39px;

          padding:
            0;

          border:
            1px solid
            #c8cab4;

          border-radius:
            50%;

          background:
            #ffffff;

          color:
            #7b7f5c;

          font-size:
            22px;

          line-height:
            1;

          cursor:
            pointer;
        }

        .recommendation-arrows button:hover {
          background:
            #f3f5e8;
        }

        /* ==================================================
           RECOMMENDATION VIEWPORT
        ================================================== */

        .recommendation-viewport {
          width:
            100%;

          overflow:
            hidden;
        }

        .recommendation-track {
          display:
            grid;

          grid-template-columns:
            repeat(
              var(--recommendation-count),
              minmax(
                0,
                1fr
              )
            );

          gap:
            17px;

          width:
            calc(
              100% *
                (var(--recommendation-items, 1))
            );

          transform:
            translateX(
              calc(
                -1 *
                  var(
                    --recommendation-index
                  ) *
                  (
                    100% /
                      var(
                        --recommendation-count
                      )
                  )
              )
            );

          transition:
            transform
              0.55s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        /*
         * Four visible cards.
         *
         * Each item gets one quarter of viewport.
         */

        .recommendation-card {
          min-width:
            0;

          width:
            100%;

          height:
            100%;

          display:
            flex;

          flex-direction:
            column;

          overflow:
            hidden;

          border:
            1px solid
            #e1e3d5;

          border-radius:
            12px;

          background:
            #fdfff1;

          box-shadow:
            0 5px 18px
              rgba(
                50,
                55,
                35,
                0.055
              );

          transition:
            transform
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .recommendation-card:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 11px 25px
              rgba(
                50,
                55,
                35,
                0.08
              );
        }

        /* ==================================================
           RECOMMENDATION IMAGE
        ================================================== */

        .recommendation-image-wrap {
          position:
            relative;

          width:
            100%;

          aspect-ratio:
            1 / 0.90;

          overflow:
            hidden;

          background:
            #ecece2;

          flex:
            0 0 auto;
        }

        .recommendation-image-link {
          position:
            absolute;

          inset:
            0;

          display:
            block;

          text-decoration:
            none;
        }

        .recommendation-image {
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

          opacity:
            1;

          transition:
            opacity
              0.3s ease,
            transform
              0.35s ease;
        }

        .recommendation-image.image-hide {
          opacity:
            0;
        }

        .recommendation-second-image {
          opacity:
            0;
        }

        .recommendation-second-image.image-show {
          opacity:
            1;
        }

        .recommendation-placeholder {
          position:
            absolute;

          inset:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            #7b7f5c;

          font-size:
            10px;

          font-weight:
            700;

          letter-spacing:
            0.08em;
        }

        /* ==================================================
           RECOMMENDATION DISCOUNT
        ================================================== */

        .recommendation-discount {
          position:
            absolute;

          top:
            10px;

          left:
            10px;

          z-index:
            5;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            26px;

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
            6px;

          background:
            rgba(
              253,
              255,
              241,
              0.96
            );

          color:
            #38602d;

          font-size:
            9px;

          font-weight:
            800;

          line-height:
            1;
        }

        /* ==================================================
           RECOMMENDATION WISHLIST
        ================================================== */

        .recommendation-wishlist {
          position:
            absolute;

          top:
            9px;

          right:
            9px;

          z-index:
            7;

          width:
            38px;

          height:
            38px;

          padding:
            0;

          border:
            1px solid
            #d4d4d4;

          border-radius:
            50%;

          background:
            rgba(
              255,
              255,
              255,
              0.95
            );

          color:
            #777777;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            20px;

          line-height:
            1;

          cursor:
            pointer;
        }

        .recommendation-wishlist.active {
          color:
            #b4002e;
        }

        /* ==================================================
           RECOMMENDATION CONTENT
        ================================================== */

        .recommendation-content {
          flex:
            1;

          display:
            flex;

          flex-direction:
            column;

          padding:
            11px 12px
            12px;

          box-sizing:
            border-box;
        }

        .recommendation-variant {
          margin-bottom:
            7px;
        }

        .recommendation-variant-header {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            6px;

          margin-bottom:
            5px;

          color:
            #555555;

          font-size:
            9px;

          font-weight:
            600;
        }

        .recommendation-variant-header small {
          color:
            #7b7f5c;

          font-size:
            7px;

          text-transform:
            uppercase;
        }

        .recommendation-colors {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            6px;
        }

        .recommendation-color {
          width:
            19px;

          height:
            19px;

          padding:
            0;

          border:
            1px solid
            #a7a8a0;

          border-radius:
            50%;

          cursor:
            pointer;
        }

        .recommendation-color.selected {
          border:
            2px solid
            #111111;

          box-shadow:
            0 0 0 2px
              #fdfff1,
            0 0 0 3px
              #7b7f5c;
        }

        /* ==================================================
           NAME
        ================================================== */

        .recommendation-name {
          min-height:
            36px;

          margin:
            0 0 5px;

          display:
            -webkit-box;

          overflow:
            hidden;

          color:
            #111111;

          font-size:
            14px;

          line-height:
            1.3;

          font-weight:
            700;

          text-decoration:
            none;

          -webkit-box-orient:
            vertical;

          -webkit-line-clamp:
            2;
        }

        .recommendation-name:hover {
          text-decoration:
            underline;
        }

        /* ==================================================
           PRICE
        ================================================== */

        .recommendation-price-area {
          margin-bottom:
            7px;
        }

        .recommendation-price-row {
          display:
            flex;

          align-items:
            baseline;

          flex-wrap:
            wrap;

          gap:
            6px;
        }

        .recommendation-selling-price {
          color:
            #111111;

          font-size:
            18px;

          line-height:
            1.1;

          font-weight:
            700;
        }

        .recommendation-old-price {
          color:
            #777777;

          font-size:
            10px;

          text-decoration:
            line-through;
        }

        .recommendation-shipping {
          display:
            block;

          margin-top:
            4px;

          color:
            #707169;

          font-size:
            8px;

          line-height:
            1.3;
        }

        /* ==================================================
           SIZE
        ================================================== */

        .recommendation-size {
          padding:
            6px;

          border:
            1px solid
            rgba(
              123,
              127,
              92,
              0.2
            );

          border-radius:
            7px;
        }

        .recommendation-size-list {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            4px;
        }

        .recommendation-size-button {
          min-width:
            32px;

          min-height:
            25px;

          padding:
            0 5px;

          border:
            1px solid
            #c9c9c9;

          border-radius:
            4px;

          background:
            #fdfff1;

          color:
            #111111;

          font-size:
            7px;

          font-weight:
            700;

          cursor:
            pointer;
        }

        .recommendation-size-button.active {
          background:
            #7b7f5c;

          border-color:
            #7b7f5c;

          color:
            #ffffff;
        }

        /* ==================================================
           RECOMMENDATION ACTIONS
        ================================================== */

        .recommendation-actions {
          margin-top:
            auto;

          padding-top:
            5px;
        }

        .recommendation-cart,
        .recommendation-quantity {
          width:
            100%;

          min-height:
            39px;

          box-sizing:
            border-box;

          border:
            1px solid
            #111111;

          border-radius:
            6px;

          background:
            transparent;

          color:
            #111111;

          font-size:
            9px;

          font-weight:
            700;

          cursor:
            pointer;
        }

        .recommendation-cart:hover {
          background:
            #111111;

          color:
            #ffffff;
        }

        .recommendation-quantity {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 10px;
        }

        .recommendation-quantity button {
          width:
            26px;

          height:
            30px;

          padding:
            0;

          border:
            none;

          background:
            transparent;

          font-size:
            17px;

          cursor:
            pointer;
        }

        .recommendation-enquiry {
          width:
            100%;

          min-height:
            34px;

          margin-top:
            5px;

          border:
            1px solid
            #7b7f5c;

          border-radius:
            6px;

          background:
            #fdfff1;

          color:
            #7b7f5c;

          font-size:
            7px;

          font-weight:
            700;

          letter-spacing:
            0.03em;

          cursor:
            pointer;
        }

        .recommendation-enquiry:hover {
          background:
            #7b7f5c;

          color:
            #ffffff;
        }

        /* ==================================================
           RECOMMENDATION LOADING
        ================================================== */

        .recommendation-loading {
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
            17px;
        }

        .recommendation-loading div {
          height:
            470px;

          border-radius:
            12px;

          background:
            #e8ebe0;

          animation:
            recommendationPulse
            1.4s
            ease-in-out
            infinite;
        }

        @keyframes recommendationPulse {

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

        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1024px) {

          .outer-wrap {
            padding:
              0 24px 60px;
          }

          .product-layout {
            grid-template-columns:
              1fr;

            padding-top:
              90px;

            gap:
              40px 0;
          }

          .main-image-viewport {
            height:
              440px;
          }

          .recommendation-track {
            gap:
              14px;
          }

        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 768px) {

          .outer-wrap {
            padding:
              0 14px 45px;
          }

          .product-layout {
            padding-top:
              80px;

            gap:
              28px 0;
          }

          .product-title {
            font-size:
              22px;
          }

          .product-price {
            font-size:
              22px;
          }

          .product-actual-price {
            font-size:
              14px;
          }

          .product-discount {
            font-size:
              10px;

            min-height:
              25px;
          }

          .gallery-container {
            flex-direction:
              column-reverse;
          }

          .thumbnails-column {
            flex-direction:
              row;

            max-height:
              none;

            overflow-x:
              auto;

            width:
              100%;

            padding-bottom:
              8px;
          }

          .thumb-box {
            width:
              62px;

            height:
              62px;

            min-width:
              62px;

            min-height:
              62px;
          }

          .main-image-viewport {
            width:
              100%;

            height:
              320px;

            border-radius:
              12px;
          }

          .cta-grid {
            grid-template-columns:
              1fr;
          }

          .sizes-list {
            gap:
              8px;
          }

          .size-option {
            min-width:
              45px;

            min-height:
              35px;

            font-size:
              11px;
          }

          .recommendation-section {
            margin-top:
              50px;

            padding-top:
              36px;
          }

          .recommendation-heading-row {
            align-items:
              flex-start;
          }

          .recommendation-title {
            font-size:
              24px;
          }

          .recommendation-eyebrow {
            font-size:
              8px;
          }

          .recommendation-arrows button {
            width:
              33px;

            height:
              33px;
          }

          /*
           * Mobile = 2 cards.
           */

          .recommendation-card {
            border-radius:
              9px;
          }

          .recommendation-image-wrap {
            aspect-ratio:
              1 / 0.92;
          }

          .recommendation-content {
            padding:
              8px;
          }

          .recommendation-name {
            min-height:
              29px;

            font-size:
              10px;
          }

          .recommendation-selling-price {
            font-size:
              14px;
          }

          .recommendation-old-price {
            font-size:
              8px;
          }

          .recommendation-shipping {
            font-size:
              7px;
          }

          .recommendation-discount {
            top:
              7px;

            left:
              7px;

            min-height:
              22px;

            padding:
              0 6px;

            font-size:
              7px;
          }

          .recommendation-wishlist {
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

          .recommendation-color {
            width:
              17px;

            height:
              17px;
          }

          .recommendation-size {
            padding:
              5px;
          }

          .recommendation-size-button {
            min-width:
              26px;

            min-height:
              23px;

            font-size:
              6px;
          }

          .recommendation-cart,
          .recommendation-quantity {
            min-height:
              35px;

            font-size:
              7px;
          }

          .recommendation-enquiry {
            min-height:
              31px;

            font-size:
              5.8px;
          }

          .recommendation-loading {
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

          .recommendation-loading div {
            height:
              390px;
          }

        }

        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 480px) {

          .outer-wrap {
            padding:
              0 10px 38px;
          }

          .main-image-viewport {
            height:
              295px;
          }

          .recommendation-title {
            font-size:
              21px;
          }

          .recommendation-track {
            gap:
              8px;
          }

          .recommendation-content {
            padding:
              7px;
          }

          .recommendation-name {
            font-size:
              9px;
          }

          .recommendation-selling-price {
            font-size:
              13px;
          }

          .recommendation-size-button {
            min-width:
              24px;

            min-height:
              22px;
          }

        }

      `}</style>

    </div>
  );
}