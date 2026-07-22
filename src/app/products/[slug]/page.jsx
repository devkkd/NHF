"use client";

import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
const PRODUCTS = {
  "percal-hand-block-cotton-double-bed-sheets": {
    slug: "percal-hand-block-cotton-double-bed-sheets",
    name: "Percal Hand Block Cotton Double Bed Sheets with 2 pillow KING SIZE",
    sku: "HBBS-04",
    item: "100% HAND BLOCK COTTON PERCAL BEDSHEET WITH 2 PILLOW",
    threadCount: "210 TC",
    price: 4200,
    images: ["/images/new-arrivals-hero.jpg", "/images/product-1.jpg"],
    specs: [
      { label: "Fabric", value: "Cotton" },
      { label: "Wash Type", value: "Hand Wash" },
      { label: "Material", value: "Cotton" },
      { label: "Packaging Type", value: "Each Item Packed Separately" },
      { label: "Size (inch)", value: "93x108" },
      { label: "Type", value: "BEDSHEET" },
      { label: "GSM", value: "210 TC" },
      { label: "Country of Origin", value: "Made in India" },
      { label: "Usage/Application", value: "Home" },
      { label: "Bed Size", value: "Double" },
      { label: "Thread Count", value: "210 TC" },
      { label: "Pattern", value: "210 TC" },
      { label: "Handmade", value: "Yes" },
      { label: "Handmade", value: "Hand Block" },
      { label: "Design", value: "Printed" },
      { label: "Design", value: "Printed" }
    ],
    description: `Each panel in this bedcover began as an individual block-printed cloth – selected for pattern, tone, and the way it sits alongside its neighbours. Assembled by hand into a patchwork that is both intentional and warmly imperfect, it is then layered and worked through with kantha running stitch from edge to edge. The result is something that rewards close looking: you'll find something new in it every time.\n\nAvailable in double and king sizes. The indigo-dominant colourway works equally well on light and dark linen, and across contemporary and classic bedroom aesthetics.`,
    features: [
      "Hand block patchwork construction – each panel individually printed",
      "Traditional kantha running stitch throughout",
      "Adjustable sizing on request for custom orders",
      "Available as part of a coordinated set with matching cushion covers",
      "Suitable for dry-cleaning or gentle machine wash"
    ],
    materials: [
      "100% fine cotton – breathable, soft, and dye-receptive",
      "Natural pigment dyes – colourfast and skin-friendly",
      "Hand-carved wooden block printing – teak or sheesham blocks",
      "Cotton kantha thread throughout"
    ],
    care: [
      "Gentle machine wash at 30°C or cool hand wash",
      "Do not bleach – preserves natural dye integrity",
      "Dry flat in shade to protect colours",
      "Iron on medium heat from reverse – kantha stitch is delicate",
      "The fabric softens beautifully with every wash"
    ],
    moreInfo: `Hand block Allover Bedcover Soft and Cool Finish Luxurious 100% Cotton Bedding like those found in hotels and celebrity homes. Comfort, quality and opulence sets our luxury bedding class apart. You would resist any other fabric after using these rich and soft bed linens.\n\nThese finest luxury bed linens keep the bed cool and is soft to your skin. Product colour may vary and not appear exact as shown in the image. About Bhavya International Jaipur is a quality focused global brand in India. Our premium range of furnishings come in ecological fabrics with amazing qualities like Cotton, Organic Cotton.\n\nThe complete product range. Hand block Allover Bedcover undergoes multilevel testing to maintain highest quality that keeps pace with the changing global trends for home and beyond. We provide impeccable customer service and assistance to help customers identify the most suited out of our product range.\n\nOur Hand block Allover Bedcover is very thick and of 100% cotton, you will clearly feel the difference once you order.\n\nOur Hand block Allover Bedcover Design spells comfort and elegance.\nFeel free to call us on 81144 23200 Process\nTime : 1-2 Business Days Shipments\nTenure : 5 - 7 Business Days at your door step`
  }
};

function getProduct(slug) {
  return (
    PRODUCTS[slug] || {
      name: "Product Not Found",
      sku: "—",
      item: "—",
      threadCount: "—",
      images: [],
      specs: [],
      description: "",
      features: [],
      materials: [],
      care: [],
      moreInfo: ""
    }
  );
}

export default function ProductDetailPage({ params }) {
  const slug = params?.slug || "percal-hand-block-cotton-double-bed-sheets";
  const product = getProduct(slug);
  const router = useRouter();
  const [quantity, setQuantity] = useState(0);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 560);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    router.push("/cart");
  };

  return (
    <>
      <Header />

      <main className="page-bg">
        <div className="outer-wrap">
          {/* ══════════════════════════════════════════
              MAIN LAYOUT — 2 column grid
              LEFT  (46%): images + more info (below images)
              RIGHT (54%): all product info
          ══════════════════════════════════════════ */}
          <div className="product-layout">
            {/* ── LEFT COLUMN: Images stacked + More Info below ── */}
            <div className="left-col">
              {/* Stacked Images */}
              <div className="image-col">
                <div className="image-box image-box--main">
                  <img
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="stack-image"
                  />
                </div>

                <div className="mobile-thumbnails">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`thumb-btn ${
                        activeImage === index ? "active" : ""
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={img} alt="" className="thumb-img" />
                    </button>
                  ))}
                </div>

                <div className="desktop-images">
                  {product.images.slice(1).map((img, index) => (
                    <div className="image-box" key={index}>
                      <img
                        src={img}
                        alt={product.name}
                        className="stack-image"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* More Information — directly below images, left column */}
              {product.moreInfo && (
                <div className="more-info-col">
                  <h2 className="detail-heading">More Information</h2>

                  <div
                    className={`more-info-content ${
                      showMoreInfo || !isMobile ? "expanded" : ""
                    }`}
                  >
                    {product.moreInfo.split("\n\n").map((p, i) => (
                      <p key={i} className="detail-para">
                        {p}
                      </p>
                    ))}
                  </div>

                  {isMobile && (
                    <button
                      className="see-more-btn"
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                    >
                      {showMoreInfo ? "See Less" : "See More"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Product Info ── */}
            <div className="info-col">
              {/* Title */}
              <h1 className="product-title">{product.name}</h1>

              {/* SKU */}
              <p className="sku-line">SKU: {product.sku}</p>

              {/* Meta */}
              <div className="meta-lines">
                <p>
                  <strong>ITEM :</strong> {product.item}
                </p>
                <p>
                  <strong>THREAD COUNT :</strong> {product.threadCount}
                </p>
              </div>
              <div
                style={{
                  marginBottom: "22px"
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "10px",
                    color: "#333"
                  }}
                >
                  Colour :
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: "1px solid #c8cab4",
                      cursor: "pointer"
                    }}
                  />

                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#7b7f5c",
                      border: "1px solid #c8cab4",
                      cursor: "pointer"
                    }}
                  />

                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#d7b98c",
                      border: "1px solid #c8cab4",
                      cursor: "pointer"
                    }}
                  />

                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#a7c7e7",
                      border: "1px solid #c8cab4",
                      cursor: "pointer"
                    }}
                  />

                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#f3b5b5",
                      border: "1px solid #c8cab4",
                      cursor: "pointer"
                    }}
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className="cta-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 220px",
                  gap: "14px"
                }}
              >
                {/* PRICE ENQUIRY */}
                <Link
                  href={`/enquiry1/${product.slug}`}
                  style={{
                    background: "#8a8d67",
                    color: "#fff",
                    width: "220px",
                    height: "56px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    fontWeight: "600"
                  }}
                >
                  BULK PRICE ENQUIRY →
                </Link>

                {/* BULK CUSTOMIZATION */}
                <a
                  href="/enquiry"
                  style={{
                    background: "transparent",
                    color: "#0e0e0e",
                    width: "220px",
                    height: "56px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    border: "1px solid #c8cab4",
                    fontWeight: "600"
                  }}
                >
                  ✦ BULK CUSTOMIZATION
                </a>

                {/* BUY NOW */}
                <button
                  style={{
                    background: "#8a8d67",
                    color: "#fff",
                    width: "220px",
                    height: "56px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                  onClick={handleBuyNow}
                >
                  BUY NOW
                </button>

                {/* ADD TO CART */}
                {quantity === 0 ? (
                  <button
                    style={{
                      background: "transparent",
                      color: "#0e0e0e",
                      width: "220px",
                      height: "56px",
                      border: "1px solid #c8cab4",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                    onClick={handleAddToCart}
                  >
                    ADD TO CART
                  </button>
                ) : (
                  <div
                    style={{
                      width: "220px",
                      height: "56px",
                      border: "1px solid #c8cab4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 18px"
                    }}
                  >
                    <button
                      onClick={() => {
                        const newQty = quantity - 1;

                        if (newQty <= 0) {
                          updateQty(product.slug, 0);
                          setQuantity(0);
                        } else {
                          updateQty(product.slug, newQty);
                          setQuantity(newQty);
                        }
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "22px",
                        cursor: "pointer"
                      }}
                    >
                      −
                    </button>

                    <span style={{ fontWeight: 600 }}>{quantity}</span>

                    <button
                      onClick={() => {
                        const newQty = quantity + 1;
                        setQuantity(newQty);
                        updateQty(product.slug, newQty);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "22px",
                        cursor: "pointer"
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Specs Table */}
              {product.specs.length > 0 && (
                <table className="specs-table">
                  <tbody>
                    {Array.from(
                      { length: Math.ceil(product.specs.length / 2) },
                      (_, row) => {
                        const left = product.specs[row * 2];
                        const right = product.specs[row * 2 + 1];
                        return (
                          <tr key={row}>
                            <td className="spec-label">{left?.label}</td>
                            <td className="spec-value">{left?.value}</td>
                            {right ? (
                              <>
                                <td className="spec-label">{right.label}</td>
                                <td className="spec-value">{right.value}</td>
                              </>
                            ) : (
                              <>
                                <td />
                                <td />
                              </>
                            )}
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              )}

              {/* Description / Features / Materials / Care */}
              <div className="right-details">
                <h2 className="detail-heading">Description</h2>
                {product.description.split("\n\n").map((p, i) => (
                  <p key={i} className="detail-para">
                    {p}
                  </p>
                ))}

                <hr className="divider" />

                <h2 className="detail-heading">Features</h2>
                <ul className="detail-list">
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>

                <hr className="divider" />

                <h2 className="detail-heading">Materials</h2>
                <ul className="detail-list">
                  {product.materials.map((m, i) => <li key={i}>{m}</li>)}
                </ul>

                <hr className="divider" />

                <h2 className="detail-heading">Care Instructions</h2>
                <ul className="detail-list">
                  {product.care.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* ── Page background ── */
        .page-bg {
          background-color: #fdfff1;
          min-height: 100vh;
          font-family: "Mona Sans", "Inter", sans-serif;
          color: #0e0e0e;
        }

        /* ── Outer wrapper ── */
        .outer-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }

        /* ══ MAIN 2-COLUMN GRID ══ */
        .product-layout {
          display: grid;
          grid-template-columns: 46% 54%;
          gap: 0 48px;
          padding-top: 120px;
          align-items: start;
        }

        /* ── LEFT COLUMN ── */
        .left-col {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* ── Images ── */
        .image-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .image-box {
          position: relative;
          width: 100%;
          background: #f4f4ec;
          line-height: 0;
        }

        .image-box--main {
          height: 500px;
        }

        .image-box--main .stack-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stack-image {
          width: 100%;
          display: block;
          object-fit: cover;
        }

        .mobile-thumbnails {
          display: none;
        }

        .desktop-images {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .thumb-btn {
          border: 1px solid #d8d8d8;
          background: #fff;
          padding: 0;
          cursor: pointer;
        }

        .thumb-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          display: block;
        }

        .thumb-btn.active {
          border: 2px solid #8a8d67;
        }

        /* ── More Info (below images in left col) ── */
        .more-info-col {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── RIGHT COLUMN: info ── */
        .info-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding-bottom: 60px;
        }

        /* Product title */
        .product-title {
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          color: #0e0e0e;
          line-height: 1.35;
          margin: 0;
        }

        /* SKU */
        .sku-line {
          font-size: 13px;
          color: #888;
          margin: 0;
        }

        /* Meta */
        .meta-lines {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .meta-lines p {
          font-size: 14px;
          margin: 0;
          line-height: 1.6;
        }
        .meta-lines strong {
          font-weight: 700;
        }

        /* CTA buttons */
        .cta-row {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        .btn-enquiry {
          background: #8a8d67 !important;
          color: #fff !important;

          display: inline-flex !important;
          align-items: center;
          justify-content: center;

          width: 220px;
          height: 56px;

          border: none !important;
          text-decoration: none !important;

          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;

          transition: all 0.3s ease;
        }

        .btn-enquiry:hover {
          background: #747854 !important;
          color: #fff !important;
        }
        .btn-bulk {
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          color: #0e0e0e;
          text-decoration: none;
          border: 1px solid #c8cab4;
          padding: 13px 22px;
          letter-spacing: 0.04em;
          display: inline-block;
          transition: background 0.2s;
        }
        .btn-bulk:hover {
          background: #f0f2de;
        }

        /* Specs table */
        .specs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          border: 1px solid #e0e2cc;
        }
        .specs-table tr {
          border-bottom: 1px solid #e0e2cc;
        }
        .spec-label {
          padding: 9px 14px;
          color: #555;
          font-weight: 400;
          width: 22%;
          vertical-align: middle;
          border-right: 1px solid #e0e2cc;
        }
        .spec-value {
          padding: 9px 14px;
          color: #0e0e0e;
          font-weight: 700;
          width: 28%;
          vertical-align: middle;
          border-right: 1px solid #e0e2cc;
        }

        /* Description / Features / Materials / Care */
        .right-details {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 8px;
        }
        .detail-heading {
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 19px;
          font-weight: 700;
          color: #0e0e0e;
          margin: 0 0 10px;
        }
        .detail-para {
          font-size: 14px;
          line-height: 1.75;
          color: #333;
          margin: 0 0 10px;
        }
        .detail-list {
          padding: 0;
          margin: 0 0 10px;
          list-style: none;
        }
        .detail-list li {
          font-size: 14px;
          line-height: 1.85;
          color: #333;
        }
        .divider {
          border: none;
          border-top: 1px solid #e0e2cc;
          margin: 26px 0;
        }
        .more-info-content {
          overflow: hidden;
          transition: max-height 0.35s ease;
        }

        @media (max-width: 560px) {
          /* Hide More Information on mobile */

          .more-info-col {
            display: none !important;
          }
          .more-info-content {
            max-height: 170px;
            position: relative;
          }

          .more-info-content.expanded {
            max-height: 3000px;
          }

          .more-info-content:not(.expanded)::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 55px;
            background: linear-gradient(rgba(253, 255, 241, 0), #fdfff1);
          }

          .see-more-btn {
            margin-top: 14px;
            border: none;
            background: none;
            color: #8a8d67;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
          }
        }

        /* ── Responsive: Tablet (960px) ── */
        @media (max-width: 960px) {
          .outer-wrap {
            padding: 0 24px 60px;
          }
          .product-layout {
            grid-template-columns: 1fr;
            padding-top: 90px;
            gap: 32px 0;
          }
          /* On tablet/mobile: right col comes first (info), then left col (images + more info) */
          .left-col {
            order: 1;
          }

          .info-col {
            order: 2;
          }
          .image-box--main {
            height: 420px;
          }
        }

        /* ── Responsive: Mobile (560px) ── */
        @media (max-width: 560px) {
          html,
          body,
          .page-bg {
            overflow-x: hidden;
          }

          * {
            box-sizing: border-box;
          }

          .outer-wrap {
            width: 100%;
            max-width: 100%;
            padding: 0 16px 40px;
          }

          .product-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding-top: 88px;
          }

          /* IMAGE FIRST */

          .left-col {
            order: 1 !important;
            width: 100%;
            gap: 18px;
          }

          .info-col {
            order: 2 !important;
            width: 100%;
            gap: 16px;
            padding-bottom: 0;
          }

          /* IMAGE */

          .image-col {
            gap: 14px;
          }

          .image-box,
          .stack-image {
            width: 100%;
          }

          .image-box--main {
            height: 270px;
          }

          .wishlist-btn {
            width: 32px;
            height: 32px;
            right: 10px;
            bottom: 10px;
            font-size: 16px;
          }

          /* TITLE */

          .product-title {
            font-size: 22px;
            line-height: 1.35;
          }

          .sku-line {
            font-size: 12px;
          }

          .meta-lines p {
            font-size: 13px;
            line-height: 1.6;
          }

          /* COLOR */

          span[style*="borderRadius"] {
            width: 20px !important;
            height: 20px !important;
          }

          /* BUTTONS */

          .cta-row {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            width: 100% !important;
          }

          .cta-row > * {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          .cta-row a,
          .cta-row button {
            width: 100% !important;
            height: 48px !important;
            min-width: 0 !important;
            max-width: 100% !important;

            display: flex !important;
            align-items: center;
            justify-content: center;

            padding: 0 10px !important;

            font-size: 11px !important;
            font-weight: 600;
            line-height: 1.3;
            text-align: center;
          }

          /* Quantity */

          .cta-row > div {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;

            height: 48px !important;

            display: flex !important;
            align-items: center;
            justify-content: space-between;

            padding: 0 14px !important;
          }

          .cta-row > div button {
            width: auto !important;
            height: auto !important;
            font-size: 18px !important;
            padding: 0 !important;
          }

          .cta-row > div span {
            font-size: 14px !important;
            font-weight: 600;
          }

          /* TABLE */

          .specs-table {
            width: 100%;
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

          .spec-label,
          .spec-value {
            padding: 8px;
            font-size: 11px;
          }

          /* DETAILS */

          .detail-heading {
            font-size: 18px;
            margin-bottom: 8px;
          }

          .detail-para,
          .detail-list li {
            font-size: 13px;
            line-height: 1.8;
          }

          .divider {
            margin: 18px 0;
          }

          .more-info-col {
            margin-top: 6px;
          }

          img {
            max-width: 100%;
            display: block;
          }
          .desktop-images {
            display: none;
          }

          .mobile-thumbnails {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            overflow-x: auto;
          }

          .mobile-thumbnails .thumb-btn {
            flex: 0 0 auto;
          }

          .thumb-img {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>
    </>
  );
}
