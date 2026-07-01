"use client";

import Image from "next/image";
import Link from "next/link";

// Static fallback shown when API returns nothing
const FALLBACK_CATEGORIES = [
  { _id: "1",  name: "Kantha Bedcovers",       image: "/images/category/1.png",  slug: "kantha-bedcovers"       },
  { _id: "2",  name: "Quilts",                  image: "/images/category/2.png",  slug: "quilts"                 },
  { _id: "3",  name: "Bedsheets",               image: "/images/category/3.png",  slug: "bedsheets"              },
  { _id: "4",  name: "Jackets & Bathrobes",     image: "/images/category/4.png",  slug: "jackets-bathrobes"      },
  { _id: "5",  name: "Bags & Pouches",          image: "/images/category/5.png",  slug: "bags-pouches"           },
  { _id: "6",  name: "Scarves",                 image: "/images/category/6.png",  slug: "scarves"                },
  { _id: "7",  name: "Kaftans",                 image: "/images/category/7.png",  slug: "kaftans"                },
  { _id: "8",  name: "Dohar",                   image: "/images/category/8.png",  slug: "dohar"                  },
  { _id: "9",  name: "Throws / Gudri",          image: "/images/category/9.png",  slug: "throws-gudri"           },
  { _id: "10", name: "Cushion Covers",          image: "/images/category/10.png", slug: "cushion-covers"         },
  { _id: "11", name: "Rugs & Dhurries",         image: "/images/category/11.png", slug: "rugs-dhurries"          },
  { _id: "12", name: "Table Covers & Runners",  image: "/images/category/12.png", slug: "table-covers-runners"   },
];

/**
 * CollectionCategory
 * Accepts `categories` prop from the parent Server Component (page.js).
 * Falls back to static data if prop is empty.
 */
export default function CollectionCategory({ categories = [] }) {
  const items = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <section
      style={{
        background: "#FDFFF1",
        padding: "90px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Heading */}
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

        {/* Cards */}
        <div className="collection-grid">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/collection/${item.slug}`}
              className="collection-card-link"
            >
              <div className="collection-card">
                <div className="image-wrapper">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
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

        {/* Button */}
        <div className="collection-btn-wrap">
          <Link href="/collection" className="collection-btn">
            SEE FULL OUR COLLECTION →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px 24px;
        }

        .collection-card-link {
          text-decoration: none;
        }

        .collection-card {
          text-align: center;
          cursor: pointer;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          margin: 0 auto;
          background: #f0efea;
          transition: transform 0.3s ease;
        }

        .collection-card:hover .image-wrapper {
          transform: scale(1.02);
        }

        .img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e5dc;
        }

        .collection-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
          transition: color 0.2s;
        }

        .collection-card:hover h5 {
          color: #4a4e38;
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
          transition: opacity 0.2s;
        }

        .collection-btn:hover {
          opacity: 0.7;
        }

        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .collection-card h5 {
            font-size: 14px;
          }

          h2 {
            font-size: 28px;
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
