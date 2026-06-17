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
    images: ["/images/timeline/1.png", "/images/timeline/2.png", "/images/timeline/3.png"],
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
    images: ["/images/timeline/4.png", "/images/timeline/5.png", "/images/timeline/1.png"],
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
    images: ["/images/timeline/5.png", "/images/timeline/4.png", "/images/timeline/3.png"],
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
    images: ["/images/timeline/1.png", "/images/timeline/2.png", "/images/timeline/3.png"],
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
    images: ["/images/timeline/4.png", "/images/timeline/5.png", "/images/timeline/1.png"],
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
    images: ["/images/timeline/3.png", "/images/timeline/4.png", "/images/timeline/5.png"],
    angle: -60,
  },
];

const styles = `
  .established-section {
    position: relative;
    background: #fdfdf4;
  }

  .established-sticky {
    position: sticky;
    top: 0;
    display: flex;
    height: 100svh;
    width: 100%;
    flex-direction: column;
    overflow: hidden;
    color: #7B7F5C;
  }

  /* ── Images area ── */
  .images-area {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 38%;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    padding: 1rem 0.75rem 0;
  }

  @media (min-width: 480px) {
    .images-area { padding: 1.25rem 1.25rem 0; }
  }

  @media (min-width: 640px) {
    .images-area { padding: 1.5rem 1.5rem 0; }
  }

  @media (min-width: 768px) {
    .images-area { padding: 1.5rem 2rem 0; }
  }

  .images-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: flex-end;
    width: 100%;
    gap: 0.5rem;
  }

  @media (min-width: 480px) { .images-grid { gap: 0.75rem; } }
  @media (min-width: 640px) { .images-grid { gap: 1rem; } }
  @media (min-width: 768px) { .images-grid { gap: 2rem; } }

  .img-wrap {
    position: relative;
    overflow: hidden;
    background: #ebeae4;
    z-index: 20;
  }

  .img-wrap-side {
    width: 100%;
    aspect-ratio: 3/4;
    max-width: 80px;
  }

  .img-wrap-side:first-child { justify-self: end; }
  .img-wrap-side:last-child  { justify-self: start; }

  @media (min-width: 480px) { .img-wrap-side { max-width: 100px; } }
  @media (min-width: 640px) { .img-wrap-side { max-width: 140px; } }
  @media (min-width: 768px) { .img-wrap-side { max-width: 180px; } }
  @media (min-width: 1024px){ .img-wrap-side { max-width: 220px; } }

  .img-wrap-center {
    margin: 0 auto;
    aspect-ratio: 3/5;
    width: 55%;
    max-width: 110px;
    transform: translateY(2.5rem);
    box-shadow: 0 12px 30px rgba(123,127,92,0.15);
    z-index: 30;
  }

  @media (min-width: 480px) {
    .img-wrap-center { max-width: 140px; transform: translateY(3rem); }
  }
  @media (min-width: 640px) {
    .img-wrap-center { max-width: 180px; transform: translateY(3.5rem); }
  }
  @media (min-width: 768px) {
    .img-wrap-center {
      max-width: 240px;
      transform: translateY(4rem);
      box-shadow: 0 18px 40px rgba(123,127,92,0.18);
    }
  }
  @media (min-width: 1024px) {
    .img-wrap-center { max-width: 280px; transform: translateY(3.5rem); }
  }

  /* ── Arc + content area ── */
  .arc-area {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 1rem;
  }

  @media (min-width: 480px) { .arc-area { padding-bottom: 1.125rem; } }
  @media (min-width: 640px) { .arc-area { padding-bottom: 1.25rem; } }
  @media (min-width: 768px) { .arc-area { padding-bottom: 1.5rem; } }

  /* ── Wheel container ── */
  .wheel-container {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    bottom: -55%;
  }

  @media (min-width: 480px) { .wheel-container { bottom: -50%; } }
  @media (min-width: 640px) { .wheel-container { bottom: -46%; } }
  @media (min-width: 768px) { .wheel-container { bottom: -42%; } }
  @media (min-width: 1024px){ .wheel-container { bottom: -38%; } }

  .wheel-sizer {
    position: relative;
    height: min(480px, 105vw);
    width:  min(480px, 105vw);
  }

  @media (min-width: 480px) {
    .wheel-sizer { height: min(530px, 112vw); width: min(530px, 112vw); }
  }
  @media (min-width: 640px) {
    .wheel-sizer { height: min(600px, 120vw); width: min(600px, 120vw); }
  }
  @media (min-width: 768px) {
    .wheel-sizer { height: min(650px, 125vw); width: min(650px, 125vw); }
  }
  @media (min-width: 1024px) {
    .wheel-sizer { height: min(700px, 130vw); width: min(700px, 130vw); }
  }

  .wheel-motion {
    position: absolute;
    inset: 0;
  }

  .wheel-outer-ring {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 1px solid rgba(123,127,92,0.35);
  }

  .wheel-inner-ring {
    position: absolute;
    inset: 36px;
    border-radius: 9999px;
    border: 1px solid rgba(123,127,92,0.18);
  }

  @media (min-width: 640px) { .wheel-inner-ring { inset: 44px; } }
  @media (min-width: 768px) { .wheel-inner-ring { inset: 50px; } }

  /* ── Year node buttons ── */
  .year-node {
    pointer-events: auto;
    position: absolute;
    transform: translate(-50%, -50%);
    text-align: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .year-node-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .year-tick {
    width: 1px;
    background: #7B7F5C;
    margin-bottom: 2px;
  }

  .year-label {
    display: block;
    white-space: nowrap;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 7px;
    color: #7B7F5C;
  }

  @media (min-width: 480px) { .year-label { font-size: 8px; } }
  @media (min-width: 768px) { .year-label { font-size: 9px; } }
  @media (min-width: 1024px){ .year-label { font-size: 10px; } }

  /* ── Text content ── */
  .text-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    padding: 0 1.25rem;
    text-align: center;
  }

  @media (min-width: 480px) { .text-content { max-width: 380px; padding: 0 1.5rem; } }
  @media (min-width: 640px) { .text-content { max-width: 440px; padding: 0 2rem; } }
  @media (min-width: 768px) { .text-content { max-width: 520px; padding: 0 2.5rem; } }

  .text-inner {
    min-height: 140px;
  }

  @media (min-width: 480px) { .text-inner { min-height: 150px; } }
  @media (min-width: 640px) { .text-inner { min-height: 160px; } }
  @media (min-width: 768px) { .text-inner { min-height: 180px; } }

  .text-year {
    font-weight: 300;
    letter-spacing: 0.05em;
    color: rgba(123,127,92,0.8);
    font-size: 10px;
  }

  @media (min-width: 480px) { .text-year { font-size: 11px; } }
  @media (min-width: 640px) { .text-year { font-size: 12px; } }
  @media (min-width: 768px) { .text-year { font-size: 14px; } }

  .text-title {
    margin-top: 0.25rem;
    font-weight: 400;
    line-height: 1.35;
    color: #7B7F5C;
    font-size: clamp(0.875rem, 3vw, 1.625rem);
  }

  .text-paras {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 300;
    line-height: 1.85;
    color: #333333;
    font-size: 10px;
  }

  @media (min-width: 480px) { .text-paras { font-size: 11px; margin-top: 0.875rem; } }
  @media (min-width: 768px) { .text-paras { font-size: 12.5px; margin-top: 1rem; } }

  /* ── Bottom nav ── */
  .bottom-nav {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 220px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 480px) { .bottom-nav { max-width: 260px; gap: 1rem; } }
  @media (min-width: 640px) { .bottom-nav { max-width: 300px; padding: 0 1.5rem; } }
  @media (min-width: 768px) { .bottom-nav { max-width: 384px; } }

  .nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: rgba(123,127,92,0.5);
    transition: color 0.2s;
    display: flex;
    align-items: center;
  }

  .nav-btn:hover  { color: #7B7F5C; }
  .nav-btn:disabled { opacity: 0.25; cursor: default; }

  .progress-track {
    position: relative;
    height: 1px;
    flex: 1;
    background: rgba(123,127,92,0.2);
  }

  .progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: #7B7F5C;
  }
`;

export default function Established() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotationSteps = timelineData.map((item) => -item.angle);
  const progressSteps = timelineData.map((_, i) => i / (timelineData.length - 1));

  const rawRotation = useTransform(scrollYProgress, progressSteps, rotationSteps);
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
    const el = containerRef.current;
    const scrollable = el.offsetHeight - window.innerHeight;
    const target = el.offsetTop + (clamped / (timelineData.length - 1)) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const active = timelineData[activeIndex];
  const progressWidth = `${((activeIndex + 1) / timelineData.length) * 100}%`;

  return (
    <>
      <style>{styles}</style>

      <section
        ref={containerRef}
        className="established-section"
        style={{ height: `${timelineData.length * 100}vh` }}
        aria-label="Company timeline"
      >
        <div className="established-sticky">

          {/* Images */}
          <div className="images-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="images-grid"
              >
                {active.images.map((src, imgIdx) => {
                  const isCenter = imgIdx === 1;
                  return (
                    <div
                      key={src}
                      className={isCenter ? "img-wrap img-wrap-center" : "img-wrap img-wrap-side"}
                    >
                      <Image
                        src={src}
                        alt={`${active.year} — image ${imgIdx + 1}`}
                        fill
                        className="object-cover"
                        sizes={
                          isCenter
                            ? "(max-width:480px) 110px,(max-width:640px) 140px,(max-width:768px) 180px,240px"
                            : "(max-width:480px) 80px,(max-width:640px) 100px,(max-width:768px) 140px,180px"
                        }
                        priority={activeIndex === 0 && isCenter}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arc + content */}
          <div className="arc-area">

            {/* Wheel */}
            <div className="wheel-container">
              <div className="wheel-sizer">
                <motion.div style={{ rotate: wheelRotation }} className="wheel-motion">
                  <div className="wheel-outer-ring" />
                  <div className="wheel-inner-ring" />

                  {timelineData.map((item, idx) => {
                    const rad = (item.angle * Math.PI) / 180;
                    const r = 38;
                    const x = 50 + r * Math.sin(rad);
                    const y = 50 - r * Math.cos(rad);
                    const isActive = idx === activeIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToIndex(idx)}
                        className="year-node"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        aria-label={`Go to ${item.year}`}
                      >
                        <div className="year-node-inner">
                          <motion.div
                            animate={{ height: isActive ? 18 : 10, opacity: isActive ? 1 : 0.35 }}
                            className="year-tick"
                          />
                          <motion.span
                            animate={{ scale: isActive ? 1.12 : 0.92, opacity: isActive ? 1 : 0.38 }}
                            transition={{ duration: 0.35 }}
                            className="year-label"
                            style={{ fontWeight: isActive ? 500 : 300 }}
                          >
                            {item.year}
                          </motion.span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Text */}
            <div className="text-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="text-inner"
                >
                  <p className="text-year">{active.year}</p>
                  <h2 className="text-title">{active.title}</h2>
                  <div className="text-paras">
                    {active.paragraphs.map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav */}
            <div className="bottom-nav">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="nav-btn"
                aria-label="Previous year"
              >
                <ChevronLeft size={17} strokeWidth={1.5} />
              </button>

              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  animate={{ width: progressWidth }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
              </div>

              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex === timelineData.length - 1}
                className="nav-btn"
                aria-label="Next year"
              >
                <ChevronRight size={17} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}