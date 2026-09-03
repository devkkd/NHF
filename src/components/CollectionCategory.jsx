"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getHomeCategories,
} from "@/lib/api";

/* =========================================================
   FALLBACK CATEGORIES
========================================================= */

const FALLBACK_CATEGORIES = [
  {
    title: "Kantha Bedcovers",
    image: "/images/category/1.png",
    slug: "kantha-bedcovers",
  },
  {
    title: "Quilts",
    image: "/images/category/2.png",
    slug: "quilts",
  },
  {
    title: "Bedsheets",
    image: "/images/category/3.png",
    slug: "bedsheets",
  },
  {
    title: "Jackets",
    image: "/images/category/4.png",
    slug: "jackets-bathrobes",
  },
  {
    title: "Bags & Pouches",
    image: "/images/category/5.png",
    slug: "bags-pouches",
  },
  {
    title: "Scarves",
    image: "/images/category/6.png",
    slug: "scarves",
  },
  {
    title: "Kaftans",
    image: "/images/category/7.png",
    slug: "kaftans",
  },
  {
    title: "Dohar",
    image: "/images/category/8.png",
    slug: "dohar",
  },
  {
    title: "Throws / Gudri",
    image: "/images/category/9.png",
    slug: "throws-gudri",
  },
  {
    title: "Cushion Covers",
    image: "/images/category/10.png",
    slug: "cushion-covers",
  },
  {
    title: "Rugs & Dhurries",
    image: "/images/category/11.png",
    slug: "rugs-dhurries",
  },
  {
    title: "Table Covers & Runners",
    image: "/images/category/12.png",
    slug: "table-covers-runners",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function CollectionCategory({
  categories = [],
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    homeCategories,
    setHomeCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD BACKEND CATEGORIES
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCategories =
      async () => {
        try {
          /*
           * Backend:
           *
           * GET /categories?home=true
           *
           * Sirf wahi categories aayengi
           * jinka showInHome = true hai.
           */

          const data =
            await getHomeCategories();

          if (
            cancelled
          ) {
            return;
          }

          /*
           * Backend se valid array
           * mila to wahi use karo.
           */

          if (
            Array.isArray(
              data
            ) &&
            data.length > 0
          ) {
            setHomeCategories(
              data
            );
          } else {
            setHomeCategories(
              []
            );
          }
        } catch (error) {
          console.error(
            "Home categories load error:",
            error
          );

          /*
           * Error hone par fallback
           * data use hoga.
           */

          if (
            !cancelled
          ) {
            setHomeCategories(
              []
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     SOURCE
  ======================================================= */

  /*
   * Priority:
   *
   * 1. Backend showInHome data
   * 2. Parent se aaye categories
   * 3. Dummy fallback
   */

  const sourceCategories =
    homeCategories.length > 0
      ? homeCategories
      : categories?.length > 0
      ? categories
      : FALLBACK_CATEGORIES;

  /* =======================================================
     NORMALIZE + SORT
  ======================================================= */

  const items =
    sourceCategories
      .map(
        (
          category,
          index
        ) => ({
          _id:
            category?._id,

          title:
            category?.name ||
            category?.title ||
            "",

          slug:
            category?.slug,

          image:
            category?.image ||
            category?.thumbnail ||
            category?.banner ||
            `/images/category/${
              (index % 12) + 1
            }.png`,

          sortOrder:
            Number(
              category?.sortOrder ||
                index + 1
            ),
        })
      )
      .filter(
        (item) =>
          item.title &&
          item.slug
      )
      .sort(
        (a, b) =>
          a.sortOrder -
          b.sortOrder
      );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="collection-section">

      <div className="collection-container">

        {/* =================================================
            HEADING
        ================================================= */}

        <h2 className="collection-heading">
          ALL CATEGORY
        </h2>

        {/* =================================================
            CATEGORY GRID
        ================================================= */}

        <div className="collection-grid">

          {items.map(
            (item) => (
              <Link
                key={
                  item._id ||
                  item.slug
                }
                href={`/${item.slug}`}
                className="collection-card-link"
              >

                <div className="collection-card">

                  {/* =======================================
                      IMAGE
                  ======================================= */}

                  <div className="image-wrapper">

                    <Image
                      src={
                        item.image
                      }
                      alt={
                        item.title
                      }
                      fill
                      sizes="
                        (max-width: 768px) 50vw,
                        (max-width: 1024px) 33vw,
                        25vw
                      "
                      style={{
                        objectFit:
                          "cover",
                      }}
                      className="collection-img"
                    />

                  </div>

                  {/* =======================================
                      TITLE
                  ======================================= */}

                  <h5>
                    {item.title} →
                  </h5>

                </div>

              </Link>
            )
          )}

        </div>

        {/* =================================================
            FULL COLLECTION
        ================================================= */}

        <div className="collection-btn-wrap">

          <Link
            href="/collection"
            className="collection-btn"
          >
            SEE FULL OUR COLLECTION →
          </Link>

        </div>

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        /* ==================================================
           SECTION
        ================================================== */

        .collection-section {
          width:
            100%;

          background:
            #FDFFF1;

          padding:
            72px 24px;

          box-sizing:
            border-box;
        }

        /* ==================================================
           CONTAINER
        ================================================== */

        .collection-container {
          width:
            100%;

          max-width:
            1400px;

          margin:
            0 auto;
        }

        /* ==================================================
           HEADING
        ================================================== */

        .collection-heading {
          margin:
            0 0 36px;

          text-align:
            center;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            38px;

          font-weight:
            600;

          line-height:
            1.25;

          letter-spacing:
            -0.02em;

          color:
            #7B7F5C;
        }

        /* ==================================================
           GRID
           DESKTOP = 4 CARDS
        ================================================== */

        .collection-grid {
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

          column-gap:
            18px;

          row-gap:
            34px;
        }

        /* ==================================================
           LINK
        ================================================== */

        .collection-card-link {
          display:
            block;

          width:
            100%;

          color:
            inherit;

          text-decoration:
            none;
        }

        /* ==================================================
           CARD
        ================================================== */

        .collection-card {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;
        }

        /* ==================================================
           IMAGE
        ================================================== */

        .image-wrapper {
          position:
            relative;

          width:
            100%;

          aspect-ratio:
            1 / 1;

          overflow:
            hidden;

          background:
            #ECEFDD;

          border-radius:
            11px;
        }

        .collection-img {
          transition:
            transform
            0.4s ease;
        }

        .collection-card-link:hover
          .collection-img {
          transform:
            scale(
              1.04
            );
        }

        /* ==================================================
           CATEGORY NAME
        ================================================== */

        .collection-card h5 {
          margin:
            14px 0 0;

          padding:
            0 4px;

          text-align:
            center;

          color:
            #7B7F5C;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            18px;

          font-weight:
            500;

          line-height:
            1.35;

          display:
            -webkit-box;

          -webkit-box-orient:
            vertical;

          -webkit-line-clamp:
            2;

          overflow:
            hidden;
        }

        /* ==================================================
           BUTTON
        ================================================== */

        .collection-btn-wrap {
          display:
            flex;

          justify-content:
            center;

          margin-top:
            50px;
        }

        .collection-btn {
          display:
            inline-block;

          background:
            transparent;

          border:
            none;

          border-bottom:
            1px solid
            #7B7F5C;

          padding-bottom:
            7px;

          color:
            #7B7F5C;

          font-family:
            "Mona Sans",
            Arial,
            sans-serif;

          font-size:
            14px;

          line-height:
            1.3;

          letter-spacing:
            0.04em;

          text-decoration:
            none;

          transition:
            opacity
            0.25s ease;
        }

        .collection-btn:hover {
          opacity:
            0.7;
        }

        /* ==================================================
           TABLET
           3 CARDS
        ================================================== */

        @media (max-width: 1100px) {

          .collection-section {
            padding:
              62px 24px;
          }

          .collection-heading {
            font-size:
              34px;

            margin-bottom:
              30px;
          }

          .collection-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            column-gap:
              16px;

            row-gap:
              28px;
          }

          .collection-card h5 {
            margin-top:
              12px;

            font-size:
              16px;
          }

          .collection-btn-wrap {
            margin-top:
              42px;
          }

        }

        /* ==================================================
           MOBILE
           EXACTLY 2 CARDS
        ================================================== */

        @media (max-width: 768px) {

          .collection-section {
            padding:
              42px 10px 45px;
          }

          .collection-heading {
            margin:
              0 0 22px;

            font-size:
              27px;

            line-height:
              1.25;
          }

          .collection-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            column-gap:
              10px;

            row-gap:
              19px;
          }

          .image-wrapper {
            aspect-ratio:
              1 / 1;

            border-radius:
              9px;
          }

          .collection-card h5 {
            margin-top:
              8px;

            padding:
              0 2px;

            font-size:
              12px;

            line-height:
              1.35;

            min-height:
              32px;
          }

          .collection-btn-wrap {
            margin-top:
              34px;
          }

          .collection-btn {
            font-size:
              11px;

            padding-bottom:
              6px;

            text-align:
              center;
          }

        }

        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 480px) {

          .collection-section {
            padding:
              38px 8px 42px;
          }

          .collection-heading {
            font-size:
              24px;

            margin-bottom:
              19px;
          }

          .collection-grid {
            column-gap:
              8px;

            row-gap:
              16px;
          }

          .image-wrapper {
            border-radius:
              8px;
          }

          .collection-card h5 {
            margin-top:
              7px;

            font-size:
              11px;

            min-height:
              30px;
          }

          .collection-btn-wrap {
            margin-top:
              30px;
          }

          .collection-btn {
            font-size:
              10px;
          }

        }

      `}</style>

    </section>
  );
}