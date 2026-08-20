"use client";

import { useRef, useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK = [
  { _id: "f1", quote: "The kantha bedcover arrived and I genuinely did not want to take it out of the packaging it was so beautifully made. The printing is perfect, the weight is exactly right.", name: "Sophie R.", location: "London, UK" },
  { _id: "f2", quote: "We've been sourcing from Nikita for our home décor boutique for three years. Their customisation is second to none, and the quality consistency is remarkable.", name: "Arjun M.", location: "Wholesale Buyer, Singapore" },
  { _id: "f3", quote: "I own four of their kaftans now. The fabric is breathable, the prints are stunning, and they travel beautifully. Worth every rupee.", name: "Priya D.", location: "Mumbai" },
  { _id: "f4", quote: "The quilted jacket became an instant favourite. I wear it constantly in autumn. There's something about the craftsmanship — it just feels different.", name: "Claire W.", location: "Paris, France" },
  { _id: "f5", quote: "Exceptional quality and fast shipping. The block-print bedsheets exceeded our expectations — we've already placed a second bulk order.", name: "David L.", location: "New York, USA" },
  { _id: "f6", quote: "Beautiful craftsmanship and wonderful communication throughout. They accommodated our custom size requirements perfectly.", name: "Hana K.", location: "Tokyo, Japan" },
];

const CARD_W = 320;
const GAP    = 20;

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK);
  const [isPaused, setIsPaused]         = useState(false);

  useEffect(() => {
    fetch(`${API}/testimonials`)
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data) && data.length > 0) setTestimonials(data); })
      .catch(() => {});
  }, []);

  const doubled = [...testimonials, ...testimonials];

  return (
    <section style={s.section}>
      <h2 style={s.heading}>What our Customers Say</h2>

      <div
        style={s.outerMask}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div style={{ ...s.track, animationPlayState: isPaused ? "paused" : "running" }}>
          {doubled.map((t, i) => (
            <div key={`${t._id}-${i}`} style={s.card}>
              <p style={s.quote}>&quot;{t.quote}&quot;</p>
              <p style={s.name}>{t.name}</p>
              <p style={s.loc}>{t.location}</p>
            </div>
          ))}
        </div>
      </div>

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

const s = {
  section: { background: "#FDFFF1", padding: "30px 0 56px", overflow: "hidden" },
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
  outerMask: {
    width: "100%",
    overflow: "hidden",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
    maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  },
  track: {
    display: "flex",
    gap: `${GAP}px`,
    width: "max-content",
    animation: "scrollLeft 32s linear infinite",
    paddingBottom: "4px",
  },
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
  quote: { fontFamily: "'Mona Sans', 'Inter', sans-serif", fontSize: "15px", fontWeight: 400, color: "#2C2C2A", lineHeight: 1.7, margin: 0, flex: 1 },
  name:  { fontFamily: "'Mona Sans', 'Inter', sans-serif", fontSize: "15px", fontWeight: 700, color: "#0E0E0E", margin: 0 },
  loc:   { fontFamily: "'Mona Sans', 'Inter', sans-serif", fontSize: "13px", fontWeight: 400, color: "#888", margin: 0 },
};
