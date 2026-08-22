"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import Image from "next/image";

// ======================================================
// API
// ======================================================

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

// ======================================================
// COUNTDOWN
// ======================================================

function useCountdown(target) {
  const calculate = useCallback(() => {
    if (!target) {
      return {
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        expired: true,
      };
    }

    const targetDate =
      new Date(target);

    // Invalid date
    if (
      Number.isNaN(
        targetDate.getTime()
      )
    ) {
      console.error(
        "INVALID COUNTDOWN DATE:",
        target
      );

      return {
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        expired: true,
      };
    }

    const now =
      Date.now();

    const difference =
      targetDate.getTime() -
      now;

    if (difference <= 0) {
      return {
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        expired: true,
      };
    }

    const totalSeconds =
      Math.floor(
        difference / 1000
      );

    const totalMinutes =
      Math.floor(
        totalSeconds / 60
      );

    const totalHours =
      Math.floor(
        totalMinutes / 60
      );

    const totalDays =
      Math.floor(
        totalHours / 24
      );

    const months =
      Math.floor(
        totalDays / 30
      );

    const days =
      totalDays % 30;

    const hours =
      totalHours % 24;

    const minutes =
      totalMinutes % 60;

    return {
      months,
      days,
      hours,
      minutes,
      expired: false,
    };
  }, [target]);

  const [
    time,
    setTime,
  ] = useState(
    calculate
  );

  useEffect(() => {
    setTime(
      calculate()
    );

    const timer =
      setInterval(() => {
        setTime(
          calculate()
        );
      }, 1000);

    return () =>
      clearInterval(
        timer
      );
  }, [
    calculate,
  ]);

  return time;
}

// ======================================================
// COUNTDOWN BOX
// ======================================================

function CountdownBox({
  label,
  value,
}) {
  return (
    <div style={cd.box}>
      <span style={cd.num}>
        {String(
          value || 0
        ).padStart(2, "0")}
      </span>

      <span style={cd.lbl}>
        {label}
      </span>
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
    fontSize:
      "clamp(20px, 3vw, 28px)",
    fontWeight: 700,
    color: "#fff",
    fontFamily:
      "'Mona Sans', 'Inter', sans-serif",
    lineHeight: 1,
  },

  lbl: {
    fontSize: "10px",
    color:
      "rgba(255,255,255,0.7)",
    textTransform:
      "uppercase",
    letterSpacing:
      "0.05em",
    fontFamily:
      "'Mona Sans', 'Inter', sans-serif",
  },
};

// ======================================================
// FETCH TRADE FAIRS
// ======================================================

async function fetchTradeFairs(
  type
) {
  try {
    const res =
      await fetch(
        `${BASE}/trade-fairs?type=${encodeURIComponent(
          type
        )}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache: "no-store",
        }
      );

    if (!res.ok) {
      throw new Error(
        `Failed to load ${type} trade fairs`
      );
    }

    const body =
      await res.json();

    return Array.isArray(
      body?.data?.fairs
    )
      ? body.data.fairs
      : [];
  } catch (error) {
    console.error(
      `TRADE FAIR ${type.toUpperCase()} ERROR:`,
      error
    );

    return [];
  }
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  } catch {
    return "";
  }
}

// ======================================================
// PAST TRADE FAIR SLIDER
// ======================================================

function MomentsSlider({
  fairs,
  loading,
}) {
  const trackRef =
    useRef(null);

  const autoplayRef =
    useRef(null);

  const isPausedRef =
    useRef(false);

  const [
    cardsPerView,
    setCardsPerView,
  ] = useState(4);

  const [
    activePage,
    setActivePage,
  ] = useState(0);

  // ----------------------------------------------------
  // RESPONSIVE CARDS
  // ----------------------------------------------------

  useEffect(() => {
    const updateCardsPerView =
      () => {
        setCardsPerView(
          window.innerWidth <=
            768
            ? 2
            : 4
        );
      };

    updateCardsPerView();

    window.addEventListener(
      "resize",
      updateCardsPerView
    );

    return () =>
      window.removeEventListener(
        "resize",
        updateCardsPerView
      );
  }, []);

  // ----------------------------------------------------
  // CONVERT FAIRS -> IMAGES
  // ----------------------------------------------------

  const images =
    fairs.flatMap(
      (fair) =>
        Array.isArray(
          fair?.images
        )
          ? fair.images.map(
              (image) => ({
                ...image,
                fairTitle:
                  fair.title,
                fairDescription:
                  fair.description,
              })
            )
          : []
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        images.length /
          cardsPerView
      )
    );

  // ----------------------------------------------------
  // RESET PAGE WHEN DATA CHANGES
  // ----------------------------------------------------

  useEffect(() => {
    setActivePage(0);

    if (
      trackRef.current
    ) {
      trackRef.current.scrollTo(
        {
          left: 0,
          behavior:
            "auto",
        }
      );
    }
  }, [
    images.length,
    cardsPerView,
  ]);

  // ----------------------------------------------------
  // GO TO PAGE
  // ----------------------------------------------------

  const goToPage =
    useCallback(
      (pageIndex) => {
        const track =
          trackRef.current;

        if (!track) {
          return;
        }

        const nextPage =
          (
            (pageIndex %
              totalPages) +
            totalPages
          ) % totalPages;

        track.scrollTo({
          left:
            nextPage *
            track.clientWidth,
          behavior:
            "smooth",
        });

        setActivePage(
          nextPage
        );
      },
      [totalPages]
    );

  // ----------------------------------------------------
  // AUTOPLAY
  // ----------------------------------------------------

  useEffect(() => {
    if (
      images.length <=
      cardsPerView
    ) {
      return;
    }

    autoplayRef.current =
      setInterval(() => {
        if (
          isPausedRef.current
        ) {
          return;
        }

        setActivePage(
          (prev) => {
            const next =
              (prev + 1) %
              totalPages;

            const track =
              trackRef.current;

            if (track) {
              track.scrollTo({
                left:
                  next *
                  track.clientWidth,
                behavior:
                  "smooth",
              });
            }

            return next;
          }
        );
      }, 3000);

    return () => {
      clearInterval(
        autoplayRef.current
      );
    };
  }, [
    images.length,
    cardsPerView,
    totalPages,
  ]);

  // ----------------------------------------------------
  // SCROLL SYNC
  // ----------------------------------------------------

  const handleScroll =
    () => {
      const track =
        trackRef.current;

      if (!track) {
        return;
      }

      const page =
        Math.round(
          track.scrollLeft /
            track.clientWidth
        );

      setActivePage(
        Math.max(
          0,
          Math.min(
            page,
            totalPages - 1
          )
        )
      );
    };

  const pause = () => {
    isPausedRef.current =
      true;
  };

  const resume = () => {
    isPausedRef.current =
      false;
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <section style={s.moments}>
      <p style={s.upcomingEyebrow}>
        — PAST TRADE FAIRS —
      </p>

      <h2 style={s.upcomingTitle}>
        Moments From Our Journey
      </h2>

      <style>{`
        .moments-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {loading ? (
        <div
          style={
            s.loadingGallery
          }
        >
          <span
            style={
              s.loadingDot
            }
          />
          <span>
            Loading past trade fairs...
          </span>
        </div>
      ) : images.length ===
        0 ? (
        <div
          style={
            s.emptyGallery
          }
        >
          No past trade fair moments available yet.
        </div>
      ) : (
        <>
          <div
            className="moments-track"
            style={
              s.momentsTrack
            }
            ref={trackRef}
            onScroll={
              handleScroll
            }
            onMouseEnter={
              pause
            }
            onMouseLeave={
              resume
            }
            onTouchStart={
              pause
            }
            onTouchEnd={
              resume
            }
            onTouchCancel={
              resume
            }
          >
            {images.map(
              (
                img,
                idx
              ) => (
                <div
                  key={
                    img?._id ||
                    `${img?.url}-${idx}`
                  }
                  style={{
                    ...s.momentCard,
                    flex: `0 0 calc(${
                      100 /
                      cardsPerView
                    }% - ${
                      ((cardsPerView -
                        1) *
                        16) /
                      cardsPerView
                    }px)`,
                  }}
                >
                  <div
                    style={
                      s.momentImgWrap
                    }
                  >
                    {img?.url ? (
                      <Image
                        src={
                          img.url
                        }
                        alt={
                          img.alt ||
                          img.fairTitle ||
                          "Trade fair moment"
                        }
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        style={{
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={
                          s.imagePlaceholder
                        }
                      />
                    )}
                  </div>

                  {img?.fairDescription && (
                    <p
                      style={
                        s.momentDescription
                      }
                    >
                      {
                        img.fairDescription
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          <div
            style={
              s.dotsWrap
            }
          >
            {Array.from({
              length:
                totalPages,
            }).map(
              (
                _,
                i
              ) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${
                    i + 1
                  }`}
                  onClick={() =>
                    goToPage(
                      i
                    )
                  }
                  style={{
                    ...s.dot,
                    ...(activePage ===
                    i
                      ? s.dotActive
                      : {}),
                  }}
                />
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ======================================================
// UPCOMING FAIR CARD
// ======================================================

function UpcomingTradeFair({
  fair,
  loading,
}) {
  const targetDate =
    fair?.date ||
    null;

  const time =
    useCountdown(
      targetDate
    );

  if (loading) {
    return (
      <section
        style={s.upcoming}
      >
        <h2
          style={
            s.upcomingTitle
          }
        >
          Upcoming Trade Fairs
        </h2>

        <p
          style={
            s.upcomingSub
          }
        >
          Explore Extraordinary Art Exhibitions Discover groundbreaking exhibitions
          featuring the world's most innovative artists, designers, and creative minds.
        </p>

        <div
          style={
            s.loadingFair
          }
        >
          Loading upcoming trade fair...
        </div>
      </section>
    );
  }

  if (!fair) {
    return (
      <section
        style={s.upcoming}
      >
        <h2
          style={
            s.upcomingTitle
          }
        >
          Upcoming Trade Fairs
        </h2>

        <p
          style={
            s.upcomingSub
          }
        >
          Explore Extraordinary Art Exhibitions Discover groundbreaking exhibitions
          featuring the world's most innovative artists, designers, and creative minds.
        </p>

        <div
          style={
            s.emptyFair
          }
        >
          No upcoming trade fair has been published yet.
        </div>
      </section>
    );
  }

  const heroImage =
    fair?.images?.[0]
      ?.url || "";

  return (
    <section style={s.upcoming}>
      <h2
        style={
          s.upcomingTitle
        }
      >
        Upcoming Trade Fairs
      </h2>

      <p
        style={
          s.upcomingSub
        }
      >
        Explore Extraordinary Art Exhibitions Discover groundbreaking exhibitions
        featuring the world's most innovative artists, designers, and creative minds.
      </p>

      {/* ==================================================
          IMAGE
      ================================================== */}

      {heroImage && (
        <div
          style={
            s.fairImgWrap
          }
        >
          <Image
            src={
              heroImage
            }
            alt={
              fair.title ||
              "Upcoming trade fair"
            }
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            style={{
              objectFit:
                "cover",
              objectPosition:
                "center",
            }}
          />
        </div>
      )}

      {/* ==================================================
          FAIR INFO
      ================================================== */}

      <div
        style={
          s.fairContent
        }
      >
        <p
          style={
            s.sourcingTag
          }
        >
          UPCOMING TRADE FAIR
        </p>

        <h3
          style={
            s.fairTitle
          }
        >
          {fair.title}
        </h3>

        {fair.description && (
          <p
            style={
              s.fairDescription
            }
          >
            {
              fair.description
            }
          </p>
        )}

        {/* ==================================================
            INFO ROW
        ================================================== */}

        <div
          style={
            s.infoGrid
          }
        >
          {(fair.venue ||
            fair.location) && (
            <div
              style={
                s.infoBlock
              }
            >
              <span
                style={
                  s.infoLabel
                }
              >
                Venue
              </span>

              <strong
                style={
                  s.infoValue
                }
              >
                {
                  fair.venue ||
                  fair.location
                }
              </strong>
            </div>
          )}

          {(fair.dateText ||
            fair.date) && (
            <div
              style={
                s.infoBlock
              }
            >
              <span
                style={
                  s.infoLabel
                }
              >
                Dates
              </span>

              <strong
                style={
                  s.infoValue
                }
              >
                {fair.dateText ||
                  formatDate(
                    fair.date
                  )}
              </strong>
            </div>
          )}

          {fair.timing && (
            <div
              style={
                s.infoBlock
              }
            >
              <span
                style={
                  s.infoLabel
                }
              >
                Timings
              </span>

              <strong
                style={
                  s.infoValue
                }
              >
                {
                  fair.timing
                }
              </strong>
            </div>
          )}
        </div>

        {/* ==================================================
            COUNTDOWN
        ================================================== */}

        {fair.date && (
          <div
            style={
              s.countdown
            }
          >
            <div
              style={
                s.countdownHeader
              }
            >
              <span>
                {
                  fair.title
                }
              </span>

              <span
                style={
                  s.countdownCaption
                }
              >
                Countdown to the Fair
              </span>
            </div>

            <div
              style={
                s.countdownGrid
              }
            >
              <CountdownBox
                label="MONTHS"
                value={
                  time.months
                }
              />

              <CountdownBox
                label="DAYS"
                value={
                  time.days
                }
              />

              <CountdownBox
                label="HOURS"
                value={
                  time.hours
                }
              />

              <CountdownBox
                label="MINS"
                value={
                  time.minutes
                }
              />
            </div>

            <p
              style={
                s.countdownFooter
              }
            >
              Fair opens:{" "}
              {fair.dateText ||
                formatDate(
                  fair.date
                )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ======================================================
// MAIN
// ======================================================

export default function ExhibitionSection() {
  const [
    pastFairs,
    setPastFairs,
  ] = useState([]);

  const [
    upcomingFairs,
    setUpcomingFairs,
  ] = useState([]);

  const [
    loadingPast,
    setLoadingPast,
  ] = useState(true);

  const [
    loadingUpcoming,
    setLoadingUpcoming,
  ] = useState(true);

  // ====================================================
  // FETCH DATA
  // ====================================================

  useEffect(() => {
    let mounted =
      true;

    const load = async () => {
      try {
        const [
          past,
          upcoming,
        ] = await Promise.all([
          fetchTradeFairs(
            "past"
          ),
          fetchTradeFairs(
            "upcoming"
          ),
        ]);

        if (
          !mounted
        ) {
          return;
        }

        setPastFairs(
          past
        );

        setUpcomingFairs(
          upcoming
        );

        setLoadingPast(
          false
        );

        setLoadingUpcoming(
          false
        );
      } catch (
        error
      ) {
        console.error(
          "EXHIBITION DATA ERROR:",
          error
        );

        if (
          mounted
        ) {
          setLoadingPast(
            false
          );

          setLoadingUpcoming(
            false
          );
        }
      }
    };

    load();

    return () => {
      mounted =
        false;
    };
  }, []);

  /*
   * Backend may contain multiple upcoming records.
   * For the current design, show the first active one.
   */
  const upcomingFair =
    upcomingFairs?.[0] ||
    null;

  return (
    <main style={s.page}>

      {/* ==================================================
          HERO HEADER
      ================================================== */}

      <section
        style={
          s.heroHeader
        }
      >
        <p
          style={s.eyebrow}
        >
          EXHIBITION / FAIR
        </p>

        <h1
          style={
            s.heroTitle
          }
        >
          Where The World, Comes To Find Jaipur&apos;s Finest
        </h1>

        <p
          style={
            s.heroSub
          }
        >
          From The Trade Halls Of Frankfurt To The Showrooms Of Paris, Hong Kong,
          And New York Nikita Home Furnishings Has Carried The Craft Of Rajasthan
          To The Most Important Home &amp; Textile Exhibitions On Earth For Nearly
          Two Decades.
        </p>
      </section>


      {/* ==================================================
          HERO IMAGE
          Existing design stays unchanged
      ================================================== */}

      <div
        style={
          s.heroImgWrap
        }
      >
        <Image
          src="/images/new-arrivals-hero.jpg"
          alt="Nikita Home Furnishings exhibition bedroom"
          fill
          style={{
            objectFit:
              "cover",
            objectPosition:
              "center",
          }}
          priority
        />
      </div>


      {/* ==================================================
          STORY
      ================================================== */}

      <section
        style={s.story}
      >
        <div
          style={
            s.storyLeft
          }
        >
          <h2
            style={
              s.storyHeading
            }
          >
            Not Just Present At The World&apos;s, Great Fairs Remembered There
          </h2>
        </div>

        <div
          style={
            s.storyRight
          }
        >
          <p
            style={
              s.storyPara
            }
          >
            Exhibiting at international trade fairs is, for many companies, a
            formality. For Nikita Home Furnishings, it is the heartbeat of how we
            work. Each fair is a living showcase — not of products in a catalogue,
            but of craft held in your hands, patterns seen in full scale, fabrics
            touched and considered by buyers who know exactly what they are looking
            for.
          </p>

          <p
            style={
              s.storyPara
            }
          >
            The relationships that define our export business were born at these
            shows. Long-standing buyers from the UK, Germany, the USA, and across
            Asia first held a Nikita kantha quilt in Frankfurt, or saw a hand
            block-printed bedcover displayed in Paris, and understood immediately
            that something different was in front of them.
          </p>
        </div>
      </section>


      {/* ==================================================
          QUOTE
      ================================================== */}

      <section
        style={
          s.quoteBand
        }
      >
        <blockquote
          style={
            s.quoteText
          }
        >
          &quot;Every fair is a conversation. You don&apos;t ship boxes to Frankfurt; you carry
          the story of Jaipur&apos;s craftspeople into a room full of the world&apos;s most
          discerning buyers, and you let the fabric speak first.&quot;
        </blockquote>

        <p
          style={
            s.quoteAuthor
          }
        >
          — Jay Kumar Maheshwari, Founder, Nikita Home Furnishings
        </p>
      </section>


      {/* ==================================================
          PAST TRADE FAIRS
      ================================================== */}

      <MomentsSlider
        fairs={
          pastFairs
        }
        loading={
          loadingPast
        }
      />


      {/* ==================================================
          UPCOMING TRADE FAIR
      ================================================== */}

      <UpcomingTradeFair
        fair={
          upcomingFair
        }
        loading={
          loadingUpcoming
        }
      />

    </main>
  );
}

// ======================================================
// STYLES
// ======================================================

const TOBIAS =
  "'Tobias TRIAL', 'Georgia', serif";

const MONA =
  "'Mona Sans', 'Inter', sans-serif";

const PRIMARY =
  "#7B7F5C";

const BG =
  "#FDFFF1";

const s = {
  page: {
    background:
      BG,
    fontFamily:
      MONA,
    overflowX:
      "hidden",
  },

  // ====================================================
  // HERO
  // ====================================================

  heroHeader: {
    textAlign:
      "center",
    paddingTop:
      "clamp(64px, 8vw, 110px)",
    paddingRight:
      "24px",
    paddingBottom:
      "40px",
    paddingLeft:
      "24px",
    maxWidth:
      "860px",
    margin:
      "0 auto",
  },

  eyebrow: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(22px, 3vw, 30px)",
    fontWeight:
      500,
    color:
      PRIMARY,
    letterSpacing:
      "-0.02em",
    lineHeight:
      1.6,
    margin:
      "0 0 8px",
  },

  heroTitle: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(20px, 2.5vw, 30px)",
    fontWeight:
      500,
    color:
      PRIMARY,
    letterSpacing:
      "-0.02em",
    lineHeight:
      1.6,
    margin:
      "0 0 20px",
  },

  heroSub: {
    fontFamily:
      MONA,
    fontSize:
      "clamp(14px, 1.8vw, 18px)",
    fontWeight:
      400,
    color:
      "#2C2C2A",
    lineHeight:
      1.7,
    margin: 0,
    textAlign:
      "center",
  },

  heroImgWrap: {
    position:
      "relative",
    width:
      "100%",
    height:
      "clamp(220px, 38vw, 420px)",
  },

  // ====================================================
  // STORY
  // ====================================================

  story: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap:
      "40px",
    maxWidth:
      "1200px",
    margin:
      "0 auto",
    padding:
      "72px 40px",
    alignItems:
      "start",
  },

  storyLeft: {},

  storyHeading: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(28px, 4vw, 44px)",
    fontWeight:
      500,
    color:
      PRIMARY,
    letterSpacing:
      "-0.04em",
    lineHeight:
      1.2,
    margin: 0,
  },

  storyRight: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "16px",
  },

  storyPara: {
    fontFamily:
      MONA,
    fontSize:
      "15px",
    fontWeight:
      400,
    color:
      "#2C2C2A",
    lineHeight:
      1.8,
    margin: 0,
  },

  // ====================================================
  // QUOTE
  // ====================================================

  quoteBand: {
    background:
      "#EDF0DD",
    padding:
      "56px 40px",
    textAlign:
      "center",
  },

  quoteText: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(16px, 2.2vw, 24px)",
    fontWeight:
      500,
    fontStyle:
      "italic",
    color:
      "#2C2C2A",
    lineHeight:
      1.7,
    maxWidth:
      "720px",
    margin:
      "0 auto 16px",
  },

  quoteAuthor: {
    fontFamily:
      MONA,
    fontSize:
      "15px",
    color:
      PRIMARY,
    fontWeight:
      500,
    margin: 0,
  },

  // ====================================================
  // PAST FAIRS
  // ====================================================

  moments: {
    padding:
      "72px 40px 56px",
    maxWidth:
      "1400px",
    margin:
      "0 auto",
    textAlign:
      "center",
  },

  upcomingEyebrow: {
    fontFamily:
      MONA,
    fontSize:
      "13px",
    letterSpacing:
      "0.1em",
    color:
      PRIMARY,
    margin:
      "0 0 8px",
  },

  upcomingTitle: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(28px, 4vw, 44px)",
    fontWeight:
      500,
    color:
      PRIMARY,
    letterSpacing:
      "-0.04em",
    lineHeight:
      1.2,
    textAlign:
      "center",
    margin:
      "0 0 12px",
  },

  momentsTrack: {
    display:
      "flex",
    gap:
      "16px",
    overflowX:
      "auto",
    scrollSnapType:
      "x mandatory",
    scrollBehavior:
      "smooth",
    WebkitOverflowScrolling:
      "touch",
    scrollbarWidth:
      "none",
    marginTop:
      "32px",
    userSelect:
      "none",
  },

  momentCard: {
    scrollSnapAlign:
      "start",
  },

 momentImgWrap: {
  position: "relative",
  width: "360px",
  height: "430px",
  borderRadius: "8px",
  overflow: "hidden",
  background: "#e5e5e0",
  flexShrink: 0,
},

  momentDescription: {
    margin:
      "10px 4px 0",
    color:
      "#666",
    fontSize:
      "12px",
    lineHeight:
      1.5,
    textAlign:
      "left",
  },

  dotsWrap: {
    display:
      "flex",
    justifyContent:
      "center",
    alignItems:
      "center",
    gap:
      "8px",
    marginTop:
      "20px",
  },

  dot: {
    width:
      "8px",
    height:
      "8px",
    borderRadius:
      "50%",
    border:
      "none",
    background:
      "#D8DBC6",
    cursor:
      "pointer",
    padding: 0,
    transition:
      "all 0.25s ease",
  },

  dotActive: {
    background:
      PRIMARY,
    width:
      "22px",
    borderRadius:
      "6px",
  },

  loadingGallery: {
    minHeight:
      "220px",
    display:
      "flex",
    justifyContent:
      "center",
    alignItems:
      "center",
    gap:
      "10px",
    color:
      "#777",
    fontSize:
      "14px",
  },

  loadingDot: {
    width:
      "8px",
    height:
      "8px",
    borderRadius:
      "50%",
    background:
      PRIMARY,
  },

  emptyGallery: {
    padding:
      "50px 20px",
    color:
      "#777",
    fontSize:
      "14px",
  },

  imagePlaceholder: {
    width:
      "100%",
    height:
      "100%",
    background:
      "#e5e5e0",
  },

  // ====================================================
  // UPCOMING
  // ====================================================

  upcoming: {
    padding:
      "72px 24px 80px",
    maxWidth:
      "900px",
    margin:
      "0 auto",
  },

  upcomingSub: {
    fontFamily:
      MONA,
    fontSize:
      "15px",
    color:
      "#444",
    textAlign:
      "center",
    lineHeight:
      1.7,
    margin:
      "0 0 36px",
  },

  fairImgWrap: {
    position:
      "relative",
    width:
      "100%",
    aspectRatio:
      "16 / 9",
    borderRadius:
      "12px",
    overflow:
      "hidden",
    background:
      "#ecece5",
  },

  fairContent: {
    marginTop:
      "28px",
  },

  sourcingTag: {
    fontFamily:
      MONA,
    fontSize:
      "11px",
    letterSpacing:
      "0.12em",
    color:
      PRIMARY,
    margin:
      "0 0 8px",
    textTransform:
      "uppercase",
  },

  fairTitle: {
    fontFamily:
      TOBIAS,
    fontSize:
      "clamp(26px, 4vw, 40px)",
    fontWeight:
      500,
    color:
      PRIMARY,
    lineHeight:
      1.2,
    margin:
      "0 0 16px",
  },

  fairDescription: {
    fontFamily:
      MONA,
    color:
      "#444",
    fontSize:
      "15px",
    lineHeight:
      1.8,
    margin:
      "0 0 28px",
  },

  infoGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap:
      "1px",
    background:
      "#d8dac9",
    border:
      "1px solid #d8dac9",
    marginBottom:
      "28px",
  },

  infoBlock: {
    background:
      BG,
    padding:
      "18px 16px",
    minHeight:
      "86px",
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "7px",
    justifyContent:
      "center",
  },

  infoLabel: {
    fontFamily:
      MONA,
    fontSize:
      "10px",
    color:
      PRIMARY,
    textTransform:
      "uppercase",
    letterSpacing:
      "0.1em",
  },

  infoValue: {
    fontFamily:
      MONA,
    fontSize:
      "13px",
    fontWeight:
      600,
    color:
      "#222",
    lineHeight:
      1.5,
  },

  countdown: {
    background:
      "#2D527B",
    borderRadius:
      "12px",
    padding:
      "24px 22px 20px",
    color:
      "#fff",
  },

  countdownHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "12px",
    marginBottom:
      "22px",
    fontFamily:
      MONA,
    fontSize:
      "13px",
    fontWeight:
      600,
    flexWrap:
      "wrap",
  },

  countdownCaption: {
    fontSize:
      "11px",
    fontWeight:
      400,
    color:
      "rgba(255,255,255,0.72)",
  },

  countdownGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap:
      "18px",
  },

  countdownFooter: {
    margin:
      "22px 0 0",
    paddingTop:
      "12px",
    borderTop:
      "1px solid rgba(255,255,255,0.16)",
    fontFamily:
      MONA,
    fontSize:
      "11px",
    color:
      "rgba(255,255,255,0.75)",
    textAlign:
      "center",
  },

  loadingFair: {
    minHeight:
      "260px",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    color:
      "#777",
    fontFamily:
      MONA,
    fontSize:
      "14px",
  },

  emptyFair: {
    padding:
      "60px 20px",
    textAlign:
      "center",
    color:
      "#777",
    fontFamily:
      MONA,
    fontSize:
      "14px",
    background:
      "#f7f8ef",
    borderRadius:
      "12px",
  },
};