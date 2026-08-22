"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";

import {
  getHomeCategories,
} from "@/lib/api";

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

export default function CollectionCategory({
  categories = [],
}) {
  const [
    homeCategories,
    setHomeCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
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

        if (cancelled) {
          return;
        }

        /*
         * Backend se valid array
         * mila to use karo.
         */
        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          setHomeCategories(
            data
          );
        } else {
          /*
           * Backend se empty data:
           * fallback dummy categories.
           */
          setHomeCategories([]);
        }
      } catch (error) {
        console.error(
          "Home categories load error:",
          error
        );

        /*
         * Error mein bhi fallback
         * dummy data use hoga.
         */
        if (!cancelled) {
          setHomeCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

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

  /*
   * Admin serial/order follow hoga.
   *
   * Backend already sortOrder bhej raha hai,
   * phir bhi frontend par safe sorting.
   */
  const items = sourceCategories
    .map(
      (
        category,
        index
      ) => ({
        _id:
          category._id,

        title:
          category.name ||
          category.title,

        slug:
          category.slug,

        image:
          category.image ||
          category.thumbnail ||
          category.banner ||
          `/images/category/${
            (index % 12) + 1
          }.png`,

        sortOrder:
          Number(
            category.sortOrder ||
              index + 1
          ),
      })
    )
    .sort(
      (a, b) =>
        a.sortOrder -
        b.sortOrder
    );

  return (
    <section
      style={{
        background:
          "#FDFFF1",
        padding:
          "90px 40px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >
        <h2
          className="collection-heading"
          style={{
            fontFamily:
              "'Tobias TRIAL', serif",
            fontSize:
              "40px",
            fontWeight: 600,
            lineHeight:
              "160%",
            letterSpacing:
              "-0.02em",
            color:
              "#7B7F5C",
            textAlign:
              "center",
            marginBottom:
              "40px",
          }}
        >
          ALL CATEGORY
        </h2>

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
                  <div className="image-wrapper">
                    <Image
                      src={
                        item.image
                      }
                      alt={
                        item.title
                      }
                      fill
                      sizes="(max-width:768px) 50vw, 33vw"
                      style={{
                        objectFit:
                          "cover",
                      }}
                      className="collection-img"
                    />
                  </div>

                  <h5>
                    {
                      item.title
                    }{" "}
                    →
                  </h5>
                </div>
              </Link>
            )
          )}
        </div>

        <div className="collection-btn-wrap">
          <Link
            href="/collection"
            className="collection-btn"
          >
            SEE FULL OUR
            COLLECTION →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .collection-card-link {
          text-decoration: none;
          display: block;
          color: inherit;
        }

        .collection-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 48px 24px;
        }

        .collection-card {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #ecefdd;
          border-radius: 12px;
        }

        .collection-img {
          transition: transform 0.4s ease;
        }

        .collection-card-link:hover .collection-img {
          transform: scale(1.04);
        }

        .collection-card h5 {
          margin: 18px 0 0;
          font-family: "Mona Sans",
            sans-serif;
          font-size: 22px;
          font-weight: 500;
          line-height: 1.45;
          color: #7b7f5c;
          text-align: center;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .collection-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 56px;
        }

        .collection-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7b7f5c;
          padding-bottom: 8px;
          color: #7b7f5c;
          font-family: "Mona Sans",
            sans-serif;
          font-size: 15px;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: 0.25s;
        }

        .collection-btn:hover {
          opacity: 0.75;
        }

        /* ===================
           Tablet
        =================== */

        @media (max-width: 1024px) {
          section {
            padding: 70px 24px !important;
          }

          .collection-grid {
            grid-template-columns: repeat(
              3,
              1fr
            );
            gap: 28px 16px;
          }

          .image-wrapper {
            aspect-ratio: 1 / 1;
          }

          .collection-card h5 {
            font-size: 17px;
            margin-top: 14px;
          }
        }

        /* ===================
           Mobile
        =================== */

        @media (max-width: 768px) {
          .collection-heading {
            font-size: 28px !important;
            margin-bottom: 24px !important;
            line-height: 1.3 !important;
          }

          section {
            padding: 25px 20px !important;
          }

          .collection-grid {
            grid-template-columns: repeat(
              2,
              1fr
            );
            gap: 18px 12px;
          }

          .image-wrapper {
            aspect-ratio: 1 / 1;
            border-radius: 10px;
          }

          .collection-card h5 {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.4;
            min-height: 36px;
            padding: 0 2px;
          }

          .collection-btn-wrap {
            margin-top: 40px;
          }

          .collection-btn {
            font-size: 12px;
            padding-bottom: 6px;
          }
        }

        /* ===================
           Small Mobile
        =================== */

        @media (max-width: 480px) {
          section {
            padding: 48px 20px !important;
          }

          .collection-grid {
            gap: 16px 10px;
          }

          .image-wrapper {
            aspect-ratio: 1 / 1;
            border-radius: 8px;
          }

          .collection-card h5 {
            font-size: 12px;
            min-height: 34px;
            margin-top: 8px;
          }

          .collection-btn {
            font-size: 11px;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}