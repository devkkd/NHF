"use client";

import Image from "next/image";

const categories = [
  {
    title: "Kantha Bedcovers",
    image: "/images/category/1.png",
  },
  {
    title: "Quilts",
    image: "/images/category/2.png",
  },
  {
    title: "Bedsheets",
    image: "/images/category/3.png",
  },
];

export default function CollectionCategory() {
  return (
    <section
      style={{
        background: "#FDFFF1",
        padding: "90px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
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
          {categories.map((item) => (
            <div key={item.title} className="collection-card">
              <div className="image-wrapper">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>

              <h5>{item.title} →</h5>
            </div>
          ))}
        </div>

        {/* Button */}

        <div className="collection-btn-wrap">
          <button className="collection-btn">
            SEE FULL OUR COLLECTION →
          </button>
        </div>
      </div>

      <style jsx>{`
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .collection-card {
          text-align: center;
        }

        .image-wrapper {
  position: relative;
  width: 100%;
  max-width: 580px;
  height: 460px;
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
        }

        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .collection-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .collection-card h5 {
            font-size: 20px;
          }

          h2 {
            font-size: 32px;
          }
        }
      `}</style>
    </section>
  );
}