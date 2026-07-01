"use client";

import Image from "next/image";
import Link from "next/link";

// Static fallback — shown when no wardrobe categories in DB yet
const FALLBACK = [
  { _id: "1", name: "Kaftans",  image: "/images/category/7.png",  slug: "kaftans"  },
  { _id: "2", name: "Jackets",  image: "/images/category/4.png",  slug: "jackets"  },
  { _id: "3", name: "Bags",     image: "/images/category/5.png",  slug: "bags"     },
];

/**
 * WardrobeSection
 * Accepts `categories` prop from the server (page.js).
 * Falls back to static data when prop is empty.
 *
 * No useEffect/fetch here — data comes from server already.
 */
export default function WardrobeSection({ categories = [] }) {
  const items = categories.length > 0 ? categories : FALLBACK;

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
            fontWeight: 400,
            lineHeight: "160%",
            letterSpacing: "-0.02em",
            color: "#7B7F5C",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          THE WARDROBE
        </h2>

        <div className="wardrobe-grid">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/collection/${item.slug}`}
              className="wardrobe-card-link"
            >
              <div className="wardrobe-card">
                <div className="image-wrapper">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="img-placeholder" />
                  )}
                </div>
                <h5>{item.name} →</h5>
              </div>
            </Link>
          ))}
        </div>

        <div className="wardrobe-btn-wrap">
          <Link href="/wardrobe" className="wardrobe-btn">
            SEE FULL OUR WARDROBE →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .wardrobe-card-link {
          text-decoration: none;
        }

        .wardrobe-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .wardrobe-card {
          text-align: center;
          cursor: pointer;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          max-width: 580px;
          height: 460px;
          overflow: hidden;
          margin: 0 auto;
          background: #f0efea;
          transition: transform 0.3s ease;
        }

        .wardrobe-card:hover .image-wrapper {
          transform: scale(1.02);
        }

        .img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e5dc;
        }

        .wardrobe-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
          transition: color 0.2s;
        }

        .wardrobe-card:hover h5 {
          color: #4a4e38;
        }

        .wardrobe-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .wardrobe-btn {
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
          transition: opacity 0.2s;
        }

        .wardrobe-btn:hover {
          opacity: 0.7;
        }

        @media (max-width: 1024px) {
          .wardrobe-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .wardrobe-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .image-wrapper {
            height: 320px;
          }
          .wardrobe-card h5 {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
