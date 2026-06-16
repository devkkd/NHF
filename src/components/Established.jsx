"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const timelineData = [
  {
    id: 1,
    year: "2006",
    title: "Nikita Home Furnishings is Established",
    paragraphs: [
      "Company registered and studio opened at Govind Nagar West, Jaipur. Initial production focused on kantha bedcovers, quilts, throws, and block-printed bedsheets.",
      "The founder, Joy Kumar Maheshwari, brings deep roots in the Rajasthani textile trade and an uncompromising standard from the first day of production. First domestic trade enquiries received within weeks of opening.",
    ],
    images: [
      "/images/timeline/1.png",
      "/images/timeline/2.png",
      "/images/timeline/3.png",
    ],
    angle: 60,
  },
  {
    id: 2,
    year: "2008-2010",
    title: "First International Trade Fair Exhibitions",
    paragraphs: [
      "Heimtextil Frankfurt and IHGF Delhi Fair introduce Nikita to the world's largest home textile buyers. The kantha and block-print collections attract immediate commercial interest.",
      "First export orders received from European and East Asian buyers within the first year of international exhibition. Production capacity expanded to meet growing demand.",
    ],
    images: [
      "/images/timeline/4.png",
      "/images/timeline/5.png",
      "/images/timeline/1.png",
    ],
    angle: 36,
  },
  {
    id: 3,
    year: "2012-2014",
    title: "Maison & Objet and Top Drawer entered",
    paragraphs: [
      "Paris and London exhibitions are added to the fair calendar. Maison & Objet introduces Nikita's artisan collections to Europe's most design-forward buyers, concept stores, interior curators, and lifestyle retailers.",
      "Top Drawer London establishes relationships with British independent boutiques and department store buyers that continue to the present day.",
    ],
    images: [
      "/images/timeline/5.png",
      "/images/timeline/4.png",
      "/images/timeline/3.png",
    ],
    angle: 12,
  },
  {
    id: 4,
    year: "2016-2018",
    title: "New York and Hong Kong Exhibitions begin",
    paragraphs: [
      "NY NOW New York opens North America as a meaningful market. US buyers, seeking genuine artisan sourcing and ethical manufacturing, respond strongly.",
      "Hong Kong Gifts & Home becomes the gateway to South-East Asian and Australasian buyers. Bags, pouches, and the accessories range are expanded, driven by demand from American and Asian wholesale buyers.",
    ],
    images: [
      "/images/timeline/1.png",
      "/images/timeline/2.png",
      "/images/timeline/3.png",
    ],
    angle: -12,
  },
  {
    id: 5,
    year: "2022-2024",
    title: "Full global exhibition Presence reinstated",
    paragraphs: [
      "Exhibition calendar restored at full scale. New collections unveiled at Heimtextil, Ambiente, Maison & Objet, NY NOW, and the IHGF Delhi Fair. Buyer relationships resume in person.",
      "New export markets opened in South-East Asia and the Gulf region. The response from buyers returning to the stands confirms that the Nikita brand has, if anything, grown stronger.",
    ],
    images: [
      "/images/timeline/4.png",
      "/images/timeline/5.png",
      "/images/timeline/1.png",
    ],
    angle: -36,
  },
  {
    id: 6,
    year: "2026",
    title: "A Global Name — The same Jaipur studio",
    paragraphs: [
      "Nikita Home Furnishings stands as India's most trusted artisan home textile manufacturer and exporter, with an established presence at the world's most important trade fairs and buyers in over 30 countries.",
      "The studio address is the same as it has always been. The artisan families at the heart of production are the same ones who worked the first collections. The standards have never been lower than on day one.",
    ],
    images: [
      "/images/timeline/3.png",
      "/images/timeline/4.png",
      "/images/timeline/5.png",
    ],
    angle: -60,
  },
];

const SCROLL_HEIGHT = `${timelineData.length * 100}vh`;

export default function Established() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotationSteps = timelineData.map((item) => -item.angle);
  const progressSteps = timelineData.map(
    (_, i) => i / (timelineData.length - 1)
  );

  const rawRotation = useTransform(
    scrollYProgress,
    progressSteps,
    rotationSteps
  );
  const wheelRotation = useSpring(rawRotation, {
    stiffness: 65,
    damping: 22,
    mass: 0.8,
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const index = Math.min(
      Math.round(value * (timelineData.length - 1)),
      timelineData.length - 1
    );
    setActiveIndex(index);
  });

  const scrollToIndex = (index) => {
    if (!containerRef.current) return;
    const clamped = Math.max(0, Math.min(index, timelineData.length - 1));
    const rect = containerRef.current;
    const scrollable = rect.offsetHeight - window.innerHeight;
    const target =
      rect.offsetTop + (clamped / (timelineData.length - 1)) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const active = timelineData[activeIndex];

  return (
    <section
      ref={containerRef}
      className="relative bg-[#fdfdf4]"
      style={{ height: SCROLL_HEIGHT }}
      aria-label="Company timeline"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden text-[#7B7F5C]">
        {/* ── 3 Images per year ─────────────────────────────────── */}
        <div className="relative z-20 mx-auto flex h-[38%] w-full max-w-5xl items-end justify-center px-4 pt-6 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid w-full grid-cols-3 items-end gap-3 md:gap-8"
            >
              {active.images.map((src, imgIdx) => {
                const isCenter = imgIdx === 1;
                return (
                  <div
                    key={src}
                    className={`relative overflow-hidden bg-[#ebeae4] ${
                      isCenter
                        ? "mx-auto aspect-3/4 w-[42%] max-w-[200px] shadow-[0_12px_28px_rgba(123,127,92,0.14)] md:max-w-[220px]"
                        : "aspect-3/4 w-full max-w-[140px] opacity-55 md:max-w-[160px]"
                    } ${imgIdx === 0 ? "justify-self-end" : ""} ${
                      imgIdx === 2 ? "justify-self-start" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${active.year} — image ${imgIdx + 1}`}
                      fill
                      className="object-cover"
                      sizes={isCenter ? "220px" : "160px"}
                      priority={activeIndex === 0 && isCenter}
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Arc + content ─────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col justify-end pb-6">
          {/* Rotating wheel */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[-42%] flex justify-center md:bottom-[-38%]">
            <div className="relative h-[min(680px,130vw)] w-[min(680px,130vw)]">
              <motion.div
                style={{ rotate: wheelRotation }}
                className="absolute inset-0"
              >
                {/* Outer arc */}
                <div className="absolute inset-0 rounded-full border border-[#7B7F5C]/35" />
                {/* Inner arc */}
                <div className="absolute inset-[14px] rounded-full border border-[#7B7F5C]/18" />

                {/* Year nodes */}
                {timelineData.map((item, idx) => {
                  const rad = (item.angle * Math.PI) / 180;
                  const radius = 50;
                  const x = 50 + radius * Math.sin(rad);
                  const y = 50 - radius * Math.cos(rad);
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToIndex(idx)}
                      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-center"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      aria-label={`Go to ${item.year}`}
                    >
                      <motion.span
                        animate={{
                          scale: isActive ? 1.12 : 0.92,
                          opacity: isActive ? 1 : 0.38,
                        }}
                        transition={{ duration: 0.35 }}
                        className={`block whitespace-nowrap text-[9px] tracking-[0.14em] uppercase md:text-[10px] ${
                          isActive ? "font-medium" : "font-light"
                        }`}
                      >
                        {item.year}
                      </motion.span>
                      <motion.div
                        animate={{
                          height: isActive ? 14 : 8,
                          opacity: isActive ? 1 : 0.35,
                        }}
                        className="mx-auto mt-1.5 w-px bg-[#7B7F5C]"
                      />
                    </button>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Text content inside arc */}
          <div className="relative z-10 mx-auto mb-2 flex max-w-2xl flex-col items-center px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="min-h-[200px] md:min-h-[210px]"
              >
                <p className="text-sm font-light tracking-wide text-[#7B7F5C]/80 md:text-base">
                  {active.year}
                </p>
                <h2
                  className="mt-1 font-normal leading-snug text-[#7B7F5C]"
                  style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.625rem)" }}
                >
                  {active.title}
                </h2>
                <div className="mt-4 space-y-3 text-[11px] leading-[185%] font-light text-[#333333] md:text-[12.5px]">
                  {active.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom nav */}
          <div className="relative z-20 mx-auto flex w-full max-w-xs items-center gap-4 px-6 md:max-w-sm">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="text-[#7B7F5C]/50 transition-colors hover:text-[#7B7F5C] disabled:opacity-25"
              aria-label="Previous year"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <div className="relative h-px flex-1 bg-[#7B7F5C]/20">
              <motion.div
                className="absolute left-0 top-0 h-full bg-[#7B7F5C]"
                animate={{
                  width: `${((activeIndex + 1) / timelineData.length) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>

            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === timelineData.length - 1}
              className="text-[#7B7F5C]/50 transition-colors hover:text-[#7B7F5C] disabled:opacity-25"
              aria-label="Next year"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
