"use client";

import Image from "next/image";
import Link from "next/link";
const products = [
  {
    image: "/images/product-1.jpg",
    title: "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
  {
    image: "/images/product-2.jpg",
    title: "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
  {
    image: "/images/product-3.jpg",
    title: "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
];

export default function NewArrivalsGrid() {
  return (
    <section className="arrival-section">
      <div className="container">
        <h2 className="section-title">NEW ARRIVALS</h2>

        <div className="product-grid">
          {products.map((item, index) => (
            <div key={index} className="product-card">
              <div className="image-wrap">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />

                <button className="wishlist-btn">
                  ♡
                </button>
              </div>

              <h3 className="product-title">
                {item.title}
              </h3>

              <div className="action-row">
                <button className="price-btn">
                  PRICE ENQUIRY →
                </button>

                <span className="bulk-text">
                  ✦ BULK CUSTOMIZATION
                </span>
              </div>
            </div>
          ))}
        </div>

       <div className="bottom-btn-wrap">
  <Link href="/new-arrivals" className="bottom-btn">
    SEE ALL NEW ARRIVALS →
  </Link>
</div>
      </div>

      <style jsx>{`
        .arrival-section {
          background: #FDFFF1;
          padding: 90px 40px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 32px;
          font-weight: 500;
          line-height: 160%;
          letter-spacing: -0.02em;
          color: #7B7F5C;
          text-align: center;
          margin-bottom: 42px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .product-card {
          display: flex;
          flex-direction: column;
        }

        .image-wrap {
          position: relative;
          width: 100%;
          height: 430px;
          overflow: hidden;
        }

        .wishlist-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 34px;
          height: 34px;
          border: 1px solid #d3d3d3;
          background: #fff;
          cursor: pointer;
          font-size: 16px;
        }

        .product-title {
          margin-top: 16px;
          margin-bottom: 18px;

          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 700;
          line-height: 160%;
          color: #0E0E0E;
        }

        .action-row {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }

        .price-btn {
          background: #7B7F5C;
          color: #fff;
          border: none;
          padding: 14px 28px;

          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          cursor: pointer;
        }

        .bulk-text {
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #0E0E0E;
        }

        .bottom-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 70px;
        }

        .bottom-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7B7F5C;
          padding-bottom: 10px;

          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          color: #7B7F5C;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .image-wrap {
            height: 360px;
          }
        }

        @media (max-width: 768px) {
          .arrival-section {
            padding: 60px 20px;
          }

          .product-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .image-wrap {
            height: 340px;
          }

          .section-title {
            font-size: 28px;
          }

          .product-title {
            font-size: 16px;
          }

          .action-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .price-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}