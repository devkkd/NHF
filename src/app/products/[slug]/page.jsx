"use client";

import { useRouter } from "next/navigation";
import { addToCart, updateQty } from "@/lib/cart";
import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1").replace(/\/$/, "");

// Sample product fallback matching user reference images
const SAMPLE_PRODUCT = {
  name: "Percal Hand Block Cotton Double Bed Sheets with 2 pillow KING SIZE",
  slug: "block",
  sku: "HBEE 04",
  item: "100% HAND BLOCK COTTON PERCAL BEDSHEET WITH 2 PILLOW",
  threadCount: "210 TC",
  colors: ["#ffffff", "#7b7f5c", "#d8c4a9", "#9bb7d4", "#e3b5b5"],
  mainImage: "/images/product/bedsheet.jpg",
  galleryImages: [
    "/images/product/new1.png",
    "/images/product/new2.png",
    "/images/product-1.jpg",
    "/images/product-2.jpg",
    "/images/product-3.jpg",
  ],
  fabric: "Cotton",
  washType: "Hand Wash",
  material: "Cotton",
  packagingType: "Each Item Packed Separately",
  size: "90x108",
  type: "BEDSHEET",
  gsm: "210 TC",
  countryOfOrigin: "Made In India",
  usageApplication: "Home",
  bedSize: "Double",
  handmade: "Yes",
  design: "Printed",
  pattern: "Printed",
  description:
    "Each panel in this bedcover began as an individual block-printed cloth — selected for pattern, tone, and the way it sits alongside its neighbours. Assembled by hand into a patchwork that is both intentional and warmly imperfect, it is then layered and worked through with kantha running stitch from edge to edge. The result is something that rewards close looking; you'll find something new in it every time.\n\nAvailable in double and king sizes. The indigo-dominant colourway works equally well on light and dark lines, and across contemporary and classic bedroom aesthetics.",
  features: [
    "Hand block patchwork construction — each panel individually printed",
    "Traditional kantha running stitch throughout",
    "Adjustable sizing on request for custom orders",
    "Available as part of a coordinated set with matching cushion covers",
    "Suitable for dry-cleaning or gentle machine wash",
  ],
  materials: [
    "100% fine cotton — breathable, soft, and dye-receptive",
    "Natural pigment dyes — colourfast and skin-friendly",
    "Hand-carved wooden block printing — teak or sheesham blocks",
    "Cotton kantha thread throughout",
  ],
  careInstructions: [
    "Gentle machine wash at 30°C or cool hand wash",
    "Do not bleach — preserves natural dye integrity",
    "Dry flat in shade to protect colours",
    "Iron on medium heat from reverse — kantha stitch is delicate",
    "The fabric softens beautifully with every wash",
  ],
  moreInformation:
    "Hand block Allover Bedcover Soft and Cool Finish Luxurious 100% Cotton Bedding like those found in hotels and celebrity homes. Comfort, quality and opulence sets our luxury bedding class apart. You would resist any other fabric after using these rich and soft bed linens.\n\nThese finest luxury bed linens keep the bed cool and is soft to your skin. Product colour may vary and not appear exact as shown in the image. About Bhavya International Jaipur is a quality focused global brand in India. Our premium range of furnishings come in ecological fabrics, with amazing qualities like Cotton, Organic Cotton.\n\nThe complete product range, Hand block Allover Bedcover undergoes multi-level testing to maintain highest quality that keeps pace with the changing global trends for home and beyond. We provide impeccable customer service and assistance to help customers identify the most suited out of our product range.\n\nOur Hand block Allover Bedcover is very thick and of 100% cotton, you will clearly feel the difference once you order.\n\nOur Hand block Allover Bedcover Design spells comfort and elegance. Feel free to call us on 01144 23200 Process Time : 1-2 Business Days. Shipments Tenure : 5 - 7 Business Days at your door step.",
};

async function fetchProduct(slug) {
  try {
    const res = await fetch(`${BASE}/products/${slug}`);
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data?.product ?? null;
  } catch {
    return null;
  }
}

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProduct(slug).then((p) => {
      if (p) {
        setProduct(p);
      } else {
        // Fallback to sample data for testing routes like /products/block or missing API items
        setProduct({ ...SAMPLE_PRODUCT, slug });
      }
      setLoading(false);
    });
  }, [slug]);

  // ====================================================
  // LOGIN / PENDING ACTION HELPERS
  // ====================================================

  const isLoggedIn = () => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      localStorage.getItem("accessToken")
    );
  };

  const showLoginRequired = (type) => {
    if (typeof window === "undefined") {
      return;
    }

    const currentUrl =
      window.location.pathname +
      window.location.search;

    if (type === "cart") {
      sessionStorage.setItem(
        "pendingCartProduct",
        JSON.stringify({
          product,
          quantity: 1,
        })
      );

      sessionStorage.setItem(
        "pendingCartRedirect",
        currentUrl
      );
    }

    if (type === "buy-now") {
      sessionStorage.setItem(
        "pendingBuyNowProduct",
        JSON.stringify({
          product,
          quantity: 1,
        })
      );
    }

    toast.error("Please login first", {
      duration: 2200,
      position: "top-right",
    });

    setTimeout(() => {
      router.push(
        `/login?redirect=${encodeURIComponent(
          type === "buy-now"
            ? "/checkout"
            : currentUrl
        )}`
      );
    }, 450);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isLoggedIn()) {
      showLoginRequired("cart");
      return;
    }

    try {
      await addToCart(
        { ...product, slug: product.slug },
        1
      );

      setQuantity(1);
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!isLoggedIn()) {
      showLoginRequired("buy-now");
      return;
    }

    try {
      await addToCart(
        { ...product, slug: product.slug },
        1
      );

      router.push("/cart");
    } catch (error) {
      console.error(
        "BUY NOW ERROR:",
        error
      );
    }
  };

  // Combine mainImage + galleryImages cleanly
  const rawImages = product
    ? [product.mainImage, ...(product.galleryImages ?? [])].filter(Boolean)
    : [];
  const allImages = rawImages.length > 0 ? rawImages : [SAMPLE_PRODUCT.mainImage, ...SAMPLE_PRODUCT.galleryImages];

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Build specs list dynamically from product fields
  const builtSpecs = product
    ? [
        { label: "Fabric", value: product.fabric || "Cotton" },
        { label: "Wash Type", value: product.washType || "Hand Wash" },
        { label: "Material", value: product.material || "Cotton" },
        { label: "Packaging Type", value: product.packagingType || "Each Item Packed Separately" },
        { label: "Size (inch)", value: product.size || "90x108" },
        { label: "Type", value: product.type || "BEDSHEET" },
        { label: "GSM", value: product.gsm || "210 TC" },
        { label: "Country of Origin", value: product.countryOfOrigin || "Made In India" },
        { label: "Usage/Application", value: product.usageApplication || "Home" },
        { label: "Bed Size", value: product.bedSize || "Double" },
        { label: "Thread Count", value: product.threadCount || "210 TC" },
        { label: "Pattern", value: product.pattern || "Printed" },
        { label: "Handmade", value: product.handmade || "Yes" },
        { label: "Design", value: product.design || "Printed" },
        ...(product.specs ?? []),
      ].filter((s) => Boolean(s.value))
    : [];

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="page-bg">
        <div className="outer-wrap">
          <div className="product-layout">
            <div className="left-col">
              <div style={{ display: "flex", gap: 16, height: 500 }}>
                <div style={{ width: 80, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: 80, background: "#e8ebe0", borderRadius: 8 }} />
                  ))}
                </div>
                <div style={{ flex: 1, background: "#e8ebe0", borderRadius: 12 }} />
              </div>
            </div>
            <div className="info-col">
              <div style={{ height: 36, background: "#e8ebe0", borderRadius: 4, width: "80%", marginBottom: 16 }} />
              <div style={{ height: 20, width: "30%", background: "#e8ebe0", borderRadius: 4, marginBottom: 20 }} />
              <div style={{ height: 120, background: "#e8ebe0", borderRadius: 8 }} />
            </div>
          </div>
        </div>
        <style jsx>{`
          .page-bg { background: #fdfff1; min-height: 100vh; }
          .outer-wrap { max-width: 1360px; margin: 0 auto; padding: 0 40px 80px; }
          .product-layout { display: grid; grid-template-columns: 50% 50%; gap: 0 40px; padding-top: 120px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <div className="outer-wrap">
        <div className="product-layout">

          {/* ════════════════════════════════════════
              LEFT COLUMN — Image Gallery (Left Thumbnails + Main View) & More Info
          ════════════════════════════════════════ */}
          <div className="left-col">
            <div className="gallery-container">

              {/* Vertical Thumbnails List (Left side of Main Image - Image 2 layout) */}
              <div className="thumbnails-column">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-box ${activeImage === idx ? "active" : ""}`}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="thumb-img" />
                  </button>
                ))}
              </div>

              {/* Main Image Display with Navigation Arrows */}
              <div className="main-image-viewport">
                <img
                  src={allImages[activeImage] || allImages[0]}
                  alt={product.name}
                  className="main-display-img"
                />

                {/* Left Arrow Button */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    className="nav-arrow nav-arrow--left"
                    onClick={handlePrevImage}
                    aria-label="Previous Image"
                  >
                    ‹
                  </button>
                )}

                {/* Right Arrow Button */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    className="nav-arrow nav-arrow--right"
                    onClick={handleNextImage}
                    aria-label="Next Image"
                  >
                    ›
                  </button>
                )}
              </div>

            </div>

            {/* More Information Section (Under images on left side - Image 1 style) */}
            {product.moreInformation && (
              <div className="more-info-col">
                <h2 className="detail-heading">More Information</h2>
                <div className={`more-info-content ${showMoreInfo || !isMobile ? "expanded" : ""}`}>
                  {product.moreInformation.split("\n\n").map((para, i) => (
                    <p key={i} className="detail-para">{para}</p>
                  ))}
                </div>
                {isMobile && (
                  <button className="see-more-btn" onClick={() => setShowMoreInfo((v) => !v)}>
                    {showMoreInfo ? "See Less" : "See More"}
                  </button>
                )}
              </div>
            )}
          </div>


          {/* ════════════════════════════════════════
              RIGHT COLUMN — Product Details, Swatches, Specs & Content
          ════════════════════════════════════════ */}
          <div className="info-col">
           <h1 className="product-title">{product.name}</h1>

<p className="product-price">
  ₹{Number(product.price || 0).toLocaleString("en-IN")}
</p>

<p className="sku-line">
  SKU : {product.sku || "HBEE 04"}
</p>

            <div className="meta-lines">
              <p><strong>ITEM :</strong> {product.item || "100% HAND BLOCK COTTON PERCAL BEDSHEET WITH 2 PILLOW"}</p>
              <p><strong>THREAD COUNT :</strong> {product.threadCount || "210 TC"}</p>
            </div>

            {/* Colour Swatches */}
            <div className="colors-section">
              <div className="colors-label">Colour :</div>
              <div className="colors-list">
                {(product.colors && product.colors.length > 0 ? product.colors : SAMPLE_PRODUCT.colors).map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveColor(i)}
                    className={`color-swatch ${activeColor === i ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    title={`Color option ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons 2x2 Grid */}
            <div className="cta-grid">
              <Link href={`/enquiry1/${product.slug}`} className="btn-filled">
                BULK PRICE ENQUIRY ›
              </Link>
              <Link href="/enquiry" className="btn-outline">
                ✦ BULK CUSTOMIZATION
              </Link>
              <button type="button" className="btn-filled" onClick={handleBuyNow}>
                BUY NOW
              </button>
              {quantity === 0 ? (
                <button type="button" className="btn-outline" onClick={handleAddToCart}>
                  ADD TO CART
                </button>
              ) : (
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isLoggedIn()) {
                        showLoginRequired("cart");
                        return;
                      }

                      const n = quantity - 1;

                      try {
                        await updateQty(
                          product._id || product.slug,
                          n
                        );

                        if (n <= 0) {
                          setQuantity(0);
                        } else {
                          setQuantity(n);
                        }
                      } catch (error) {
                        console.error(
                          "DECREASE QTY ERROR:",
                          error
                        );
                      }
                    }}
                  >−</button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isLoggedIn()) {
                        showLoginRequired("cart");
                        return;
                      }

                      const n = quantity + 1;

                      try {
                        await updateQty(
                          product._id || product.slug,
                          n
                        );

                        setQuantity(n);
                      } catch (error) {
                        console.error(
                          "INCREASE QTY ERROR:",
                          error
                        );
                      }
                    }}
                  >+</button>
                </div>
              )}
            </div>

            {/* Specifications Table (Image 1 style) */}
            {builtSpecs.length > 0 && (
              <div className="specs-table-wrap">
                <table className="specs-table">
                  <tbody>
                    {Array.from({ length: Math.ceil(builtSpecs.length / 2) }, (_, row) => {
                      const left = builtSpecs[row * 2];
                      const right = builtSpecs[row * 2 + 1];
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
                              <td className="spec-label" />
                              <td className="spec-value" />
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Text Detail Sections */}
            <div className="right-details">
              {product.description && (
                <>
                  <h2 className="detail-heading">Description</h2>
                  {product.description.split("\n\n").map((para, i) => (
                    <p key={i} className="detail-para">{para}</p>
                  ))}
                  <hr className="divider" />
                </>
              )}

              {product.features?.length > 0 && (
                <>
                  <h2 className="detail-heading">Features</h2>
                  <ul className="detail-list">
                    {product.features.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <hr className="divider" />
                </>
              )}

              {product.materials?.length > 0 && (
                <>
                  <h2 className="detail-heading">Materials</h2>
                  <ul className="detail-list">
                    {product.materials.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <hr className="divider" />
                </>
              )}

              {product.careInstructions?.length > 0 && (
                <>
                  <h2 className="detail-heading">Care Instructions</h2>
                  <ul className="detail-list">
                    {product.careInstructions.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      <style jsx>{`
        .page-bg {
          background-color: #fdfff1;
          min-height: 100vh;
          font-family: "Mona Sans", "Inter", -apple-system, sans-serif;
          color: #0e0e0e;
        }

        .outer-wrap {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 48% 52%;
          gap: 0 44px;
          padding-top: 110px;
          align-items: start;
        }

        /* ════════════════════════════════════════
           LEFT COLUMN GALLERY (Image 2 style)
        ════════════════════════════════════════ */
        .left-col {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .gallery-container {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          width: 100%;
        }

        .thumbnails-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 560px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
        }

        .thumbnails-column::-webkit-scrollbar {
          width: 4px;
        }
        .thumbnails-column::-webkit-scrollbar-thumb {
          background: #c8cab4;
          border-radius: 4px;
        }

        .thumb-box {
          width: 76px;
          height: 76px;
          min-width: 76px;
          min-height: 76px;
          padding: 0;
          border-radius: 10px;
          border: 2px solid transparent;
          background: #f4f4ec;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.15s ease;
          outline: none;
        }

        .thumb-box:hover {
          transform: translateY(-2px);
          border-color: #c8cab4;
        }

        .thumb-box.active {
          border-color: #0e0e0e;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #7b7f5c;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .main-image-viewport {
          position: relative;
          flex: 1;
          height: 540px;
          border-radius: 16px;
          overflow: hidden;
          background: #f4f4ec;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
        }

        .main-display-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.25s ease;
        }

        /* Navigation Arrows over Main Image */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(14, 14, 14, 0.7);
          color: #ffffff;
          border: none;
          font-size: 22px;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          z-index: 5;
          user-select: none;
        }

        .nav-arrow:hover {
          background: #0e0e0e;
          transform: translateY(-50%) scale(1.08);
        }

        .nav-arrow--left {
          left: 14px;
        }

        .nav-arrow--right {
          right: 14px;
        }

        /* ════════════════════════════════════════
           RIGHT COLUMN & CONTENT (Image 1 style)
        ════════════════════════════════════════ */
        .info-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-title {
          font-family: "Tobias TRIAL", Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 700;
          color: #0e0e0e;
          line-height: 1.35;
          margin: 0;
          letter-spacing: -0.2px;
        }
          .product-price {
  font-family: "Mona Sans", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #7b7f5c;
  margin: 8px 0 6px;
  line-height: 1;
}

        .sku-line {
          font-size: 13px;
          color: #777;
          margin: -6px 0 4px;
          font-weight: 500;
        }

        .meta-lines {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13.5px;
          color: #111;
        }

        .meta-lines p {
          margin: 0;
          line-height: 1.5;
        }

        .meta-lines strong {
          font-weight: 700;
          color: #000;
        }

        /* Colour Swatches */
        .colors-section {
          margin-top: 4px;
          margin-bottom: 8px;
        }

        .colors-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .colors-list {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .color-swatch {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid #c8cab4;
          padding: 0;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          outline: none;
        }

        .color-swatch:hover {
          transform: scale(1.1);
        }

        .color-swatch.active {
          border: 2px solid #7b7f5c;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #7b7f5c;
        }

        /* CTA Grid */
        .cta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 8px 0 16px;
        }

        .btn-filled {
          background: #7b7f5c;
          color: #ffffff;
          height: 52px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-family: inherit;
          transition: background-color 0.2s ease, transform 0.15s ease;
          box-sizing: border-box;
          padding: 0 16px;
          text-transform: uppercase;
        }

        .btn-filled:hover {
          background: #676a4c;
        }

        .btn-outline {
          background: transparent;
          color: #0e0e0e;
          height: 52px;
          border: 1px solid #c8cab4;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-family: inherit;
          transition: background-color 0.2s ease, border-color 0.2s ease;
          box-sizing: border-box;
          padding: 0 16px;
          text-transform: uppercase;
        }

        .btn-outline:hover {
          background: #f4f6e6;
          border-color: #7b7f5c;
        }

        .qty-control {
          height: 52px;
          border: 1px solid #c8cab4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          background: #ffffff;
        }

        .qty-control button {
          border: none;
          background: transparent;
          font-size: 20px;
          cursor: pointer;
          color: #0e0e0e;
          padding: 0 8px;
        }

        .qty-control span {
          font-weight: 600;
          font-size: 15px;
        }

        /* Specs Table */
        .specs-table-wrap {
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          border: 1px solid #e0e2cc;
          background: #fafbf4;
        }

        .specs-table tr {
          border-bottom: 1px solid #e0e2cc;
        }

        .spec-label {
          padding: 8px 12px;
          color: #444;
          font-weight: 400;
          width: 22%;
          border-right: 1px solid #e0e2cc;
          background: #fafbf4;
        }

        .spec-value {
          padding: 8px 12px;
          color: #0e0e0e;
          font-weight: 700;
          width: 28%;
          border-right: 1px solid #e0e2cc;
          background: #fafbf4;
        }

        /* Detail Text Sections */
        .right-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-heading {
          font-family: "Tobias TRIAL", Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #0e0e0e;
          margin: 12px 0 8px;
        }

        .detail-para {
          font-size: 13.5px;
          line-height: 1.7;
          color: #333;
          margin: 0 0 10px;
        }

        .detail-list {
          padding-left: 20px;
          margin: 0 0 10px;
        }

        .detail-list li {
          font-size: 13.5px;
          line-height: 1.75;
          color: #333;
          margin-bottom: 4px;
        }

        .divider {
          border: none;
          border-top: 1px solid #e0e2cc;
          margin: 16px 0;
        }

        .more-info-col {
          display: flex;
          flex-direction: column;
          margin-top: 20px;
        }

        .see-more-btn {
          margin-top: 12px;
          border: none;
          background: none;
          color: #7b7f5c;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        /* ════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .outer-wrap {
            padding: 0 24px 60px;
          }
          .product-layout {
            grid-template-columns: 1fr;
            padding-top: 90px;
            gap: 40px 0;
          }
          .main-image-viewport {
            height: 440px;
          }
        }

        @media (max-width: 768px) {
          .outer-wrap {
            padding: 0 16px 40px;
          }
          .product-layout {
            padding-top: 80px;
            gap: 28px 0;
          }
            .product-price {
    font-size: 22px;
  }

          .gallery-container {
            flex-direction: column-reverse;
          }
          .thumbnails-column {
            flex-direction: row;
            max-height: none;
            overflow-x: auto;
            width: 100%;
            padding-bottom: 8px;
          }
          .thumb-box {
            width: 64px;
            height: 64px;
            min-width: 64px;
            min-height: 64px;
          }
          .main-image-viewport {
            height: 320px;
            width: 100%;
            border-radius: 12px;
          }
          .cta-grid {
            grid-template-columns: 1fr;
          }
          .specs-table {
            font-size: 11.5px;
          }
          .spec-label, .spec-value {
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
}
