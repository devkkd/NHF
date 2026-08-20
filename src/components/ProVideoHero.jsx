"use client";

import { useEffect, useRef, useState } from "react";

export default function ProVideoHero() {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");

    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // scroll-driven animation — desktop only
  useEffect(() => {
    if (isMobile) return;

    let raf = null;

    const handleScroll = () => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        raf = null;

        const el = wrapRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;

        let p = -rect.top / scrollable;
        p = Math.min(1, Math.max(0, p));

        setProgress(p);

        const video = videoRef.current;
        if (video) {
          if (p > 0 && p < 1) {
            if (video.paused) video.play().catch(() => {});
          } else if (p >= 1) {
            video.pause();
          } else if (p <= 0) {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  // keep mobile video always playing
  useEffect(() => {
    if (!isMobile) return;

    const video = mobileVideoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, [isMobile]);

  // ===== helpers (desktop scroll math) =====
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mapRange = (v, inMin, inMax, outMin, outMax) => {
    const t = clamp01((v - inMin) / (inMax - inMin));
    return lerp(outMin, outMax, t);
  };

  const textOpacity = 1 - mapRange(progress, 0.02, 0.2, 0, 1);
  const textTranslate = mapRange(progress, 0.02, 0.22, 0, -40);
  const shrink = mapRange(progress, 0.22, 0.78, 0, 1);
  const radius = lerp(0, 54, shrink);
  const bezel = lerp(0, 14, shrink);
  const chromeOpacity = mapRange(progress, 0.6, 0.8, 0, 1);
  const stageBg = mapRange(progress, 0.3, 0.8, 1, 0);

  // bottom text (below phone) fades in as phone forms — same timing as chrome
  const bottomTextOpacity = mapRange(progress, 0.65, 0.85, 0, 1);
  const bottomTextTranslate = mapRange(progress, 0.65, 0.85, 20, 0);

  // =========================================
  // MOBILE — static layout, no scroll animation
  // =========================================
  if (isMobile) {
    return (
      <>
        <section className="mobile-hero">
          <div className="mobile-text-top">
            <p className="eyebrow">THE COLLECTION</p>
            <h1>
              Explore Every Corner Of The Nikita World, From
              Bedroom Essentials To Wearable Artisan Textiles.
            </h1>
          </div>

          <div className="mobile-phone-frame">
            <div className="frame-inner">
              <video
                ref={mobileVideoRef}
                className="hero-video"
                src="/vid1.mp4"
                muted
                playsInline
                autoPlay
                loop
                preload="auto"
              />
            </div>

            <div className="cam-housing">
              <div className="cam-lens">
                <div className="cam-lens-inner" />
              </div>
            </div>

            <div className="top-notch" />

            <div className="btn-power" />
            <div className="btn-vol-up" />
            <div className="btn-vol-down" />
            <div className="btn-action" />
          </div>

          <div className="mobile-text-bottom">
            <p>
              From bedroom throws to studio-woven scarves,
              every Nikita piece is <strong>handcrafted with intent</strong> —
              blending traditional technique with a modern,
              considered edge.
            </p>
          </div>
        </section>

        <GlobalStyles />
      </>
    );
  }

  // =========================================
  // DESKTOP — scroll-driven shrink animation
  // =========================================
  return (
    <>
      <section ref={wrapRef} className="hero-wrap">
        <div className="hero-sticky">
          <div className="stage-bg" style={{ opacity: stageBg }} />

          <div className="desktop-phone-stack">
            <div
              className="video-frame"
              style={{
                width: shrink === 0 ? "100vw" : undefined,
                height: shrink === 0 ? "100vh" : undefined,
                "--shrink": shrink,
                borderRadius: `${radius}px`,
                padding: `${bezel}px`,
              }}
            >
              <div
                className="frame-inner"
                style={{
                  borderRadius: `${Math.max(radius - bezel, 0)}px`,
                }}
              >
                <video
                  ref={videoRef}
                  className="hero-video"
                  src="/vid1.mp4"
                  muted
                  playsInline
                  loop
                  preload="auto"
                />
              </div>

              <div className="cam-housing" style={{ opacity: chromeOpacity }}>
                <div className="cam-lens">
                  <div className="cam-lens-inner" />
                </div>
              </div>

              <div className="top-notch" style={{ opacity: chromeOpacity }} />

              <div className="btn-power" style={{ opacity: chromeOpacity }} />
              <div className="btn-vol-up" style={{ opacity: chromeOpacity }} />
              <div className="btn-vol-down" style={{ opacity: chromeOpacity }} />
              <div className="btn-action" style={{ opacity: chromeOpacity }} />
            </div>

            {/* bottom text — appears below the phone once it's formed */}
            <div
              className="desktop-text-bottom"
              style={{
                opacity: bottomTextOpacity,
                transform: `translateY(${bottomTextTranslate}px)`,
              }}
            >
              <p>
                From bedroom throws to studio-woven scarves,
                every Nikita piece is{" "}
                <strong>handcrafted with intent</strong> — blending
                traditional technique with a modern, considered edge.
              </p>
            </div>
          </div>

          <div
            className="hero-text"
            style={{
              opacity: textOpacity,
              transform: `translate(-50%, calc(-50% + ${textTranslate}px))`,
            }}
          >
            <p className="eyebrow">THE COLLECTION</p>
            <h1>
              Explore Every Corner Of The Nikita World,
              <br />
              From Bedroom Essentials
              <br />
              To Wearable Artisan Textiles.
            </h1>
          </div>
        </div>
      </section>

      <GlobalStyles />
    </>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      @font-face {
        font-family: "Tobias TRIAL";
        src: local("Cormorant Garamond");
        font-weight: 700;
        font-display: swap;
      }

      @font-face {
        font-family: "Mona Sans";
        src: local("Inter");
        font-weight: 400 800;
        font-display: swap;
      }

      body {
        background: #fefff5;
        color: #0e0e0e;
        font-family: "Mona Sans", -apple-system, "Segoe UI", sans-serif;
      }

      /* =========================================
         DESKTOP HERO WRAP — controls scroll distance
      ========================================= */

      .hero-wrap {
        position: relative;
        height: 400vh;
        background: #000;
      }

      .hero-sticky {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fefff5;
      }

      .stage-bg {
        position: absolute;
        inset: 0;
        background: #000;
        z-index: 0;
        pointer-events: none;
      }

      /* stack that holds the phone + the text below it,
         kept together and vertically centered as a unit */

      .desktop-phone-stack {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 22px;
      }

      /* =========================================
         VIDEO FRAME — desktop shrink-to-phone
      ========================================= */

      .video-frame {
        position: relative;

        width: calc(
          100vw - (100vw - min(760px, 88vw)) * var(--shrink)
        );
        height: calc(
          100vh - (100vh - min(760px, 88vw) / 2.166) * var(--shrink)
        );

        max-width: 100vw;
        max-height: 100vh;

        box-sizing: border-box;

        background: linear-gradient(
          155deg,
          #35354a 0%,
          #1c1c28 35%,
          #101018 65%,
          #2a2a3a 100%
        );

        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55),
          inset 0 0 0 1px rgba(255, 255, 255, 0.06);

        transition: box-shadow 0.3s ease;
      }

      .frame-inner {
        position: relative;

        width: 100%;
        height: 100%;

        overflow: hidden;

        background: #000;

        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
      }

      .hero-video {
        position: absolute;
        inset: 0;

        width: 100%;
        height: 100%;

        object-fit: cover;
      }

      /* =========================================
         CAMERA HOUSING (shared: desktop + mobile)
      ========================================= */

      .cam-housing {
        position: absolute;

        left: 14px;
        top: 50%;

        width: 26px;
        height: 130px;

        transform: translateY(-50%);

        background: linear-gradient(180deg, #0a0a0e, #050508);

       border-radius: 0 10px 10px 0px;

        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
          2px 0 6px rgba(0, 0, 0, 0.4);

        display: flex;
        align-items: center;
        justify-content: center;

        z-index: 3;

        transition: opacity 0.2s ease;
      }

      .cam-lens {
        width: 15px;
        height: 15px;

        border-radius: 50%;

        background: radial-gradient(
          circle at 35% 35%,
          #3a4a6b,
          #0c0c14 70%
        );

        display: flex;
        align-items: center;
        justify-content: center;

        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .cam-lens-inner {
        width: 6px;
        height: 6px;

        border-radius: 50%;

        background: radial-gradient(
          circle at 40% 40%,
          #6f8fd6,
          #10131f 75%
        );
      }

      .top-notch {
        position: absolute;

        top: -1px;
        left: 50%;

        width: 60px;
        height: 5px;

        transform: translateX(-50%);

        background: #050508;

        border-radius: 0 0 4px 4px;

        z-index: 3;

        transition: opacity 0.2s ease;
      }

      .btn-power,
      .btn-vol-up,
      .btn-vol-down,
      .btn-action {
        position: absolute;

        background: linear-gradient(90deg, #2a2a3a, #16161f);

        z-index: 2;

        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);

        transition: opacity 0.2s ease;
      }

      .btn-power {
        right: -3px;
        top: 32%;

        width: 3px;
        height: 0px;

        border-radius: 0 2px 2px 0;
      }

      .btn-action {
        left: -3px;
        top: 16%;

        width: 3px;
        height: 0px;

        border-radius: 2px 0 0 2px;
      }

      .btn-vol-up {
        left: -3px;
        top: 27%;

        width: 3px;
        height: 0px;

        border-radius: 2px 0 0 2px;
      }

      .btn-vol-down {
        left: -3px;
        top: 40%;

        width: 3px;
        height: 0px;

        border-radius: 2px 0 0 2px;
      }

      /* =========================================
         DESKTOP TEXT OVERLAY (top heading)
      ========================================= */

      .hero-text {
        position: absolute;

        left: 50%;
        top: 50%;

        z-index: 2;

        text-align: center;

        width: min(900px, 88vw);

        pointer-events: none;
      }

      .eyebrow {
        margin: 0 0 14px;

        color: #7b7f5c;

        font-family: "Mona Sans", sans-serif;

        font-size: 20px;
        font-weight: 600;

        letter-spacing: 0.08em;
      }

      .hero-text h1 {
        margin: 0;

        color: #0e0e0e;

        font-family: "Tobias TRIAL", Georgia, serif;

        font-weight: 500;

        font-size: clamp(18px, 3.4vw, 30px);

        line-height: 1.3;
      }

      /* =========================================
         DESKTOP TEXT BELOW PHONE (fades in with chrome)
      ========================================= */

      .desktop-text-bottom {
        max-width: 480px;

        text-align: center;

        pointer-events: none;
      }

      .desktop-text-bottom p {
        margin: 0;

        color: #0e0e0e;

        font-family: "Mona Sans", sans-serif;

        font-size: 15.5px;

        line-height: 1.65;
      }

      .desktop-text-bottom strong {
        font-weight: 700;
      }

      /* =========================================
         MOBILE — fixed, no scroll animation
      ========================================= */

      .mobile-hero {
        width: 100%;

        background: #fefff5;

        padding: 56px 24px 64px;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 40px;
      }

      .mobile-text-top {
        text-align: center;
        max-width: 480px;
      }

      .mobile-text-top .eyebrow {
        font-size: 15px;
        margin-bottom: 10px;
      }

      .mobile-text-top h1 {
        margin: 0;

        color: #0e0e0e;

        font-family: "Tobias TRIAL", Georgia, serif;

        font-weight: 500;

        font-size: clamp(22px, 6.5vw, 28px);

        line-height: 1.3;
      }

      .mobile-phone-frame {
        position: relative;

        width: min(320px, 82vw);
        aspect-ratio: 2.166 / 1.2;

        box-sizing: border-box;

        padding: 10px;

        border-radius: 40px;

        background: linear-gradient(
          155deg,
          #35354a 0%,
          #1c1c28 35%,
          #101018 65%,
          #2a2a3a 100%
        );

        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18),
          inset 0 0 0 1px rgba(255, 255, 255, 0.06);
      }

      .mobile-phone-frame .frame-inner {
        border-radius: 30px;
      }

      .mobile-phone-frame .cam-housing {
        width: 16px;
        height: 76px;
        left: 10px;
        top: 50%;
        
        
      }

      .mobile-phone-frame .cam-lens {
        width: 10px;
        height: 10px;
      }

      .mobile-phone-frame .cam-lens-inner {
        width: 4px;
        height: 4px;
      }

      .mobile-phone-frame .top-notch {
        width: 40px;
        height: 4px;
      }

      .mobile-phone-frame .btn-power {
        height: 0px;
      }

      .mobile-phone-frame .btn-vol-up,
      .mobile-phone-frame .btn-vol-down {
        height: 0px;
      }

      .mobile-phone-frame .btn-action {
        height: 0px;
      }

      .mobile-text-bottom {
        text-align: center;
        max-width: 420px;
      }

      .mobile-text-bottom p {
        margin: 0;

        color: #0e0e0e;

        font-family: "Mona Sans", sans-serif;

        font-size: 15.5px;

        line-height: 1.65;
      }

      .mobile-text-bottom strong {
        font-weight: 700;
      }
    `}</style>
  );
}