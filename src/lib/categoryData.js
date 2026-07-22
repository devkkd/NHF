// lib/categoryData.js
// ============================================================
// Merged data source for New Arrivals, Collection, Wardrobe
// (and any future category) — all served via slug from
// app/[category]/page.jsx
// ============================================================

function makeProducts(count, slugPrefix, imagePool = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    slug: `${slugPrefix}-${i + 1}`,
    name: "HAND BLOCK PERCALE PRINTED BEDSHEET",
    image: `/images/product-${(i % imagePool) + 1}.jpg`,
  }));
}

export const categories = {
  // ---------------- NEW ARRIVALS (rich grid: sort/filter/pagination) ----------------
  "new-arrivals": {
    slug: "new-arrivals",
    variant: "grid-full",
    heading: "NEW ARRIVALS",
    bulkOrderHref: "/enquiry",
    totalCount: 260,
    accent: "#7b7f5c",
    border: "#c8cab4",
    bg: "#fdfff1",
    heroImage: "/images/new-arrivals-hero.jpg",
    products: makeProducts(15, "product"),
  },

  // ---------------- COLLECTION (simple grid) ----------------
  collection: {
    slug: "collection",
    variant: "simple",
    topLabel: "COLLECTION",
    heading: "Throws",
    bulkOrderHref: "/enquiry",
    accent: "#8b8c68",
     border: "#c8cab4",
    bg: "#fdfff1",
    heroImage: "/images/new-arrivals-hero.jpg",
    products: [
      { id: 1, slug: "throws-1", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-1.jpg" },
      { id: 2, slug: "throws-2", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-2.jpg" },
      { id: 3, slug: "throws-3", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-3.jpg" },
    ],
  },

  // ---------------- WARDROBE (simple grid) ----------------
  wardrobe: {
    slug: "wardrobe",
    variant: "simple",
    topLabel: "WARDROBE",
    heading: "Kaftans",
    bulkOrderHref: "/enquiry",
    accent: "#8b8c68",
     border: "#c8cab4",
    bg: "#fdfff1",
    heroImage: "/images/new-arrivals-hero.jpg",
    products: [
      { id: 1, slug: "kaftan-1", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-1.jpg" },
      { id: 2, slug: "kaftan-2", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-2.jpg" },
      { id: 3, slug: "kaftan-3", name: "HAND BLOCK PERCALE PRINTED BEDSHEET", image: "/images/product-3.jpg" },
    ],
  },
};

export function getCategory(slug) {
  return categories[slug];
}