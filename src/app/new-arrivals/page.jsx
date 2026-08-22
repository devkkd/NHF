"use client";

import {
  useState,
  useEffect,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import {
  addToCart,
  updateQty,
} from "@/lib/cart";

import {
  toggleWishlist,
  getWishlist,
} from "@/lib/wishlist";


// ======================================================
// CONFIG
// ======================================================

const BASE =
  (
    process.env
      .NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api/v1"
  ).replace(
    /\/$/,
    ""
  );

const ACCENT =
  "#7b7f5c";

const BG =
  "#fdfff1";

const BORDER =
  "#c8cab4";

const LIMIT =
  12;


// ======================================================
// FETCH NEW ARRIVALS
// ======================================================

async function fetchNewArrivals(
  page = 1
) {
  try {
    const res =
      await fetch(
        `${BASE}/products?newArrivals=true&page=${page}&limit=${LIMIT}`,
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json",
          },

          cache:
            "no-store",
        }
      );

    if (
      !res.ok
    ) {
      return {
        products: [],
        total: 0,
        pages: 1,
      };
    }

    const body =
      await res.json();

    return (
      body?.data ?? {
        products: [],
        total: 0,
        pages: 1,
      }
    );
  } catch (error) {
    console.error(
      "NEW ARRIVALS ERROR:",
      error
    );

    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }
}


// ======================================================
// LOGIN CHECK
// ======================================================

function isLoggedIn() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return Boolean(
    localStorage.getItem(
      "accessToken"
    )
  );
}


// ======================================================
// PAGE
// ======================================================

export default function NewArrivalsPage() {
  const router =
    useRouter();

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    pages,
    setPages,
  ] = useState(1);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    quantities,
    setQuantities,
  ] = useState({});

  const [
    wishlist,
    setWishlist,
  ] = useState({});


  // ====================================================
  // REDIRECT TO LOGIN
  // ====================================================

  const redirectToLogin =
    (
      redirect = "/"
    ) => {
      router.push(
        `/login?redirect=${encodeURIComponent(
          redirect
        )}`
      );
    };


  // ====================================================
  // GUEST LOGIN FLOW
  // ====================================================

  const openLoginForAction =
    ({
      type,
      product,
    }) => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      /*
       * ----------------------------------------------
       * SAVE PENDING ACTION
       * ----------------------------------------------
       */

      if (
        type ===
        "cart"
      ) {
        sessionStorage.setItem(
          "pendingCartProduct",
          JSON.stringify({
            product,
            quantity: 1,
          })
        );

        sessionStorage.setItem(
          "pendingCartRedirect",
          window.location.pathname +
            window.location.search
        );
      }

      if (
        type ===
        "wishlist"
      ) {
        sessionStorage.setItem(
          "pendingWishlistProduct",
          JSON.stringify({
            product,
          })
        );

        sessionStorage.setItem(
          "pendingWishlistRedirect",
          window.location.pathname +
            window.location.search
        );
      }

      if (
        type ===
        "buy-now"
      ) {
        sessionStorage.setItem(
          "pendingBuyNowProduct",
          JSON.stringify({
            product,
            quantity: 1,
          })
        );
      }

      /*
       * ----------------------------------------------
       * TOAST
       * ----------------------------------------------
       */

      toast.error("Please login first", {
        duration: 2200,
      });

      /*
       * ----------------------------------------------
       * LOGIN PAGE
       *
       * Tumhare current Header mein actual
       * login popup component nahi hai.
       * Header guest ko /login par hi bhejta hai.
       *
       * Isliye same existing login UI use karna.
       * ----------------------------------------------
       */

      setTimeout(
        () => {
          if (
            type ===
            "buy-now"
          ) {
            redirectToLogin(
              "/checkout"
            );
          } else {
            redirectToLogin(
              window.location.pathname +
                window.location.search
            );
          }
        },
        650
      );
    };


  // ====================================================
  // LOAD WISHLIST
  // ====================================================

  useEffect(() => {
    let mounted =
      true;

    const loadWishlist =
      async () => {
        try {
          /*
           * Guest ke liye protected
           * wishlist API ko call mat karo.
           */
          if (
            !isLoggedIn()
          ) {
            if (
              mounted
            ) {
              setWishlist(
                {}
              );
            }

            return;
          }

          const saved =
            await getWishlist();

          if (
            !Array.isArray(
              saved
            )
          ) {
            return;
          }

          const map =
            {};

          saved.forEach(
            (
              item
            ) => {
              if (
                item?.slug
              ) {
                map[
                  item.slug
                ] = true;
              }
            }
          );

          if (
            mounted
          ) {
            setWishlist(
              map
            );
          }
        } catch (
          error
        ) {
          console.error(
            "LOAD WISHLIST ERROR:",
            error
          );
        }
      };

    loadWishlist();

    return () => {
      mounted =
        false;
    };
  }, []);


  // ====================================================
  // LOAD PRODUCTS
  // ====================================================

  useEffect(() => {
    let mounted =
      true;

    setLoading(
      true
    );

    fetchNewArrivals(
      page
    ).then(
      (
        data
      ) => {
        if (
          !mounted
        ) {
          return;
        }

        setProducts(
          data.products ??
            []
        );

        setTotal(
          data.total ??
            0
        );

        setPages(
          data.pages ??
            1
        );

        setLoading(
          false
        );
      }
    );

    if (
      typeof window !==
      "undefined"
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    return () => {
      mounted =
        false;
    };
  }, [
    page,
  ]);


  // ====================================================
  // SAVED / WISHLIST
  // ====================================================

  const handleToggleWishlist =
    async (
      e,
      product
    ) => {
      e.preventDefault();
      e.stopPropagation();

      /*
       * ================================================
       * NOT LOGGED IN
       * ================================================
       */

      if (
        !isLoggedIn()
      ) {
        openLoginForAction({
          type:
            "wishlist",

          product,
        });

        return;
      }

      /*
       * ================================================
       * LOGGED IN
       * ================================================
       */

      try {
        const nowSaved =
          await toggleWishlist(
            product
          );

        setWishlist(
          (
            prev
          ) => {
            const copy =
              {
                ...prev,
              };

            if (
              nowSaved
            ) {
              copy[
                product.slug
              ] =
                true;
            } else {
              delete copy[
                product.slug
              ];
            }

            return copy;
          }
        );
      } catch (
        error
      ) {
        console.error(
          "WISHLIST ERROR:",
          error
        );
      }
    };


  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart =
    async (
      e,
      product
    ) => {
      e.preventDefault();
      e.stopPropagation();

      /*
       * ================================================
       * NOT LOGGED IN
       * ================================================
       */

      if (
        !isLoggedIn()
      ) {
        openLoginForAction({
          type:
            "cart",

          product,
        });

        return;
      }

      /*
       * ================================================
       * LOGGED IN
       * ================================================
       */

      try {
        await addToCart(
          product,
          1
        );

        setQuantities(
          (
            prev
          ) => ({
            ...prev,

            [product.slug]:
              1,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "ADD TO CART ERROR:",
          error
        );
      }
    };


  // ====================================================
  // INCREASE QUANTITY
  // ====================================================

  const increaseQty =
    async (
      e,
      product
    ) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        openLoginForAction({
          type:
            "cart",

          product,
        });

        return;
      }

      const qty =
        (
          quantities[
            product.slug
          ] || 1
        ) + 1;

      try {
        await updateQty(
          product._id,
          qty
        );

        setQuantities(
          (
            prev
          ) => ({
            ...prev,

            [product.slug]:
              qty,
          })
        );
      } catch (
        error
      ) {
        console.error(
          "INCREASE QTY ERROR:",
          error
        );
      }
    };


  // ====================================================
  // DECREASE QUANTITY
  // ====================================================

  const decreaseQty =
    async (
      e,
      product
    ) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        !isLoggedIn()
      ) {
        openLoginForAction({
          type:
            "cart",

          product,
        });

        return;
      }

      const qty =
        (
          quantities[
            product.slug
          ] || 1
        ) - 1;

      try {
        if (
          qty <=
          0
        ) {
          await updateQty(
            product._id,
            0
          );

          setQuantities(
            (
              prev
            ) => {
              const copy =
                {
                  ...prev,
                };

              delete copy[
                product.slug
              ];

              return copy;
            }
          );
        } else {
          await updateQty(
            product._id,
            qty
          );

          setQuantities(
            (
              prev
            ) => ({
              ...prev,

              [product.slug]:
                qty,
            })
          );
        }
      } catch (
        error
      ) {
        console.error(
          "DECREASE QTY ERROR:",
          error
        );
      }
    };


  // ====================================================
  // PAGE NUMBERS (for pagination bar)
  // ====================================================

  const getPageNumbers = () => {
    const arr = [];
    const maxToShow = 5;

    if (pages <= maxToShow) {
      for (let i = 1; i <= pages; i++) arr.push(i);
      return arr;
    }

    let start = Math.max(1, page - 2);
    let end = Math.min(pages, start + maxToShow - 1);

    if (end - start < maxToShow - 1) {
      start = Math.max(1, end - maxToShow + 1);
    }

    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };


  // ====================================================
  // SHOWING
  // ====================================================

  const showingFrom =
    total === 0
      ? 0
      : (page - 1) * LIMIT + 1;

  const showingTo =
    Math.min(
      page *
        LIMIT,
      total
    );


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="na-page">

      {/* ==================================================
          HERO
      ================================================== */}

      <div className="na-hero">

        <img
          src="/images/new-arrivals-hero.jpg"
          alt="New Arrivals"
          className="na-hero-img"
        />

        <div className="na-hero-overlay">
          <h1 className="na-hero-title">
            NEW ARRIVALS
          </h1>
        </div>

      </div>


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="na-header">

        <h2 className="na-heading">
          New Arrivals
        </h2>

        <a
          href="/enquiry"
          className="na-bulk-link"
        >
          Bulk Order Request →
        </a>

      </div>


      {/* ==================================================
          CONTROLS
      ================================================== */}

      <div className="na-controls">

        <span className="na-count">
          {loading
            ? "Loading…"
            : `${total} Products`}
        </span>

      </div>


      {/* ==================================================
          GRID
      ================================================== */}

      <div className="na-grid">

        {loading ? (
          Array.from({
            length:
              LIMIT,
          }).map(
            (
              _,
              i
            ) => (
              <CardSkeleton
                key={
                  i
                }
              />
            )
          )
        ) : products.length ===
          0 ? (
          <div className="na-empty">

            <p>
              No new arrivals yet.
            </p>

            <Link
              href="/"
              style={{
                color:
                  ACCENT,

                fontSize:
                  14,
              }}
            >
              ← Back to Home
            </Link>

          </div>
        ) : (
          products.map(
            (
              product
            ) => (
              <Link
                href={`/products/${product.slug}`}
                key={
                  product._id
                }
                className="na-card-link"
              >

                <div className="na-card">

                  {/* IMAGE */}

                  <div className="na-img-wrap">

                    {product.mainImage ? (
                      <img
                        src={
                          product.mainImage
                        }
                        alt={
                          product.name
                        }
                        className="na-img"
                      />
                    ) : (
                      <div className="na-img-placeholder" />
                    )}

                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={`na-wishlist${
                        wishlist[
                          product.slug
                        ]
                          ? " active"
                          : ""
                      }`}
                      onClick={(
                        e
                      ) =>
                        handleToggleWishlist(
                          e,
                          product
                        )
                      }
                      aria-label="Wishlist"
                    >
                      {
                        wishlist[
                          product.slug
                        ]
                          ? "♥"
                          : "♡"
                      }
                    </button>

                  </div>


                  {/* INFO */}

                  <div className="na-info">

                    <div className="na-name-row">

                      <h3 className="na-name">
                        {product.name?.toUpperCase()}
                      </h3>

                      <span className="na-name-rule" />

                    </div>


                    <p className="na-price">
                      ₹
                      {Number(
                        product.price ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>


                    <div className="na-actions">

                      {/* BULK ENQUIRY */}

                      <button
                        type="button"
                        className="na-btn-enquiry"
                        onClick={(
                          e
                        ) => {
                          e.preventDefault();
                          e.stopPropagation();

                          router.push(
                            `/enquiry1/${product.slug}`
                          );
                        }}
                      >
                        BULK PRICE ENQUIRY ↗
                      </button>


                      {/* ADD TO CART */}

                      {!quantities[
                        product.slug
                      ] ? (
                        <button
                          type="button"
                          className="na-btn-cart"
                          onClick={(
                            e
                          ) =>
                            handleAddToCart(
                              e,
                              product
                            )
                          }
                        >
                          <span className="na-cart-dot">
                            •
                          </span>
                          ADD TO CART
                        </button>
                      ) : (
                        <div
                          className="na-qty"
                          onClick={(
                            e
                          ) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >

                          <button
                            type="button"
                            onClick={(
                              e
                            ) =>
                              decreaseQty(
                                e,
                                product
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {
                              quantities[
                                product.slug
                              ]
                            }
                          </span>

                          <button
                            type="button"
                            onClick={(
                              e
                            ) =>
                              increaseQty(
                                e,
                                product
                              )
                            }
                          >
                            +
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </Link>
            )
          )
        )}

      </div>


      {/* ==================================================
          PAGINATION
      ================================================== */}

      {!loading &&
        total >
          0 && (
          <div className="na-pagination">

            <p className="na-showing">
              Showing {showingFrom} – {showingTo} of {total}
            </p>

            {pages > 1 && (
              <div className="na-pagenums">

                <button
                  type="button"
                  className="na-pagebtn na-pagebtn-arrow"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {getPageNumbers()[0] > 1 && (
                  <>
                    <button
                      type="button"
                      className="na-pagebtn"
                      onClick={() => setPage(1)}
                    >
                      1
                    </button>
                    {getPageNumbers()[0] > 2 && (
                      <span className="na-pagedots">…</span>
                    )}
                  </>
                )}

                {getPageNumbers().map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`na-pagebtn${
                      n === page ? " active" : ""
                    }`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] <
                  pages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] <
                      pages - 1 && (
                      <span className="na-pagedots">…</span>
                    )}
                    <button
                      type="button"
                      className="na-pagebtn"
                      onClick={() => setPage(pages)}
                    >
                      {pages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="na-pagebtn na-pagebtn-arrow"
                  disabled={page >= pages}
                  onClick={() =>
                    setPage((p) => Math.min(pages, p + 1))
                  }
                  aria-label="Next page"
                >
                  ›
                </button>

              </div>
            )}

            <button
              type="button"
              className="na-back-top"
              onClick={() =>
                window.scrollTo(
                  {
                    top: 0,
                    behavior:
                      "smooth",
                  }
                )
              }
            >
              ↑ BACK TO TOP
            </button>

          </div>
        )}


      {/* ==================================================
          STYLES
      ================================================== */}

      <style jsx>{`

        .na-page {
          background: ${BG};
          min-height: 100vh;
        }


        /* ===============================================
           HERO
        =============================================== */

        .na-hero {
          position: relative;
          width: 100%;
          height: 440px;
          overflow: hidden;
        }

        .na-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .na-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .na-hero-title {
          font-family: "Tobias TRIAL", serif;
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.08em;
          margin: 0;
        }


        /* ===============================================
           HEADER
        =============================================== */

        .na-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 36px 60px 20px;
          gap: 16px;
        }

        .na-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 40px;
          font-weight: 500;
          color: ${ACCENT};
          letter-spacing: -0.02em;
          margin: 0;
        }

        .na-bulk-link {
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          color: ${ACCENT};
          text-decoration: none;
          border-bottom: 1px solid ${ACCENT};
          padding-bottom: 2px;
          white-space: nowrap;
        }


        /* ===============================================
           CONTROLS
        =============================================== */

        .na-controls {
          display: flex;
          justify-content: flex-end;
          padding: 0 60px 16px;
        }

        .na-count {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #555;
        }


        /* ===============================================
           GRID
        =============================================== */

        .na-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: start;
          gap: 28px 20px;
          padding: 0 60px 40px;
          max-width: 1800px;
          margin: 0 auto;
        }

        .na-card-link {
          text-decoration: none;
          display: block;
          width: 100%;
        }

        .na-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 14px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid #e2e3d7;
          border-radius: 22px;
          box-shadow:
            0 12px 34px rgba(61, 67, 41, 0.08),
            0 2px 8px rgba(61, 67, 41, 0.04);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .na-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 18px 42px rgba(61, 67, 41, 0.12),
            0 4px 12px rgba(61, 67, 41, 0.05);
        }

        .na-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 15px;
          overflow: hidden;
          background: #e8e9da;
        }

        .na-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .na-card:hover .na-img {
          transform: scale(1.025);
        }

        .na-img-placeholder {
          width: 100%;
          height: 100%;
          background: #e8e9da;
        }


        /* ===============================================
           WISHLIST
        =============================================== */

        .na-wishlist {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(123, 127, 92, 0.12);
          border-radius: 50%;
          width: 54px;
          height: 54px;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4b5a4;
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.10);
          z-index: 4;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .na-wishlist:hover {
          transform: scale(1.04);
          color: ${ACCENT};
        }

        .na-wishlist.active {
          color: #9b3043;
        }


        /* ===============================================
           INFO
        =============================================== */

        .na-info {
          padding: 18px 8px 4px;
        }

        .na-name-row {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 40px;
          margin-bottom: 14px;
        }

        .na-name {
          flex: 0 1 auto;
          min-width: 0;
          height: auto;
          margin: 0;
          font-family: "Tobias TRIAL", "Playfair Display", Georgia, serif;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #151515;
          overflow: visible;
          display: block;
          text-overflow: clip;
          text-transform: uppercase;
        }

        .na-name-rule {
          width: 86px;
          height: 1px;
          background: #b9a764;
          flex: 0 0 auto;
          margin-left: auto;
          margin-top: 8px;
        }

        .na-price {
          margin: 0 0 20px;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 23px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0;
          color: #171717;
        }


        /* ===============================================
           ACTIONS
        =============================================== */

        .na-actions {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }

        .na-btn-enquiry,
        .na-btn-cart {
          width: 100%;
          min-height: 60px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px 16px;
          font-family: "Mona Sans", "Inter", sans-serif;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: 0.055em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease;
        }

        .na-btn-enquiry {
          background: ${ACCENT};
          color: #fff;
          border: 1px solid ${ACCENT};
        }

        .na-btn-enquiry:hover {
          background: #676a4c;
          border-color: #676a4c;
        }

        .na-btn-cart {
          background: transparent;
          color: #1b1b1b;
          border: 1px solid ${BORDER};
        }

        .na-btn-cart:hover {
          background: #f4f5eb;
          border-color: ${ACCENT};
        }

        .na-cart-dot {
          font-size: 19px;
          line-height: 0;
          margin-right: 8px;
          transform: translateY(-1px);
        }


        /* ===============================================
           QUANTITY
        =============================================== */

        .na-qty {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 60px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          border: 1px solid ${BORDER};
          padding: 0 14px;
          background: transparent;
        }

        .na-qty button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 22px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #111;
        }

        .na-qty span {
          font-family: "Mona Sans", sans-serif;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
          min-width: 18px;
        }

        .na-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: #555;
        }


        /* ===============================================
           PAGINATION
        =============================================== */

        .na-pagination {
          text-align: center;
          padding: 20px 60px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .na-showing {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #777;
          margin: 0;
        }

        .na-pagenums {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .na-pagebtn {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: ${BG};
          border: 1px solid ${BORDER};
          color: #0e0e0e;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .na-pagebtn:hover:not(:disabled) {
          background: #f4f5eb;
          border-color: ${ACCENT};
        }

        .na-pagebtn.active {
          background: ${ACCENT};
          border-color: ${ACCENT};
          color: #fff;
        }

        .na-pagebtn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .na-pagebtn-arrow {
          font-size: 18px;
        }

        .na-pagedots {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #999;
          padding: 0 2px;
        }

        .na-back-top {
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          color: ${ACCENT};
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.06em;
        }


        /* ===============================================
           TABLET
        =============================================== */

        @media (max-width: 1100px) {

          .na-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 18px;
          }

        }

        @media (max-width: 900px) {

          .na-hero {
            height: 320px;
          }

          .na-header,
          .na-controls,
          .na-pagination {
            padding-left: 24px;
            padding-right: 24px;
          }

          .na-heading {
            font-size: 30px;
          }

          .na-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding: 0 24px 32px;
            gap: 20px 14px;
          }

        }


        /* ===============================================
           MOBILE
        =============================================== */

        @media (max-width: 560px) {

          .na-hero {
            height: 200px;
          }

          .na-hero-title {
            font-size: 28px;
          }

          .na-header {
            padding: 20px 16px 12px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .na-heading {
            font-size: 26px;
          }

          .na-controls {
            padding: 0 16px 12px;
          }

          .na-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding: 0 12px 28px;
            gap: 14px 10px;
          }

          .na-card {
            padding: 8px;
            border-radius: 16px;
          }

          .na-img-wrap {
            aspect-ratio: 4 / 3.35;
            border-radius: 12px;
          }

          .na-wishlist {
            top: 10px;
            right: 10px;
            width: 48px;
            height: 48px;
            font-size: 25px;
          }

          .na-info {
            padding: 15px 6px 4px;
          }

          .na-name-row {
            gap: 12px;
            margin-bottom: 11px;
          }

          .na-name {
            font-size: 15px;
            line-height: 1.2;
          }

          .na-name-rule {
            width: 30px;
          }

          .na-price {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .na-actions {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .na-btn-enquiry,
          .na-btn-cart,
          .na-qty {
            min-height: 42px;
          }

          .na-btn-enquiry,
          .na-btn-cart {
            font-size: 8px;
            padding: 8px 6px;
            letter-spacing: 0.03em;
          }

          .na-cart-dot {
            font-size: 16px;
            margin-right: 5px;
          }

          .na-pagination {
            padding: 12px 16px 40px;
            gap: 14px;
          }

          .na-pagebtn {
            width: 34px;
            height: 34px;
            font-size: 12px;
          }

          .na-price {
            font-size: 19px;
          }

        }

        @media (max-width: 420px) {

          .na-grid {
            padding-left: 12px;
            padding-right: 12px;
          }

          .na-card {
            padding: 8px;
            border-radius: 16px;
          }

          .na-name {
            font-size: 18px;
          }

          .na-name-rule {
            width: 42px;
          }

          .na-price {
            font-size: 19px;
          }

          .na-btn-enquiry,
          .na-btn-cart {
            font-size: 9px;
            letter-spacing: 0.04em;
            padding-left: 6px;
            padding-right: 6px;
          }

          .na-pagebtn {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          .na-pagenums {
            gap: 5px;
          }

        }

      `}</style>

    </main>
  );
}


// ======================================================
// SKELETON
// ======================================================

function CardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "#e8e9da",
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,#e8e9da 25%,#f0f0e8 50%,#e8e9da 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />

      </div>


      <div
        style={{
          padding: "10px 4px 0",
        }}
      >

        <div
          style={{
            height: 14,
            background: "#e8e9da",
            borderRadius: 3,
            marginBottom: 10,
            width: "80%",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >

          <div
            style={{
              height: 38,
              background: "#e8e9da",
              borderRadius: 2,
              flex: 1,
            }}
          />

          <div
            style={{
              height: 38,
              background: "#e8e9da",
              borderRadius: 2,
              width: 80,
            }}
          />

        </div>

      </div>


      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

    </div>
  );
}