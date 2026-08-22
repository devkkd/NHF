"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_SLIDES = [
  {
    _id: "fallback-1",
    image: "/images/banner/banner-1.png",
    headline: "Every Thread Carries A Story, Make Yours Beautiful",
    subtext: "Nikita Home Furnishings Crafted Textile Collections. Furniture And Wardrobes From Jaipur.",
    buttons: [
      { label: "Our Story", href: "/our-story", style: "secondary" },
      { label: "Explore The Collection ↓", href: "/collection", style: "primary" },
    ],
  },
];

export default function Hero() {
  const [slides, setSlides]     = useState(FALLBACK_SLIDES);
  const [current, setCurrent]   = useState(0);
  const [ready, setReady]       = useState(false); // first image fully loaded
  const timerRef                = useRef(null);

  // Fetch banners
  useEffect(() => {
    fetch(`${API}/banners`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data);
      })
      .catch(() => {});
  }, []);

  // Preload first image before showing anything
  useEffect(() => {
    if (!slides.length) return;
    const img = new window.Image();
    img.src = slides[0].image;
    if (img.complete) {
      setReady(true);
    } else {
      img.onload  = () => setReady(true);
      img.onerror = () => setReady(true); // show anyway on error
    }
  }, [slides]);

  // Auto-advance — only after ready
  useEffect(() => {
    if (!ready || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [ready, slides.length]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      style={{ backgroundColor: "#1c1c1a" }} // dark bg — no white flash ever
    >
      {/* ── Skeleton placeholder ──────────────────────────────── */}
      {!ready && (
        <div
          className="absolute inset-0 z-10"
          style={{ backgroundColor: "#1c1c1a" }}
        />
      )}

      {/* ── Slides — plain CSS bg, no Next Image ─────────────── */}
      {ready && slides.map((s, i) => (
        <div
          key={s._id}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: i === current ? "opacity 1000ms ease-in-out" : "opacity 800ms ease-in-out",
            zIndex: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* ── Dark overlay ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
        style={{ zIndex: 2 }}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center text-center px-6 pb-16 md:pb-20"
        style={{
          zIndex: 3,
          opacity: ready ? 1 : 0,
          transition: "opacity 500ms ease-in-out",
        }}
      >
        <h1 className="text-white text-[28px] md:text-[35px] font-light leading-tight tracking-tight max-w-3xl drop-shadow-md">
          {slide?.headline}
        </h1>

        {slide?.subtext && (
         <p className="mt-4 text-white/100 text-[16px] md:text-[18px] tracking-wide leading-relaxed max-w-xl drop-shadow">
  {slide.subtext}
</p>
        )}

        {slide?.buttons?.length > 0 && (
          <div className="mt-7 flex items-center gap-4 flex-wrap justify-center">
            {slide.buttons.map((btn, i) => (
              <Link
                key={i}
                href={btn.href}
                className={
                  btn.style === "primary"
                    ? "text-[11px] tracking-[0.18em] uppercase bg-white text-[#2C2C2C] px-7 py-3 hover:bg-white/90 transition-colors duration-300"
                    : "text-[11px] tracking-[0.18em] uppercase bg-white/20 backdrop-blur-sm text-white border border-white/50 px-7 py-3 hover:bg-white/30 transition-colors duration-300"
                }
              >
                {btn.label}
              </Link>
            ))}
          </div>
        )}

        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  clearInterval(timerRef.current);
                  setCurrent(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-[5px] bg-white"
                    : "w-[5px] h-[5px] bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
