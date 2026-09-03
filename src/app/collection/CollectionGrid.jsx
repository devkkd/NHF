"use client";

import Image from "next/image";
import Link from "next/link";

export default function CollectionGrid({
  categories = [],
}) {
  if (
    !categories ||
    categories.length === 0
  ) {
    return (
      <div
        style={{
          textAlign:
            "center",
          padding:
            "80px 40px",
          fontFamily:
            "'Mona Sans', sans-serif",
          color: "#000000",
          fontSize: "16px",
          lineHeight: "1.6",
        }}
      >
        <p>
          No categories found.
          Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="col-grid">
      {categories.map(
        (category, index) => {
          const children =
            Array.isArray(
              category.children
            )
              ? category.children
              : [];

          return (
            <Link
              key={
                category._id
              }
              href={`/${category.slug}`}
              className="col-card-link"
            >
              <div className="col-card">
                <div className="col-img-wrap">
                  <Image
                    src={
                      category.image ||
                      category.thumbnail ||
                      category.banner ||
                      `/images/category/${
                        (index %
                          12) +
                        1
                      }.png`
                    }
                    alt={
                      category.name ||
                      "Category"
                    }
                    fill
                    sizes="
                      (max-width: 480px) 50vw,
                      (max-width: 768px) 50vw,
                      25vw
                    "
                    style={{
                      objectFit:
                        "cover",
                    }}
                  />
                </div>

                <div className="col-card-meta">
                  <span className="col-serial">
                    {category.sortOrder}
                  </span>

                  <h3 className="col-cat-name">
                    {
                      category.name
                    }{" "}
                    →
                  </h3>
                </div>

                {children.length >
                  0 && (
                  <p className="col-sub-count">
                    {children.length}{" "}
                    Subcategor
                    {children.length ===
                    1
                      ? "y"
                      : "ies"}
                  </p>
                )}

                {category.description && (
                  <p className="col-cat-desc">
                    {
                      category.description
                    }
                  </p>
                )}
              </div>
            </Link>
          );
        }
      )}

      <style jsx>{`
        /* ==================================================
           MAIN CATEGORY GRID
        ================================================== */

        .col-grid {
          display: grid;

          /* DESKTOP = 4 CARDS IN ONE ROW */
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );

          gap: 48px 24px;

          padding: 0 40px 80px;

          max-width: 1400px;

          margin: 0 auto;

          box-sizing: border-box;
        }

        /* ==================================================
           CARD LINK
        ================================================== */

        .col-card-link {
          text-decoration: none;
          display: block;
          min-width: 0;
        }

        /* ==================================================
           CARD
        ================================================== */

        .col-card {
          text-align: center;
          cursor: pointer;
          min-width: 0;
        }

        /* ==================================================
           CATEGORY IMAGE
        ================================================== */

        .col-img-wrap {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: #e8e9da;
        }

        /* ==================================================
           CATEGORY NAME
        ================================================== */

        .col-cat-name {
          margin: 0;

          font-family:
            "Mona Sans",
            sans-serif;

          font-size: 22px;

          font-weight: 500;

          color: #000000;

          line-height: 1.4;

          transition:
            color 0.2s ease;
        }

        .col-card:hover
          .col-cat-name {
          color: #636649;
        }

        /* ==================================================
           META
        ================================================== */

        .col-card-meta {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          margin-top: 18px;

          min-width: 0;
        }

        /* ==================================================
           SERIAL
        ================================================== */

        .col-serial {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          width: 22px;
          height: 22px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #ecefdd;

          color: #000000;

          font-family:
            "Mona Sans",
            sans-serif;

          font-size: 11px;

          font-weight: 700;
        }

        /* ==================================================
           SUBCATEGORY COUNT
        ================================================== */

        .col-sub-count {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size: 13px;

          color: #000000;

          margin:
            8px 0 0;

          text-transform:
            uppercase;

          letter-spacing:
            0.05em;

          line-height:
            1.4;
        }

        /* ==================================================
           DESCRIPTION
        ================================================== */

        .col-cat-desc {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size: 14px;

          color: #000000;

          margin:
            7px 0 0;

          line-height: 1.6;

          overflow: hidden;

          text-overflow: ellipsis;

          display: -webkit-box;

          -webkit-line-clamp: 2;

          -webkit-box-orient: vertical;
        }

        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1024px) {
          .col-grid {
            /*
             * Keep 4 columns on larger tablets /
             * smaller desktop screens.
             */
            grid-template-columns: repeat(
              4,
              minmax(0, 1fr)
            );

            gap:
              32px 16px;

            padding:
              0 30px 70px;
          }

          .col-img-wrap {
            height:
              250px;
          }

          .col-cat-name {
            font-size:
              19px;
          }

          .col-card-meta {
            gap:
              7px;

            margin-top:
              14px;
          }
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 768px) {
          .col-grid {
            /*
             * MOBILE = 2 CARDS IN ONE ROW
             */
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );

            gap:
              20px;

            padding:
              0 20px 60px;

            max-width:
              100%;
          }

          .col-img-wrap {
            height:
              200px;
          }

          .col-cat-name {
            font-size:
              16px;

            line-height:
              1.35;
          }

          .col-card-meta {
            margin-top:
              12px;

            gap:
              6px;
          }

          .col-sub-count {
            font-size:
              10px;

            line-height:
              1.35;
          }

          .col-cat-desc {
            font-size:
              12px;
          }
        }

        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 480px) {
          .col-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );

            gap:
              16px;

            padding:
              0 16px 48px;
          }

          .col-img-wrap {
            height:
              160px;
          }

          .col-cat-name {
            font-size:
              14px;

            line-height:
              1.35;
          }

          .col-serial {
            width:
              19px;

            height:
              19px;

            font-size:
              9px;
          }

          .col-card-meta {
            gap:
              5px;

            margin-top:
              10px;
          }

          .col-sub-count {
            font-size:
              9px;
          }

          .col-cat-desc {
            font-size:
              11px;

            line-height:
              1.5;
          }
        }
      `}</style>
    </div>
  );
}