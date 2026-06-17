"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const QUOTE_TEXT = `"Nikita Began With A Single Conviction: That The Finest Homes Are Not Decorated, They Are Felt. Felt In The Weight Of A Kantha Quilt On A Cold Morning. In The Softness Of Hand-block Cotton Against The Skin. In The Quiet Beauty Of An Ajrakh-printed Cushion That Catches The Evening Light."`;

const WORD_DELAY = 90;   // ms between each word lighting up
const LIT_HOLD  = 1;     // how many words stay "lit" before turning to full dark
const PAUSE_END = 1800;  // ms pause at end before restarting

// Split preserving whitespace tokens so spacing is retained exactly
const tokens = QUOTE_TEXT.split(/(\s+)/);

export default function OurStorySection() {
  // wordStates: "dim" | "lit" | "past"  (indexed over non-whitespace spans only)
  const [wordStates, setWordStates] = useState(() =>
    tokens.map((t) => (t.trim() ? "dim" : null))
  );
  const timerRef = useRef(null);

  const run = useCallback(() => {
    // Reset all words to dim
    setWordStates(tokens.map((t) => (t.trim() ? "dim" : null)));

    let wordIdx = 0; // index in wordStates array (only word tokens)
    const wordTokenIdxs = tokens.reduce((acc, t, i) => {
      if (t.trim()) acc.push(i);
      return acc;
    }, []);

    const step = () => {
      if (wordIdx >= wordTokenIdxs.length) {
        timerRef.current = setTimeout(() => run(), PAUSE_END);
        return;
      }

      setWordStates((prev) => {
        const next = [...prev];
        // Light up current word
        next[wordTokenIdxs[wordIdx]] = "lit";
        // Settle the one before the hold window to "past"
        const settleAt = wordIdx - LIT_HOLD - 1;
        if (settleAt >= 0) next[wordTokenIdxs[settleAt]] = "past";
        return next;
      });

      wordIdx++;
      timerRef.current = setTimeout(step, WORD_DELAY);
    };

    timerRef.current = setTimeout(step, 80);
  }, []);

  useEffect(() => {
    run();
    return () => clearTimeout(timerRef.current);
  }, [run]);

  const colorFor = (state) => {
    if (state === "lit")  return "#7B7F5C";
    if (state === "past") return "#7B7F5C";
    return "#d8dac5"; // dim
  };

  return (
    <section className="w-full bg-[#FDFFF1] py-16 px-6 md:px-12 flex flex-col items-center justify-center text-center font-sans">

      {/* ── Animated Quote ───────────────────────────────────── */}
      <div className="max-w-5xl mb-8">
        <h2
          className="tracking-[-0.02em] leading-[160%]"
          style={{
            fontFamily: "'Tobias TRIAL', Georgia, serif",
            fontWeight: 600,
            fontSize: "clamp(1rem, 2.5vw, 1.875rem)",
          }}
        >
          {tokens.map((tok, i) => {
            const state = wordStates[i];
            if (state === null) {
              // whitespace token — render as-is
              return <span key={i}>{tok}</span>;
            }
            return (
              <span
                key={i}
                style={{
                  color: colorFor(state),
                  transition: "color 0.18s ease",
                  display: "inline",
                  whiteSpace: "pre-wrap",
                }}
              >
                {tok}
              </span>
            );
          })}
        </h2>
      </div>

      {/* ── Sub-paragraph ────────────────────────────────────── */}
      <div className="max-w-4xl text-[#8E8F7A] text-xs md:text-[13px] leading-[180%] font-light tracking-wide mb-14 px-4">
        <p className="mb-2">
          Since 2008, from our studio in Jaipur, we have been manufacturing and exporting artisan home furnishings and lifestyle textiles to homes across the world. Every piece is made by skilled hands who have inherited their craft. Every design carries the mark of our corner of Rajasthan.
        </p>
        <p className="font-medium italic text-[#7B7F5C]/90">
          This is not mass production. This is not trend-chasing. This is craft — slow, intentional, irreplaceable.
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 items-center justify-center border-b border-[#7B7F5C]/10 pb-12 mb-10">
        {[
          { num: "18", label: "Years of Craft" },
          { num: "30", label: "Countries Served" },
          { num: "15K", label: "Pieces Crafted" },
          { num: "80",  label: "Artisan Partners" },
        ].map(({ num, label }, i, arr) => (
          <div
            key={label}
            className={`flex flex-col items-center px-4 ${
              i < arr.length - 1 ? "md:border-r border-[#7B7F5C]/20" : ""
            }`}
          >
            <span
              className="text-3xl md:text-4xl text-[#7B7F5C] font-light tracking-tight mb-1"
              style={{ fontFamily: "'Tobias TRIAL', Georgia, serif" }}
            >
              {num}
              <span className="text-[#B5B79C] ml-0.5">+</span>
            </span>
            <span className="text-[11px] md:text-xs uppercase tracking-widest text-[#8E8F7A] font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── CTA Button ───────────────────────────────────────── */}
      <button className="bg-[#7B7F5C] hover:bg-[#686B4E] text-white text-xs tracking-widest uppercase font-medium py-3.5 px-8 flex items-center gap-2 transition-all shadow-sm">
        Discover Our Story
        <span className="text-xs font-light">→</span>
      </button>
    </section>
  );
}