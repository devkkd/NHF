import Image from "next/image";

import {
  getCategoryTree,
} from "@/lib/api";

import CollectionGrid from "./CollectionGrid";

export const metadata = {
  title:
    "Collection — Nikita Home Furnishings",
};

export default async function CollectionPage() {
  let categories = [];

  try {
    categories =
      await getCategoryTree();
  } catch (error) {
    console.error(
      "Collection categories error:",
      error
    );

    categories = [];
  }

  /*
   * Only MAIN CATEGORIES belong
   * on the main collection page.
   *
   * Subcategories are shown after
   * entering a category.
   */

  categories = (
    categories || []
  )
    .filter(
      (category) =>
        !category.parent &&
        category.isActive !== false
    )
    .sort(
      (a, b) =>
        Number(
          a.sortOrder || 0
        ) -
        Number(
          b.sortOrder || 0
        )
    );

  return (
    <main
      style={{
        background:
          "#fdfff1",
        minHeight:
          "100vh",
      }}
    >
      {/* ==================================================
          HERO
      ================================================== */}

      <div
        style={{
          position:
            "relative",
          width:
            "100%",
          height: 460,
          overflow:
            "hidden",
        }}
      >
        <Image
          src="/images/new-arrivals-hero.jpg"
          alt="Collection"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit:
              "cover",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            background:
              "rgba(0,0,0,0.38)",
            display:
              "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: 20,
            textAlign:
              "center",
          }}
        >
          <h1
            style={{
              fontFamily:
                "'Tobias TRIAL', serif",
              fontSize:
                "clamp(32px, 5vw, 64px)",
              fontWeight: 500,
              color: "#fff",
              letterSpacing:
                "0.1em",
              margin:
                "0 0 16px",
            }}
          >
            THE COLLECTION
          </h1>

          <p
            style={{
              fontFamily:
                "'Mona Sans', sans-serif",
              fontSize:
                "clamp(13px, 1.5vw, 16px)",
              color:
                "rgba(255,255,255,0.85)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Explore every corner
            of the Nikita world —
            from bedroom essentials
            to wearable artisan
            textiles.
          </p>
        </div>
      </div>

      {/* ==================================================
          HEADING
      ================================================== */}

      <div
        style={{
          textAlign:
            "center",
          padding:
            "60px 40px 36px",
        }}
      >
        <h2
          style={{
            fontFamily:
              "'Tobias TRIAL', serif",
            fontSize: 40,
            fontWeight: 600,
            color:
              "#7b7f5c",
            margin:
              "0 0 12px",
            letterSpacing:
              "-0.02em",
          }}
        >
          ALL CATEGORIES
        </h2>

        <p
          style={{
            fontFamily:
              "'Mona Sans', sans-serif",
            fontSize: 15,
            color: "#555",
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          Choose a category to
          explore its
          subcategories and
          products.
        </p>
      </div>

      {/* ==================================================
          CATEGORY GRID
      ================================================== */}

      <CollectionGrid
        categories={
          categories
        }
      />
    </main>
  );
}