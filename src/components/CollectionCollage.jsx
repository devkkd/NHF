"use client";

import { useRef, useState, useEffect } from "react";

// ─── Config ─────────────────────────────────────────────────
const COLLECTION_TEXT = {
  title: "THE COLLECTION",
  description: [
    "Explore Every Corner Of The Nikita World,",
    "From Bedroom Essentials",
    "To Wearable Artisan Textiles.",
  ],
};

const RING_DEFS = [
  {
    id: "inner",
    radiusBase: 260,
    rotateMax: 160,   // degrees at full scroll
    direction: 1,
    products: [
      { id: "i1", src: "/images/product/6.png",  angle: 0   },
      { id: "i2", src: "/images/product/7.png",  angle: 72  },
      { id: "i3", src: "/images/product/8.png",  angle: 144 },
      { id: "i4", src: "/images/product/9.png",  angle: 216 },
      { id: "i5", src: "/images/product/10.png", angle: 288 },
    ],
    cardSizeBase: 100,
    zIndex: 10,
  },
  {
    id: "middle",
    radiusBase: 400,
    rotateMax: 100,
    direction: -1,
    products: [
      { id: "m1", src: "/images/product/10.png", angle: 20  },
      { id: "m2", src: "/images/product/1.png",  angle: 80  },
      { id: "m3", src: "/images/product/2.png",  angle: 140 },
      { id: "m4", src: "/images/product/3.png",  angle: 200 },
      { id: "m5", src: "/images/product/4.png",  angle: 260 },
      { id: "m6", src: "/images/product/5.png",  angle: 320 },
    ],
    cardSizeBase: 112,
    zIndex: 5,
  },
  {
    id: "outer",
    radiusBase: 540,
    rotateMax: 120,
    direction: 1,
    products: [
      { id: "o1", src: "/images/product/1.png", angle: 0   },
      { id: "o2", src: "/images/product/2.png", angle: 40  },
      { id: "o3", src: "/images/product/3.png", angle: 80  },
      { id: "o4", src: "/images/product/4.png", angle: 120 },
      { id: "o5", src: "/images/product/5.png", angle: 160 },
      { id: "o6", src: "/images/product/6.png", angle: 200 },
      { id: "o7", src: "/images/product/7.png", angle: 240 },
      { id: "o8", src: "/images/product/8.png", angle: 280 },
      { id: "o9", src: "/images/product/9.png", angle: 320 },
    ],
    cardSizeBase: 124,
    zIndex: 2,
  },
];

const PLACEHOLDER_COLORS = [
  "#D4C4A0","#B8A082","#C9B99A","#A89070",
  "#DDD0B8","#C4A882","#B09070","#D8C8A8",
];

function getScale(width) {
  if (width < 480)  return 0.38;
  if (width < 768)  return 0.52;
  if (width < 1024) return 0.68;
  if (width < 1280) return 0.82;
  return 1;
}

// ─── Main Component ──────────────────────────────────────────
export default function CircularCollection() {
  const containerRef  = useRef(null);
  const ringsRef      = useRef([]);   // refs to ring DOM elements
  const cardsRef      = useRef([]);   // refs to card wrappers for counter-rotation
  const rafRef        = useRef(null);
  const scrollRef     = useRef(0);    // current scroll progress 0–1
  const renderRef     = useRef(0);    // rendered progress (lerped)

  const [scale, setScale]   = useState(1);
  const [mounted, setMounted] = useState(false);

  // ── Mount + resize ─────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const update = () => setScale(getScale(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── RAF animation loop ──────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect   = container.getBoundingClientRect();
      const total  = container.offsetHeight - window.innerHeight;
      // how far has the top of container scrolled past viewport top
      const scrolled = -rect.top;
      scrollRef.current = Math.max(0, Math.min(1, scrolled / total));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init

    const tick = () => {
      // Lerp for smoothness — but much faster than spring so it doesn't block scroll
      const diff = scrollRef.current - renderRef.current;
      if (Math.abs(diff) > 0.0001) {
        renderRef.current += diff * 0.12;

        const p = renderRef.current;

        RING_DEFS.forEach((def, i) => {
          const el = ringsRef.current[i];
          if (!el) return;
          const deg = def.direction * def.rotateMax * p;
          el.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;

          // counter-rotate each card so images stay upright
          const cardEls = cardsRef.current[i];
          if (cardEls) {
            cardEls.forEach((c) => {
              if (c) c.style.transform = `rotate(${-deg}deg)`;
            });
          }
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted]);

  // ── Responsive values ───────────────────────────────────────
  const centerMaxWidth = scale < 0.5 ? 180 : scale < 0.7 ? 240 : 460;
  const titleSize      = scale < 0.5 ? "text-xl" : scale < 0.7 ? "text-2xl" : "text-3xl md:text-4xl";
const descSize =
  scale < 0.5
    ? "text-[11px]"
    : "text-[13px] md:text-[15px]";
  const eyebrowSize    = scale < 0.5 ? "text-[12px]" : "text-[16px]";

  if (!mounted) {
    return <div className="h-[240vh] bg-[#FDFFF1]" />;
  }

  return (
    <div ref={containerRef} className="relative bg-[#FDFFF1]" style={{ height: "240vh" }}>
      <div
  className="sticky top-0 w-full overflow-hidden flex items-center justify-center"
  style={{
    height: "100vh",
    paddingTop: "40px",
    paddingBottom: "40px",
    boxSizing: "border-box",
  }}
>
        {/* ── Rings ────────────────────────────────────────── */}
        {RING_DEFS.map((def, ri) => {
          const radius   = def.radiusBase * scale;
          const cardSize = Math.round(def.cardSizeBase * scale);

          return (
            <div
              key={def.id}
              ref={(el) => (ringsRef.current[ri] = el)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 0,
                height: 0,
                zIndex: def.zIndex,
                transform: "translate(-50%, -50%) rotate(0deg)",
                willChange: "transform",
              }}
            >
              {/* Dashed orbit guide */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: radius * 2,
                  height: radius * 2,
                  marginLeft: -radius,
                  marginTop: -radius,
                  borderRadius: "50%",
                  border: "1px dashed rgba(120,120,100,0.2)",
                  pointerEvents: "none",
                }}
              />

              {/* Cards */}
              {def.products.map((product, pi) => {
                const rad = (product.angle * Math.PI) / 180;
                const x   = radius * Math.cos(rad);
                const y   = radius * Math.sin(rad);

                return (
                  <div
                    key={product.id}
                    style={{
                      position: "absolute",
                      left: x - cardSize / 2,
                      top:  y - cardSize / 2,
                      width: cardSize,
                      height: cardSize,
                      cursor: "pointer",
                    }}
                  >
                    {/* Counter-rotate wrapper */}
                    <div
                      ref={(el) => {
                        if (!cardsRef.current[ri]) cardsRef.current[ri] = [];
                        cardsRef.current[ri][pi] = el;
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        willChange: "transform",
                        transform: "rotate(0deg)",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 12,
                          overflow: "hidden",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.src}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.style.background =
                              PLACEHOLDER_COLORS[pi % PLACEHOLDER_COLORS.length];
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ── Center Text ──────────────────────────────────── */}
        <div
          className="relative text-center px-4 pointer-events-none"
          style={{ maxWidth: centerMaxWidth, zIndex: 20 }}
        >
          <p className={`${eyebrowSize} tracking-[0.3em] uppercase text-black-400 mb-2 font-medium`}>
            Nikita Home Furnishings
          </p>
          <h2
            className={`${titleSize} font-semibold mb-3 leading-tight`}
            style={{ fontFamily: "'Tobias TRIAL', Georgia, serif", color: "#7B7F5C" }}
          >
            {COLLECTION_TEXT.title}
          </h2>
          <div
            className="mx-auto mb-3"
            style={{ width: scale < 0.5 ? 24 : 48, height: "1.5px", backgroundColor: "#7B7F5C" }}
          />
          <div className="space-y-1">
            {COLLECTION_TEXT.description.map((line, i) => (
              <p key={i} className={`${descSize} text-black-500 font-normal leading-relaxed tracking-wide`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}