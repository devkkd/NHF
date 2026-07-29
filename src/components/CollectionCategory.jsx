"use client";

import Image from "next/image";
import Link from "next/link";

const FALLBACK_CATEGORIES = [
  { title: "Kantha Bedcovers",      image: "/images/category/1.png",  slug: "kantha-bedcovers" },
  { title: "Quilts",                image: "/images/category/2.png",  slug: "quilts" },
  { title: "Bedsheets",             image: "/images/category/3.png",  slug: "bedsheets" },
  { title: "Jackets & Bathrobes",   image: "/images/category/4.png",  slug: "jackets-bathrobes" },
  { title: "Bags & Pouches",        image: "/images/category/5.png",  slug: "bags-pouches" },
  { title: "Scarves",               image: "/images/category/6.png",  slug: "scarves" },
  { title: "Kaftans",               image: "/images/category/7.png",  slug: "kaftans" },
  { title: "Dohar",                 image: "/images/category/8.png",  slug: "dohar" },
  { title: "Throws / Gudri",        image: "/images/category/9.png",  slug: "throws-gudri" },
  { title: "Cushion Covers",        image: "/images/category/10.png", slug: "cushion-covers" },
  { title: "Rugs & Dhurries",       image: "/images/category/11.png", slug: "rugs-dhurries" },
  { title: "Table Covers & Runners",image: "/images/category/12.png", slug: "table-covers-runners" },
];

export default function CollectionCategory({ categories = [] }) {
  const items = categories.length > 0
    ? categories.map((c, i) => ({
        title: c.name,
        image: c.image || `/images/category/${(i % 12) + 1}.png`,
        slug:  c.slug,
      }))
    : FALLBACK_CATEGORIES;

  return (
    <section
      style={{
        background: "#FDFFF1",
        padding: "90px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <h2
          style={{
            fontFamily: "'Tobias TRIAL', serif",
            fontSize: "40px",
            fontWeight: 600,
            lineHeight: "160%",
            letterSpacing: "-0.02em",
            color: "#7B7F5C",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          ALL CATEGORY
        </h2>

        <div className="collection-grid">
          {items.map((item) => (
            <Link key={item.slug} href={`/${item.slug}`} className="collection-card-link">
              <div className="collection-card">
                <div className="image-wrapper">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width:768px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h5>{item.title} →</h5>
              </div>
            </Link>
          ))}
        </div>

        <div className="collection-btn-wrap">
          <Link href="/collection" className="collection-btn">
            SEE FULL OUR COLLECTION →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .collection-card-link {
          text-decoration: none;
          display: block;
        }

        /* ── 3 columns on desktop ── */
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px 24px;
        }

        .collection-card {
          text-align: center;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          margin: 0 auto;
        }

        .collection-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
        }

        .collection-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .collection-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7b7f5c;
          padding-bottom: 8px;
          color: #7b7f5c;
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          cursor: pointer;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-block;
        }

        /* ── Tablet: still 3 columns ── */
        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px 16px;
          }
          .collection-card h5 {
            font-size: 18px;
          }
        }

        /* ── Small tablet / mobile: 2 columns ── */
        @media (max-width: 768px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .collection-card h5 {
            font-size: 14px;
          }
          .image-wrapper {
            height: 180px;
          }
        }

        @media (max-width: 480px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .image-wrapper {
            height: 150px;
          }
          .collection-card h5 {
            font-size: 12px;
            margin-top: 10px;
          }
        }
      `}</style>
    </section>
  );
}
