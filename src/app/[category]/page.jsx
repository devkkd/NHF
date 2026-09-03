"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";
import toast from "react-hot-toast";

import {
  addToCart,
  updateQty,
} from "@/lib/cart";

import {
  toggleWishlist,
  getWishlist,
} from "@/lib/wishlist";

/* ======================================================
   CONFIG
====================================================== */

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

const ACCENT = "#7b7f5c";
const BG = "#fdfff1";
const BORDER = "#c8cab4";

const LIMIT = 12;
const PRODUCT_FETCH_LIMIT = 100;

const SORT_OPTIONS = [
  "Recommended",
  "Newest",
  "Name A–Z",
  "Name Z–A",
];

const SKELETON_COUNT = 9;

/* ======================================================
   SAFE DATA HELPERS
====================================================== */

function getId(value) {
  if (!value) return "";

  if (
    typeof value ===
    "object"
  ) {
    return String(
      value._id ||
        value.id ||
        ""
    );
  }

  return String(value);
}

function normalizeSlug(
  value = ""
) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(
      /^\/+|\/+$/g,
      ""
    );
}

/* ======================================================
   PRODUCT IMAGE HELPERS
====================================================== */

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


/* ======================================================
   PRODUCT VARIANT HELPERS
====================================================== */

function getProductColors(product) {
  return Array.isArray(product?.colors)
    ? product.colors.filter(Boolean)
    : [];
}

function getProductSizes(product) {
  const sizes =
    Array.isArray(product?.sizes)
      ? product.sizes
      : Array.isArray(product?.sizeVariations)
        ? product.sizeVariations
        : Array.isArray(product?.variants)
          ? product.variants
          : [];

  return sizes.filter((size) =>
    String(
      size?.name ?? size?.size ?? ""
    ).trim()
  );
}

function getSizeName(size) {
  return String(
    size?.name ?? size?.size ?? ""
  ).trim();
}

function getActualPrice(product) {
  return Number(
    product?.actualPrice ??
      product?.mrp ??
      product?.originalPrice ??
      product?.price ??
      0
  );
}

function getSellingPrice(product) {
  return Number(
    product?.sellingPrice ??
      product?.salePrice ??
      product?.price ??
      0
  );
}

function getVariantActualPrice(variant) {
  return Number(
    variant?.actualPrice ??
      variant?.mrp ??
      variant?.originalPrice ??
      variant?.price ??
      0
  );
}

function getVariantSellingPrice(variant) {
  return Number(
    variant?.sellingPrice ??
      variant?.salePrice ??
      variant?.price ??
      0
  );
}

function getDiscountPercent(actual, selling) {
  const a = Number(actual || 0);
  const s = Number(selling || 0);

  if (a <= 0 || s <= 0 || s >= a) {
    return 0;
  }

  return Math.round(((a - s) / a) * 100);
}


function formatCurrency(value) {
  const number = Number(value || 0);
  return `₹${number.toLocaleString("en-IN")}`;
}

/* ======================================================
   FETCH CATEGORY BY SLUG
====================================================== */

async function fetchCategoryBySlug(
  slug
) {
  try {
    const cleanSlug =
      normalizeSlug(
        slug
      );

    const res =
      await fetch(
        `${BASE}/categories/${encodeURIComponent(
          cleanSlug
        )}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        }
      );

    if (!res.ok) {
      return null;
    }

    const body =
      await res.json();

    return (
      body?.data?.category ||
      body?.data ||
      body?.category ||
      null
    );
  } catch (error) {
    console.error(
      "FETCH CATEGORY BY SLUG ERROR:",
      error
    );

    return null;
  }
}

/* ======================================================
   FETCH CATEGORY TREE
====================================================== */

async function fetchCategoryTree({
  wardrobe = false,
} = {}) {
  try {
    const params =
      new URLSearchParams();

    params.set(
      "tree",
      "true"
    );

    if (wardrobe) {
      params.set(
        "wardrobe",
        "true"
      );
    }

    const res =
      await fetch(
        `${BASE}/categories?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        }
      );

    if (!res.ok) {
      return [];
    }

    const body =
      await res.json();

    const data =
      Array.isArray(
        body
      )
        ? body
        : Array.isArray(
              body?.data
            )
          ? body.data
          : Array.isArray(
                body?.data
                  ?.categories
              )
            ? body.data
                .categories
            : [];

    return Array.isArray(
      data
    )
      ? data
      : [];
  } catch (error) {
    console.error(
      "FETCH CATEGORY TREE ERROR:",
      error
    );

    return [];
  }
}

/* ======================================================
   NORMALIZE CATEGORY
====================================================== */

function normalizeCategory(
  category
) {
  if (!category) {
    return null;
  }

  const children =
    Array.isArray(
      category.children
    )
      ? category.children
      : [];

  return {
    ...category,

    _id:
      category._id ||
      category.id ||
      "",

    name:
      category.name ||
      "Category",

    slug:
      category.slug ||
      "",

    image:
      category.image ||
      category.bannerImage ||
      "",

    heroImage:
      category.heroImage ||
      "",

    mobileHeroImage:
      category.mobileHeroImage ||
      "",

    children: children
      .filter(Boolean)
      .map(
        (child) => ({
          ...child,

          _id:
            child._id ||
            child.id ||
            "",

          name:
            child.name ||
            "Subcategory",

          slug:
            child.slug ||
            "",

          image:
            child.image ||
            "",

          heroImage:
            child.heroImage ||
            "",

          mobileHeroImage:
            child.mobileHeroImage ||
            "",
        })
      ),
  };
}

/* ======================================================
   FIND CATEGORY IN TREE
====================================================== */

function findCategoryInTree(
  tree,
  slug
) {
  const cleanSlug =
    normalizeSlug(
      slug
    );

  if (!cleanSlug) {
    return null;
  }

  for (
    const parent of tree
  ) {
    if (
      normalizeSlug(
        parent?.slug
      ) ===
      cleanSlug
    ) {
      return normalizeCategory(
        parent
      );
    }
  }

  return null;
}

/* ======================================================
   FETCH WARDROBE PRODUCTS PAGE
====================================================== */

async function fetchWardrobeProductsPage(
  page = 1
) {
  try {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      String(
        PRODUCT_FETCH_LIMIT
      )
    );

    params.set(
      "wardrobe",
      "true"
    );

    const res =
      await fetch(
        `${BASE}/products?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        }
      );

    if (!res.ok) {
      return {
        products: [],
        total: 0,
        pages: 1,
      };
    }

    const body =
      await res.json();

    const data =
      body?.data || {};

    return {
      products:
        Array.isArray(
          data.products
        )
          ? data.products
          : [],

      total:
        Number(
          data.total
        ) || 0,

      pages:
        Number(
          data.pages
        ) || 1,
    };
  } catch (error) {
    console.error(
      "FETCH WARDROBE PRODUCTS ERROR:",
      error
    );

    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }
}

/* ======================================================
   FETCH ALL WARDROBE PRODUCTS
====================================================== */

async function fetchAllWardrobeProducts() {
  const first =
    await fetchWardrobeProductsPage(
      1
    );

  let all = [
    ...first.products,
  ];

  const totalPages =
    Math.max(
      Number(
        first.pages
      ) || 1,
      1
    );

  if (
    totalPages > 1
  ) {
    for (
      let page = 2;
      page <= totalPages;
      page++
    ) {
      const result =
        await fetchWardrobeProductsPage(
          page
        );

      if (
        result.products
          .length
      ) {
        all = [
          ...all,
          ...result.products,
        ];
      }
    }
  }

  return all;
}

/* ======================================================
   FETCH PRODUCTS BY CATEGORY ID
====================================================== */

async function fetchProductsPage(
  categoryId,
  page = 1
) {
  if (!categoryId) {
    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }

  try {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      String(
        PRODUCT_FETCH_LIMIT
      )
    );

    params.set(
      "category",
      String(
        categoryId
      )
    );

    const res =
      await fetch(
        `${BASE}/products?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        }
      );

    if (!res.ok) {
      return {
        products: [],
        total: 0,
        pages: 1,
      };
    }

    const body =
      await res.json();

    const data =
      body?.data || {};

    return {
      products:
        Array.isArray(
          data.products
        )
          ? data.products
          : [],

      total:
        Number(
          data.total
        ) || 0,

      pages:
        Number(
          data.pages
        ) || 1,
    };
  } catch (error) {
    console.error(
      "FETCH PRODUCTS PAGE ERROR:",
      error
    );

    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }
}

/* ======================================================
   FETCH ALL PRODUCTS FOR CATEGORY
====================================================== */

async function fetchAllProductsByCategory(
  categoryId
) {
  if (!categoryId) {
    return [];
  }

  const first =
    await fetchProductsPage(
      categoryId,
      1
    );

  let all = [
    ...first.products,
  ];

  const totalPages =
    Math.max(
      Number(
        first.pages
      ) || 1,
      1
    );

  if (
    totalPages > 1
  ) {
    for (
      let page = 2;
      page <= totalPages;
      page++
    ) {
      const result =
        await fetchProductsPage(
          categoryId,
          page
        );

      if (
        result.products
          .length
      ) {
        all = [
          ...all,
          ...result.products,
        ];
      }
    }
  }

  return all;
}

/* ======================================================
   MAIN CATEGORY PRODUCTS
====================================================== */

async function fetchProductsForMainCategory(
  categoryId,
  children = []
) {
  const categoryIds = [];

  if (categoryId) {
    categoryIds.push(
      String(categoryId)
    );
  }

  children.forEach(
    (child) => {
      const id =
        getId(child);

      if (
        id &&
        !categoryIds.includes(
          id
        )
      ) {
        categoryIds.push(
          id
        );
      }
    }
  );

  if (
    !categoryIds.length
  ) {
    return [];
  }

  const results =
    await Promise.all(
      categoryIds.map(
        (id) =>
          fetchAllProductsByCategory(
            id
          )
      )
    );

  const merged = [];

  const seen =
    new Set();

  results.forEach(
    (products) => {
      products.forEach(
        (product) => {
          const key =
            String(
              product?._id ||
                product?.id ||
                product?.slug ||
                ""
            );

          if (
            !key ||
            !seen.has(key)
          ) {
            if (key) {
              seen.add(
                key
              );
            }

            merged.push(
              product
            );
          }
        }
      );
    }
  );

  return merged;
}

/* ======================================================
   SORT PRODUCTS
====================================================== */

function sortProducts(
  products,
  sort
) {
  const list = [
    ...(Array.isArray(
      products
    )
      ? products
      : []),
  ];

  if (
    sort ===
    "Name A–Z"
  ) {
    return list.sort(
      (a, b) =>
        String(
          a?.name || ""
        ).localeCompare(
          String(
            b?.name || ""
          )
        )
    );
  }

  if (
    sort ===
    "Name Z–A"
  ) {
    return list.sort(
      (a, b) =>
        String(
          b?.name || ""
        ).localeCompare(
          String(
            a?.name || ""
          )
        )
    );
  }

  if (
    sort ===
    "Newest"
  ) {
    return list.sort(
      (a, b) => {
        const aDate =
          new Date(
            a?.createdAt ||
              a?.updatedAt ||
              0
          ).getTime();

        const bDate =
          new Date(
            b?.createdAt ||
              b?.updatedAt ||
              0
          ).getTime();

        return (
          bDate - aDate
        );
      }
    );
  }

  return list;
}

/* ======================================================
   COMPONENT
====================================================== */

export default function CategoryPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const slug =
    Array.isArray(
      params?.category
    )
      ? params.category[0]
      : params?.category;

  const subcategoryId =
    searchParams.get(
      "subcategoryId"
    );

  /* ====================================================
     STATE
  ==================================================== */

  const [
    category,
    setCategory,
  ] = useState(null);

  const [
    allProducts,
    setAllProducts,
  ] = useState([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState([]);

  const [
    selectedSubcategory,
    setSelectedSubcategory,
  ] = useState(
    null
  );

  const [
    loadingCat,
    setLoadingCat,
  ] = useState(true);

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

  const [
    selectedSort,
    setSelectedSort,
  ] = useState(
    "Recommended"
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    wishlist,
    setWishlist,
  ] = useState({});

  const [
    quantities,
    setQuantities,
  ] = useState({});
  const [
  selectedColors,
  setSelectedColors,
] = useState({});

const [
  selectedSizes,
  setSelectedSizes,
] = useState({});

  /*
   * NEW
   *
   * Product image hover/touch state.
   *
   * true = gallery image
   * false = main image
   */

  const [
    hoveredProducts,
    setHoveredProducts,
  ] = useState({});

  /* ====================================================
     LOAD WISHLIST
  ==================================================== */

  useEffect(() => {
    let mounted = true;

    const loadWishlist =
      async () => {
        try {
          const saved =
            await getWishlist();

          if (
            !Array.isArray(
              saved
            )
          ) {
            return;
          }

          const map = {};

          saved.forEach(
            (item) => {
              const itemSlug =
                item?.slug;

              if (
                itemSlug
              ) {
                map[
                  itemSlug
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
            "Wishlist load error:",
            error
          );
        }
      };

    loadWishlist();

    return () => {
      mounted =
        false;
    };
  }, []);

  /* ====================================================
     LOAD CATEGORY
  ==================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCategory =
      async () => {
        if (!slug) {
          return;
        }

        setLoadingCat(
          true
        );

        setNotFound(
          false
        );

        setCategory(
          null
        );

        setSubcategories(
          []
        );

        setSelectedSubcategory(
          null
        );

        setPage(1);

        setHoveredProducts(
          {}
        );

        /* ==============================================
           WARDROBE
        ============================================== */

        if (
          slug ===
          "wardrobe"
        ) {
          const wardrobeTree =
            await fetchCategoryTree(
              {
                wardrobe:
                  true,
              }
            );

          const normalizedWardrobe =
            Array.isArray(
              wardrobeTree
            )
              ? wardrobeTree
                  .filter(
                    Boolean
                  )
                  .map(
                    (
                      item
                    ) =>
                      normalizeCategory(
                        item
                      )
                  )
              : [];

          if (
            mounted
          ) {
            setCategory({
              _id: "wardrobe",
              name: "Wardrobe",
              slug: "wardrobe",
              image:
                "/images/new-arrivals-hero.jpg",
              children:
                normalizedWardrobe,
            });

            setSubcategories(
              normalizedWardrobe
            );

            let active =
              null;

            if (
              subcategoryId
            ) {
              active =
                normalizedWardrobe.find(
                  (
                    item
                  ) =>
                    getId(
                      item
                    ) ===
                      String(
                        subcategoryId
                      ) ||
                    item.children?.some(
                      (
                        child
                      ) =>
                        getId(
                          child
                        ) ===
                        String(
                          subcategoryId
                        )
                    )
                ) ||
                null;
            }

            let activeChild =
              null;

            if (
              subcategoryId
            ) {
              for (
                const parent of
                  normalizedWardrobe
              ) {
                const child =
                  Array.isArray(
                    parent?.children
                  )
                    ? parent.children.find(
                        (
                          item
                        ) =>
                          getId(
                            item
                          ) ===
                          String(
                            subcategoryId
                          )
                      )
                    : null;

                if (
                  child
                ) {
                  activeChild =
                    child;

                  break;
                }
              }
            }

            setSelectedSubcategory(
              activeChild ||
                active ||
                null
            );

            setLoadingCat(
              false
            );
          }

          return;
        }

        /* ==============================================
           NORMAL CATEGORY API
        ============================================== */

        let foundCategory =
          await fetchCategoryBySlug(
            slug
          );

        /* ==============================================
           FALLBACK TREE
        ============================================== */

        if (
          !foundCategory
        ) {
          const tree =
            await fetchCategoryTree();

          foundCategory =
            findCategoryInTree(
              tree,
              slug
            );
        }

        /* ==============================================
           NOT FOUND
        ============================================== */

        if (
          !foundCategory
        ) {
          if (
            mounted
          ) {
            setNotFound(
              true
            );

            setLoadingCat(
              false
            );
          }

          return;
        }

        const normalized =
          normalizeCategory(
            foundCategory
          );

        /* ==============================================
           CHILDREN
        ============================================== */

        let children =
          Array.isArray(
            normalized?.children
          )
            ? normalized.children
            : [];

        /* ==============================================
           FALLBACK CHILDREN FROM TREE
        ============================================== */

        if (
          children.length ===
          0
        ) {
          const tree =
            await fetchCategoryTree();

          const treeCategory =
            findCategoryInTree(
              tree,
              slug
            );

          if (
            treeCategory &&
            Array.isArray(
              treeCategory.children
            )
          ) {
            children =
              treeCategory.children;
          }
        }

        /* ==============================================
           CURRENT SUBCATEGORY
        ============================================== */

        let currentSubcategory =
          null;

        if (
          subcategoryId
        ) {
          currentSubcategory =
            children.find(
              (
                child
              ) =>
                getId(
                  child
                ) ===
                String(
                  subcategoryId
                )
            ) ||
            null;
        }

        if (
          mounted
        ) {
          setCategory(
            normalized
          );

          setSubcategories(
            children
          );

          setSelectedSubcategory(
            currentSubcategory
          );

          setLoadingCat(
            false
          );
        }
      };

    loadCategory();

    return () => {
      mounted =
        false;
    };
  }, [
    slug,
    subcategoryId,
  ]);

  /* ====================================================
     LOAD PRODUCTS
  ==================================================== */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        if (
          loadingCat
        ) {
          return;
        }

        if (
          notFound &&
          slug !==
            "wardrobe"
        ) {
          return;
        }

        setLoadingProducts(
          true
        );

        setHoveredProducts(
          {}
        );

        setQuantities(
          {}
        );

        /* ==============================================
           WARDROBE
        ============================================== */

        if (
          slug ===
          "wardrobe"
        ) {
          /* -------------------------------------------
             SELECTED SUBCATEGORY
          ------------------------------------------- */

          if (
            subcategoryId
          ) {
            const exactProducts =
              await fetchAllProductsByCategory(
                subcategoryId
              );

            if (
              mounted
            ) {
              setAllProducts(
                exactProducts
              );

              setLoadingProducts(
                false
              );

              setPage(1);
            }

            return;
          }

          /* -------------------------------------------
             WHOLE WARDROBE
          ------------------------------------------- */

          const wardrobeProducts =
            await fetchAllWardrobeProducts();

          if (
            mounted
          ) {
            setAllProducts(
              wardrobeProducts
            );

            setLoadingProducts(
              false
            );

            setPage(1);
          }

          return;
        }

        /* ==============================================
           SELECTED SUBCATEGORY
        ============================================== */

        if (
          subcategoryId
        ) {
          const exactProducts =
            await fetchAllProductsByCategory(
              subcategoryId
            );

          if (
            mounted
          ) {
            setAllProducts(
              exactProducts
            );

            setLoadingProducts(
              false
            );

            setPage(1);
          }

          return;
        }

        /* ==============================================
           MAIN CATEGORY
        ============================================== */

        const mainCategoryId =
          getId(
            category
          );

        const combined =
          await fetchProductsForMainCategory(
            mainCategoryId,
            subcategories
          );

        if (
          mounted
        ) {
          setAllProducts(
            combined
          );

          setLoadingProducts(
            false
          );

          setPage(1);
        }
      };

    loadProducts();

    return () => {
      mounted =
        false;
    };
  }, [
    category,
    subcategories,
    subcategoryId,
    loadingCat,
    notFound,
    slug,
  ]);

  /* ====================================================
     SORT + PAGINATION
  ==================================================== */

  const sortedProducts =
    sortProducts(
      allProducts,
      selectedSort
    );

  const total =
    sortedProducts.length;

  const pages =
    Math.max(
      1,
      Math.ceil(
        total / LIMIT
      )
    );

  const safePage =
    Math.min(
      Math.max(
        page,
        1
      ),
      pages
    );

  const startIndex =
    (safePage - 1) *
    LIMIT;

  const endIndex =
    startIndex +
    LIMIT;

  const visibleProducts =
    sortedProducts.slice(
      startIndex,
      endIndex
    );

  /* ====================================================
     PAGE NUMBERS
  ==================================================== */

  function getPageNumbers() {
    const maxVisible = 5;

    const result = [];

    if (
      pages <=
      maxVisible
    ) {
      for (
        let i = 1;
        i <= pages;
        i++
      ) {
        result.push(i);
      }

      return result;
    }

    if (
      safePage <= 3
    ) {
      result.push(
        1,
        2,
        3,
        4,
        "...",
        pages
      );
    } else if (
      safePage >=
      pages - 2
    ) {
      result.push(
        1,
        "...",
        pages - 3,
        pages - 2,
        pages - 1,
        pages
      );
    } else {
      result.push(
        1,
        "...",
        safePage - 1,
        safePage,
        safePage + 1,
        "...",
        pages
      );
    }

    return result;
  }

  /* ====================================================
     HEADING
  ==================================================== */

  const heading =
    loadingCat
      ? ""
      : selectedSubcategory
        ? selectedSubcategory.name
        : category?.name ||
          String(
            slug || ""
          )
            .replace(
              /-/g,
              " "
            )
            .toUpperCase();

  /* ====================================================
     HERO IMAGE
  ==================================================== */

  const desktopHeroImage =
    selectedSubcategory?.heroImage ||
    category?.heroImage ||
    selectedSubcategory?.image ||
    category?.image ||
    "/images/new-arrivals-hero.jpg";

  const mobileHeroImage =
    selectedSubcategory?.mobileHeroImage ||
    category?.mobileHeroImage ||
    desktopHeroImage;

  /* ====================================================
     SUBCATEGORY
  ==================================================== */

  function handleSubcategoryClick(
    child
  ) {
    if (!child?._id) {
      return;
    }

    router.push(
      `/${slug}?subcategoryId=${encodeURIComponent(
        child._id
      )}`
    );
  }

  function handleMainCategoryClick() {
    router.push(
      `/${slug}`
    );
  }

  /* ====================================================
     PAGINATION
  ==================================================== */

  function goToPage(
    nextPage
  ) {
    if (
      nextPage < 1 ||
      nextPage > pages ||
      nextPage === safePage
    ) {
      return;
    }

    setPage(
      nextPage
    );

    setHoveredProducts(
      {}
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  /* ====================================================
     LOGIN HELPERS
  ==================================================== */

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

  function goToLogin(
    redirect
  ) {
    router.push(
      `/login?redirect=${encodeURIComponent(
        redirect
      )}`
    );
  }

  function savePendingAction(
    type,
    product
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

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
        window.location.pathname +
          window.location.search
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
        window.location.pathname +
          window.location.search
      );
    }
  }

  /* ====================================================
     WISHLIST
  ==================================================== */

  const handleToggleWishlist =
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
          "Please login first",
          {
            duration:
              2200,

            position:
              "top-right",
          }
        );

        setTimeout(
          () => {
            goToLogin(
              window.location.pathname +
                window.location.search
            );
          },
          450
        );

        return;
      }

      try {
        const nowSaved =
          await toggleWishlist(
            product
          );

        setWishlist(
          (previous) => {
            const copy = {
              ...previous,
            };

            if (
              nowSaved
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
          "Wishlist toggle error:",
          error
        );
      }
    };

  /* ====================================================
     COLOUR / SIZE SELECTION
  ==================================================== */

  function handleColorSelect(
    event,
    product,
    color
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedColors(
      (previous) => ({
        ...previous,
        [product.slug]: color,
      })
    );

    setQuantities(
      (previous) => ({
        ...previous,
        [product.slug]: 0,
      })
    );
  }

  function handleSizeSelect(
    event,
    product,
    size
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedSizes(
      (previous) => ({
        ...previous,
        [product.slug]: size,
      })
    );

    setQuantities(
      (previous) => ({
        ...previous,
        [product.slug]: 0,
      })
    );
  }

  /* ====================================================
     CART
  ==================================================== */

  const handleAddToCart =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const colors =
        getProductColors(product);

      const sizes =
        getProductSizes(product);

      const selectedColor =
        selectedColors[product.slug] || "";

      const selectedSize =
        selectedSizes[product.slug] || "";

      if (
        colors.length > 0 &&
        !selectedColor
      ) {
        toast.error(
          "Please select colour first",
          {
            duration: 1800,
            position: "top-right",
          }
        );
        return;
      }

      if (
        sizes.length > 0 &&
        !selectedSize
      ) {
        toast.error(
          "Please select size first",
          {
            duration: 1800,
            position: "top-right",
          }
        );
        return;
      }

      if (!isLoggedIn()) {
        savePendingAction(
          "cart",
          product
        );

        toast.error(
          "Please login first",
          {
            duration: 2200,
            position: "top-right",
          }
        );

        setTimeout(() => {
          goToLogin(
            window.location.pathname +
              window.location.search
          );
        }, 450);

        return;
      }

      try {
        const selectedVariant =
          sizes.find(
            (variant) =>
              getSizeName(variant) ===
              selectedSize
          ) || null;

        const actualPrice =
          selectedVariant
            ? getVariantActualPrice(
                selectedVariant
              )
            : getActualPrice(product);

        const sellingPrice =
          selectedVariant
            ? getVariantSellingPrice(
                selectedVariant
              )
            : getSellingPrice(product);

        const cartProduct = {
          ...product,
          selectedColor,
          selectedSize,
          selectedVariant,
          selectedActualPrice:
            actualPrice,
          selectedSellingPrice:
            sellingPrice,
          selectedShippingCost:
            Number(
              product?.shippingCost || 0
            ),
        };

        await addToCart(
          cartProduct,
          1
        );

        setQuantities(
          (previous) => ({
            ...previous,
            [product.slug]: 1,
          })
        );

        toast.success(
          "Added to cart",
          {
            duration: 1600,
            position: "top-right",
          }
        );
      } catch (error) {
        console.error(
          "ADD TO CART ERROR:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to add to cart",
          {
            duration: 2000,
            position: "top-right",
          }
        );
      }
    };

  /* ====================================================
     INCREASE QTY
  ==================================================== */

  const increaseQty =
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
          "Please login first",
          {
            duration:
              2200,

            position:
              "top-right",
          }
        );

        setTimeout(
          () => {
            goToLogin(
              window.location.pathname +
                window.location.search
            );
          },
          450
        );

        return;
      }

      const currentQty =
        quantities[
          product.slug
        ] || 1;

      const nextQty =
        currentQty + 1;

      try {
        await updateQty(
          product._id,
          nextQty
        );

        setQuantities(
          (previous) => ({
            ...previous,

            [product.slug]:
              nextQty,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "INCREASE QTY ERROR:",
          error
        );
      }
    };

  /* ====================================================
     DECREASE QTY
  ==================================================== */

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
          "Please login first",
          {
            duration:
              2200,

            position:
              "top-right",
          }
        );

        return;
      }

      const currentQty =
        quantities[
          product.slug
        ] || 1;

      const nextQty =
        currentQty - 1;

      try {
        await updateQty(
          product._id,
          nextQty
        );

        if (
          nextQty <= 0
        ) {
          setQuantities(
            (previous) => {
              const copy = {
                ...previous,
              };

              delete copy[
                product.slug
              ];

              return copy;
            }
          );
        } else {
          setQuantities(
            (previous) => ({
              ...previous,

              [product.slug]:
                nextQty,
            })
          );
        }
      } catch (
        error
      ) {
        console.error(
          "DECREASE QTY ERROR:",
          error
        );
      }
    };

  /* ====================================================
     IMAGE HOVER
  ==================================================== */

  function handleProductMouseEnter(
    product
  ) {
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
      (previous) => ({
        ...previous,

        [product.slug]:
          true,
      })
    );
  }

  function handleProductMouseLeave(
    product
  ) {
    setHoveredProducts(
      (previous) => ({
        ...previous,

        [product.slug]:
          false,
      })
    );
  }

  function handleProductTouchStart(
    event,
    product
  ) {
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
      (previous) => ({
        ...previous,

        [product.slug]:
          true,
      })
    );
  }

  /* ====================================================
     NOT FOUND
  ==================================================== */

  if (
    !loadingCat &&
    notFound &&
    slug !==
      "wardrobe"
  ) {
    return (
      <main
        style={{
          background:
            BG,

          minHeight:
            "60vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
          }}
        >
          <h2
            style={{
              fontFamily:
                "'Tobias TRIAL', serif",

              color:
                ACCENT,

              marginBottom:
                12,
            }}
          >
            Category not found
          </h2>

          <Link
            href="/collection"
            style={{
              color:
                ACCENT,

              fontSize:
                14,

              textDecoration:
                "none",

              borderBottom:
                `1px solid ${ACCENT}`,
            }}
          >
            ← Browse all categories
          </Link>
        </div>
      </main>
    );
  }

  const isLoading =
    loadingCat ||
    loadingProducts;

  const rangeStart =
    total === 0
      ? 0
      : startIndex + 1;

  const rangeEnd =
    Math.min(
      endIndex,
      total
    );

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <main className="cat-page">

      <style jsx>{`
        .cat-page {
          width: 100%;
          min-height: 100vh;
          background: ${BG};
          overflow-x: hidden;
        }

        /* ==============================================
           HERO
        ============================================== */

        .cat-hero-banner {
          width: 100%;
          overflow: hidden;
        }

        .cat-hero-banner picture {
          width: 100%;
          display: block;
        }

        .cat-hero-img {
          width: 100%;
          height: auto;
          aspect-ratio: 1920 / 540;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* ==============================================
           TOP LABEL
        ============================================== */

        .cat-top-label {
          text-align: center;
          padding: 32px 0 20px;
        }

        .cat-top-label p {
          margin: 0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size: 30px;
          font-weight: 500;
          line-height: 160%;

          color: ${ACCENT};

          letter-spacing:
            -0.02em;
        }

        /* ==============================================
           HEADER
        ============================================== */

        .cat-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 16px;

          padding:
            0 60px 20px;
        }

        .cat-section-title {
          margin: 0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size: 40px;
          font-weight: 500;

          letter-spacing:
            -0.02em;

          line-height: 1.2;

          color: ${ACCENT};
        }

        .cat-bulk-order-link {
          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size: 16px;

          color: ${ACCENT};

          text-decoration:
            none;

          border-bottom:
            1px solid
              ${ACCENT};

          padding-bottom: 2px;

          white-space:
            nowrap;
        }

        .cat-bulk-order-link:hover {
          opacity: 0.75;
        }

        /* ==============================================
           SUBCATEGORY
        ============================================== */

        .cat-subcategory-section {
          padding:
            0 60px 36px;
        }

        .cat-subcategory-title-row {
          display: flex;
          justify-content:
            space-between;
          align-items:
            center;

          gap: 20px;

          margin-bottom: 18px;
        }

        .cat-subcategory-title {
          margin: 0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size: 25px;
          font-weight: 500;

          color: ${ACCENT};
        }

        .cat-all-category-btn {
          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size: 12px;
          font-weight: 600;

          background:
            transparent;

          border:
            1px solid
              ${BORDER};

          color: #0e0e0e;

          padding:
            8px 15px;

          cursor:
            pointer;
        }

        .cat-all-category-btn:hover {
          background:
            #f0f2de;
        }

        .cat-subcategory-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap: 14px;
        }

        .cat-subcategory-card {
          border:
            1px solid
              ${BORDER};

          background:
            ${BG};

          text-decoration:
            none;

          color:
            #111;

          cursor:
            pointer;

          overflow:
            hidden;

          transition:
            border-color
              0.2s ease,
            transform
              0.2s ease,
            box-shadow
              0.2s ease;
        }

        .cat-subcategory-card:hover {
          border-color:
            ${ACCENT};

          transform:
            translateY(
              -2px
            );

          box-shadow:
            0 8px 20px
              rgba(
                0,
                0,
                0,
                0.06
              );
        }

        .cat-subcategory-card-active {
          border-color:
            ${ACCENT};

          box-shadow:
            0 0 0 1px
              ${ACCENT};
        }

        .cat-subcategory-image-wrap {
          width: 100%;

          aspect-ratio:
            4 / 3;

          overflow:
            hidden;

          background:
            #e8e9da;
        }

        .cat-subcategory-image {
          width: 100%;
          height: 100%;

          object-fit:
            cover;

          display:
            block;
        }

        .cat-subcategory-placeholder {
          width: 100%;
          height: 100%;

          background:
            #e8e9da;
        }

        .cat-subcategory-info {
          padding:
            13px 14px 15px;
        }

        .cat-subcategory-name {
          margin: 0;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size: 12px;
          font-weight: 700;

          color: #111;

          text-transform:
            uppercase;

          line-height:
            1.45;
        }

        .cat-subcategory-link {
          margin-top: 7px;

          display:
            block;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size: 10px;

          color: ${ACCENT};

          letter-spacing:
            0.04em;
        }

        /* ==============================================
           CONTROLS
        ============================================== */

        .cat-controls-bar {
          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          padding:
            14px 60px;

          position:
            relative;
        }

        .cat-sort-wrapper {
          position:
            relative;
        }

        .cat-sort-btn,
        .cat-filters-btn {
          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            13px;

          font-weight:
            600;

          color:
            #0e0e0e;

          background:
            ${BG};

          border:
            1px solid
              ${BORDER};

          padding:
            7px 16px;

          cursor:
            pointer;

          letter-spacing:
            0.04em;
        }

        .cat-sort-btn:hover,
        .cat-filters-btn:hover {
          background:
            #f0f2de;
        }

        .cat-sort-dropdown {
          position:
            absolute;

          top:
            110%;

          left:
            0;

          background:
            ${BG};

          border:
            1px solid
              ${BORDER};

          min-width:
            180px;

          z-index:
            99;

          box-shadow:
            0 4px 12px
              rgba(
                0,
                0,
                0,
                0.08
              );
        }

        .cat-sort-option {
          width:
            100%;

          display:
            block;

          text-align:
            left;

          border:
            none;

          background:
            transparent;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            13px;

          padding:
            10px 16px;

          cursor:
            pointer;

          color:
            #0e0e0e;
        }

        .cat-sort-option:hover,
        .cat-sort-option.active {
          background:
            #f0f2de;

          color:
            ${ACCENT};
        }

        .cat-product-count {
          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            14px;

          color:
            #555;
        }

        /* ==============================================
           PRODUCT GRID (base — overridden below,
           align-items now STRETCH so every card in a
           row matches the tallest card's height)
        ============================================== */

        .cat-product-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          align-items:
            stretch;

          gap:
            28px 20px;

          padding:
            0 60px 40px;

          max-width:
            1800px;

          margin:
            0 auto;
        }

        .cat-product-card-link {
          text-decoration:
            none;

          display:
            block;

          width:
            100%;

          height:
            100%;
        }

        .cat-product-card {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;

          height:
            100%;

          padding:
            14px;

          box-sizing:
            border-box;

          background:
            ${BG};

          border:
            1px solid
              #e2e3d7;

          border-radius:
            22px;

          box-shadow:
            0 12px 34px
              rgba(
                61,
                67,
                41,
                0.08
              ),
            0 2px 8px
              rgba(
                61,
                67,
                41,
                0.04
              );

          transition:
            transform
              0.25s ease,
            box-shadow
              0.25s ease;
        }

        .cat-product-card:hover {
          transform:
            translateY(
              -3px
            );

          box-shadow:
            0 18px 42px
              rgba(
                61,
                67,
                41,
                0.12
              ),
            0 4px 12px
              rgba(
                61,
                67,
                41,
                0.05
              );
        }

        /* ==============================================
           PRODUCT IMAGE
           
           TWO IMAGES STACKED
        ============================================== */

        .cat-product-img-wrapper {
          position:
            relative;

          width:
            100%;

          aspect-ratio:
            4 / 3;

          border-radius:
            15px;

          overflow:
            hidden;

          background:
            #e8e9da;

          cursor:
            pointer;
        }

        .cat-product-img {
          position:
            absolute;

          inset:
            0;

          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          display:
            block;

          transition:
            opacity
              0.35s ease,
            transform
              0.4s ease;
        }

        /*
         * Main image
         */

        .cat-product-img-main {
          z-index:
            1;

          opacity:
            1;
        }

        /*
         * Second image
         */

        .cat-product-img-hover {
          z-index:
            2;

          opacity:
            0;
        }

        /*
         * When mouse/finger is over product image
         */

        .cat-product-img-main.is-hidden {
          opacity:
            0;
        }

        .cat-product-img-hover.is-visible {
          opacity:
            1;
        }

        /*
         * Slight image zoom
         */

        .cat-product-img-wrapper:hover
          .cat-product-img-hover.is-visible {
          transform:
            scale(
              1.025
            );
        }

        /*
         * Small hover text
         */

        .cat-image-hover-label {
          position:
            absolute;

          left:
            50%;

          bottom:
            10px;

          transform:
            translateX(
              -50%
            );

          z-index:
            7;

          pointer-events:
            none;

          padding:
            5px 9px;

          border-radius:
            5px;

          background:
            rgba(
              15,
              15,
              15,
              0.72
            );

          color:
            #fff;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            8px;

          line-height:
            1.2;

          font-weight:
            600;

          white-space:
            nowrap;

          opacity:
            0;

          transition:
            opacity
              0.2s ease;
        }

        .cat-product-img-wrapper:hover
          .cat-image-hover-label {
          opacity:
            1;
        }

        /* ==============================================
           WISHLIST
        ============================================== */

        .cat-wishlist-btn {
          position:
            absolute;

          top:
            14px;

          right:
            14px;

          background:
            ${BG};

          border:
            1px solid
              rgba(
                123,
                127,
                92,
                0.16
              );

          border-radius:
            50%;

          width:
            54px;

          height:
            54px;

          font-size:
            28px;

          line-height:
            1;

          cursor:
            pointer;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            #888;

          box-shadow:
            0 5px 16px
              rgba(
                0,
                0,
                0,
                0.08
              );

          z-index:
            10;

          transition:
            transform
              0.2s ease,
            color
              0.2s ease;
        }

        .cat-wishlist-btn:hover {
          transform:
            scale(
              1.04
            );

          color:
            ${ACCENT};
        }

        .cat-wishlist-btn-active {
          color:
            #9b3043;
        }

        .cat-wishlist-btn:active {
          transform:
            scale(
              0.95
            );
        }

        /* ==============================================
           PRODUCT INFO
        ============================================== */

        .cat-product-info {
          width:
            100%;

          padding:
            18px 8px 4px;

          display:
            flex;

          flex-direction:
            column;

          flex:
            1;
        }

        .cat-product-name-row {
          display:
            flex;

          align-items:
            center;

          gap:
            18px;

          min-height:
            40px;

          margin-bottom:
            14px;
        }

        .cat-product-name {
          flex:
            0 1 auto;

          min-width:
            0;

          margin:
            0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            25px;

          line-height:
            1.15;

          font-weight:
            500;

          letter-spacing:
            -0.02em;

          color:
            #151515;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          display:
            -webkit-box;

          -webkit-line-clamp:
            2;

          -webkit-box-orient:
            vertical;

          text-transform:
            uppercase;
        }

        .cat-product-name-rule {
          width:
            86px;

          height:
            1px;

          background:
            #b9a764;

          flex:
            0 0 auto;

          margin-left:
            auto;

          margin-top:
            8px;
        }

        .cat-product-price {
          margin:
            0 0 20px;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            23px;

          line-height:
            1;

          font-weight:
            700;

          color:
            #171717;
        }

        .cat-product-actions {
          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            minmax(
              0,
              1fr
            );

          gap:
            12px;

          align-items:
            stretch;

          margin-top:
            auto;
        }

        .cat-btn-enquiry,
        .cat-btn-bulk {
          width:
            100%;

          min-height:
            60px;

          box-sizing:
            border-box;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          text-align:
            center;

          padding:
            14px 16px;

          font-family:
            "Mona Sans",
            "Inter",
            sans-serif;

          font-size:
            12px;

          line-height:
            1.35;

          font-weight:
            700;

          letter-spacing:
            0.055em;

          text-transform:
            uppercase;

          cursor:
            pointer;

          transition:
            background-color
              0.2s ease,
            border-color
              0.2s ease,
            color
              0.2s ease,
            transform
              0.15s ease;
        }

        .cat-btn-enquiry {
          background:
            ${ACCENT};

          color:
            #fff;

          border:
            1px solid
              ${ACCENT};
        }

        .cat-btn-enquiry:hover {
          background:
            #676a4c;

          border-color:
            #676a4c;
        }

        .cat-btn-bulk {
          background:
            transparent;

          color:
            #1b1b1b;

          border:
            1px solid
              ${BORDER};
        }

        .cat-btn-bulk:hover {
          background:
            #f4f5eb;

          border-color:
            ${ACCENT};
        }

        .cat-qty-control {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;

          min-height:
            60px;

          width:
            100%;

          min-width:
            0;

          box-sizing:
            border-box;

          border:
            1px solid
              ${BORDER};

          padding:
            0 14px;

          background:
            transparent;
        }

        .cat-qty-control button {
          border:
            none;

          background:
            transparent;

          cursor:
            pointer;

          font-size:
            22px;

          width:
            30px;

          height:
            30px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            0;

          color:
            #111;
        }

        .cat-qty-control span {
          font-family:
            "Mona Sans",
            sans-serif;

          font-weight:
            600;

          font-size:
            14px;

          text-align:
            center;

          min-width:
            18px;
        }

        /* ==============================================
           PAGINATION
        ============================================== */

        .cat-pagination-area {
          text-align:
            center;

          padding:
            20px 60px
            60px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            18px;
        }

        .cat-showing-text {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            13px;

          color:
            #777;

          margin:
            0;
        }

        .cat-pagination-nav {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          flex-wrap:
            wrap;

          gap:
            8px;
        }

        .cat-page-btn {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            13px;

          font-weight:
            600;

          background:
            ${BG};

          border:
            1px solid
              ${BORDER};

          color:
            #0e0e0e;

          width:
            38px;

          height:
            38px;

          border-radius:
            50%;

          cursor:
            pointer;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          transition:
            background-color
              0.2s ease,
            border-color
              0.2s ease,
            color
              0.2s ease;
        }

        .cat-page-btn:hover:not(
            :disabled
          ) {
          background:
            #f4f5eb;

          border-color:
            ${ACCENT};
        }

        .cat-page-btn:disabled {
          opacity:
            0.35;

          cursor:
            not-allowed;
        }

        .cat-page-active {
          background:
            ${ACCENT};

          border-color:
            ${ACCENT};

          color:
            #fff;
        }

        .cat-page-nav {
          width:
            auto;

          border-radius:
            20px;

          padding:
            0 18px;
        }

        .cat-page-dots {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            13px;

          color:
            #999;

          padding:
            0 2px;
        }

        .cat-back-to-top {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            12px;

          color:
            ${ACCENT};

          background:
            none;

          border:
            none;

          cursor:
            pointer;

          letter-spacing:
            0.06em;
        }

        /* ==============================================
           EMPTY
        ============================================== */

        .cat-empty {
          grid-column:
            1 / -1;

          text-align:
            center;

          padding:
            80px 20px;

          font-family:
            "Mona Sans",
            sans-serif;

          color:
            #888;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            16px;
        }

        /* ==============================================
           SKELETON
        ============================================== */

        .cat-skel {
          display:
            block;

          position:
            relative;

          overflow:
            hidden;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );

          border-radius:
            4px;
        }

        .cat-skel::after {
          content:
            "";

          position:
            absolute;

          inset:
            0;

          transform:
            translateX(
              -100%
            );

          background:
            linear-gradient(
              90deg,
              rgba(
                255,
                255,
                255,
                0
              ),
              rgba(
                255,
                255,
                255,
                0.55
              ),
              rgba(
                255,
                255,
                255,
                0
              )
            );

          animation:
            catShimmer
            1.4s
            infinite;
        }

        @keyframes catShimmer {
          100% {
            transform:
              translateX(
                100%
              );
          }
        }

        .cat-hero-skel {
          width:
            100%;

          height:
            auto;

          aspect-ratio:
            1920 / 540;

          border-radius:
            0;
        }

        .cat-skel-label {
          width:
            220px;

          height:
            30px;

          margin:
            0 auto;
        }

        .cat-skel-title {
          width:
            260px;

          height:
            40px;
        }

        .cat-skel-link {
          width:
            140px;

          height:
            20px;
        }

        .cat-skel-sortbtn {
          width:
            110px;

          height:
            34px;
        }

        .cat-skel-count {
          width:
            90px;

          height:
            18px;
        }

        .cat-card-skel-img {
          width:
            100%;

          aspect-ratio:
            4 / 3;

          border-radius:
            15px;
        }

        .cat-card-skel-name {
          width:
            80%;

          height:
            22px;

          margin:
            14px 0;
        }

        .cat-card-skel-actions {
          display:
            flex;

          gap:
            10px;
        }

        .cat-card-skel-btn1 {
          flex:
            1;

          height:
            52px;
        }

        .cat-card-skel-btn2 {
          flex:
            1;

          height:
            52px;
        }

        /* ==============================================
           RESPONSIVE
        ============================================== */

        @media (max-width: 1100px) {
          .cat-subcategory-grid {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }

          .cat-product-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              24px 18px;
          }
        }

        @media (max-width: 900px) {
          .cat-section-header,
          .cat-controls-bar,
          .cat-pagination-area,
          .cat-subcategory-section {
            padding-left:
              24px;

            padding-right:
              24px;
          }

          .cat-section-title {
            font-size:
              30px;
          }

          .cat-subcategory-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .cat-product-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            padding:
              0 24px 32px;

            gap:
              20px 14px;
          }
        }

        @media (max-width: 560px) {
          .cat-top-label {
            padding:
              20px 16px
              12px;
          }

          .cat-top-label p {
            font-size:
              22px;
          }

          .cat-section-header {
            padding:
              18px 16px
              16px;

            flex-direction:
              column;

            align-items:
              flex-start;

            gap:
              10px;
          }

          .cat-section-title {
            font-size:
              24px;
          }

          .cat-subcategory-section {
            padding:
              8px 16px
              24px;
          }

          .cat-subcategory-title-row {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              10px;
          }

          .cat-subcategory-title {
            font-size:
              21px;
          }

          .cat-subcategory-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );

            gap:
              10px;
          }

          .cat-subcategory-info {
            padding:
              10px;
          }

          .cat-subcategory-name {
            font-size:
              10px;
          }

          .cat-controls-bar {
            padding:
              0 16px 18px;

            flex-wrap:
              wrap;

            gap:
              10px;
          }

          .cat-sort-btn,
          .cat-filters-btn {
            font-size:
              10px;

            padding:
              7px 10px;
          }

          .cat-product-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            padding:
              0 12px 28px;

            gap:
              14px 10px;
          }

          .cat-product-card {
            padding:
              8px;

            border-radius:
              16px;
          }

          .cat-product-img-wrapper {
            aspect-ratio:
              4 / 3.35;

            border-radius:
              12px;
          }

          .cat-image-hover-label {
            display:
              none;
          }

          .cat-wishlist-btn {
            top:
              8px;

            right:
              8px;

            width:
              38px;

            height:
              38px;

            font-size:
              21px;
          }

          .cat-product-info {
            padding:
              12px 5px 4px;
          }

          .cat-product-name-row {
            gap:
              7px;

            margin-bottom:
              9px;
          }

          .cat-product-name {
            font-size:
              14px;

            line-height:
              1.2;
          }

          .cat-product-name-rule {
            width:
              24px;
          }

          .cat-product-price {
            font-size:
              16px;

            margin-bottom:
              10px;
          }

          .cat-product-actions {
            grid-template-columns:
              1fr;

            gap:
              7px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk,
          .cat-qty-control {
            min-height:
              42px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk {
            font-size:
              8px;

            padding:
              9px 7px;

            letter-spacing:
              0.04em;
          }

          .cat-qty-control {
            padding:
              0 10px;
          }

          .cat-qty-control button {
            font-size:
              18px;
          }

          .cat-pagination-area {
            padding:
              12px 16px
              40px;

            gap:
              14px;
          }

          .cat-pagination-nav {
            gap:
              6px;
          }

          .cat-page-btn {
            width:
              34px;

            height:
              34px;

            font-size:
              12px;
          }

          .cat-page-nav {
            padding:
              0 12px;
          }
        }

        @media (max-width: 420px) {
          .cat-product-grid {
            padding-left:
              10px;

            padding-right:
              10px;
          }

          .cat-product-card {
            padding:
              7px;

            border-radius:
              14px;
          }

          .cat-product-name {
            font-size:
              12px;
          }

          .cat-product-price {
            font-size:
              15px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk {
            font-size:
              7px;
          }

          .cat-wishlist-btn {
            width:
              34px;

            height:
              34px;

            font-size:
              19px;
          }

          .cat-page-btn {
            width:
              30px;

            height:
              30px;

            font-size:
              11px;
          }
        }

        /*
         * Touch devices:
         * image swap remains active.
         */

        @media (hover: none) {
          .cat-product-img-wrapper {
            -webkit-tap-highlight-color:
              transparent;
          }
        }

        /* ==================================================
           UPDATED PRODUCT CARD
           (align-items: stretch added here too so this
           final grid rule — which wins on cascade for the
           properties it sets — never re-introduces the
           "start" behaviour that caused uneven card sizes)
        ================================================== */

        .cat-product-grid {
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 26px 18px;
          align-items: stretch;
        }

        .cat-product-card-link {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
          color: inherit;
        }

        .cat-product-card {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fdfff1;
          border: 1px solid rgba(123,127,92,0.18);
          border-radius: 18px;
          padding: 11px;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 8px 22px rgba(55,60,37,0.07);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .cat-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 13px 28px rgba(55,60,37,0.10);
        }

        .cat-product-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 4.1;
          overflow: hidden;
          border-radius: 13px;
          background: #e8e9da;
        }

        .cat-product-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity .35s ease, transform .4s ease;
        }

        .cat-product-img-main {
          z-index: 1;
          opacity: 1;
        }

        .cat-product-img-hover {
          z-index: 2;
          opacity: 0;
        }

        .cat-product-img-main.is-hidden {
          opacity: 0;
        }

        .cat-product-img-hover.is-visible {
          opacity: 1;
          transform: scale(1.02);
        }

        .cat-product-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e9da;
        }

        .cat-wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          width: 48px;
          height: 48px;
          border: 1px solid #d4d4d0;
          border-radius: 50%;
          background: #fdfff1;
          color: #7d7d73;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }

        .cat-wishlist-btn-active {
          color: #9d3548;
        }

        .cat-product-info {
          width: 100%;
          padding: 14px 5px 4px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .cat-colour-section {
          width: 100%;
          margin-bottom: 10px;
        }

        .cat-colour-heading,
        .cat-size-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .cat-colour-title,
        .cat-size-title {
          color: #555;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 14px;
          line-height: 1.2;
          font-weight: 700;
        }

        .cat-select-label {
          color: #888;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 10px;
          line-height: 1;
          font-weight: 700;
          text-transform: uppercase;
        }

        .cat-colour-options,
        .cat-size-options {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cat-colour-circle {
          width: 28px;
          height: 28px;
          padding: 0;
          border: 1px solid #aaa;
          border-radius: 50%;
          cursor: pointer;
        }

        .cat-colour-circle.selected {
          box-shadow: 0 0 0 2px #fdfff1, 0 0 0 4px #111;
          border-color: #111;
        }

        .cat-product-name-row {
          margin-bottom: 8px;
        }

        .cat-product-name {
          margin: 0;
          color: #111;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 21px;
          line-height: 1.24;
          font-weight: 700;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cat-price-section {
          width: 100%;
          margin-bottom: 10px;
        }

        .cat-price-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .cat-selling-price {
          color: #111;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 24px;
          line-height: 1;
          font-weight: 800;
        }

        .cat-mrp-price {
          color: #777;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          line-height: 1;
          text-decoration: line-through;
        }

        .cat-discount-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 7px;
          border-radius: 6px;
          background: #dfe8cf;
          color: #42602f;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 10px;
          line-height: 1;
          font-weight: 800;
        }

        .cat-shipping-text {
          margin-top: 5px;
          color: #666;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 11px;
          line-height: 1.3;
        }

        .cat-size-section {
          width: 100%;
          padding: 9px;
          margin-bottom: 10px;
          border: 1px solid #d7d8ca;
          border-radius: 9px;
          box-sizing: border-box;
        }

        .cat-size-button {
          min-width: 43px;
          min-height: 32px;
          padding: 0 9px;
          border: 1px solid #c8c8c8;
          border-radius: 6px;
          background: #fdfff1;
          color: #111;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .cat-size-button.selected {
          background: ${ACCENT};
          border-color: ${ACCENT};
          color: #fff;
        }

        .cat-card-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: auto;
        }

        .cat-add-cart-button,
        .cat-bulk-button {
          width: 100%;
          min-height: 47px;
          padding: 10px 12px;
          border-radius: 8px;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 10px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: .035em;
          cursor: pointer;
        }

        .cat-add-cart-button {
          background: #fdfff1;
          border: 1px solid #111;
          color: #111;
        }

        .cat-add-cart-button:hover {
          background: #111;
          color: #fff;
        }

        .cat-bulk-button {
          background: #fdfff1;
          border: 1px solid ${ACCENT};
          color: ${ACCENT};
        }

        .cat-bulk-button:hover {
          background: ${ACCENT};
          color: #fff;
        }

        .cat-qty-control {
          width: 100%;
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #111;
          border-radius: 8px;
          background: #fdfff1;
          box-sizing: border-box;
        }

        .cat-qty-control button {
          width: 42px;
          height: 45px;
          border: none;
          background: transparent;
          color: #111;
          font-size: 20px;
          cursor: pointer;
        }

        .cat-qty-control span {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #111;
        }

        @media (max-width: 1100px) {
          .cat-product-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .cat-product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 16px 10px;
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        @media (max-width: 560px) {
          .cat-product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 12px 7px;
            padding-left: 8px;
            padding-right: 8px;
          }

          .cat-product-card {
            padding: 6px;
            border-radius: 12px;
          }

          .cat-product-img-wrapper {
            aspect-ratio: 4 / 4.25;
            border-radius: 9px;
          }

          .cat-wishlist-btn {
            top: 6px;
            right: 6px;
            width: 34px;
            height: 34px;
            font-size: 19px;
          }

          .cat-product-info {
            padding: 9px 3px 3px;
          }

          .cat-colour-title,
          .cat-size-title {
            font-size: 9px;
          }

          .cat-select-label {
            font-size: 7px;
          }

          .cat-colour-options {
            gap: 5px;
          }

          .cat-colour-circle {
            width: 19px;
            height: 19px;
          }

          .cat-product-name {
            font-size: 13px;
          }

          .cat-selling-price {
            font-size: 16px;
          }

          .cat-mrp-price {
            font-size: 8px;
          }

          .cat-discount-badge {
            padding: 4px 5px;
            font-size: 6.5px;
          }

          .cat-shipping-text {
            font-size: 8px;
          }

          .cat-size-section {
            padding: 7px;
            margin-bottom: 7px;
            border-radius: 7px;
          }

          .cat-size-options {
            gap: 4px;
          }

          .cat-size-button {
            min-width: 29px;
            min-height: 25px;
            padding: 0 6px;
            font-size: 7px;
            border-radius: 5px;
          }

          .cat-card-actions {
            gap: 5px;
          }

          .cat-add-cart-button,
          .cat-bulk-button,
          .cat-qty-control {
            min-height: 37px;
          }

          .cat-add-cart-button,
          .cat-bulk-button {
            padding: 6px 4px;
            font-size: 6.5px;
          }

          .cat-qty-control button {
            width: 30px;
            height: 35px;
            font-size: 17px;
          }

          .cat-qty-control span {
            font-size: 9px;
          }
        }
      `}

</style>

      {/* ==================================================
          HERO
      ================================================== */}

      <div className="cat-hero-banner">
        {isLoading &&
        !category ? (
          <HeroSkeleton />
        ) : (
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={
                mobileHeroImage
              }
            />

            <img
              src={
                desktopHeroImage
              }
              alt={
                heading ||
                "Category"
              }
              className="cat-hero-img"
            />
          </picture>
        )}
      </div>

      {/* ==================================================
          LABEL
      ================================================== */}

      <div className="cat-top-label">
        {loadingCat ? (
          <span className="cat-skel cat-skel-label" />
        ) : (
          <p>
            COLLECTION
          </p>
        )}
      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="cat-section-header">
        {loadingCat ? (
          <>
            <span className="cat-skel cat-skel-title" />
            <span className="cat-skel cat-skel-link" />
          </>
        ) : (
          <>
            <h2 className="cat-section-title">
              {heading}
            </h2>

            <a
              href="/enquiry"
              className="cat-bulk-order-link"
            >
              Bulk Order Request →
            </a>
          </>
        )}
      </div>

      {/* ==================================================
          SUBCATEGORIES
      ================================================== */}

      {!loadingCat &&
        subcategories.length >
          0 && (
          <section className="cat-subcategory-section">
            <div className="cat-subcategory-title-row">
              <h3 className="cat-subcategory-title">
                Shop By Subcategory
              </h3>

              {subcategoryId && (
                <button
                  type="button"
                  className="cat-all-category-btn"
                  onClick={
                    handleMainCategoryClick
                  }
                >
                  VIEW ALL
                </button>
              )}
            </div>

            <div className="cat-subcategory-grid">
              {subcategories.map(
                (
                  child
                ) => {
                  const childId =
                    getId(
                      child
                    );

                  const active =
                    String(
                      subcategoryId ||
                        ""
                    ) ===
                    String(
                      childId
                    );

                  return (
                    <button
                      type="button"
                      key={
                        childId ||
                        child.slug
                      }
                      onClick={() =>
                        handleSubcategoryClick(
                          child
                        )
                      }
                      className={`cat-subcategory-card${
                        active
                          ? " cat-subcategory-card-active"
                          : ""
                      }`}
                    >
                      <div className="cat-subcategory-image-wrap">
                        {child.image ? (
                          <img
                            src={
                              child.image
                            }
                            alt={
                              child.name
                            }
                            className="cat-subcategory-image"
                          />
                        ) : (
                          <div className="cat-subcategory-placeholder" />
                        )}
                      </div>

                      <div className="cat-subcategory-info">
                        <p className="cat-subcategory-name">
                          {
                            child.name
                          }
                        </p>

                        <span className="cat-subcategory-link">
                          VIEW PRODUCTS →
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )}

      {/* ==================================================
          CONTROLS
      ================================================== */}

      <div className="cat-controls-bar">
        {isLoading ? (
          <>
            <span className="cat-skel cat-skel-sortbtn" />
            <span className="cat-skel cat-skel-count" />
            <span className="cat-skel cat-skel-sortbtn" />
          </>
        ) : (
          <>
            <div className="cat-sort-wrapper">
              <button
                type="button"
                className="cat-sort-btn"
                onClick={() =>
                  setSortOpen(
                    (
                      value
                    ) =>
                      !value
                  )
                }
              >
                SORT BY:{" "}
                {
                  selectedSort
                }{" "}
                ▾
              </button>

              {sortOpen && (
                <div className="cat-sort-dropdown">
                  {SORT_OPTIONS.map(
                    (
                      option
                    ) => (
                      <button
                        key={
                          option
                        }
                        type="button"
                        className={`cat-sort-option${
                          selectedSort ===
                          option
                            ? " active"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedSort(
                            option
                          );

                          setSortOpen(
                            false
                          );

                          setPage(
                            1
                          );

                          setHoveredProducts(
                            {}
                          );
                        }}
                      >
                        {
                          option
                        }
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <span className="cat-product-count">
              {total}{" "}
              Products
            </span>

            <button
              type="button"
              className="cat-filters-btn"
            >
              FILTERS ⇅
            </button>
          </>
        )}
      </div>

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <div className="cat-product-grid">
        {isLoading ? (
          Array.from({
            length: SKELETON_COUNT,
          }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : visibleProducts.length === 0 ? (
          <div className="cat-empty">
            <p>
              No products found
              {selectedSubcategory
                ? ` in ${selectedSubcategory.name}.`
                : " in this category."}
            </p>

            {subcategoryId ? (
              <button
                type="button"
                onClick={
                  handleMainCategoryClick
                }
                style={{
                  color: ACCENT,
                  fontSize: 14,
                  textDecoration: "none",
                  border: "none",
                  borderBottom:
                    `1px solid ${ACCENT}`,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                ← View all category products
              </button>
            ) : (
              <Link
                href="/collection"
                style={{
                  color: ACCENT,
                  fontSize: 14,
                  textDecoration: "none",
                  borderBottom:
                    `1px solid ${ACCENT}`,
                }}
              >
                ← Browse all categories
              </Link>
            )}
          </div>
        ) : (
          visibleProducts.map((product) => {
            const images =
              getProductImages(product);

            const mainImage =
              images[0] || "";

            const hoverImage =
              images[1] || "";

            const isHovered = Boolean(
              hoveredProducts[product.slug]
            );

            const colors =
              getProductColors(product);

            const sizes =
              getProductSizes(product);

            const selectedColor =
              selectedColors[product.slug] || "";

            const selectedSize =
              selectedSizes[product.slug] || "";

            const selectedVariant =
              sizes.find(
                (variant) =>
                  getSizeName(variant) ===
                  selectedSize
              ) || null;

            const actualPrice =
              selectedVariant
                ? getVariantActualPrice(
                    selectedVariant
                  )
                : getActualPrice(product);

            const sellingPrice =
              selectedVariant
                ? getVariantSellingPrice(
                    selectedVariant
                  )
                : getSellingPrice(product);

            const discount =
              getDiscountPercent(
                actualPrice,
                sellingPrice
              );

            const shippingCost = Number(
              product?.shippingCost || 0
            );

            const quantity =
              quantities[product.slug] || 0;

            return (
              <Link
                href={`/products/${product.slug}`}
                key={product._id}
                className="cat-product-card-link"
              >
                <article className="cat-product-card">
                  <div
                    className="cat-product-img-wrapper"
                    onMouseEnter={() =>
                      handleProductMouseEnter(
                        product
                      )
                    }
                    onMouseLeave={() =>
                      handleProductMouseLeave(
                        product
                      )
                    }
                    onTouchStart={(event) =>
                      handleProductTouchStart(
                        event,
                        product
                      )
                    }
                  >
                    {mainImage ? (
                      <>
                        <img
                          src={mainImage}
                          alt={
                            product.name ||
                            "Product"
                          }
                          className={`cat-product-img cat-product-img-main${
                            isHovered &&
                            hoverImage
                              ? " is-hidden"
                              : ""
                          }`}
                        />

                        {hoverImage && (
                          <img
                            src={hoverImage}
                            alt={
                              product.name ||
                              "Product preview"
                            }
                            className={`cat-product-img cat-product-img-hover${
                              isHovered
                                ? " is-visible"
                                : ""
                            }`}
                          />
                        )}
                      </>
                    ) : (
                      <div className="cat-product-img-placeholder" />
                    )}

                    <button
                      type="button"
                      className={`cat-wishlist-btn${
                        wishlist[product.slug]
                          ? " cat-wishlist-btn-active"
                          : ""
                      }`}
                      aria-label="Wishlist"
                      onClick={(event) =>
                        handleToggleWishlist(
                          event,
                          product
                        )
                      }
                    >
                      {wishlist[product.slug]
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <div className="cat-product-info">
                    {colors.length > 0 && (
                      <div
                        className="cat-colour-section"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <div className="cat-colour-heading">
                          <span className="cat-colour-title">
                            Colour
                          </span>

                          <span className="cat-select-label">
                            {selectedColor
                              ? "SELECTED"
                              : "SELECT"}
                          </span>
                        </div>

                        <div className="cat-colour-options">
                          {colors.map(
                            (color, index) => (
                              <button
                                key={`${product._id}-color-${index}`}
                                type="button"
                                className={`cat-colour-circle${
                                  selectedColor ===
                                  color
                                    ? " selected"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                                title={color}
                                aria-label={`Select ${color}`}
                                onClick={(event) =>
                                  handleColorSelect(
                                    event,
                                    product,
                                    color
                                  )
                                }
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="cat-product-name-row">
                      <h3 className="cat-product-name">
                        {product.name}
                      </h3>
                    </div>

                    <div className="cat-price-section">
                      <div className="cat-price-row">
                        <span className="cat-selling-price">
                          {sizes.length > 0 &&
                          !selectedSize
                            ? "From "
                            : ""}
                          {formatCurrency(
                            sellingPrice
                          )}
                        </span>

                        {actualPrice > 0 &&
                          actualPrice !==
                            sellingPrice && (
                            <span className="cat-mrp-price">
                              {formatCurrency(
                                actualPrice
                              )}
                            </span>
                          )}

                        {discount > 0 && (
                          <span className="cat-discount-badge">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="cat-shipping-text">
                        {shippingCost > 0
                          ? `Shipping ${formatCurrency(
                              shippingCost
                            )}`
                          : "Free Shipping"}
                      </div>
                    </div>

                    {sizes.length > 0 && (
                      <div
                        className="cat-size-section"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <div className="cat-size-heading">
                          <span className="cat-size-title">
                            Size
                          </span>

                          <span className="cat-select-label">
                            {selectedSize ||
                              "SELECT"}
                          </span>
                        </div>

                        <div className="cat-size-options">
                          {sizes.map(
                            (size, index) => {
                              const name =
                                getSizeName(
                                  size
                                );

                              return (
                                <button
                                  key={`${product._id}-size-${index}`}
                                  type="button"
                                  className={`cat-size-button${
                                    selectedSize ===
                                    name
                                      ? " selected"
                                      : ""
                                  }`}
                                  onClick={(
                                    event
                                  ) =>
                                    handleSizeSelect(
                                      event,
                                      product,
                                      name
                                    )
                                  }
                                >
                                  {name}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className="cat-card-actions"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      {quantity > 0 ? (
                        <div className="cat-qty-control">
                          <button
                            type="button"
                            onClick={(event) =>
                              decreaseQty(
                                event,
                                product
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={(event) =>
                              increaseQty(
                                event,
                                product
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cat-add-cart-button"
                          onClick={(event) =>
                            handleAddToCart(
                              event,
                              product
                            )
                          }
                        >
                          ADD TO CART
                        </button>
                      )}

                      <button
                        type="button"
                        className="cat-bulk-button"
                        onClick={(event) => {
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
              </Link>
            );
          })
        )}
      </div>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      {!isLoading &&
        total > 0 && (
          <div className="cat-pagination-area">

            <p className="cat-showing-text">
              Showing{" "}
              {rangeStart}{" "}
              –{" "}
              {rangeEnd}{" "}
              of{" "}
              {total}
            </p>

            {pages > 1 && (
              <div className="cat-pagination-nav">

                <button
                  type="button"
                  className="cat-page-btn cat-page-nav"
                  onClick={() =>
                    goToPage(
                      safePage -
                        1
                    )
                  }
                  disabled={
                    safePage ===
                    1
                  }
                >
                  ← PREV
                </button>

                {getPageNumbers().map(
                  (
                    number,
                    index
                  ) =>
                    number ===
                    "..." ? (
                      <span
                        key={`dots-${index}`}
                        className="cat-page-dots"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={
                          number
                        }
                        type="button"
                        className={`cat-page-btn${
                          number ===
                          safePage
                            ? " cat-page-active"
                            : ""
                        }`}
                        onClick={() =>
                          goToPage(
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
                  className="cat-page-btn cat-page-nav"
                  onClick={() =>
                    goToPage(
                      safePage +
                        1
                    )
                  }
                  disabled={
                    safePage ===
                    pages
                  }
                >
                  NEXT →
                </button>

              </div>
            )}

            <button
              type="button"
              className="cat-back-to-top"
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

          </div>
        )}

    </main>
  );
}

/* ======================================================
   HERO SKELETON
====================================================== */

function HeroSkeleton() {
  return (
    <span className="cat-skel cat-hero-skel" />
  );
}

/* ======================================================
   CARD SKELETON
====================================================== */

function CardSkeleton() {
  return (
    <div
      style={{
        display:
          "flex",

        flexDirection:
          "column",
      }}
    >
      <span className="cat-skel cat-card-skel-img" />

      <div
        style={{
          padding:
            "10px 4px 0",
        }}
      >
        <span className="cat-skel cat-card-skel-name" />

        <div className="cat-card-skel-actions">
          <span className="cat-skel cat-card-skel-btn1" />
          <span className="cat-skel cat-card-skel-btn2" />
        </div>
      </div>
    </div>
  );
}