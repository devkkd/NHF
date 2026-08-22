"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  getWardrobeCategories,
} from "@/lib/api";

const FALLBACK = [
  {
    title: "Kaftans",
    image: "/images/wardrobe/1.png",
    slug: "kaftans",
  },
  {
    title: "Jackets",
    image: "/images/wardrobe/2.png",
    slug: "jackets-bathrobes",
  },
  {
    title: "Bags",
    image: "/images/wardrobe/3.png",
    slug: "bags-pouches",
  },
];

export default function WardrobeSection({
  categories = [],
}) {
  const [
    wardrobeCategories,
    setWardrobeCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // Scroll container ref -> isse hum left/right scroll control karenge
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadWardrobeCategories =
      async () => {
        try {
          /*
           * Backend:
           *
           * GET /categories?wardrobe=true
           *
           * Sirf wahi categories aayengi
           * jinka showInWardrobe = true hai.
           */
          const data =
            await getWardrobeCategories();

          if (cancelled) {
            return;
          }

          if (
            Array.isArray(data) &&
            data.length > 0
          ) {
            setWardrobeCategories(
              data
            );
          } else {
            setWardrobeCategories(
              []
            );
          }
        } catch (error) {
          console.error(
            "Wardrobe categories load error:",
            error
          );

          if (!cancelled) {
            setWardrobeCategories(
              []
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadWardrobeCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Priority:
   *
   * 1. Backend Wardrobe categories
   * 2. categories prop
   * 3. Dummy fallback
   */
  const sourceCategories =
    wardrobeCategories.length >
    0
      ? wardrobeCategories
      : categories?.length > 0
      ? categories
      : FALLBACK;

  /*
   * Admin sortOrder follow hoga.
   */
  const sortedCategories =
    sourceCategories
      .map(
        (
          category,
          index
        ) => ({
          _id:
            category._id,

          title:
            category.name ||
            category.title,

          image:
            category.image ||
            category.thumbnail ||
            category.banner ||
            `/images/wardrobe/${
              (index % 3) + 1
            }.png`,

          slug:
            category.slug,

          sortOrder:
            Number(
              category.sortOrder ||
                index + 1
            ),
        })
      )
      .sort(
        (a, b) =>
          a.sortOrder -
          b.sortOrder
      );

  /*
   * Wardrobe Home section:
   *
   * Backend se max 10 categories fetch
   * honge (admin-order ke according).
   *
   * Display:
   * - Desktop: 4 cards visible, baaki horizontal scroll se
   * - Mobile: 2 cards visible, baaki horizontal scroll se
   *
   * Card ka size same rakha hai, sirf
   * layout grid se horizontal-scroll me
   * badla gaya hai.
   */
  const items =
    sortedCategories.slice(
      0,
      10
    );

  // Ek card jitna scroll karna hai (container width / visible cards)
  const scrollByCard = (
    direction
  ) => {
    const container =
      scrollRef.current;

    if (!container) return;

    const card =
      container.querySelector(
        ".wardrobe-card-link"
      );

    const cardWidth = card
      ? card.getBoundingClientRect()
          .width
      : container.clientWidth /
        4;

    const gap = 24;

    container.scrollBy({
      left:
        direction === "left"
          ? -(cardWidth + gap)
          : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <section className="wardrobe-section">
      <div className="wardrobe-container">
        <h2 className="wardrobe-heading">
          THE WARDROBE
        </h2>

        <div className="wardrobe-scroll-wrap">
          {/* Left arrow - right-to-left scroll */}
          <button
            type="button"
            className="wardrobe-arrow wardrobe-arrow-left"
            onClick={() =>
              scrollByCard(
                "left"
              )
            }
            aria-label="Scroll left"
          >
            ←
          </button>

          <div
            className="wardrobe-grid"
            ref={scrollRef}
          >
            {items.map(
              (item) => (
                <Link
                  key={
                    item._id ||
                    item.slug
                  }
                  href={`/${item.slug}`}
                  className="wardrobe-card-link"
                >
                  <div className="wardrobe-card">
                    <div className="image-wrapper">
                      <Image
                        src={
                          item.image
                        }
                        alt={
                          item.title
                        }
                        fill
                        sizes="(max-width:768px) 50vw, 33vw"
                        style={{
                          objectFit:
                            "cover",
                        }}
                      />
                    </div>

                    <h5>
                      {
                        item.title
                      }{" "}
                      →
                    </h5>
                  </div>
                </Link>
              )
            )}
          </div>

          {/* Right arrow - left-to-right scroll */}
          <button
            type="button"
            className="wardrobe-arrow wardrobe-arrow-right"
            onClick={() =>
              scrollByCard(
                "right"
              )
            }
            aria-label="Scroll right"
          >
            →
          </button>
        </div>

        <div className="wardrobe-btn-wrap">
          <Link
            href="/wardrobe"
            className="wardrobe-btn"
          >
            SEE FULL OUR
            WARDROBE →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .wardrobe-section {
          background: #FDFFF1;
          padding: 90px 40px;
          box-sizing: border-box;
        }

        .wardrobe-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .wardrobe-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 40px;
          font-weight: 400;
          line-height: 160%;
          letter-spacing: -0.02em;
          color: #7B7F5C;
          text-align: center;
          margin: 0 0 40px;
        }

        .wardrobe-card-link {
          text-decoration: none;
          display: block;
          flex: 0 0 auto;
          scroll-snap-align: start;
        }

        /* ---------- SCROLL WRAPPER + ARROWS ---------- */

        .wardrobe-scroll-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .wardrobe-arrow {
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #7b7f5c;
          background: #FDFFF1;
          color: #7b7f5c;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: opacity 0.2s ease;
        }

        .wardrobe-arrow:hover {
          opacity: 0.7;
        }

        .wardrobe-arrow-left {
          margin-right: 16px;
        }

        .wardrobe-arrow-right {
          margin-left: 16px;
        }

        /* ---------- HORIZONTAL SCROLL GRID ---------- */
        /* Desktop: 4 cards visible at once, baaki scroll se */

        .wardrobe-grid {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          flex: 1;
          scrollbar-width: none; /* firefox */
        }

        .wardrobe-grid::-webkit-scrollbar {
          display: none; /* chrome/safari */
        }

        .wardrobe-card {
          text-align: center;
        }

        .image-wrapper {
          position: relative;
          /* 3 cards visible: (100% - 2 gaps) / 3 */
          width: calc(
            (100vw - 80px - 48px) / 3
          );
          max-width: 380px;
          aspect-ratio: 1 / 1;
          height: auto;
          overflow: hidden;
          margin: 0 auto;
        }

        .wardrobe-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans",
            sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
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
          font-family: "Mona Sans",
            sans-serif;
          font-size: 16px;
          cursor: pointer;
          letter-spacing: 0.02em;
          text-decoration: none;
        }

        .wardrobe-btn:hover {
          opacity: 0.75;
        }

        /* ---------- TABLET ---------- */

        @media (max-width: 1024px) {
          .wardrobe-section {
            padding: 70px 28px;
          }

          .wardrobe-heading {
            font-size: 34px;
            margin-bottom: 32px;
          }

          .image-wrapper {
            /* Tablet: 3 cards visible, square */
            width: calc(
              (100vw - 56px - 40px) / 3
            );
            aspect-ratio: 1 / 1;
            height: auto;
          }
        }

        /* ---------- MOBILE ---------- */
        /* Mobile: 2 cards visible at once, baaki scroll se */

        @media (max-width: 768px) {
          .wardrobe-section {
            padding: 56px 20px;
          }

          .wardrobe-heading {
            font-size: 28px;
            margin-bottom: 28px;
          }

          .wardrobe-grid {
            gap: 16px;
          }

          .image-wrapper {
            width: calc(
              (100vw - 40px - 16px) / 2
            );
            aspect-ratio: 1 / 1;
            height: auto;
            max-width: 100%;
          }

          .wardrobe-card h5 {
            font-size: 20px;
            margin-top: 14px;
          }

          .wardrobe-btn-wrap {
            margin-top: 32px;
          }

          .wardrobe-btn {
            font-size: 14px;
          }

          .wardrobe-arrow {
            width: 36px;
            height: 36px;
            font-size: 15px;
          }
        }

        /* ---------- SMALL MOBILE ---------- */

        @media (max-width: 480px) {
          .wardrobe-section {
            padding: 44px 16px;
          }

          .wardrobe-heading {
            font-size: 24px;
            margin-bottom: 22px;
          }

          .image-wrapper {
            width: calc(
              (100vw - 32px - 16px) / 2
            );
            aspect-ratio: 1 / 1;
            height: auto;
          }

          .wardrobe-card h5 {
            font-size: 17px;
          }

          .wardrobe-btn {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}