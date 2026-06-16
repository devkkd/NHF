// "use client";

// import { useRef } from "react";
// import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// // ─── Center Text ───────────────────────────────────────────
// const COLLECTION_TEXT = {
//   title: "THE COLLECTION",
//   description: [
//     "Explore Every Corner Of The Nikita World,",
//     "From Bedroom Essentials",
//     "To Wearable Artisan Textiles.",
//   ],
// };

// // ─── Ring Configs ──────────────────────────────────────────
// const RINGS = [
//   {
//     id: "outer",
//     radius: 520,
//     zIndex: 0,
//     rotateRange: [0, 120],   // clockwise
//     products: [
//       { id: "o1", src: "/images/product/1.png", angle: 0 },
//       { id: "o2", src: "/images/product/2.png", angle: 40 },
//       { id: "o3", src: "/images/product/3.png", angle: 80 },
//       { id: "o4", src: "/images/product/4.png", angle: 120 },
//       { id: "o5", src: "/images/product/5.png", angle: 160 },
//       { id: "o6", src: "/images/product/6.png", angle: 200 },
//       { id: "o7", src: "/images/product/7.png", angle: 240 },
//       { id: "o8", src: "/images/product/8.png", angle: 280 },
//       { id: "o9", src: "/images/product/9.png", angle: 320 },
//     ],
//     cardSize: 88,
//   },
//   {
//     id: "middle",
//     radius: 340,
//     zIndex: 5,
//     rotateRange: [0, -100],  // counter-clockwise
//     products: [
//       { id: "m1", src: "/images/product/10.png", angle: 20 },
//       { id: "m2", src: "/images/product/1.png", angle: 80 },
//       { id: "m3", src: "/images/product/2.png", angle: 140 },
//       { id: "m4", src: "/images/product/3.png", angle: 200 },
//       { id: "m5", src: "/images/product/4.png", angle: 260 },
//       { id: "m6", src: "/images/product/5.png", angle: 320 },
//     ],
//     cardSize: 80,
//   },
//   {
//     id: "inner",
//     radius: 175,
//     zIndex: 10,
//     rotateRange: [0, 160],   // clockwise, faster
//     products: [
//       { id: "i1", src: "/images/product/6.png", angle: 0 },
//       { id: "i2", src: "/images/product/7.png", angle: 72 },
//       { id: "i3", src: "/images/product/8.png", angle: 144 },
//       { id: "i4", src: "/images/product/9.png", angle: 216 },
//       { id: "i5", src: "/images/product/10.png", angle: 288 },
//     ],
//     cardSize: 72,
//   },
// ];

// // ─── Fallback placeholder when image is missing ─────────────
// const PLACEHOLDER_COLORS = [
//   "#D4C4A0", "#B8A082", "#C9B99A", "#A89070",
//   "#DDD0B8", "#C4A882", "#B09070", "#D8C8A8",
// ];

// function ProductCard({ src, index, size }) {
//   return (
//     <div
//       className="absolute rounded-xl overflow-hidden shadow-lg border border-white/60 bg-white"
//       style={{ width: size, height: size }}
//     >
//       {/* eslint-disable-next-line @next/next/no-img-element */}
//       <img
//         src={src}
//         alt=""
//         className="w-full h-full object-cover"
//         onError={(e) => {
//           e.currentTarget.style.display = "none";
//           e.currentTarget.parentElement.style.background =
//             PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
//         }}
//       />
//     </div>
//   );
// }

// // ─── Single Ring ────────────────────────────────────────────
// function Ring({ ring, rotationValue }) {
//   return (
//     <motion.div
//       className="absolute inset-0 flex items-center justify-center pointer-events-none"
//       style={{ zIndex: ring.zIndex, rotate: rotationValue }}
//     >
//       {/* Dashed ring guide */}
//       <div
//         className="absolute rounded-full border border-dashed border-stone-200/70"
//         style={{
//           width: ring.radius * 2,
//           height: ring.radius * 2,
//         }}
//       />

//       {ring.products.map((product, i) => {
//         const rad = (product.angle * Math.PI) / 180;
//         const x = ring.radius * Math.cos(rad);
//         const y = ring.radius * Math.sin(rad);

//         return (
//           <motion.div
//             key={product.id}
//             className="absolute pointer-events-auto cursor-pointer"
//             style={{
//               x,
//               y,
//               // Counter-rotate so cards always face up while ring spins
//               rotate: rotationValue
//                 ? undefined
//                 : -(product.angle),
//             }}
//             whileHover={{ scale: 1.12 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//           >
//             <ProductCard src={product.src} index={i} size={ring.cardSize} />
//           </motion.div>
//         );
//       })}
//     </motion.div>
//   );
// }

// // ─── Main Component ─────────────────────────────────────────
// export default function CircularCollection() {
//   const containerRef = useRef(null);

//   // Track scroll progress of this section
//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end start"],
//   });

//   // Spring smoothing — this is what makes it silky
//   const smoothProgress = useSpring(scrollYProgress, {
//     stiffness: 60,
//     damping: 25,
//     restDelta: 0.001,
//   });

//   // One rotation value per ring derived from the smooth progress
//   const outerRotation   = useTransform(smoothProgress, [0, 1], RINGS[0].rotateRange);
//   const middleRotation  = useTransform(smoothProgress, [0, 1], RINGS[1].rotateRange);
//   const innerRotation   = useTransform(smoothProgress, [0, 1], RINGS[2].rotateRange);

//   const rotations = [outerRotation, middleRotation, innerRotation];

//   return (
//     // 300vh gives the scroll room — visuals stay sticky inside
//     <div
//       ref={containerRef}
//       className="relative h-[300vh] bg-[#FAF8F4]"
//     >
//       <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

//         {/* Render all 3 rings */}
//         {RINGS.map((ring, i) => (
//           <Ring key={ring.id} ring={ring} rotationValue={rotations[i]} />
//         ))}

//         {/* Center text — sits between middle and inner ring */}
//         <div
//           className="relative text-center px-8 pointer-events-none"
//           style={{ zIndex: 7, maxWidth: 420 }}
//         >
//           <p className="text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-3 font-medium">
//             Nikita Home Furnishings
//           </p>
//           <h2
//             className="text-3xl md:text-4xl font-semibold text-[#4A3F35] mb-4 leading-tight"
//             style={{ fontFamily: "'Tobias TRIAL', Georgia, serif" }}
//           >
//             {COLLECTION_TEXT.title}
//           </h2>
//           <div className="w-8 h-px bg-stone-400 mx-auto mb-4" />
//           {COLLECTION_TEXT.description.map((line, i) => (
//             <p
//               key={i}
//               className="text-[11px] md:text-xs text-stone-500 leading-relaxed tracking-wide"
//             >
//               {line}
//             </p>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";

import { useRef } from "react";
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

// ─── Perfect Spacing Ring Configs ───────────────────────────
// Adjusting radii so that inner ring is far enough from text,
// and the spacing between all rings is completely uniform.
const RINGS = [
  {
    id: "inner",
    radius: 260, // Increased to completely avoid text overlapping
    zIndex: 10,
    rotateRange: [0, 160],   // Clockwise, faster
    products: [
      { id: "i1", src: "/images/product/6.png", angle: 0 },
      { id: "i2", src: "/images/product/7.png", angle: 72 },
      { id: "i3", src: "/images/product/8.png", angle: 144 },
      { id: "i4", src: "/images/product/9.png", angle: 216 },
      { id: "i5", src: "/images/product/10.png", angle: 288 },
    ],
    cardSize: 80,
  },
  {
    id: "middle",
    radius: 400, // Balanced gap from inner ring (400 - 260 = 140px gap)
    zIndex: 5,
    rotateRange: [0, -100],  // Counter-clockwise
    products: [
      { id: "m1", src: "/images/product/10.png", angle: 20 },
      { id: "m2", src: "/images/product/1.png", angle: 80 },
      { id: "m3", src: "/images/product/2.png", angle: 140 },
      { id: "m4", src: "/images/product/3.png", angle: 200 },
      { id: "m5", src: "/images/product/4.png", angle: 260 },
      { id: "m6", src: "/images/product/5.png", angle: 320 },
    ],
    cardSize: 88,
  },
  {
    id: "outer",
    radius: 540, // Balanced gap from middle ring (540 - 400 = 140px gap)
    zIndex: 2,
    rotateRange: [0, 120],   // Clockwise
    products: [
      { id: "o1", src: "/images/product/1.png", angle: 0 },
      { id: "o2", src: "/images/product/2.png", angle: 40 },
      { id: "o3", src: "/images/product/3.png", angle: 80 },
      { id: "o4", src: "/images/product/4.png", angle: 120 },
      { id: "o5", src: "/images/product/5.png", angle: 160 },
      { id: "o6", src: "/images/product/6.png", angle: 200 },
      { id: "o7", src: "/images/product/7.png", angle: 240 },
      { id: "o8", src: "/images/product/8.png", angle: 280 },
      { id: "o9", src: "/images/product/9.png", angle: 320 },
    ],
    cardSize: 96,
  },
];

const PLACEHOLDER_COLORS = [
  "#D4C4A0", "#B8A082", "#C9B99A", "#A89070",
  "#DDD0B8", "#C4A882", "#B09070", "#D8C8A8",
];

function ProductCard({ src, index, size }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ width: size, height: size }}
    >
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

// ─── Single Ring Component ──────────────────────────────────
function Ring({ ring, rotationValue }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
      style={{ zIndex: ring.zIndex, rotate: rotationValue, width: 0, height: 0 }}
    >
      {/* Dashed ring path guide */}
      <div
        className="absolute rounded-full border border-dashed border-stone-200/60"
        style={{
          width: ring.radius * 2,
          height: ring.radius * 1,
        }}
      />

      {ring.products.map((product, i) => {
        const rad = (product.angle * Math.PI) / 180;
        const x = ring.radius * Math.cos(rad);
        const y = ring.radius * Math.sin(rad);

        return (
          <motion.div
            key={product.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              x,
              y,
              // Centering the card over its coordinates perfectly
              left: "-50%",
              top: "-50%",
              x: x,
              y: y,
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Keeping the card upright/facing up while ring rotates */}
            <motion.div
              style={{
                rotate: rotationValue ? useTransform(rotationValue, (v) => -v) : 0
              }}
            >
              <ProductCard src={product.src} index={i} size={ring.cardSize} />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Main Export Component ──────────────────────────────────
export default function CircularCollection() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 22,
    restDelta: 0.001,
  });

  // Deriving transformation rotation for each individual ring
  const innerRotation  = useTransform(smoothProgress, [0, 1], RINGS[0].rotateRange);
  const middleRotation = useTransform(smoothProgress, [0, 1], RINGS[1].rotateRange);
  const outerRotation  = useTransform(smoothProgress, [0, 1], RINGS[2].rotateRange);

  const rotations = [innerRotation, middleRotation, outerRotation];

  return (
    <div
      ref={containerRef}
      className="relative h-[300vh] bg-[#FAF8F4]"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Render all 3 perfectly spaced rings */}
        {RINGS.map((ring, i) => (
          <Ring key={ring.id} ring={ring} rotationValue={rotations[i]} />
        ))}

        {/* Center Text Panel - Completely clear from any rings or cards */}
        <div
          className="relative text-center px-6 pointer-events-none z-20"
          style={{ maxWidth: 460 }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2 font-medium">
            Nikita Home Furnishings
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold mb-4 leading-tight"
            style={{ 
              fontFamily: "'Tobias TRIAL', Georgia, serif",
              color: "#7B7F5C" // Exact color applied here
            }}
          >
            {COLLECTION_TEXT.title}
          </h2>
          
          {/* Custom colored line divider */}
          <div className="w-12 h-[1.5px] mx-auto mb-4" style={{ backgroundColor: "#7B7F5C" }} />
          
          <div className="space-y-1">
            {COLLECTION_TEXT.description.map((line, i) => (
              <p
                key={i}
                className="text-[11px] md:text-xs text-stone-500 font-normal leading-relaxed tracking-wide"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}