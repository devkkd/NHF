"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  addToCart,
  updateQty,
} from "@/lib/cart";

const FALLBACK = [
  {
    slug: "product-1",
    mainImage:
      "/images/product-1.jpg",
    name:
      "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
  {
    slug: "product-2",
    mainImage:
      "/images/product-2.jpg",
    name:
      "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
  {
    slug: "product-3",
    mainImage:
      "/images/product-3.jpg",
    name:
      "HAND BLOCK PERCALE PRINTED BEDSHEET",
  },
];

const ACCENT = "#7b7f5c";
const BG = "#fdfff1";
const BORDER = "#c8cab4";

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

const NEW_ARRIVALS_LIMIT = 20;


// ======================================================
// LOGIN
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
// COMPONENT
// ======================================================

export default function NewArrivalsGrid({
  products = [],
}) {
  const router =
    useRouter();

  const scrollRef =
    useRef(null);

  const [quantities, setQuantities] =
    useState({});

  const [apiProducts, setApiProducts] =
    useState([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(false);


  // ====================================================
  // LOAD NEW ARRIVALS DIRECTLY FROM BACKEND
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    const loadNewArrivals = async () => {
      try {
        const res = await fetch(
          `${BASE}/products?newArrivals=true&page=1&limit=${NEW_ARRIVALS_LIMIT}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          return;
        }

        const body = await res.json();

        const list = Array.isArray(body?.data?.products)
          ? body.data.products
          : Array.isArray(body?.products)
            ? body.products
            : [];

        if (!cancelled) {
          setApiProducts(list);
        }
      } catch (error) {
        console.error(
          "HOME NEW ARRIVALS FETCH ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadNewArrivals();

    return () => {
      cancelled = true;
    };
  }, []);


  // ====================================================
  // DRAG
  // ====================================================

  const dragging =
    useRef(false);

  const dragStartX =
    useRef(0);

  const dragStartScroll =
    useRef(0);

  const hasDragged =
    useRef(false);


  // ====================================================
  // LOGIN FLOW
  // ====================================================

  const redirectToLogin = (
    redirect = "/"
  ) => {
    router.push(
      `/login?redirect=${encodeURIComponent(
        redirect
      )}`
    );
  };


  const openLoginForAction = ({
    type,
    product,
  }) => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const currentPath =
      window.location.pathname +
      window.location.search;

    if (
      type === "cart"
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
        currentPath
      );
    }

    if (
      type === "wishlist"
    ) {
      sessionStorage.setItem(
        "pendingWishlistProduct",
        JSON.stringify({
          product,
        })
      );

      sessionStorage.setItem(
        "pendingWishlistRedirect",
        currentPath
      );
    }

    toast.error(
      "Please login first",
      {
        duration: 2200,
        position:
          "top-right",
      }
    );

    setTimeout(() => {
      redirectToLogin(
        currentPath
      );
    }, 650);
  };


  // ====================================================
  // CART
  // ====================================================

  const handleAddToCart = (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !isLoggedIn()
    ) {
      openLoginForAction({
        type: "cart",
        product,
      });

      return;
    }

    addToCart(
      product,
      1
    );

    setQuantities(
      (prev) => ({
        ...prev,
        [product.slug]: 1,
      })
    );
  };


  const increaseQty = (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !isLoggedIn()
    ) {
      openLoginForAction({
        type: "cart",
        product,
      });

      return;
    }

    const qty =
      (quantities[
        product.slug
      ] || 1) + 1;

    updateQty(
      product._id,
      qty
    );

    setQuantities(
      (prev) => ({
        ...prev,
        [product.slug]: qty,
      })
    );
  };


  const decreaseQty = (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !isLoggedIn()
    ) {
      openLoginForAction({
        type: "cart",
        product,
      });

      return;
    }

    const qty =
      (quantities[
        product.slug
      ] || 1) - 1;

    if (
      qty <= 0
    ) {
      updateQty(
        product._id,
        0
      );

      setQuantities(
        (prev) => {
          const copy = {
            ...prev,
          };

          delete copy[
            product.slug
          ];

          return copy;
        }
      );
    } else {
      updateQty(
        product._id,
        qty
      );

      setQuantities(
        (prev) => ({
          ...prev,
          [product.slug]: qty,
        })
      );
    }
  };


  // ====================================================
  // WISHLIST
  // ====================================================

  const handleWishlistClick = (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !isLoggedIn()
    ) {
      openLoginForAction({
        type: "wishlist",
        product,
      });

      return;
    }
  };


  // ====================================================
  // PRODUCTS
  // ====================================================

  const sourceProducts =
    apiProducts.length > 0
      ? apiProducts
      : products?.filter(
          (p) =>
            p.showInNewArrivals === true ||
            p.showInNewArrivals === 1
        );

  const items =
    sourceProducts?.length > 0
      ? sourceProducts
          .slice(0, NEW_ARRIVALS_LIMIT)
          .map((p) => ({
            _id: p._id,
            slug: p.slug,
            mainImage:
              p.mainImage ||
              p.image ||
              p.images?.[0]?.url ||
              "/images/product-1.jpg",
            name:
              p.name?.toUpperCase() ||
              "NEW ARRIVAL",
            price: p.price || 0,
          }))
      : FALLBACK;


  // ====================================================
  // SCROLL STATE
  // ====================================================

  const updateScrollState =
    useCallback(() => {
      const el =
        scrollRef.current;

      if (!el) {
        return;
      }

      const maxScroll =
        el.scrollWidth -
        el.clientWidth;

      setCanScrollLeft(
        el.scrollLeft >
          2
      );

      setCanScrollRight(
        el.scrollLeft <
          maxScroll - 2
      );
    }, []);


  useEffect(() => {
    const el =
      scrollRef.current;

    if (!el) {
      return;
    }

    const refresh = () => {
      requestAnimationFrame(() => {
        updateScrollState();
      });
    };

    refresh();

    el.addEventListener(
      "scroll",
      updateScrollState,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      refresh
    );

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(refresh)
        : null;

    observer?.observe(el);

    const track =
      el.querySelector(
        ".product-track"
      );

    if (track) {
      observer?.observe(track);
    }

    const imageTimer = setTimeout(
      refresh,
      300
    );

    return () => {
      el.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        refresh
      );

      observer?.disconnect();
      clearTimeout(imageTimer);
    };
  }, [
    items.length,
    productsLoading,
    updateScrollState,
  ]);


  // ====================================================
  // ARROW SCROLL
  // ====================================================

  const scrollSlider = (
    direction
  ) => {
    const el =
      scrollRef.current;

    if (!el) {
      return;
    }

    const current =
      el.scrollLeft;

    const max =
      Math.max(
        0,
        el.scrollWidth -
          el.clientWidth
      );

    // Re-read layout before deciding whether
    // the slider can move.
    updateScrollState();

    if (max <= 2) {
      return;
    }

    const card =
      el.querySelector(
        ".product-card-link"
      );

    const gap =
      parseFloat(
        getComputedStyle(
          el.querySelector(
            ".product-track"
          ) || el
        ).columnGap ||
          getComputedStyle(
            el.querySelector(
              ".product-track"
            ) || el
          ).gap ||
          "0"
      ) || 0;

    const step =
      (card?.getBoundingClientRect().width ||
        el.clientWidth * 0.82) +
      gap;

    const target =
      direction === "next"
        ? Math.min(
            current + step,
            max
          )
        : Math.max(
            current - step,
            0
          );

    el.scrollTo({
      left: target,
      behavior: "smooth",
    });

    setTimeout(
      updateScrollState,
      500
    );
  };


  // ====================================================
  // DRAG START
  // ====================================================

  const handlePointerDown = (
    e
  ) => {
    if (
      e.pointerType ===
      "touch"
    ) {
      return;
    }

    const el =
      scrollRef.current;

    if (!el) {
      return;
    }

    dragging.current =
      true;

    hasDragged.current =
      false;

    dragStartX.current =
      e.clientX;

    dragStartScroll.current =
      el.scrollLeft;

    el.classList.add(
      "dragging"
    );

    try {
      el.setPointerCapture(
        e.pointerId
      );
    } catch {}
  };


  const handlePointerMove = (
    e
  ) => {
    if (
      !dragging.current
    ) {
      return;
    }

    const el =
      scrollRef.current;

    if (!el) {
      return;
    }

    const delta =
      e.clientX -
      dragStartX.current;

    if (
      Math.abs(delta) >
      5
    ) {
      hasDragged.current =
        true;
    }

    el.scrollLeft =
      dragStartScroll.current -
      delta;

    updateScrollState();
  };


  const handlePointerUp = () => {
    dragging.current =
      false;

    const el =
      scrollRef.current;

    if (el) {
      el.classList.remove(
        "dragging"
      );
    }
  };


  // ====================================================
  // BLOCK CLICK AFTER DRAG
  // ====================================================

  const handleProductClick = (
    e
  ) => {
    if (
      hasDragged.current
    ) {
      e.preventDefault();
      e.stopPropagation();

      hasDragged.current =
        false;
    }
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <section className="arrival-section">

      <div className="container">

        <h2 className="section-title">
          NEW ARRIVALS
        </h2>


        <div className="carousel">

          {/* LEFT ARROW */}

          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={() =>
              scrollSlider(
                "prev"
              )
            }
            disabled={
              !canScrollLeft
            }
            aria-label="Previous products"
          >
            ‹
          </button>


          {/* SCROLL AREA */}

          <div
            ref={scrollRef}
            className="product-grid"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              handlePointerUp
            }
            onPointerCancel={
              handlePointerUp
            }
          >

            <div className="product-track">

              {items.map(
                (
                  item,
                  index
                ) => (
                  <Link
                    key={
                      item._id ||
                      item.slug ||
                      index
                    }
                    href={`/products/${item.slug}`}
                    className="product-card-link"
                    onClick={
                      handleProductClick
                    }
                    draggable={
                      false
                    }
                  >

                    <article className="product-card">

                      {/* IMAGE */}

                      <div className="image-wrap">

                        <Image
                          src={
                            item.mainImage
                          }
                          alt={
                            item.name
                          }
                          fill
                          sizes="
                            (max-width: 768px) 46vw,
                            (max-width: 1100px) 31vw,
                            23vw
                          "
                          style={{
                            objectFit:
                              "cover",
                          }}
                          className="product-img"
                          draggable={
                            false
                          }
                        />


                        <button
                          type="button"
                          className="wishlist-btn"
                          onClick={(
                            e
                          ) =>
                            handleWishlistClick(
                              e,
                              item
                            )
                          }
                          aria-label="Wishlist"
                        >
                          ♡
                        </button>

                      </div>


                      {/* INFO */}

                      <div className="info-wrap">

                        <div className="name-row">

                          <h3 className="product-title">
                            {
                              item.name
                            }
                          </h3>

                          <span className="name-rule" />

                        </div>


                        <p className="product-price">
                          ₹
                          {Number(
                            item.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>


                        <div className="action-row">

                          <button
                            type="button"
                            className="price-btn"
                            onClick={(
                              e
                            ) => {
                              e.preventDefault();
                              e.stopPropagation();

                              router.push(
                                `/enquiry1/${item.slug}`
                              );
                            }}
                          >
                            BULK PRICE ENQUIRY ↗
                          </button>


                          {!
                            quantities[
                              item.slug
                            ] ? (
                            <button
                              type="button"
                              className="cart-btn"
                              onClick={(
                                e
                              ) =>
                                handleAddToCart(
                                  e,
                                  item
                                )
                              }
                            >
                              <span className="cart-dot">
                                •
                              </span>

                              ADD TO CART
                            </button>
                          ) : (
                            <div
                              className="qty-control"
                              onClick={(
                                e
                              ) =>
                                e.stopPropagation()
                              }
                            >
                              <button
                                type="button"
                                onClick={(
                                  e
                                ) =>
                                  decreaseQty(
                                    e,
                                    item
                                  )
                                }
                              >
                                −
                              </button>

                              <span>
                                {
                                  quantities[
                                    item.slug
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
                                    item
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          )}

                        </div>

                      </div>

                    </article>

                  </Link>
                )
              )}

            </div>

          </div>


          {/* RIGHT ARROW */}

          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={() =>
              scrollSlider(
                "next"
              )
            }
            disabled={
              !canScrollRight
            }
            aria-label="Next products"
          >
            ›
          </button>

        </div>


        {/* SEE ALL */}

        <div className="bottom-btn-wrap">
          <Link
            href="/new-arrivals"
            className="bottom-btn"
          >
            SEE ALL NEW ARRIVALS →
          </Link>
        </div>

      </div>


      <style jsx>{`

        /* ==================================================
           SECTION
        ================================================== */

        .arrival-section {
          width: 100%;
          background: ${BG};
          padding:
            82px 24px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .container {
          width: 100%;
          max-width: 1420px;
          margin: 0 auto;
        }


        /* ==================================================
           TITLE
        ================================================== */

        .section-title {
          margin:
            0 0 42px;

          text-align:
            center;

          font-family:
            "Tobias TRIAL",
            serif;

          font-size:
            32px;

          font-weight:
            500;

          line-height:
            1.5;

          letter-spacing:
            -0.02em;

          color:
            ${ACCENT};
        }


        /* ==================================================
           CAROUSEL
        ================================================== */

        .carousel {
          position:
            relative;

          width:
            100%;

          display:
            flex;

          align-items:
            center;

          gap:
            12px;
        }


        /* ==================================================
           ACTUAL SCROLL VIEWPORT
        ================================================== */

        .product-grid {
          flex:
            1 1 0;

          min-width:
            0;

          width:
            100%;

          overflow-x:
            auto;

          overflow-y:
            hidden;

          scrollbar-width:
            none;

          -ms-overflow-style:
            none;

          scroll-behavior:
            smooth;

          scroll-snap-type:
            x mandatory;

          -webkit-overflow-scrolling:
            touch;

          cursor:
            grab;

          user-select:
            none;

          touch-action:
            pan-x;

          padding:
            4px 2px
            14px;

          box-sizing:
            border-box;
        }

        .product-grid::-webkit-scrollbar {
          display:
            none;
        }

        .product-grid.dragging {
          cursor:
            grabbing;

          scroll-behavior:
            auto;
        }


        /* ==================================================
           IMPORTANT:
           TRACK MUST BE WIDER THAN VIEWPORT
        ================================================== */

        .product-track {
          display: flex;

          width: max-content;
          min-width: max-content;

          gap: 22px;

          align-items: stretch;

          flex-shrink: 0;
        }


        /* ==================================================
           CARD WIDTH
        ================================================== */

        .product-card-link {
          display: block;

          flex: 0 0 340px;

          width: 340px;
          min-width: 340px;

          scroll-snap-align: start;
          scroll-snap-stop: always;

          text-decoration: none;

          flex-shrink: 0;
        }


        .product-card {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;

          box-sizing:
            border-box;

          padding:
            14px;

          background:
            rgba(
              255,
              255,
              255,
              0.78
            );

          border:
            1px solid
            #e2e3d7;

          border-radius:
            22px;

          box-shadow:
            0 12px 34px
              rgba(
                61,
                67,
                41,
                0.08
              ),
            0 2px 8px
              rgba(
                61,
                67,
                41,
                0.04
              );

          transition:
            transform
            0.25s ease,
            box-shadow
            0.25s ease;
        }

        .product-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 18px 42px
              rgba(
                61,
                67,
                41,
                0.12
              ),
            0 4px 12px
              rgba(
                61,
                67,
                41,
                0.05
              );
        }


        /* ==================================================
           IMAGE
        ================================================== */

        .image-wrap {
          position:
            relative;

          width:
            100%;

          aspect-ratio:
            4 / 3;

          overflow:
            hidden;

          border-radius:
            15px;

          background:
            #e8e9da;

          flex-shrink:
            0;
        }

        .product-img {
          transition:
            transform
            0.4s ease;
        }

        .product-card:hover
          .product-img {
          transform:
            scale(1.025);
        }


        /* ==================================================
           WISHLIST
        ================================================== */

        .wishlist-btn {
          position:
            absolute;

          top:
            14px;

          right:
            14px;

          width:
            54px;

          height:
            54px;

          border:
            1px solid
            rgba(
              123,
              127,
              92,
              0.12
            );

          border-radius:
            50%;

          background:
            rgba(
              255,
              255,
              255,
              0.96
            );

          box-shadow:
            0 5px 16px
              rgba(
                0,
                0,
                0,
                0.1
              );

          color:
            #b4b5a4;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            28px;

          line-height:
            1;

          padding:
            0;

          cursor:
            pointer;

          z-index:
            4;
        }

        .wishlist-btn:hover {
          color:
            ${ACCENT};
        }


        /* ==================================================
           INFO
        ================================================== */

        .info-wrap {
          padding:
            18px
            8px
            4px;
        }

        .name-row {
          display:
            flex;

          align-items:
            center;

          gap:
            18px;

          min-height:
            40px;

          margin-bottom:
            14px;
        }

        .product-title {
          flex:
            0 1 auto;

          min-width:
            0;

          margin:
            0;

          font-family:
            "Tobias TRIAL",
            "Playfair Display",
            Georgia,
            serif;

          font-size:
            21px;

          line-height:
            1.15;

          font-weight:
            500;

          letter-spacing:
            -0.02em;

          color:
            #151515;
        }

        .name-rule {
          width:
            60px;

          height:
            1px;

          background:
            #b9a764;

          flex:
            0 0 auto;

          margin-left:
            auto;
        }

        .product-price {
          margin:
            0 0 20px;

          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            20px;

          font-weight:
            700;

          color:
            #171717;
        }


        /* ==================================================
           ACTIONS
        ================================================== */

        .action-row {
          display:
            grid;

          grid-template-columns:
            1fr
            1fr;

          gap:
            12px;
        }

        .price-btn,
        .cart-btn {
          width:
            100%;

          min-height:
            58px;

          box-sizing:
            border-box;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            12px;

          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            11px;

          font-weight:
            700;

          line-height:
            1.35;

          letter-spacing:
            0.05em;

          text-transform:
            uppercase;

          cursor:
            pointer;
        }

        .price-btn {
          background:
            ${ACCENT};

          color:
            #fff;

          border:
            1px solid
            ${ACCENT};
        }

        .price-btn:hover {
          background:
            #676a4c;
        }

        .cart-btn {
          background:
            transparent;

          color:
            #1b1b1b;

          border:
            1px solid
            ${BORDER};
        }

        .cart-btn:hover {
          background:
            #f4f5eb;

          border-color:
            ${ACCENT};
        }

        .cart-dot {
          font-size:
            17px;

          margin-right:
            6px;
        }


        /* ==================================================
           QUANTITY
        ================================================== */

        .qty-control {
          width:
            100%;

          min-height:
            58px;

          box-sizing:
            border-box;

          border:
            1px solid
            ${BORDER};

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 14px;
        }

        .qty-control button {
          width:
            28px;

          height:
            28px;

          border:
            none;

          background:
            transparent;

          cursor:
            pointer;

          font-size:
            20px;
        }

        .qty-control span {
          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            14px;

          font-weight:
            600;
        }


        /* ==================================================
           ARROWS
        ================================================== */

        .carousel-arrow {
          flex:
            0 0 auto;

          width:
            44px;

          height:
            44px;

          border:
            1px solid
            ${BORDER};

          border-radius:
            50%;

          background:
            #fff;

          color:
            ${ACCENT};

          font-size:
            24px;

          line-height:
            1;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          cursor:
            pointer;

          z-index:
            5;

          transition:
            opacity
            0.2s ease,
            background
            0.2s ease;
        }

        .carousel-arrow:hover:not(
          :disabled
        ) {
          background:
            #f4f5eb;
        }

        .carousel-arrow:disabled {
          opacity:
            0.28;

          cursor:
            default;
        }


        /* ==================================================
           BOTTOM BUTTON
        ================================================== */

        .bottom-btn-wrap {
          display:
            flex;

          justify-content:
            center;

          margin-top:
            62px;
        }

        .bottom-btn {
          color:
            ${ACCENT};

          text-decoration:
            none;

          border-bottom:
            1px solid
            ${ACCENT};

          padding-bottom:
            10px;

          font-family:
            "Mona Sans",
            sans-serif;

          font-size:
            16px;
        }


        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1100px) {

          .arrival-section {
            padding:
              70px 18px;
          }

          .product-track {
            gap:
              18px;
          }

          .product-card-link {
            width:
              300px;

            min-width:
              300px;

            flex-basis:
              300px;
          }

          .carousel-arrow {
            width:
              40px;

            height:
              40px;
          }
        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 768px) {

          .arrival-section {
            padding:
              48px 8px;
          }

          .section-title {
            font-size:
              24px;

            margin-bottom:
              26px;
          }

          .carousel {
            gap:
              5px;
          }

          .product-grid {
            padding:
              3px
              0
              12px;
          }

          .product-track {
            gap:
              12px;
          }

          .product-card-link {
            width:
              calc(
                (100vw - 62px) / 2
              );

            min-width:
              calc(
                (100vw - 62px) / 2
              );

            flex-basis:
              calc(
                (100vw - 62px) / 2
              );
          }

          .product-card {
            padding:
              10px;

            border-radius:
              16px;
          }

          .wishlist-btn {
            width:
              42px;

            height:
              42px;

            top:
              10px;

            right:
              10px;

            font-size:
              22px;
          }

          .info-wrap {
            padding:
              12px
              5px
              2px;
          }

          .name-row {
            gap:
              10px;

            margin-bottom:
              10px;
          }

          .product-title {
            font-size:
              14px;
          }

          .name-rule {
            width:
              34px;
          }

          .product-price {
            font-size:
              15px;

            margin-bottom:
              12px;
          }

          .action-row {
            grid-template-columns:
              1fr;
            gap:
              8px;
          }

          .price-btn,
          .cart-btn,
          .qty-control {
            min-height:
              46px;
          }

          .price-btn,
          .cart-btn {
            font-size:
              9px;

            padding:
              8px;
          }

          .carousel-arrow {
            width:
              30px;

            height:
              30px;

            font-size:
              17px;
          }

          .bottom-btn-wrap {
            margin-top:
              36px;
          }

          .bottom-btn {
            font-size:
              13px;
          }
        }


        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 400px) {

          .arrival-section {
            padding:
              40px 5px;
          }

          .carousel {
            gap:
              3px;
          }

          .product-track {
            gap:
              8px;
          }

          .product-card-link {
            width:
              calc(
                (100vw - 48px) / 2
              );

            min-width:
              calc(
                (100vw - 48px) / 2
              );

            flex-basis:
              calc(
                (100vw - 48px) / 2
              );
          }

          .product-title {
            font-size:
              12px;
          }

          .product-price {
            font-size:
              13px;
          }

          .price-btn,
          .cart-btn {
            font-size:
              8px;
          }

          .qty-control {
            min-height:
              40px;
          }
        }

      `}</style>

    </section>
  );
}