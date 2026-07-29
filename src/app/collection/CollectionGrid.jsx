"use client";

import Image from "next/image";
import Link from "next/link";

export default function CollectionGrid({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "80px 40px",
        fontFamily: "'Mona Sans', sans-serif", color: "#888",
      }}>
        <p>No categories found. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="col-grid">
      {categories.map((cat, i) => (
        <Link
          key={cat._id}
          href={`/${cat.slug}`}
          className="col-card-link"
        >
          <div className="col-card">
            <div className="col-img-wrap">
              <Image
                src={cat.image || `/images/category/${(i % 12) + 1}.png`}
                alt={cat.name}
                fill
                sizes="(max-width:768px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <h3 className="col-cat-name">{cat.name} →</h3>
            {cat.description && (
              <p className="col-cat-desc">{cat.description}</p>
            )}
          </div>
        </Link>
      ))}

      <style jsx>{`
        .col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px 24px;
          padding: 0 40px 80px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .col-card-link { text-decoration: none; display: block; }
        .col-card { text-align: center; cursor: pointer; }
        .col-img-wrap {
          position: relative;
          width: 100%; height: 300px;
          overflow: hidden; background: #e8e9da;
        }
        .col-cat-name {
          margin: 18px 0 6px;
          font-family: "Mona Sans", sans-serif;
          font-size: 22px; font-weight: 400;
          color: #7b7f5c; line-height: 160%;
          transition: color 0.2s;
        }
        .col-card:hover .col-cat-name { color: #636649; }
        .col-cat-desc {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px; color: #888;
          margin: 0; line-height: 1.6;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        @media (max-width: 1024px) {
          .col-grid { grid-template-columns: repeat(3, 1fr); gap: 32px 16px; }
          .col-cat-name { font-size: 18px; }
        }
        @media (max-width: 768px) {
          .col-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 0 20px 60px; }
          .col-img-wrap { height: 200px; }
          .col-cat-name { font-size: 16px; }
        }
        @media (max-width: 480px) {
          .col-grid { gap: 16px; padding: 0 16px 48px; }
          .col-img-wrap { height: 160px; }
          .col-cat-name { font-size: 13px; margin-top: 10px; }
        }
      `}</style>
    </div>
  );
}
