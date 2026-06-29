"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// ─── Center Text Config ─────────────────────────────────────
const COLLECTION_TEXT = {
  title: "THE COLLECTION",
  description: [
    "Explore Every Corner Of The Nikita World,",
    "From Bedroom Essentials",
    "To Wearable Artisan Textiles.",
  ],
};

// ─── Responsive Ring Configs (from remote) ──────────────────
function getRings(scale) {
  return [
    {
      id: "inner",
      radius: 260 * scale,
      zIndex: 10,
      rotateRange: [0, 160],
      products: [
        { id: "i1", src: "/images/product/6.png",  angle: 0   },
        { id: "i2", src: "/images/product/7.png",  angle: 72  },
        { id: "i3", src: "/images/product/8.png",  angle: 144 },
        { id: "i4", src: "/images/product/9.png",  angle: 216 },
        { id: "i5", src: "/images/product/10.png", angle: 288 },
      ],
      cardSize: Math.round(80 * scale),
    },
    {
      id: "middle",
      radius: 400 * scale,
      zIndex: 5,
      rotateRange: [0, -100],
      products: [
        { id: "m1", src: "/images/product/10.png", angle: 20  },
        { id: "m2", src: "/images/product/1.png",  angle: 80  },
        { id: "m3", src: "/images/product/2.png",  angle: 140 },
        { id: "m4", src: "/images/product/3.png",  angle: 200 },
        { id: "m5", src: "/images/product/4.png",  angle: 260 },
        { id: "m6", src: "/images/product/5.png",  angle: 320 },
      ],
      cardSize: Math.round(88 * scale),
    },
    {
      id: "outer",
      radius: 540 * scale,
      zIndex: 2,
      rotateRange: [0, 120],
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
      cardSize: Math.round(96 * scale),
    },
  ];
}

function getScale(width) {
  if (width < 480)  return 0.38;
  if (width < 768)  return 0.52;
  if (width < 1024) return 0.68;
  if (width < 1280) return 0.82;
  return 1;
}

const PLACEHOLDER_COLORS = [
  "#D4C4A0", "#B8A082", "#C9B99A", "#A89070",
  "#DDD0B8", "#C4A882", "#B09070", "#D8C8A8",
];

// ─── Product Card ────────────────────────────────────────────
function ProductCard({ src, index, size }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement.style.background =
            PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
        }}
      />
    </div>
  );
}

// ─── Single Ring ─────────────────────────────────────────────
// counterRotation is pre-computed in the parent to satisfy React hook rules
// (hooks must not be called inside a loop or non-top-level component)
function Ring({ ring, rotationValue, counterRotation }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
      style={{ zIndex: ring.zIndex, rotate: rotationValue, width: 0, height: 0 }}
    >
      {/* Dashed ring guide */}
      <div
        className="absolute rounded-full border border-dashed border-stone-200/60"
        style={{ width: ring.radius * 2, height: ring.radius * 2 }}
      />

      {ring.products.map((product, i) => {
        const rad = (product.angle * Math.PI) / 180;
        const x   = ring.radius * Math.cos(rad);
        const y   = ring.radius * Math.sin(rad);

        return (
          <motion.div
            key={product.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{ left: "-50%", top: "-50%", x, y }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Keep card upright while ring rotates */}
            <motion.div style={{ rotate: counterRotation }}>
              <ProductCard src={product.src} index={i} size={ring.cardSize} />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────
export default function CircularCollection() {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Responsive scaling
  useEffect(() => {
    function update() { setScale(getScale(window.innerWidth)); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rings = getRings(scale);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping:   22,
    restDelta: 0.001,
  });

  // Rotation per ring — computed at top level (hook rules compliant)
  const innerRotation  = useTransform(smoothProgress, [0, 1], rings[0].rotateRange);
  const middleRotation = useTransform(smoothProgress, [0, 1], rings[1].rotateRange);
  const outerRotation  = useTransform(smoothProgress, [0, 1], rings[2].rotateRange);

  // Counter-rotations so cards stay upright — also computed at top level
  const innerCounter  = useTransform(innerRotation,  (v) => -v);
  const middleCounter = useTransform(middleRotation, (v) => -v);
  const outerCounter  = useTransform(outerRotation,  (v) => -v);

  const rotations        = [innerRotation,  middleRotation,  outerRotation ];
  const counterRotations = [innerCounter,   middleCounter,   outerCounter  ];

  // Responsive center text sizes
  const centerMaxWidth = scale < 0.5 ? 180 : scale < 0.7 ? 240 : 460;
  const titleSize      = scale < 0.5 ? "text-xl" : scale < 0.7 ? "text-2xl" : "text-3xl md:text-4xl";
  const descSize       = scale < 0.5 ? "text-[9px]" : "text-[11px] md:text-xs";
  const eyebrowSize    = scale < 0.5 ? "text-[8px]" : "text-[10px]";

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[#FDFFF1]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

        {rings.map((ring, i) => (
          <Ring
            key={ring.id}
            ring={ring}
            rotationValue={rotations[i]}
            counterRotation={counterRotations[i]}
          />
        ))}

        {/* Center Text */}
        <div
          className="relative text-center px-4 pointer-events-none z-20"
          style={{ maxWidth: centerMaxWidth }}
        >
          <p className={`${eyebrowSize} tracking-[0.3em] uppercase text-stone-400 mb-2 font-medium`}>
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
              <p key={i} className={`${descSize} text-stone-500 font-normal leading-relaxed tracking-wide`}>
                {line}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
