"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "The kantha bedcover arrived and I genuinely did not want to take it out of the packaging it was so beautifully made. The printing is perfect, the weight is exactly right, and it has completely transformed our bedroom.",
    name: "Sophie R.",
    location: "London, UK",
  },
  {
    id: 2,
    quote:
      "We've been sourcing from Nikita for our home décor boutique for three years. Their customisation is second to none, and the quality consistency is remarkable. Our customers keep coming back asking for more.",
    name: "Arjun M.",
    location: "Wholesale Buyer, Singapore",
  },
  {
    id: 3,
    quote:
      "I own four of their kaftans now. The fabric is breathable, the prints are stunning, and they travel beautifully. Worth every rupee — and I say that as someone who buys from the best labels.",
    name: "Priya D.",
    location: "Mumbai",
  },
  {
    id: 4,
    quote:
      "The quilted jacket became an instant favourite. I wear it constantly in autumn. There's something about the craftsmanship — it just feels different to everything else in my wardrobe.",
    name: "Claire W.",
    location: "Paris, France",
  },
  {
    id: 5,
    quote:
      "Exceptional quality and fast shipping. The block-print bedsheets exceeded our expectations — we've already placed a second bulk order.",
    name: "David L.",
    location: "New York, USA",
  },
  {
    id: 6,
    quote:
      "Beautiful craftsmanship and wonderful communication throughout. They accommodated our custom size requirements perfectly.",
    name: "Hana K.",
    location: "Tokyo, Japan",
  },
];

export default function TestimonialsSection() {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate reviews for infinite scroll
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section style={s.section}>
      {/* Heading */}
      <h2 style={s.heading}>What our Customers Say</h2>

      {/* Scrolling track */}
      <div
        style={s.outerMask}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          style={{
            ...s.track,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {doubled.map((t, i) => (
            <div key={i} style={s.card}>
              <p style={s.quote}>&quot;{t.quote}&quot;</p>
              <p style={s.name}>{t.name}</p>
              <p style={s.loc}>{t.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace logos — single PNG */}
   

      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 600px) {
          .nik-card { min-width: 260px !important; max-width: 260px !important; }
        }
      `}</style>
    </section>
  );
}

const CARD_W = 320;
const GAP = 20;

const s = {
  section: {
    background: "#FDFFF1",
    padding: "30px 0 56px",
    overflow: "hidden",
  },
  heading: {
    fontFamily: "'Tobias TRIAL', 'Georgia', serif",
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 600,
    color: "#7B7F5C",
    textAlign: "center",
    letterSpacing: "-0.02em",
    lineHeight: 1.6,
    margin: "0 0 40px",
  },

  /* Mask fades edges */
  outerMask: {
    width: "100%",
    overflow: "hidden",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  },

  /* Infinite scroll track */
  track: {
    display: "flex",
    gap: `${GAP}px`,
    width: "max-content",
    animation: `scrollLeft 32s linear infinite`,
    paddingBottom: "4px", // prevent card shadow clip
  },

  /* Individual review card */
  card: {
    minWidth: `${CARD_W}px`,
    maxWidth: `${CARD_W}px`,
    background: "#FDFFF1",
    border: "1px solid #E0DDCE",
    borderRadius: "4px",
    padding: "24px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  quote: {
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: 400,
    color: "#2C2C2A",
    lineHeight: 1.7,
    margin: 0,
    flex: 1,
  },
  name: {
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: 700,
    color: "#0E0E0E",
    margin: 0,
  },
  loc: {
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
    fontSize: "13px",
    fontWeight: 400,
    color: "#888",
    margin: 0,
  },

  
};