"use client";

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
    images: [
      "/images/new-arrivals-hero.jpg",
      "/images/product-1.jpg",
    ],
    specs: [
      { label: "Fabric",             value: "Cotton" },
      { label: "Wash Type",          value: "Hand Wash" },
      { label: "Material",           value: "Cotton" },
      { label: "Packaging Type",     value: "Each Item Packed Separately" },
      { label: "Size (inch)",        value: "93x108" },
      { label: "Type",               value: "BEDSHEET" },
      { label: "GSM",                value: "210 TC" },
      { label: "Country of Origin",  value: "Made in India" },
      { label: "Usage/Application",  value: "Home" },
      { label: "Bed Size",           value: "Double" },
      { label: "Thread Count",       value: "210 TC" },
      { label: "Pattern",            value: "210 TC" },
      { label: "Handmade",           value: "Yes" },
      { label: "Handmade",           value: "Hand Block" },
      { label: "Design",             value: "Printed" },
      { label: "Design",             value: "Printed" },
    ],
    description: `Each panel in this bedcover began as an individual block-printed cloth – selected for pattern, tone, and the way it sits alongside its neighbours. Assembled by hand into a patchwork that is both intentional and warmly imperfect, it is then layered and worked through with kantha running stitch from edge to edge. The result is something that rewards close looking: you'll find something new in it every time.\n\nAvailable in double and king sizes. The indigo-dominant colourway works equally well on light and dark linen, and across contemporary and classic bedroom aesthetics.`,
    features: [
      "Hand block patchwork construction – each panel individually printed",
      "Traditional kantha running stitch throughout",
      "Adjustable sizing on request for custom orders",
      "Available as part of a coordinated set with matching cushion covers",
      "Suitable for dry-cleaning or gentle machine wash",
    ],
    materials: [
      "100% fine cotton – breathable, soft, and dye-receptive",
      "Natural pigment dyes – colourfast and skin-friendly",
      "Hand-carved wooden block printing – teak or sheesham blocks",
      "Cotton kantha thread throughout",
    ],
    care: [
      "Gentle machine wash at 30°C or cool hand wash",
      "Do not bleach – preserves natural dye integrity",
      "Dry flat in shade to protect colours",
      "Iron on medium heat from reverse – kantha stitch is delicate",
      "The fabric softens beautifully with every wash",
    ],
    moreInfo: `Hand block Allover Bedcover Soft and Cool Finish Luxurious 100% Cotton Bedding like those found in hotels and celebrity homes. Comfort, quality and opulence sets our luxury bedding class apart. You would resist any other fabric after using these rich and soft bed linens.\n\nThese finest luxury bed linens keep the bed cool and is soft to your skin. Product colour may vary and not appear exact as shown in the image. About Bhavya International Jaipur is a quality focused global brand in India. Our premium range of furnishings come in ecological fabrics with amazing qualities like Cotton, Organic Cotton.\n\nThe complete product range. Hand block Allover Bedcover undergoes multilevel testing to maintain highest quality that keeps pace with the changing global trends for home and beyond. We provide impeccable customer service and assistance to help customers identify the most suited out of our product range.\n\nOur Hand block Allover Bedcover is very thick and of 100% cotton, you will clearly feel the difference once you order.\n\nOur Hand block Allover Bedcover Design spells comfort and elegance.\nFeel free to call us on 81144 23200 Process\nTime : 1-2 Business Days Shipments\nTenure : 5 - 7 Business Days at your door step`,
  },
};

function getProduct(slug) {
  return PRODUCTS[slug] || {
    name: "Product Not Found", sku: "—", item: "—", threadCount: "—",
    images: [], specs: [], description: "", features: [], materials: [], care: [], moreInfo: "",
  };
}

export default function ProductDetailPage({ params }) {
  const slug = params?.slug || "percal-hand-block-cotton-double-bed-sheets";
  const product = getProduct(slug);

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
                  <img src={product.images[0]} alt={product.name} className="stack-image" />
                  <button className="wishlist-btn" aria-label="Add to wishlist">♡</button>
                </div>
                {product.images[1] && (
                  <div className="image-box">
                    <img src={product.images[1]} alt={product.name} className="stack-image" />
                  </div>
                )}
              </div>

              {/* More Information — directly below images, left column */}
              {product.moreInfo && (
                <div className="more-info-col">
                  <h2 className="detail-heading">More Information</h2>
                  {product.moreInfo.split("\n\n").map((p, i) => (
                    <p key={i} className="detail-para">{p}</p>
                  ))}
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
                <p><strong>ITEM :</strong> {product.item}</p>
                <p><strong>THREAD COUNT :</strong> {product.threadCount}</p>
              </div>

              {/* CTA Buttons */}
              <div className="cta-row">
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
  }}
>
  PRICE ENQUIRY →
</Link>       <a href="/enquiry" className="btn-bulk">✦ BULK CUSTOMIZATION</a>
              </div>

              {/* Specs Table */}
              {product.specs.length > 0 && (
                <table className="specs-table">
                  <tbody>
                    {Array.from({ length: Math.ceil(product.specs.length / 2) }, (_, row) => {
                      const left  = product.specs[row * 2];
                      const right = product.specs[row * 2 + 1];
                      return (
                        <tr key={row}>
                          <td className="spec-label">{left?.label}</td>
                          <td className="spec-value">{left?.value}</td>
                          {right
                            ? <><td className="spec-label">{right.label}</td><td className="spec-value">{right.value}</td></>
                            : <><td /><td /></>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Description / Features / Materials / Care */}
              <div className="right-details">

                <h2 className="detail-heading">Description</h2>
                {product.description.split("\n\n").map((p, i) => (
                  <p key={i} className="detail-para">{p}</p>
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

      <Footer />

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

        .wishlist-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(255,255,255,0.85);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 18px;
          cursor: pointer;
          color: #7b7f5c;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wishlist-btn:hover { background: #fff; }

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
        .meta-lines { display: flex; flex-direction: column; gap: 5px; }
        .meta-lines p { font-size: 14px; margin: 0; line-height: 1.6; }
        .meta-lines strong { font-weight: 700; }

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
        .btn-bulk:hover { background: #f0f2de; }

        /* Specs table */
        .specs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          border: 1px solid #e0e2cc;
        }
        .specs-table tr { border-bottom: 1px solid #e0e2cc; }
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
            order: 2;
          }
          .info-col {
            order: 1;
          }
          .image-box--main {
            height: 420px;
          }
        }

        /* ── Responsive: Mobile (560px) ── */
        @media (max-width: 560px) {
          .outer-wrap {
            padding: 0 16px 48px;
          }
          .product-layout {
            padding-top: 80px;
            gap: 24px 0;
          }
          .product-title {
            font-size: 20px;
          }
          .btn-enquiry,
          .btn-bulk {
            width: 100%;
            text-align: center;
          }
          .image-box--main {
            height: 300px;
          }
          .specs-table {
            font-size: 12px;
          }
          .spec-label,
          .spec-value {
            padding: 7px 10px;
          }
        }
      `}</style>
    </>
  );
}