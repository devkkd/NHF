"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const footerLinks = {
  company: [
    { label: "Company", href: "/company" },
    { label: "Customization", href: "/customization" },
    { label: "Our Story", href: "/our-story" },
    { label: "Exhibition / Fair", href: "/exhibition-fair" },
    { label: "Company Profile", href: "/company-profile" },
    { label: "Manufacturing", href: "/manufacturing" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
  ],
  garments: [
    { label: "Kaftans", href: "/kaftans" },
    { label: "Bathrobes", href: "/bathrobes" },
    { label: "Scarves", href: "/scarves" },
    { label: "Garments", href: "/garments" },
    { label: "Pajama Set", href: "/pajama-set" },
    { label: "Dohar", href: "/dohar" },
  ],
  jacketsAndBathrobes: [
    { label: "Jackets & Bathrobes", href: "/jackets-bathrobes" },
    { label: "Cotton Quilted Jackets", href: "/cotton-quilted-jackets" },
    { label: "Vintage & New Kantha Jackets", href: "/kantha-jackets" },
    { label: "Waffle, Velvet & Suzani Jackets / Bathrobes", href: "/waffle-velvet-suzani" },
  ],
  scarves: [
    { label: "Scarves", href: "/scarves-category" },
    { label: "Cotton Screen & Handblock Printed Scarves", href: "/printed-scarves" },
    { label: "Vintage & New Kantha / Embroidered Scarves", href: "/kantha-scarves" },
  ],
  bagsAndPouches: [
    { label: "Bags & Pouches", href: "/bags-pouches" },
    { label: "Tote Bags With Out ZIP", href: "/tote-bags-no-zip" },
    { label: "Tote Bags With ZIP", href: "/tote-bags-zip" },
    { label: "Toiletry Pouches", href: "/toiletry-pouches" },
    { label: "Quilted Thela Bags With Flap", href: "/quilted-thela-bags" },
    { label: "Velvet Bags With ZIP", href: "/velvet-bags-zip" },
    { label: "Velvet Bags Without ZIP", href: "/velvet-bags-no-zip" },
    { label: "Velvet Toilerty Pouches", href: "/velvet-toiletry" },
    { label: "Duffle Bags", href: "/duffle-bags" },
    { label: "School Bags", href: "/school-bags" },
    { label: "Tote Bags With ZIP", href: "/tote-bags-zip-2" },
  ],
  throwsAndMore: [
    { label: "Throws / Gudri", href: "/throws-gudri" },
    { label: "Cushion Covers", href: "/cushion-covers" },
    { label: "Rugs & Dhurries", href: "/rugs-dhurries" },
    { label: "Table Covers & Runners", href: "/table-covers" },
  ],
  bedCovers: [
    { label: "Bed Covers", href: "/bed-covers" },
    { label: "Cotton Handblock Printed Waffle Bed Covers", href: "/waffle-bed-covers" },
    { label: "Cotton Handblock Printed TNT Bed Covers", href: "/tnt-bed-covers" },
    { label: "Cotton Quilted Bed Covers / Quilts", href: "/quilted-bed-covers" },
    { label: "Organdi Cutwork Bed Covers", href: "/organdi-bed-covers" },
    { label: "Cotton Suzani Embroidered Bed Covers", href: "/suzani-bed-covers" },
    { label: "Cotton Kantha Bed Covers", href: "/kantha-bed-covers" },
    { label: "Silk Kantha / Khambadiya Bed Covers", href: "/silk-kantha-bed-covers" },
  ],
  quilts: [
    { label: "Quilts", href: "/quilts" },
    { label: "Cotton Kantha Quilt", href: "/cotton-kantha-quilt" },
    { label: "Silk Kantha Quilts", href: "/silk-kantha-quilts" },
    { label: "Cotton Kantha Quilts", href: "/cotton-kantha-quilts-2" },
  ],
  bedsheets: [
    { label: "Bedsheet", href: "/bedsheets" },
    { label: "Cotton Screen Printed Bedsheets", href: "/screen-printed" },
    { label: "Cotton Handblock Printed Bedsheets", href: "/handblock-bedsheets" },
  ],
};

/* Desktop columns definition */
const desktopColumns = [
  { key: "company",           links: footerLinks.company },
  { key: "garments",          links: [...footerLinks.garments, ...footerLinks.jacketsAndBathrobes, ...footerLinks.scarves] },
  { key: "bags",              links: footerLinks.bagsAndPouches },
  { key: "throws",            links: [...footerLinks.throwsAndMore, ...footerLinks.bedCovers] },
  { key: "quilts",            links: footerLinks.quilts },
  { key: "bedsheets",         links: footerLinks.bedsheets },
];

/* Mobile accordion sections */
const accordionSections = [
  { title: "Company",              links: footerLinks.company },
  { title: "Garments",             links: footerLinks.garments },
  { title: "Jackets & Bathrobes",  links: footerLinks.jacketsAndBathrobes },
  { title: "Scarves",              links: footerLinks.scarves },
  { title: "Bags & Pouches",       links: footerLinks.bagsAndPouches },
  { title: "Throws & Gudri",       links: footerLinks.throwsAndMore },
  { title: "Bed Covers",           links: footerLinks.bedCovers },
  { title: "Quilts",               links: footerLinks.quilts },
  { title: "Bedsheets",            links: footerLinks.bedsheets },
];

/* ─────────────────────────────────────────────
   ACCORDION (mobile)
───────────────────────────────────────────── */
function AccordionSection({ title, links }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #C4C3B2" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Mona Sans', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          color: "#7B7F5C",
          textAlign: "left",
        }}
      >
        {title}
        <span style={{ fontSize: "20px", lineHeight: 1, color: "#7B7F5C" }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: "12px" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                fontFamily: "'Mona Sans', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "240%",
                color: "#0E0E0E",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style>{`
        /* ── Base ── */
        .f-root {
          font-family: 'Mona Sans', sans-serif;
          background-color: #FDFFF1;
        }

        /* ── Shared padding helper ── */
        .f-pad { padding-left: 80px; padding-right: 80px; }

        /* ── FOLLOW US ── */
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
          transition: opacity 0.2s, transform 0.2s;
        }
        .f-social-icon:hover { opacity: 0.82; transform: scale(1.06); }

        /* ── CTA + NEWSLETTER ── */
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
          gap: 0;
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
          gap: 110px;
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
        .f-email-input:focus { border-color: #7B7F5C; }
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
        .f-sub-btn:hover { background-color: #636749; }
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
        .f-back-top:hover { opacity: 0.7; }

        /* ── BRAND + LINKS ── */
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
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px 20px;
        }
        .f-accordion { display: none; }
        .f-link {
          display: block;
          font-family: 'Mona Sans', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 240%;
          color: #0E0E0E;
          text-decoration: none;
          transition: color 0.15s;
        }
        .f-link:hover { color: #7B7F5C; }

        /* ── CONTACT ── */
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

        /* ── TAGLINE ── */
        .f-tagline {
          padding-top: 40px;
          padding-bottom: 40px;
          text-align: center;
        }

        /* ══════════════════════════════════════
           TABLET  769 – 1024
        ══════════════════════════════════════ */
        @media (max-width: 1024px) {
          .f-pad { padding-left: 40px; padding-right: 40px; }
          .f-cta-row { gap: 40px; }
          .f-desktop-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ══════════════════════════════════════
           MOBILE  ≤ 768
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .f-pad { padding-left: 20px; padding-right: 20px; }

          /* Follow us */
          .f-follow { flex-wrap: wrap; padding-top: 28px; padding-bottom: 20px; }
          .f-follow-left { width: 100%; }
          .f-socials { width: 100%; }

          /* CTA */
          .f-cta-row {
            grid-template-columns: 1fr;
            padding-top: 32px;
            padding-bottom: 32px;
            gap: 32px;
            border-bottom: none;
          }
          .f-cta-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
          .f-v-line { display: none; }
          /* newsletter border on mobile */
          .f-newsletter-wrap {
            border-top: 1px solid #C4C3B2;
            border-bottom: 1px solid #C4C3B2;
            padding: 28px 0;
          }

          /* subscribe */
          .f-sub-row { flex-direction: column; align-items: stretch; gap: 50px; }
          .f-input-wrap { min-width: unset; }
          .f-back-top { text-align: center; margin-top: 4px; }

          /* brand */
          .f-brand-sec { padding-top: 32px; padding-bottom: 24px; }
          .f-brand-row { flex-direction: column; text-align: center; }
          .f-desktop-grid { display: none; }
          .f-accordion { display: block; }

          /* contact */
          .f-contact {
            flex-direction: column;
            align-items: flex-start;
            padding-top: 20px;
            padding-bottom: 20px;
          }
          .f-contact-right { flex-direction: column; align-items: flex-start; gap: 6px; }
          .f-contact-sep { display: none; }

          /* tagline */
          .f-tagline { padding-top: 28px; padding-bottom: 28px; }
        }

        /* ══════════════════════════════════════
           LARGE DESKTOP  ≥ 1440
        ══════════════════════════════════════ */
        @media (min-width: 1440px) {
          .f-pad { padding-left: 120px; padding-right: 120px; }
          .f-cta-row { gap: 120px; }
        }
      `}</style>

      <footer className="f-root">

        {/* ── FOLLOW US ── */}
        <div className="f-follow f-pad">
          <div className="f-follow-left">
            <h3 style={{
              fontFamily: "'Tobias TRIAL', serif",
              fontWeight: 600,
              fontSize: "clamp(22px, 3vw, 40px)",
              letterSpacing: "-0.02em",
              color: "#7B7F5C",
              margin: 0,
              whiteSpace: "nowrap",
            }}>
              FOLLOW US
            </h3>
            <div className="f-follow-line" />
          </div>

          <div className="f-socials">
            {[
              { src: "/images/footer/instagram.png", alt: "Instagram", href: "https://instagram.com" },
              { src: "/images/footer/facebook.png",  alt: "Facebook",  href: "https://facebook.com"  },
              { src: "/images/footer/youtube.png",   alt: "YouTube",   href: "https://youtube.com"   },
            ].map(({ src, alt, href }) => (
              <Link key={alt} href={href} target="_blank" rel="noopener noreferrer" className="f-social-icon">
                <Image src={src} alt={alt} width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA + NEWSLETTER ── */}
        <div className="f-cta-row f-pad">

          {/* Left — CTA */}
          <div className="f-cta-inner">
            <div style={{ flexShrink: 0 }}>
              <Image src="/images/footer/logo2.png" alt="NHF Logo" width={80} height={80} style={{ objectFit: "contain" }} />
            </div>
            <div className="f-v-line" />
            <div>
              <h4 style={{
                fontFamily: "'Tobias TRIAL', serif",
                fontWeight: 500,
                fontSize: "clamp(17px, 1.6vw, 25px)",
                color: "#7B7F5C",
                margin: "0 0 12px 0",
                lineHeight: 1.3,
              }}>
                READY TO BRING ARTISAN CRAFT<br />INTO YOUR HOME?
              </h4>
              <p style={{ fontFamily: "'Mona Sans', sans-serif", fontSize: "14px", lineHeight: "1.8", margin: 0, color: "#0E0E0E" }}>
                Browse The Full Nikita Collection From Hand-block Bedsheets To Kantha Quilts, From Quilted Jackets To Hand-woven Rugs. Every Piece Is Available To Order Directly. Customisation Welcome.
              </p>
            </div>
          </div>

          {/* Right — Newsletter */}
          <div className="f-newsletter-wrap">
            <h5 style={{
              fontFamily: "'Mona Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(17px, 1.6vw, 24px)",
              lineHeight: "160%",
              color: "#7B7F5C",
              margin: "0 0 8px 0",
            }}>
              Exclusive Updates, Delivered
            </h5>
            <p style={{ fontFamily: "'Mona Sans', sans-serif", fontSize: "15px", lineHeight: "160%", color: "#0E0E0E", margin: "0 0 20px 0" }}>
              Subscribe for curated news, product releases, and member-only offers.
            </p>
            <div className="f-sub-row">
              <div className="f-input-wrap">
                <input type="email" placeholder="Enter your email address" className="f-email-input" />
                <button className="f-sub-btn">Subscribe Now</button>
              </div>
              <button onClick={scrollToTop} className="f-back-top">↑ BACK TO TOP</button>
            </div>
          </div>
        </div>

        {/* ── BRAND + LINKS ── */}
        <div className="f-brand-sec f-pad">
          <div className="f-brand-row">
            <Image src="/images/footer/Logo2.png" alt="Nikita Home Furnishings Logo" width={46} height={46} style={{ objectFit: "contain" }} />
            <h2 style={{
              fontFamily: "'Tobias TRIAL', serif",
              fontWeight: 600,
              fontSize: "clamp(15px, 1.8vw, 26px)",
              letterSpacing: "-0.01em",
              color: "#7B7F5C",
              margin: 0,
            }}>
              NIKITA HOME FURNISHINGS
            </h2>
          </div>

          <p style={{
            fontFamily: "'Mona Sans', sans-serif",
            fontSize: "15px",
            lineHeight: "160%",
            color: "#0E0E0E",
            textAlign: "center",
            margin: "0 auto 40px",
            maxWidth: "720px",
          }}>
            Artisan Home Textiles And Lifestyle Collections Made In Jaipur, Rajasthan, India. Manufacturers And Exporters Since 2006, Crafted With Hands That Know The Difference.
          </p>

          {/* Desktop 6-column grid */}
          <div className="f-desktop-grid">
            {desktopColumns.map((col) => (
              <div key={col.key}>
                {col.links.map((link) => (
                  <Link key={link.href} href={link.href} className="f-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile accordion */}
          <div className="f-accordion">
            {accordionSections.map((sec) => (
              <AccordionSection key={sec.title} title={sec.title} links={sec.links} />
            ))}
          </div>
        </div>

        {/* ── CONTACT BAR ── */}
        <div className="f-contact f-pad">
          <div>
            <p style={{ fontFamily: "'Mona Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#0E0E0E", margin: "0 0 4px 0" }}>
              Contact Us
            </p>
            <p style={{ fontFamily: "'Mona Sans', sans-serif", fontSize: "14px", color: "#0E0E0E", margin: 0 }}>
              38, Gupta Garden, Govind Nagar West, Amer Road, Jaipur – 302002, Rajasthan
            </p>
          </div>
          <div className="f-contact-right">
            <a href="tel:+919460387858" className="f-link" style={{ fontWeight: 700, fontSize: "14px" }}>
              +91 9460387858
            </a>
            <span className="f-contact-sep" style={{ color: "#C4C3B2" }}>|</span>
            <a href="mailto:nikitahomefurnishings@yahoo.com" className="f-link" style={{ fontWeight: 700, fontSize: "14px" }}>
              nikitahomefurnishings@yahoo.com
            </a>
          </div>
        </div>

        {/* ── TAGLINE + COPYRIGHT ── */}
        <div className="f-tagline f-pad">
          <p style={{
            fontFamily: "'Tobias TRIAL', serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(15px, 1.5vw, 22px)",
            color: "#7B7F5C",
            margin: "0 0 8px 0",
          }}>
            &ldquo;Crafted in Jaipur. Cherished everywhere.&rdquo;
          </p>
          <p style={{ fontFamily: "'Mona Sans', sans-serif", fontSize: "13px", color: "#7B7F5C", margin: 0 }}>
            Copyright line: © 2026 Nikita Home Furnishings. Made with care in Rajasthan, India.
          </p>
        </div>

      </footer>
    </>
  );
}