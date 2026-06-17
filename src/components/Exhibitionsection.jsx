"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ─── Countdown Timer ───────────────────────────────────────────────
function useCountdown(target) {
  const calc = () => {
    const diff = new Date(target) - Date.now();
    if (diff <= 0) return { months: 0, days: 0, hours: 0, minutes: 0 };
    const total = Math.floor(diff / 1000);
    const minutes = Math.floor(total / 60) % 60;
    const hours = Math.floor(total / 3600) % 24;
    const days = Math.floor(total / 86400) % 30;
    const months = Math.floor(total / (86400 * 30));
    return { months, days, hours, minutes };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 60000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownBox({ label, value }) {
  return (
    <div style={cd.box}>
      <span style={cd.num}>{String(value).padStart(2, "0")}</span>
      <span style={cd.lbl}>{label}</span>
    </div>
  );
}

const cd = {
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  num: {
    fontSize: "clamp(20px, 3vw, 28px)",
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
    lineHeight: 1,
  },
  lbl: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
  },
};

// ─── Main Component ────────────────────────────────────────────────
export default function ExhibitionSection() {
  const FAIR_DATE = "2026-10-13T09:00:00";
  const time = useCountdown(FAIR_DATE);

  return (
    <main style={s.page}>

      {/* ── Hero Header ── */}
      <section style={s.heroHeader}>
        <p style={s.eyebrow}>EXHIBITION / FAIR</p>
        <h1 style={s.heroTitle}>Where The World, Comes To Find Jaipur's Finest</h1>
        <p style={s.heroSub}>
          From The Trade Halls Of Frankfurt To The Showrooms Of Paris, Hong Kong,
          And New York Nikita Home Furnishings Has Carried The Craft Of Rajasthan
          To The Most Important Home &amp; Textile Exhibitions On Earth For Nearly
          Two Decades.
        </p>
      </section>

      {/* ── Full-width Hero Image ── */}
      <div style={s.heroImgWrap}>
        <Image
          src="/images/new-arrivals-hero.jpg"
          alt="Nikita Home Furnishings exhibition bedroom"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* ── Two-col Story ── */}
      <section style={s.story}>
        <div style={s.storyLeft}>
          <h2 style={s.storyHeading}>
            Not Just Present At The World's, Great Fairs Remembered There
          </h2>
        </div>
        <div style={s.storyRight}>
          <p style={s.storyPara}>
            Exhibiting at international trade fairs is, for many companies, a
            formality. For Nikita Home Furnishings, it is the heartbeat of how we
            work. Each fair is a living showcase — not of products in a catalogue,
            but of craft held in your hands, patterns seen in full scale, fabrics
            touched and considered by buyers who know exactly what they are looking
            for.
          </p>
          <p style={s.storyPara}>
            The relationships that define our export business were born at these
            shows. Long-standing buyers from the UK, Germany, the USA, and across
            Asia first held a Nikita kantha quilt in Frankfurt, or saw a hand
            block-printed bedcover displayed in Paris, and understood immediately
            that something different was in front of them.
          </p>
          
        </div>
      </section>

      {/* ── Quote Band ── */}
      <section style={s.quoteBand}>
        <blockquote style={s.quoteText}>
          "Every fair is a conversation. You don't ship boxes to Frankfurt you carry
          the story of Jaipur's craftspeople into a room full of the world's most
          discerning buyers, and you let the fabric speak first."
        </blockquote>
        <p style={s.quoteAuthor}>
          — Jay Kumar Maheshwari, Founder, Nikita Home Furnishings
        </p>
      </section>

      {/* ── Upcoming Trade Fairs ── */}
      <section style={s.upcoming}>
        <h2 style={s.upcomingTitle}>Upcoming Trade Fairs</h2>
        <p style={s.upcomingSub}>
          Explore Extraordinary Art Exhibitions Discover groundbreaking exhibitions
          featuring the world's most innovative artists, designers, and creative minds.
        </p>

        {/* Delhi Fair Card Image */}
        <div style={s.fairImgWrap}>
          <Image
            src="/images/delhiex.png"
            alt="IHGF Delhi Fair Autumn 2026"
            fill
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
      </section>
    </main>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const TOBIAS = "'Tobias TRIAL', 'Georgia', serif";
const MONA = "'Mona Sans', 'Inter', sans-serif";
const PRIMARY = "#7B7F5C";
const BG = "#FDFFF1";

const s = {
  page: {
    background: BG,
    fontFamily: MONA,
    overflowX: "hidden",
  },

  // Hero header
  heroHeader: {
    textAlign: "center",
    paddingTop: "clamp(64px, 8vw, 110px)",
    paddingRight: "24px",
    paddingBottom: "40px",
    paddingLeft: "24px",
    maxWidth: "860px",
    margin: "0 auto",
  },
  eyebrow: {
    fontFamily: TOBIAS,
    fontSize: "clamp(22px, 3vw, 30px)",
    fontWeight: 500,
    color: PRIMARY,
    letterSpacing: "-0.02em",
    lineHeight: 1.6,
    margin: "0 0 8px",
  },
  heroTitle: {
    fontFamily: TOBIAS,
    fontSize: "clamp(20px, 2.5vw, 30px)",
    fontWeight: 500,
    color: PRIMARY,
    letterSpacing: "-0.02em",
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  heroSub: {
    fontFamily: MONA,
    fontSize: "clamp(14px, 1.8vw, 18px)",
    fontWeight: 400,
    color: "#2C2C2A",
    lineHeight: 1.7,
    margin: 0,
    textAlign: "center",
  },

  // Hero image
  heroImgWrap: {
    position: "relative",
    width: "100%",
    height: "clamp(220px, 38vw, 420px)",
  },

  // Story section
  story: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "72px 40px",
    alignItems: "start",
  },
  storyLeft: {},
  storyHeading: {
    fontFamily: TOBIAS,
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 500,
    color: PRIMARY,
    letterSpacing: "-0.04em",
    lineHeight: 1.2,
    margin: 0,
  },
  storyRight: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  storyPara: {
    fontFamily: MONA,
    fontSize: "15px",
    fontWeight: 400,
    color: "#2C2C2A",
    lineHeight: 1.8,
    margin: 0,
  },
  badge: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
  },
  badgeCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#2C2C2A",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Quote band
  quoteBand: {
    background: "#EDF0DD",
    padding: "56px 40px",
    textAlign: "center",
  },
  quoteText: {
    fontFamily: TOBIAS,
    fontSize: "clamp(16px, 2.2vw, 24px)",
    fontWeight: 500,
    fontStyle: "italic",
    color: "#2C2C2A",
    lineHeight: 1.7,
    maxWidth: "720px",
    margin: "0 auto 16px",
  },
  quoteAuthor: {
    fontFamily: MONA,
    fontSize: "15px",
    color: PRIMARY,
    fontWeight: 500,
    margin: 0,
  },

  // Upcoming section
  upcoming: {
    padding: "72px 24px 80px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  upcomingTitle: {
    fontFamily: TOBIAS,
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 500,
    color: PRIMARY,
    letterSpacing: "-0.04em",
    lineHeight: 1.6,
    textAlign: "center",
    margin: "0 0 12px",
  },
  upcomingSub: {
    fontFamily: MONA,
    fontSize: "15px",
    color: "#444",
    textAlign: "center",
    lineHeight: 1.7,
    margin: "0 0 36px",
  },

  // Fair image wrapper
  fairImgWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "12px",
    overflow: "hidden",
   
  },
  
};