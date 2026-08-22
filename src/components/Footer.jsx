"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const API = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

/* ── Static company links (not from backend) ─────────────── */
const COMPANY_LINKS = [
  {
    label: "Customization",
    href: "/customization",
  },
  {
    label: "Our Story",
    href: "/our-story",
  },
  {
    label: "Exhibition / Fair",
    href: "/exhibition",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Shipping Policy",
    href: "#",
  },
  {
    label: "Return Policy",
    href: "#",
  },
  {
    label: "Terms & Conditions",
    href: "#",
  },
];

const MARKETPLACE_LOGOS = [
  {
    name: "TradeIndia",
    href:
      "https://www.tradeindia.com/nikita-home-furnishings-2288943/",
    src: "/images/footer/tradeindia.png",
    w: 130,
    h: 36,
  },
  {
    name: "eBay",
    href: "ebay: https://www.ebay.com.au/str/nikitahomefurnishing",
    src: "/images/footer/ebay.png",
    w: 80,
    h: 36,
  },
  {
    name: "Etsy",
    href:
      "https://www.etsy.com/in-en/shop/Nhfhandicraft",
    src: "/images/footer/etsy.png",
    w: 80,
    h: 36,
  },
  {
    name: "Justdial",
    href: "just dial: https://jsdl.in/DT-30Y6A6AUMME",
    src: "/images/footer/justdial.png",
    w: 100,
    h: 36,
  },
];

const SOCIALS = [
  {
    src: "/images/footer/instagram.png",
    alt: "Instagram",
    href: "insta: https://www.instagram.com/nikitahomefurnishings_/",
    
  },
  {
    src: "/images/footer/facebook.png",
    alt: "Facebook",
    href: "https://facebook.com",
  },
  {
    src: "/images/footer/youtube.png",
    alt: "YouTube",
    href: "https://youtube.com",
  },
];


/* ======================================================
   NORMALIZE CATEGORY TREE
====================================================== */

function normalizeCategoryTree(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(Boolean)
    .map((parent) => {
      const children = Array.isArray(
        parent?.children
      )
        ? parent.children
        : [];

      return {
        ...parent,
        name:
          parent?.name ||
          "Category",
        slug:
          parent?.slug ||
          "",
        children: children
          .filter(Boolean)
          .map((child) => ({
            ...child,
            name:
              child?.name ||
              "Subcategory",
            slug:
              child?.slug ||
              "",
          })),
      };
    });
}


/* ── Accordion (mobile) ──────────────────────────────────── */

function AccordionSection({
  title,
  links,
}) {
  const [open, setOpen] =
    useState(false);

  const safeLinks = Array.isArray(
    links
  )
    ? links
    : [];

  return (
    <div
      style={{
        borderBottom:
          "1px solid #C4C3B2",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        style={{
          width: "100%",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily:
            "'Mona Sans',sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          color: "#7B7F5C",
          textAlign: "left",
        }}
      >
        {title}

        <span
          style={{
            fontSize: "20px",
            lineHeight: 1,
            color: "#7B7F5C",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div
          style={{
            paddingBottom: "12px",
          }}
        >
          {safeLinks.map(
            (link, i) => (
              <Link
                key={
                  link?.href
                    ? `${link.href}-${i}`
                    : `footer-mobile-link-${i}`
                }
                href={
                  link?.href || "#"
                }
                style={{
                  display: "block",
                  fontFamily:
                    "'Mona Sans',sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "240%",
                  color: "#0E0E0E",
                  textDecoration:
                    "none",
                }}
              >
                {link?.label ||
                  "Link"}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}


/* ── Build desktop columns from category tree ────────────── */

function buildDesktopColumns(
  categoryTree
) {
  const safeTree =
    normalizeCategoryTree(
      categoryTree
    );

  // Max 6 columns for categories,
  // distribute evenly
  const cols = [];
  let current = [];

  const MAX_PER_COL = 12;

  safeTree.forEach(
    (parent) => {
      if (!parent?.slug) {
        return;
      }

      const items = [
        {
          label:
            parent.name,
          href:
            `/${parent.slug}`,
          isCategoryHead: true,
        },

       ...parent.children
  .filter(
    (child) =>
      child?.slug
  )
  .map((child) => ({
    label:
      child.name,
    href:
      `/${child.slug}`,
  })),
      ];

      if (
        current.length > 0 &&
        current.length +
            items.length >
          MAX_PER_COL
      ) {
        cols.push(current);
        current = [];
      }

      current = [
        ...current,
        ...items,
      ];
    }
  );

  if (
    current.length > 0
  ) {
    cols.push(current);
  }

  return cols;
}


/* ── Main Footer ─────────────────────────────────────────── */

export default function Footer() {
  const [
    categoryTree,
    setCategoryTree,
  ] = useState([]);

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });


  /* ======================================================
     LOAD FOOTER CATEGORY TREE
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    const loadFooterCategories =
      async () => {
        try {
          const response =
            await fetch(
              `${API}/categories/footer-tree`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                cache:
                  "no-store",
              }
            );

          if (!response.ok) {
            throw new Error(
              `Footer categories request failed: ${response.status}`
            );
          }

          const result =
            await response
              .json();

          /*
           * Support both:
           *
           * { data: [...] }
           *
           * and:
           *
           * { data: { categories: [...] } }
           *
           * and:
           *
           * [...]
           */

          let rawData =
            Array.isArray(
              result
            )
              ? result
              : Array.isArray(
                    result?.data
                  )
              ? result.data
              : Array.isArray(
                    result?.data
                      ?.categories
                  )
              ? result.data
                  .categories
              : [];

          const normalized =
            normalizeCategoryTree(
              rawData
            );

          if (mounted) {
            setCategoryTree(
              normalized
            );
          }
        } catch (error) {
          console.error(
            "Footer category tree error:",
            error
          );

          /*
           * Footer should never crash
           * the whole page because of
           * category API failure.
           */
          if (mounted) {
            setCategoryTree(
              []
            );
          }
        }
      };

    loadFooterCategories();

    return () => {
      mounted = false;
    };
  }, []);


  /* ======================================================
     DESKTOP COLUMNS
  ====================================================== */

  const desktopCatCols =
    buildDesktopColumns(
      categoryTree
    );


  /* ======================================================
     MOBILE ACCORDION
  ====================================================== */

  const accordionCatSections =
    normalizeCategoryTree(
      categoryTree
    ).map((parent) => {
      const children =
        Array.isArray(
          parent.children
        )
          ? parent.children
          : [];

      return {
        title:
          parent.name,

        links:
          children.length > 0
            ? children
                .filter(
                  (child) =>
                    child?.slug
                )
                .map(
  (child) => ({
    label:
      child.name,
    href:
      `/${child.slug}`,
  })
)
            : [
                {
                  label:
                    parent.name,
                  href:
                    parent.slug
                      ? `/${parent.slug}`
                      : "#",
                },
              ],
      };
    });


  return (
    <>
      <style>{`
        .f-root {
          font-family: 'Mona Sans', sans-serif;
          background-color: #FDFFF1;
        }

        .f-pad {
          padding-left: 80px;
          padding-right: 80px;
        }

        .f-marketplace {
          padding-top: 28px;
          padding-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .f-mkt-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 40px;
          transition: opacity 0.2s;
        }

        .f-mkt-item:hover {
          opacity: 0.7;
        }

        .f-mkt-divider {
          width: 1px;
          height: 36px;
          background-color: #C4C3B2;
          flex-shrink: 0;
        }

        .f-follow {
          padding-top: 40px;
          padding-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .f-follow-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1;
          min-width: 0;
        }

        .f-follow-line {
          flex: 1;
          height: 1px;
          background-color: #C4C3B2;
        }

        .f-socials {
          display: flex;
          gap: 14px;
          flex-shrink: 0;
        }

        .f-social-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          display: block;
          transition:
            opacity 0.2s,
            transform 0.2s;
        }

        .f-social-icon:hover {
          opacity: 0.82;
          transform: scale(1.06);
        }
          .f-social-icon.instagram-icon {
  width: 4px;
  height: 4px;
}
.f-social-icon.instagram-icon img {
  width: 30px !important;
  height: 30px !important;
}
        .f-cta-row {
          border-bottom: 1px solid #C4C3B2;
          padding-top: 60px;
          padding-bottom: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        .f-cta-inner {
          display: flex;
          align-items: center;
        }

        .f-v-line {
          width: 1px;
          height: 140px;
          background-color: #C4C3B2;
          margin: 0 36px;
          flex-shrink: 0;
        }

        .f-sub-row {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .f-input-wrap {
          display: flex;
          flex: 1;
          min-width: 220px;
        }

        .f-email-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #C4C3B2;
          border-right: none;
          border-radius: 4px 0 0 4px;
          background-color: #F5F4EC;
          font-family: 'Mona Sans', sans-serif;
          font-size: 14px;
          color: #0E0E0E;
          outline: none;
        }

        .f-email-input:focus {
          border-color: #7B7F5C;
        }

        .f-sub-btn {
          padding: 12px 20px;
          background-color: #7B7F5C;
          color: #fff;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-family: 'Mona Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .f-sub-btn:hover {
          background-color: #636749;
        }

        .f-back-top {
          background: none;
          border: none;
          color: #7B7F5C;
          cursor: pointer;
          font-family: 'Mona Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          white-space: nowrap;
          letter-spacing: 0.04em;
          padding: 0;
          transition: opacity 0.2s;
        }

        .f-back-top:hover {
          opacity: 0.7;
        }

        .f-brand-sec {
          padding-top: 56px;
          padding-bottom: 40px;
          border-bottom: 1px solid #C4C3B2;
        }

        .f-brand-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .f-desktop-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 24px 32px;
          align-items: start;
        }

        .f-col {
          display: flex;
          flex-direction: column;
          min-width: 140px;
        }

        .f-accordion {
          display: none;
        }

        .f-link {
          display: block;
          font-family: 'Mona Sans', sans-serif;
          font-weight: 400;
          font-size: 11px;
          line-height: 220%;
          color: #0E0E0E;
          text-decoration: none;
          transition: color 0.15s;
          word-break: break-word;
        }

        .f-link:hover {
          color: #7B7F5C;
        }

        .f-link-head {
          font-weight: 700;
          font-size: 12px;
          color: #7B7F5C;
          margin-bottom: 2px;
        }

        .f-company-col {
          min-width: 160px;
        }

        .f-contact {
          padding-top: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #C4C3B2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .f-contact-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .f-tagline {
          padding-top: 40px;
          padding-bottom: 40px;
          text-align: center;
        }

        @media (min-width: 1440px) {
          .f-pad {
            padding-left: 120px;
            padding-right: 120px;
          }

          .f-cta-row {
            gap: 120px;
          }

          .f-link {
            font-size: 12px;
          }

          .f-mkt-item {
            padding: 0 60px;
          }
        }

        @media (max-width: 1279px) {
          .f-pad {
            padding-left: 40px;
            padding-right: 40px;
          }

          .f-cta-row {
            gap: 40px;
          }

          .f-mkt-item {
            padding: 0 28px;
          }
        }

        @media (max-width: 1024px) {
          .f-pad {
            padding-left: 32px;
            padding-right: 32px;
          }

          .f-cta-row {
            grid-template-columns: 1fr;
            gap: 32px;
            padding-top: 40px;
            padding-bottom: 40px;
            border-bottom: none;
          }

          .f-cta-inner {
            gap: 0;
          }

          .f-newsletter-wrap {
            border-top: 1px solid #C4C3B2;
            padding-top: 28px;
          }

          .f-mkt-item {
            padding: 0 20px;
          }
        }

        @media (max-width: 768px) {
          .f-pad {
            padding-left: 20px;
            padding-right: 20px;
          }

          .f-marketplace {
            flex-wrap: wrap;
            padding-top: 20px;
            padding-bottom: 20px;
          }

          .f-mkt-item {
            padding: 10px 16px;
          }

          .f-mkt-divider {
            display: none;
          }

          .f-follow {
            flex-wrap: wrap;
            padding-top: 28px;
            padding-bottom: 20px;
          }

          .f-follow-left {
            width: 100%;
          }

          .f-socials {
            width: 100%;
          }

          .f-cta-row {
            grid-template-columns: 1fr;
            padding-top: 32px;
            padding-bottom: 32px;
            gap: 32px;
            border-bottom: none;
          }

          .f-cta-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .f-v-line {
            display: none;
          }

          .f-newsletter-wrap {
            border-top: 1px solid #C4C3B2;
            border-bottom: 1px solid #C4C3B2;
            padding: 28px 0;
          }

          .f-sub-row {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .f-input-wrap {
            min-width: unset;
          }

          .f-back-top {
            text-align: center;
          }

          .f-brand-sec {
            padding-top: 32px;
            padding-bottom: 24px;
          }

          .f-brand-row {
            flex-direction: column;
            text-align: center;
          }

          .f-desktop-grid {
            display: none;
          }

          .f-accordion {
            display: block;
          }

          .f-contact {
            flex-direction: column;
            align-items: flex-start;
            padding-top: 20px;
            padding-bottom: 20px;
          }

          .f-contact-right {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .f-contact-sep {
            display: none;
          }

          .f-tagline {
            padding-top: 28px;
            padding-bottom: 28px;
          }
        }
      `}</style>

      <footer className="f-root">

        {/* ── MARKETPLACE LOGOS ── */}

        <div className="f-marketplace f-pad">
          {MARKETPLACE_LOGOS.map(
            (logo, idx) => (
              <div
                key={logo.name}
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                }}
              >
                {idx !== 0 && (
                  <div className="f-mkt-divider" />
                )}

                <Link
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="f-mkt-item"
                  aria-label={
                    logo.name
                  }
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.w}
                    height={logo.h}
                    style={{
                      objectFit:
                        "contain",
                      width:
                        `${logo.w}px`,
                      height:
                        `${logo.h}px`,
                    }}
                  />
                </Link>
              </div>
            )
          )}
        </div>


        {/* ── FOLLOW US ── */}

        <div className="f-follow f-pad">
          <div className="f-follow-left">
            <h3
              style={{
                fontFamily:
                  "'Tobias TRIAL',serif",
                fontWeight: 600,
                fontSize:
                  "clamp(22px,3vw,40px)",
                letterSpacing:
                  "-0.02em",
                color:
                  "#7B7F5C",
                margin: 0,
                whiteSpace:
                  "nowrap",
              }}
            >
              FOLLOW US
            </h3>

            <div className="f-follow-line" />
          </div>

         <div
  className="f-socials"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexShrink: 0,
  }}
>
  {SOCIALS.map(
    ({
      src,
      alt,
      href,
    }) => {
      const isInstagram =
        alt === "Instagram";

      return (
        <Link
          key={alt}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={alt}
          style={{
            width: isInstagram
              ? "38px"
              : "48px",
            height: isInstagram
              ? "38px"
              : "48px",
            minWidth: isInstagram
              ? "38px"
              : "48px",
            minHeight: isInstagram
              ? "38px"
              : "48px",
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={
              isInstagram
                ? 38
                : 48
            }
            height={
              isInstagram
                ? 38
                : 48
            }
            style={{
              display: "block",
              objectFit: "contain",
              width: "100%",
              height: "100%",
            }}
          />
        </Link>
      );
    }
  )}
</div>
        </div>


        {/* ── CTA + NEWSLETTER ── */}

        <div className="f-cta-row f-pad">
          <div className="f-cta-inner">

            <div
              style={{
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/footer/logo2.png"
                alt="NHF Logo"
                width={80}
                height={80}
                style={{
                  objectFit:
                    "contain",
                  width: "80px",
                  height: "80px",
                }}
              />
            </div>

            <div className="f-v-line" />

            <div>
              <h4
                style={{
                  fontFamily:
                    "'Tobias TRIAL',serif",
                  fontWeight: 500,
                  fontSize:
                    "clamp(17px,1.6vw,25px)",
                  color:
                    "#7B7F5C",
                  margin:
                    "0 0 12px 0",
                  lineHeight: 1.3,
                }}
              >
                READY TO BRING ARTISAN CRAFT
                <br />
                INTO YOUR HOME?
              </h4>

              <p
                style={{
                  fontFamily:
                    "'Mona Sans',sans-serif",
                  fontSize:
                    "14px",
                  lineHeight:
                    "1.8",
                  margin: 0,
                  color:
                    "#0E0E0E",
                }}
              >
                Browse The Full Nikita Collection From
                Hand-block Bedsheets To Kantha Quilts,
                From Quilted Jackets To Hand-woven Rugs.
                Every Piece Is Available To Order Directly.
                Customisation Welcome.
              </p>
            </div>

          </div>

          {/* <div className="f-newsletter-wrap">

            <h5
              style={{
                fontFamily:
                  "'Mona Sans',sans-serif",
                fontWeight: 700,
                fontSize:
                  "clamp(17px,1.6vw,24px)",
                lineHeight:
                  "160%",
                color:
                  "#7B7F5C",
                margin:
                  "0 0 8px 0",
              }}
            >
              Exclusive Updates, Delivered
            </h5>

            <p
              style={{
                fontFamily:
                  "'Mona Sans',sans-serif",
                fontSize:
                  "15px",
                lineHeight:
                  "160%",
                color:
                  "#0E0E0E",
                margin:
                  "0 0 20px 0",
              }}
            >
              Subscribe for curated news, product releases,
              and member-only offers.
            </p>

            <div className="f-sub-row">

              <div className="f-input-wrap">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="f-email-input"
                />

                <button
                  type="button"
                  className="f-sub-btn"
                >
                  Subscribe Now
                </button>
              </div>

              <button
                type="button"
                onClick={
                  scrollToTop
                }
                className="f-back-top"
              >
                ↑ BACK TO TOP
              </button>

            </div>

          </div> */}
        </div>


        {/* ── BRAND + LINKS ── */}

        <div className="f-brand-sec f-pad">

          <div className="f-brand-row">

            <Image
              src="/images/footer/Logo2.png"
              alt="Nikita Home Furnishings"
              width={46}
              height={46}
              style={{
                objectFit:
                  "contain",
                width: "46px",
                height: "46px",
              }}
            />

            <h2
              style={{
                fontFamily:
                  "'Tobias TRIAL',serif",
                fontWeight: 600,
                fontSize:
                  "clamp(15px,1.8vw,26px)",
                letterSpacing:
                  "-0.01em",
                color:
                  "#7B7F5C",
                margin: 0,
              }}
            >
              NIKITA HOME FURNISHINGS
            </h2>

          </div>

          <p
            style={{
              fontFamily:
                "'Mona Sans',sans-serif",
              fontSize:
                "15px",
              lineHeight:
                "160%",
              color:
                "#0E0E0E",
              textAlign:
                "center",
              margin:
                "0 auto 40px",
              maxWidth:
                "720px",
            }}
          >
            Artisan Home Textiles And Lifestyle
            Collections Made In Jaipur, Rajasthan,
            India. Manufacturers And Exporters Since
            2006, Crafted With Hands That Know The Difference.
          </p>


          {/* Desktop grid */}

          <div className="f-desktop-grid">

            {/* Company column */}

            <div className="f-col f-company-col">

              <span className="f-link f-link-head">
                Company
              </span>

              {COMPANY_LINKS.map(
                (link, index) => (
                  <Link
                    key={
                      `${link.href}-${index}`
                    }
                    href={link.href}
                    className="f-link"
                  >
                    {link.label}
                  </Link>
                )
              )}

            </div>


            {/* Dynamic category columns */}

            {desktopCatCols.map(
              (col, columnIndex) => (
                <div
                  key={
                    `category-column-${columnIndex}`
                  }
                  className="f-col"
                >
                  {col.map(
                    (
                      item,
                      itemIndex
                    ) => (
                      <Link
                        key={
                          `${item.href}-${itemIndex}`
                        }
                        href={
                          item.href
                        }
                        className={`f-link${
                          item.isCategoryHead
                            ? " f-link-head"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              )
            )}

          </div>


          {/* Mobile accordion */}

          <div className="f-accordion">

            <AccordionSection
              title="Company"
              links={
                COMPANY_LINKS
              }
            />

            {accordionCatSections.map(
              (
                section,
                index
              ) => (
                <AccordionSection
                  key={
                    `accordion-category-${section.title}-${index}`
                  }
                  title={
                    section.title
                  }
                  links={
                    section.links
                  }
                />
              )
            )}

          </div>

        </div>


        {/* ── CONTACT ── */}

        <div className="f-contact f-pad">

          <div>

            <p
              style={{
                fontFamily:
                  "'Mona Sans',sans-serif",
                fontWeight: 700,
                fontSize:
                  "14px",
                color:
                  "#0E0E0E",
                margin:
                  "0 0 4px 0",
              }}
            >
              Contact Us
            </p>

            <p
              style={{
                fontFamily:
                  "'Mona Sans',sans-serif",
                fontSize:
                  "14px",
                color:
                  "#0E0E0E",
                margin: 0,
              }}
            >
              38, Gupta Garden, Govind Nagar West,
              Behind Hotel Amer City Heritage,
              <br />
              Amer Road, Jaipur – 302002, Rajasthan
            </p>

          </div>

          <div className="f-contact-right">

            <a
              href="tel:+919460387858"
              className="f-link"
              style={{
                fontWeight: 700,
                fontSize:
                  "14px",
              }}
            >
              +91 9460387858 || +91 8887999800
            </a>

            <span
              className="f-contact-sep"
              style={{
                color:
                  "#C4C3B2",
              }}
            >
              |
            </span>

            <a
              href="mailto:nikitahomefurnishings@yahoo.com"
              className="f-link"
              style={{
                fontWeight: 700,
                fontSize:
                  "14px",
              }}
            >
              nikitahomefurnishings@yahoo.com
            </a>

          </div>

        </div>


        {/* ── TAGLINE ── */}

        <div className="f-tagline f-pad">

          <p
            style={{
              fontFamily:
                "'Tobias TRIAL',serif",
              fontWeight: 400,
              fontStyle:
                "italic",
              fontSize:
                "clamp(15px,1.5vw,22px)",
              color:
                "#7B7F5C",
              margin:
                "0 0 8px 0",
            }}
          >
            &ldquo;Crafted in Jaipur. Cherished everywhere.&rdquo;
          </p>

          <p
            style={{
              fontFamily:
                "'Mona Sans',sans-serif",
              fontSize:
                "13px",
              color:
                "#7B7F5C",
              margin:
                "0 0 14px 0",
            }}
          >
            © 2026 Nikita Home Furnishings.
            Made with care in Rajasthan, India.
          </p>

          <div
            style={{
              fontFamily:
                "'Mona Sans',sans-serif",
              fontSize:
                "13px",
              color:
                "#7B7F5C",
              letterSpacing:
                "0.04em",
            }}
          >
            Crafted by{" "}
            <a
              href="https://www.kontentkraftdigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color:
                  "#556B2F",
                fontWeight: 700,
                textDecoration:
                  "none",
              }}
            >
              Kontent Kraft Digital
            </a>
          </div>

        </div>

      </footer>
    </>
  );
}