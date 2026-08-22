"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { addToCart, updateQty } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist";

// ======================================================
// CONFIG
// ======================================================

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

// ======================================================
// SAFE DATA HELPERS
// ======================================================

function getId(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
}

function normalizeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

// ======================================================
// FETCH CATEGORY BY SLUG
// ======================================================

async function fetchCategoryBySlug(slug) {
  try {
    const cleanSlug = normalizeSlug(slug);

    const res = await fetch(
      `${BASE}/categories/${encodeURIComponent(cleanSlug)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const body = await res.json();

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

// ======================================================
// FETCH PUBLIC CATEGORY TREE
// FALLBACK FOR CHILDREN
// ======================================================

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

          cache: "no-store",
        }
      );

    if (!res.ok) {
      console.error(
        "CATEGORY TREE ERROR:",
        res.status
      );

      return [];
    }

    const body =
      await res.json();

    const data =
      Array.isArray(body)
        ? body
        : Array.isArray(
            body?.data
          )
        ? body.data
        : Array.isArray(
            body?.data?.categories
          )
        ? body.data.categories
        : [];

    return Array.isArray(data)
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

// ======================================================
// NORMALIZE CATEGORY
// ======================================================

function normalizeCategory(category) {
  if (!category) return null;

  const children = Array.isArray(category.children)
    ? category.children
    : [];

  return {
    ...category,

    _id: category._id || category.id || "",

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

    children: children
      .filter(Boolean)
      .map((child) => ({
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
      })),
  };
}

// ======================================================
// FIND CATEGORY TREE NODE
// ======================================================

function findCategoryInTree(
  tree,
  slug
) {
  const cleanSlug =
    normalizeSlug(slug);

  if (!cleanSlug) {
    return null;
  }

  for (const parent of tree) {
    if (
      normalizeSlug(parent?.slug) ===
      cleanSlug
    ) {
      return normalizeCategory(
        parent
      );
    }
  }

  return null;
}

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
      String(PRODUCT_FETCH_LIMIT)
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

          cache: "no-store",
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
async function fetchAllWardrobeProducts() {
  const first =
    await fetchWardrobeProductsPage(
      1
    );

  let all =
    [
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
        result.products.length
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
// ======================================================
// FETCH PRODUCTS BY EXACT CATEGORY ID
// ======================================================

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
      String(PRODUCT_FETCH_LIMIT)
    );

    params.set(
      "category",
      String(categoryId)
    );

    const res = await fetch(
      `${BASE}/products?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
        },
        cache: "no-store",
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
        Number(data.total) || 0,

      pages:
        Number(data.pages) || 1,
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

// ======================================================
// FETCH ALL PRODUCTS FOR ONE CATEGORY
// ======================================================

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

  let all =
    [...first.products];

  const totalPages =
    Math.max(
      Number(first.pages) || 1,
      1
    );

  if (totalPages > 1) {
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
        result.products.length
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

// ======================================================
// FETCH ALL PRODUCTS FOR MAIN CATEGORY
// INCLUDING ALL SUBCATEGORIES
// ======================================================

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
        !categoryIds.includes(id)
      ) {
        categoryIds.push(id);
      }
    }
  );

  if (!categoryIds.length) {
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
              seen.add(key);
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

// ======================================================
// SORT PRODUCTS
// ======================================================

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
    sort === "Name A–Z"
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
    sort === "Name Z–A"
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
    sort === "Newest"
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

        return bDate - aDate;
      }
    );
  }

  return list;
}

// ======================================================
// COMPONENT
// ======================================================

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

  // ====================================================
  // STATE
  // ====================================================

  const [category, setCategory] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [allProducts, setAllProducts] =
    useState([]);

  const [
    subcategories,
    setSubcategories,
  ] = useState([]);

  const [
    selectedSubcategory,
    setSelectedSubcategory,
  ] = useState(null);

  const [loadingCat, setLoadingCat] =
    useState(true);

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [sortOpen, setSortOpen] =
    useState(false);

  const [
    selectedSort,
    setSelectedSort,
  ] = useState(
    "Recommended"
  );

  const [page, setPage] =
    useState(1);

  const [
    wishlist,
    setWishlist,
  ] = useState({});

  const [
    quantities,
    setQuantities,
  ] = useState({});

  // ====================================================
  // LOAD WISHLIST
  // ====================================================

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
              const slug =
                item?.slug;

              if (slug) {
                map[slug] =
                  true;
              }
            }
          );

          if (mounted) {
            setWishlist(
              map
            );
          }
        } catch (error) {
          console.error(
            "Wishlist load error:",
            error
          );
        }
      };

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // LOAD CATEGORY
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadCategory =
      async () => {
        if (!slug) {
          return;
        }

        setLoadingCat(true);
        setNotFound(false);
        setCategory(null);
        setSubcategories([]);
        setSelectedSubcategory(
          null
        );
        setPage(1);

        // ----------------------------------------------
        // WARDROBE
        // ----------------------------------------------

       if (
  slug ===
  "wardrobe"
) {
  const wardrobeTree =
    await fetchCategoryTree({
      wardrobe: true,
    });

  /*
   * Backend se wardrobe categories
   * aa rahi hain.
   */

  const normalizedWardrobe =
    Array.isArray(
      wardrobeTree
    )
      ? wardrobeTree
          .filter(Boolean)
          .map(
            (item) =>
              normalizeCategory(
                item
              )
          )
      : [];

  /*
   * Wardrobe page ke andar
   * main categories dikhenge.
   *
   * Example:
   *
   * Wardrobe
   *   ├── Kaftans
   *   ├── Jackets
   *   └── Bags
   *
   * Aur har category ke
   * children/subcategories.
   */

  if (mounted) {
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

    /*
     * Agar URL mein
     * subcategoryId hai to
     * active wardrobe category
     * identify karo.
     */

    const active =
      subcategoryId
        ? normalizedWardrobe.find(
            (item) =>
              getId(item) ===
              String(
                subcategoryId
              ) ||
              item.children?.some(
                (child) =>
                  getId(
                    child
                  ) ===
                  String(
                    subcategoryId
                  )
              )
          )
        : null;

    let activeChild = null;

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
                (item) =>
                  getId(
                    item
                  ) ===
                  String(
                    subcategoryId
                  )
              )
            : null;

        if (child) {
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

        // ----------------------------------------------
        // TRY NORMAL CATEGORY API
        // ----------------------------------------------

        let foundCategory =
          await fetchCategoryBySlug(
            slug
          );

        // ----------------------------------------------
        // FALLBACK TO FOOTER TREE
        // ----------------------------------------------

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

        if (
          !foundCategory
        ) {
          if (mounted) {
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

        // ----------------------------------------------
        // CHILDREN FROM CATEGORY
        // ----------------------------------------------

        let children =
          Array.isArray(
            normalized?.children
          )
            ? normalized.children
            : [];

        // ----------------------------------------------
        // IF CATEGORY API DIDN'T GIVE CHILDREN,
        // FETCH THEM FROM TREE
        // ----------------------------------------------

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

        // ----------------------------------------------
        // FIND CURRENT SUBCATEGORY
        // ----------------------------------------------

        let currentSubcategory =
          null;

        if (
          subcategoryId
        ) {
          currentSubcategory =
            children.find(
              (child) =>
                getId(
                  child
                ) ===
                String(
                  subcategoryId
                )
            ) ||
            null;
        }

        if (mounted) {
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
      mounted = false;
    };
  }, [
    slug,
    subcategoryId,
  ]);

  // ====================================================
  // LOAD PRODUCTS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        if (loadingCat) {
          return;
        }

        if (
          notFound &&
          slug !== "wardrobe"
        ) {
          return;
        }

        setLoadingProducts(
          true
        );

        // ----------------------------------------------
        // WARDROBE
        // ----------------------------------------------

       if (
  slug ===
  "wardrobe"
) {
  /*
   * ----------------------------------------------
   * WARDROBE SUBCATEGORY SELECTED
   * ----------------------------------------------
   */

  if (
    subcategoryId
  ) {
    const exactProducts =
      await fetchAllProductsByCategory(
        subcategoryId
      );

    if (mounted) {
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

  /*
   * ----------------------------------------------
   * WHOLE WARDROBE
   * ----------------------------------------------
   */

  const wardrobeProducts =
    await fetchAllWardrobeProducts();

  if (mounted) {
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

        // ----------------------------------------------
        // SUBCATEGORY SELECTED
        // ----------------------------------------------

        if (
          subcategoryId
        ) {
          const exactProducts =
            await fetchAllProductsByCategory(
              subcategoryId
            );

          if (mounted) {
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

        // ----------------------------------------------
        // MAIN CATEGORY
        // Fetch category + every subcategory
        // ----------------------------------------------

        const mainCategoryId =
          getId(
            category
          );

        const combined =
          await fetchProductsForMainCategory(
            mainCategoryId,
            subcategories
          );

        if (mounted) {
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
      mounted = false;
    };
  }, [
    category,
    subcategories,
    subcategoryId,
    loadingCat,
    notFound,
    slug,
  ]);

  // ====================================================
  // SORT + LOCAL PAGINATION
  // ====================================================

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

  // ====================================================
  // PAGE NUMBERS
  // ====================================================

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
      safePage <=
      3
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

  // ====================================================
  // CATEGORY NAME
  // ====================================================

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

  // ====================================================
  // HERO IMAGE
  // ====================================================

  const heroImage =
    selectedSubcategory?.image ||
    category?.image ||
    "/images/new-arrivals-hero.jpg";

  // ====================================================
  // HANDLERS
  // ====================================================

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ====================================================
  // LOGIN / GUEST ACTION HELPERS
  // ====================================================

  function isLoggedIn() {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      localStorage.getItem("accessToken")
    );
  }

  function goToLogin(redirect) {
    router.push(
      `/login?redirect=${encodeURIComponent(redirect)}`
    );
  }

  function savePendingAction(type, product) {
    if (typeof window === "undefined") {
      return;
    }

    if (type === "cart") {
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

    if (type === "wishlist") {
      sessionStorage.setItem(
        "pendingWishlistProduct",
        JSON.stringify({ product })
      );

      sessionStorage.setItem(
        "pendingWishlistRedirect",
        window.location.pathname +
          window.location.search
      );
    }
  }

  // ====================================================
  // WISHLIST
  // ====================================================

  const handleToggleWishlist =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isLoggedIn()) {
        savePendingAction(
          "wishlist",
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
        const nowSaved =
          await toggleWishlist(
            product
          );

        setWishlist(
          (prev) => {
            const copy = {
              ...prev,
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
      } catch (error) {
        console.error(
          "Wishlist toggle error:",
          error
        );
      }
    };

  // ====================================================
  // CART
  // ====================================================

  const handleAddToCart =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

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
        await addToCart(
          product,
          1
        );

        setQuantities(
          (prev) => ({
            ...prev,
            [product.slug]:
              1,
          })
        );
      } catch (error) {
        console.error(
          "ADD TO CART ERROR:",
          error
        );
      }
    };

  const increaseQty =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isLoggedIn()) {
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
          (prev) => ({
            ...prev,
            [product.slug]:
              nextQty,
          })
        );
      } catch (error) {
        console.error(
          "INCREASE QTY ERROR:",
          error
        );
      }
    };

  const decreaseQty =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isLoggedIn()) {
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
            (prev) => {
              const copy = {
                ...prev,
              };

              delete copy[
                product.slug
              ];

              return copy;
            }
          );
        } else {
          setQuantities(
            (prev) => ({
              ...prev,
              [product.slug]:
                nextQty,
            })
          );
        }
      } catch (error) {
        console.error(
          "DECREASE QTY ERROR:",
          error
        );
      }
    };

  // ====================================================
  // NOT FOUND
  // ====================================================

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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="cat-page">
      <style>{`
        .cat-page {
          background: ${BG};
          min-height: 100vh;
        }

        .cat-hero-banner {
          width: 100%;
          overflow: hidden;
        }

        .cat-hero-img {
          width: 100%;
          height: 440px;
          object-fit: cover;
          display: block;
        }

        .cat-top-label {
          text-align: center;
          padding: 32px 0 20px;
        }

        .cat-top-label p {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 30px;
          font-weight: 500;
          line-height: 160%;
          color: ${ACCENT};
          letter-spacing: -0.02em;
        }

        .cat-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 0 60px 20px;
        }

        .cat-section-title {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 40px;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: ${ACCENT};
        }

        .cat-bulk-order-link {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 16px;
          color: ${ACCENT};
          text-decoration: none;
          border-bottom: 1px solid ${ACCENT};
          padding-bottom: 2px;
          white-space: nowrap;
        }

        .cat-bulk-order-link:hover {
          opacity: 0.75;
        }

        /* ==================================================
           SUBCATEGORY SECTION
        ================================================== */

        .cat-subcategory-section {
          padding: 0 60px 36px;
        }

        .cat-subcategory-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .cat-subcategory-title {
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 25px;
          font-weight: 500;
          color: ${ACCENT};
        }

        .cat-all-category-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: transparent;
          border: 1px solid ${BORDER};
          color: #0e0e0e;
          padding: 8px 15px;
          cursor: pointer;
        }

        .cat-all-category-btn:hover {
          background: #f0f2de;
        }

        .cat-subcategory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .cat-subcategory-card {
          border: 1px solid ${BORDER};
          background: #fff;
          text-decoration: none;
          color: #111;
          cursor: pointer;
          overflow: hidden;
          transition:
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .cat-subcategory-card:hover {
          border-color: ${ACCENT};
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        .cat-subcategory-card-active {
          border-color: ${ACCENT};
          box-shadow: 0 0 0 1px ${ACCENT};
        }

        .cat-subcategory-image-wrap {
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #e8e9da;
        }

        .cat-subcategory-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cat-subcategory-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e9da;
        }

        .cat-subcategory-info {
          padding: 13px 14px 15px;
        }

        .cat-subcategory-name {
          margin: 0;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #111;
          text-transform: uppercase;
          line-height: 1.45;
        }

        .cat-subcategory-link {
          margin-top: 7px;
          display: block;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 10px;
          color: ${ACCENT};
          letter-spacing: 0.04em;
        }

        /* ==================================================
           CONTROLS
        ================================================== */

        .cat-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 60px;
          position: relative;
        }

        .cat-sort-wrapper {
          position: relative;
        }

        .cat-sort-btn,
        .cat-filters-btn {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0e0e0e;
          background: ${BG};
          border: 1px solid ${BORDER};
          padding: 7px 16px;
          cursor: pointer;
          letter-spacing: 0.04em;
        }

        .cat-sort-btn:hover,
        .cat-filters-btn:hover {
          background: #f0f2de;
        }

        .cat-sort-dropdown {
          position: absolute;
          top: 110%;
          left: 0;
          background: #fff;
          border: 1px solid ${BORDER};
          min-width: 180px;
          z-index: 99;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .cat-sort-option {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          padding: 10px 16px;
          cursor: pointer;
          color: #0e0e0e;
        }

        .cat-sort-option:hover,
        .cat-sort-option.active {
          background: #f0f2de;
          color: ${ACCENT};
        }

        .cat-product-count {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 14px;
          color: #555;
        }

        /* ==================================================
           PRODUCT GRID — MATCHED TO NEW ARRIVALS CARD DESIGN
        ================================================== */

        .cat-product-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: start;
          gap: 28px 20px;
          padding: 0 60px 40px;
          max-width: 1800px;
          margin: 0 auto;
        }

        .cat-product-card-link {
          text-decoration: none;
          display: block;
          width: 100%;
        }

        .cat-product-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 14px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid #e2e3d7;
          border-radius: 22px;
          box-shadow:
            0 12px 34px rgba(61, 67, 41, 0.08),
            0 2px 8px rgba(61, 67, 41, 0.04);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .cat-product-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 18px 42px rgba(61, 67, 41, 0.12),
            0 4px 12px rgba(61, 67, 41, 0.05);
        }

        .cat-product-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 15px;
          overflow: hidden;
          background: #e8e9da;
        }

        .cat-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .cat-product-card:hover .cat-product-img {
          transform: scale(1.025);
        }

        .cat-product-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e9da;
        }

        .cat-wishlist-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(123, 127, 92, 0.12);
          border-radius: 50%;
          width: 54px;
          height: 54px;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4b5a4;
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.10);
          z-index: 4;
          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .cat-wishlist-btn:hover {
          transform: scale(1.04);
          color: ${ACCENT};
        }

        .cat-wishlist-btn-active {
          color: #9b3043;
        }

        .cat-wishlist-btn:active {
          transform: scale(0.95);
        }

        .cat-product-info {
          width: 100%;
          padding: 18px 8px 4px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .cat-product-name-row {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 40px;
          margin-bottom: 14px;
        }

        .cat-product-name {
          flex: 0 1 auto;
          min-width: 0;
          height: auto;
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #151515;
          overflow: visible;
          display: block;
          text-overflow: clip;
          text-transform: uppercase;
        }

        .cat-product-name-rule {
          width: 86px;
          height: 1px;
          background: #b9a764;
          flex: 0 0 auto;
          margin-left: auto;
          margin-top: 8px;
        }

        .cat-product-price {
          margin: 0 0 20px;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 23px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0;
          color: #171717;
        }

        .cat-product-actions {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
          margin-top: auto;
        }

        .cat-btn-enquiry,
        .cat-btn-bulk {
          width: 100%;
          min-height: 60px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px 16px;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: 0.055em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease;
        }

        .cat-btn-enquiry {
          background: ${ACCENT};
          color: #fff;
          border: 1px solid ${ACCENT};
        }

        .cat-btn-enquiry:hover {
          background: #676a4c;
          border-color: #676a4c;
        }

        .cat-btn-bulk {
          background: transparent;
          color: #1b1b1b;
          border: 1px solid ${BORDER};
        }

        .cat-btn-bulk:hover {
          background: #f4f5eb;
          border-color: ${ACCENT};
        }

        .cat-qty-control {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 60px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          border: 1px solid ${BORDER};
          padding: 0 14px;
          background: transparent;
        }

        .cat-qty-control button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 22px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #111;
        }

        .cat-qty-control span {
          font-family: "Mona Sans", sans-serif;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
          min-width: 18px;
        }

        /* ==================================================
           PAGINATION — MATCHED TO NEW ARRIVALS PAGE STYLE
        ================================================== */

        .cat-pagination-area {
          text-align: center;
          padding: 20px 60px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .cat-showing-text {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #777;
          margin: 0;
        }

        .cat-pagination-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cat-page-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: ${BG};
          border: 1px solid ${BORDER};
          color: #0e0e0e;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .cat-page-btn:hover:not(:disabled) {
          background: #f4f5eb;
          border-color: ${ACCENT};
        }

        .cat-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .cat-page-active {
          background: ${ACCENT};
          border-color: ${ACCENT};
          color: #fff;
        }

        .cat-page-nav {
          width: auto;
          border-radius: 20px;
          padding: 0 18px;
        }

        .cat-page-dots {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #999;
          padding: 0 2px;
        }

        .cat-back-to-top {
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          color: ${ACCENT};
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.06em;
        }

        .cat-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          font-family: "Mona Sans", sans-serif;
          color: #888;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* ==================================================
           SKELETON
        ================================================== */

        .cat-skel {
          display: block;
          position: relative;
          overflow: hidden;
          background: rgba(0,0,0,0.08);
          border-radius: 4px;
        }

        .cat-skel::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: cat-shimmer 1.4s infinite;
        }

        @keyframes cat-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .cat-hero-skel {
          width: 100%;
          height: 440px;
          border-radius: 0;
        }

        .cat-skel-label {
          width: 220px;
          height: 30px;
          margin: 0 auto;
        }

        .cat-skel-title {
          width: 260px;
          height: 40px;
        }

        .cat-skel-link {
          width: 140px;
          height: 20px;
        }

        .cat-skel-sortbtn {
          width: 110px;
          height: 34px;
        }

        .cat-skel-count {
          width: 90px;
          height: 18px;
        }

        .cat-card-skel-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 15px;
        }

        .cat-card-skel-name {
          width: 80%;
          height: 14px;
          margin: 10px 0;
        }

        .cat-card-skel-actions {
          display: flex;
          gap: 10px;
        }

        .cat-card-skel-btn1 {
          width: 110px;
          height: 34px;
        }

        .cat-card-skel-btn2 {
          width: 90px;
          height: 26px;
        }

        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 1100px) {
          .cat-subcategory-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .cat-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 18px;
          }
        }

        @media (max-width: 900px) {
          .cat-hero-img,
          .cat-hero-skel {
            height: 320px;
          }

          .cat-section-header,
          .cat-controls-bar,
          .cat-pagination-area,
          .cat-subcategory-section {
            padding-left: 24px;
            padding-right: 24px;
          }

          .cat-section-title,
          .cat-skel-title {
            font-size: 30px;
          }

          .cat-subcategory-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cat-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding: 0 24px 32px;
            gap: 20px 14px;
          }
        }

        @media (max-width: 560px) {
          .cat-hero-img,
          .cat-hero-skel {
            height: 170px;
          }

          .cat-top-label {
            padding: 20px 16px 12px;
          }

          .cat-top-label p {
            font-size: 22px;
          }

          .cat-section-header {
            padding: 18px 16px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .cat-section-title {
            font-size: 24px;
          }

          .cat-subcategory-section {
            padding: 8px 16px 24px;
          }

          .cat-subcategory-title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .cat-subcategory-title {
            font-size: 21px;
          }

          .cat-subcategory-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .cat-subcategory-info {
            padding: 10px;
          }

          .cat-subcategory-name {
            font-size: 10px;
          }

          .cat-controls-bar {
            padding: 0 16px 18px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .cat-sort-btn,
          .cat-filters-btn {
            font-size: 10px;
            padding: 7px 10px;
          }

          .cat-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding: 0 12px 28px;
            gap: 14px 10px;
          }

          .cat-product-card {
            padding: 8px;
            border-radius: 16px;
          }

          .cat-product-img-wrapper {
            aspect-ratio: 4 / 3.35;
            border-radius: 12px;
          }

          .cat-wishlist-btn {
            top: 10px;
            right: 10px;
            width: 48px;
            height: 48px;
            font-size: 25px;
          }

          .cat-product-info {
            padding: 15px 6px 4px;
          }

          .cat-product-name-row {
            gap: 12px;
            margin-bottom: 11px;
          }

          .cat-product-name {
            font-size: 15px;
            line-height: 1.2;
          }

          .cat-product-name-rule {
            width: 30px;
          }

          .cat-product-price {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .cat-product-actions {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk,
          .cat-qty-control {
            min-height: 50px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk {
            font-size: 10px;
            padding: 10px 8px;
          }

          .cat-pagination-area {
            padding: 12px 16px 40px;
            gap: 14px;
          }

          .cat-pagination-nav {
            gap: 6px;
          }

          .cat-page-btn {
            width: 34px;
            height: 34px;
            font-size: 12px;
          }

          .cat-page-nav {
            padding: 0 14px;
            height: 34px;
          }
        }

        @media (max-width: 420px) {
          .cat-product-grid {
            padding-left: 12px;
            padding-right: 12px;
          }

          .cat-product-card {
            padding: 8px;
            border-radius: 16px;
          }

          .cat-product-name {
            font-size: 18px;
          }

          .cat-product-name-rule {
            width: 42px;
          }

          .cat-product-price {
            font-size: 19px;
          }

          .cat-btn-enquiry,
          .cat-btn-bulk {
            font-size: 9px;
            letter-spacing: 0.04em;
            padding-left: 6px;
            padding-right: 6px;
          }

          .cat-page-btn {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          .cat-pagination-nav {
            gap: 5px;
          }
        }
      `}</style>

      {/* ==================================================
          HERO
      ================================================== */}

      <div className="cat-hero-banner">
        {isLoading && !category ? (
          <HeroSkeleton />
        ) : (
          <img
            src={heroImage}
            alt={heading}
            className="cat-hero-img"
          />
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
          ONLY MAIN CATEGORY VIEW
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
                (child) => {
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
          FILTER / SORT
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
                    (value) =>
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
                    (option) => (
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
            length:
              SKELETON_COUNT,
          }).map(
            (_, index) => (
              <CardSkeleton
                key={
                  index
                }
              />
            )
          )
        ) : visibleProducts.length ===
          0 ? (
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
                  color:
                    ACCENT,
                  fontSize:
                    14,
                  textDecoration:
                    "none",
                  border:
                    "none",
                  borderBottom:
                    `1px solid ${ACCENT}`,
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                }}
              >
                ← View all category products
              </button>
            ) : (
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
            )}
          </div>
        ) : (
          visibleProducts.map(
            (product) => (
              <Link
                href={`/products/${product.slug}`}
                key={
                  product._id
                }
                className="cat-product-card-link"
              >
                <div className="cat-product-card">
                  <div className="cat-product-img-wrapper">
                    {product.mainImage ? (
                      <img
                        src={
                          product.mainImage
                        }
                        alt={
                          product.name
                        }
                        className="cat-product-img"
                      />
                    ) : (
                      <div className="cat-product-img-placeholder" />
                    )}

                    <button
                      type="button"
                      className={`cat-wishlist-btn${
                        wishlist[
                          product.slug
                        ]
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
                      {wishlist[
                        product.slug
                      ]
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <div className="cat-product-info">
                    <div className="cat-product-name-row">
                      <h6 className="cat-product-name">
                        {
                          product.name?.toUpperCase()
                        }
                      </h6>

                      <span className="cat-product-name-rule" />
                    </div>

                    <p className="cat-product-price">
                      ₹
                      {Number(
                        product.price ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <div className="cat-product-actions">
                      <button
                        type="button"
                        className="cat-btn-enquiry"
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

                      {!quantities[
                        product.slug
                      ] ? (
                        <button
                          type="button"
                          className="cat-btn-bulk"
                          onClick={(
                            event
                          ) =>
                            handleAddToCart(
                              event,
                              product
                            )
                          }
                        >
                          ● ADD TO CART
                        </button>
                      ) : (
                        <div
                          className="cat-qty-control"
                          onClick={(
                            event
                          ) =>
                            event.preventDefault()
                          }
                        >
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
                          >
                            −
                          </button>

                          <span>
                            {
                              quantities[
                                product.slug
                              ]
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
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          )
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
                      safePage - 1
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
                      safePage + 1
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

// ======================================================
// HERO SKELETON
// ======================================================

function HeroSkeleton() {
  return (
    <span className="cat-skel cat-hero-skel" />
  );
}

// ======================================================
// CARD SKELETON
// ======================================================

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