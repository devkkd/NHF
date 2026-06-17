"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const products = [
  {
    id: 1,
    slug: "throws-1",
    name: "HAND BLOCK PERCALE PRINTED BEDSHEET",
    image: "/images/product-1.jpg",
  },
  {
    id: 2,
    slug: "throws-2",
    name: "HAND BLOCK PERCALE PRINTED BEDSHEET",
    image: "/images/product-2.jpg",
  },
  {
    id: 3,
    slug: "throws-3",
    name: "HAND BLOCK PERCALE PRINTED BEDSHEET",
    image: "/images/product-3.jpg",
  },
];

export default function CollectionPage() {
  return (
    <>
      <Header />

      <main className="collection-page">
        {/* Hero Banner */}
        <div className="hero-banner">
          <img
            src="/images/new-arrivals-hero.jpg"
            alt="Collection Banner"
            className="hero-img"
          />
        </div>

        {/* Collection Heading */}
        <div className="collection-heading">
          <p>COLLECTION</p>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Throws</h2>

          <a href="/enquiry" className="bulk-order-link">
            Bulk Order Request →
          </a>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {products.map((product) => (
            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              className="product-card-link"
            >
              <div className="product-card">
                <div className="product-img-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />

                  <button className="wishlist-btn">
                    ♡
                  </button>
                </div>

                <div className="product-info">
                  <h6 className="product-name">
                    {product.name}
                  </h6>

                  <div className="product-actions">
                    <button className="btn-enquiry">
                      PRICE ENQUIRY →
                    </button>

                    <button className="btn-bulk">
                      ✦ BULK CUSTOMIZATION
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .collection-page {
          background: #fdfff1;
          min-height: 100vh;
        }

        .hero-banner {
          width: 100%;
          overflow: hidden;
        }

        .hero-img {
          width: 100%;
          height: 430px;
          object-fit: cover;
          display: block;
        }

        .collection-heading {
          text-align: center;
          padding-top: 32px;
          padding-bottom: 20px;
        }

        .collection-heading p {
          margin: 0;
          font-family: "Tobias TRIAL", serif;
          font-size: 30px;
          font-weight: 500;
          line-height: 160%;
          color: #8b8c68;
          letter-spacing: -0.02em;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 36px 48px;
        }

        .section-title {
          margin: 0;
          font-family: "Tobias TRIAL", serif;
          font-size: 46px;
          font-weight: 500;
          line-height: 1.2;
          color: #8b8c68;
        }

        .bulk-order-link {
          text-decoration: none;
          font-family: "Tobias TRIAL", serif;
          font-size: 22px;
          color: #8b8c68;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          padding: 0 36px 70px;
        }

        .product-card-link {
          text-decoration: none;
        }

        .product-card {
          background: #fdfff1;
        }

        .product-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-img {
          transform: scale(1.04);
        }

        .wishlist-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 34px;
          height: 34px;
          border: 1px solid #d8d8d8;
          background: white;
          cursor: pointer;
        }

        .product-info {
          padding-top: 16px;
        }

        .product-name {
          margin: 0 0 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0e0e0e;
          line-height: 160%;
        }

        .product-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-enquiry {
          background: #8b8c68;
          color: white;
          border: none;
          padding: 14px 24px;
          font-size: 13px;
          cursor: pointer;
        }

        .btn-bulk {
          background: transparent;
          border: none;
          font-size: 13px;
          color: #0e0e0e;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .section-title {
            font-size: 42px;
          }
        }

        @media (max-width: 768px) {
          .hero-img {
            height: 260px;
          }

          .collection-heading p {
            font-size: 22px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding: 0 20px 32px;
          }

          .section-title {
            font-size: 38px;
          }

          .bulk-order-link {
            font-size: 18px;
          }

          .product-grid {
            grid-template-columns: 1fr;
            padding: 0 20px 50px;
          }

          .product-name {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}