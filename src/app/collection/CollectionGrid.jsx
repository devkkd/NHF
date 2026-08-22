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
          color: "#888",
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
                      category.name
                    }
                    fill
                    sizes="(max-width:768px) 50vw, 33vw"
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
        .col-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 48px 24px;
          padding: 0 40px 80px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .col-card-link {
          text-decoration: none;
          display: block;
        }

        .col-card {
          text-align: center;
          cursor: pointer;
        }

        .col-img-wrap {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: #e8e9da;
        }

        .col-cat-name {
          margin: 0;
          font-family: "Mona Sans",
            sans-serif;
          font-size: 22px;
          font-weight: 500;
          color: #7b7f5c;
          line-height: 1.4;
          transition: color 0.2s;
        }

        .col-card:hover
          .col-cat-name {
          color: #636649;
        }

        .col-card-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 18px;
        }

        .col-serial {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ecefdd;
          color: #7b7f5c;
          font-family: "Mona Sans",
            sans-serif;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .col-sub-count {
          font-family: "Mona Sans",
            sans-serif;
          font-size: 11px;
          color: #7c8065;
          margin: 7px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .col-cat-desc {
          font-family: "Mona Sans",
            sans-serif;
          font-size: 13px;
          color: #888;
          margin: 6px 0 0;
          line-height: 1.6;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        @media (max-width: 1024px) {
          .col-grid {
            grid-template-columns: repeat(
              3,
              1fr
            );
            gap: 32px 16px;
          }

          .col-cat-name {
            font-size: 18px;
          }

          .col-img-wrap {
            height: 250px;
          }
        }

        @media (max-width: 768px) {
          .col-grid {
            grid-template-columns: repeat(
              2,
              1fr
            );
            gap: 20px;
            padding: 0 20px 60px;
          }

          .col-img-wrap {
            height: 200px;
          }

          .col-cat-name {
            font-size: 16px;
          }

          .col-card-meta {
            margin-top: 12px;
          }

          .col-sub-count {
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .col-grid {
            gap: 16px;
            padding: 0 16px 48px;
          }

          .col-img-wrap {
            height: 160px;
          }

          .col-cat-name {
            font-size: 13px;
          }

          .col-serial {
            width: 18px;
            height: 18px;
            font-size: 8px;
          }

          .col-card-meta {
            gap: 5px;
            margin-top: 10px;
          }

          .col-sub-count {
            font-size: 8px;
          }

          .col-cat-desc {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}