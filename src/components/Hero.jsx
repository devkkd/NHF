"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    bg: "/images/banner/banner-1.png",
    headline: "Every Thread Carries A Story, Make Yours Beautiful",
    subtext:
      "Nikita Home Furnishings Crafted Textile Collections. Furniture And Wardrobes From Jaipur. Discover The Collection From Jaipur.",
  },
  {
    id: 2,
    bg: "/images/banner/banner-1.png",
    headline: "Timeless Craftsmanship, Modern Living",
    subtext:
      "Handcrafted with love and precision. Explore our curated home furnishing collections.",
  },
  {
    id: 3,
    bg: "/images/banner/banner-1.png",
    headline: "Luxury Woven Into Every Detail",
    subtext:
      "From the heart of Jaipur — exquisite textiles and furniture that tell your story.",
  },
];

const AUTOPLAY_INTERVAL = 5000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (index) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const goToNext = () => {
    goTo((current + 1) % slides.length);
  };

  const goToPrev = () => {
    goTo((current - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">

      {/* ── Background Slides ─────────────────────────────────── */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${slide.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
          role="img"
          aria-label={slide.headline}
        />
      ))}

      {/* ── Dark overlay ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
        style={{ zIndex: 2 }}
      />

      {/* ── Left Arrow ────────────────────────────────────────── */}
      <button
        onClick={goToPrev}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/40 text-white hover:bg-white/20 transition-colors duration-300"
        style={{ zIndex: 10 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* ── Right Arrow ───────────────────────────────────────── */}
      <button
        onClick={goToNext}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/40 text-white hover:bg-white/20 transition-colors duration-300"
        style={{ zIndex: 10 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── Content — bottom center ───────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center text-center px-6 pb-16 md:pb-20"
        style={{ zIndex: 10 }}
      >
        {/* Headline — key forces re-mount for fade-in effect */}
        <h1
          key={`headline-${current}`}
          className="text-white text-[28px] md:text-[35px] font-light leading-tight tracking-tight max-w-3xl drop-shadow-md animate-fadeIn"
        >
          {slides[current].headline}
        </h1>

        {/* Subtext */}
        <p
          key={`subtext-${current}`}
          className="mt-4 text-white/80 text-[12px] md:text-[13px] tracking-wide leading-relaxed max-w-xl drop-shadow animate-fadeIn"
        >
          {slides[current].subtext}
        </p>

        {/* CTAs */}
        <div className="mt-7 flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/our-story"
            className="text-[11px] tracking-[0.18em] uppercase bg-white/20 backdrop-blur-sm text-white border border-white/50 px-7 py-3 hover:bg-white/30 transition-colors duration-300"
          >
            Our
          </Link>
          <Link
            href="/collection"
            className="text-[11px] tracking-[0.18em] uppercase bg-white text-[#2C2C2C] px-7 py-3 hover:bg-white/90 transition-colors duration-300"
          >
            Explore The Collection ↓
          </Link>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-[5px] bg-white"
                  : "w-[5px] h-[5px] bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Inline animation ──────────────────────────────────── */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease forwards;
        }
      `}</style>
    </section>
  );
}
