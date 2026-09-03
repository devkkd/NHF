"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  getCart,
  CART_EVENT,
} from "@/lib/cart";

import {
  getWishlist,
  WISHLIST_EVENT,
} from "@/lib/wishlist";

import { useAuth } from "@/hooks/useAuth";


// ======================================================
// NAVIGATION
// ======================================================

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
   {
    label: "SALE",
    href: "/sale",
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    label: "Collection",
    href: "/collection",
  },
 
  // {
  //   label: "Wardrobe",
  //   href: "/wardrobe",
  // },
  {
    label: "Our Story",
    href: "/our-story",
  },
  {
    label: "Exhibition / Fair",
    href: "/exhibition",
  },
  {
    label: "Bulk Order",
    href: "/enquiry",
  },
  {
    label: "+ Customization",
    href: "/customization",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];


// ======================================================
// COLORS
// ======================================================

const SOLID_BG =
  "#fdfdf4";

const SOLID_FG =
  "#234D35";


// ======================================================
// HEADER
// ======================================================

export default function Header() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const isHome =
    pathname === "/";

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const headerRef =
    useRef(null);

  const [
    headerHeight,
    setHeaderHeight,
  ] = useState(0);

  const {
    isAuthenticated,
  } = useAuth();

  const [
    cartCount,
    setCartCount,
  ] = useState(0);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState([]);

  const [
    showResults,
    setShowResults,
  ] = useState(false);

  const [
    wishlistCount,
    setWishlistCount,
  ] = useState(0);

  const isSolid =
    !isHome || scrolled;


  // ====================================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ====================================================

  useEffect(() => {
    setMenuOpen(false);
  }, [
    pathname,
  ]);


  // ====================================================
  // HOME SCROLL
  // ====================================================

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const onScroll =
      () => {
        setScrolled(
          window.scrollY >
            10
        );
      };

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );
    };
  }, [
    isHome,
  ]);


  // ====================================================
  // HEADER HEIGHT
  // ====================================================

  useEffect(() => {
    const updateHeight =
      () => {
        if (
          headerRef.current
        ) {
          setHeaderHeight(
            headerRef.current
              .offsetHeight
          );
        }
      };

    updateHeight();

    window.addEventListener(
      "resize",
      updateHeight
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateHeight
      );
    };
  }, [
    isSolid,
    menuOpen,
  ]);


  // ====================================================
  // CART COUNT
  // ====================================================

  // ====================================================
  // CART COUNT
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const updateCartCount = async () => {
      try {
        const cart = await getCart();

        if (!mounted) {
          return;
        }

        /*
         * Only keep valid cart products.
         * Deleted / null / invalid products
         * should not appear in cart badge.
         */
        const validItems = Array.isArray(cart)
          ? cart.filter((item) => {
              const product = item?.product || item;

              return (
                product &&
                typeof product === "object" &&
                (product._id || product.slug)
              );
            })
          : [];

        /*
         * Count quantity only for valid products.
         */
        const total = validItems.reduce(
          (sum, item) => {
            return (
              sum +
              Number(item?.quantity || 0)
            );
          },
          0
        );

        setCartCount(total);
      } catch (error) {
        console.error(
          "HEADER CART COUNT ERROR:",
          error
        );

        if (mounted) {
          setCartCount(0);
        }
      }
    };

    // Initial cart count
    updateCartCount();

    // Update immediately whenever cart changes
    window.addEventListener(
      CART_EVENT,
      updateCartCount
    );

    /*
     * Re-check backend every 10 seconds.
     * If an admin deletes a product,
     * cart badge will automatically update.
     */
    const interval = setInterval(() => {
      updateCartCount();
    }, 10000);

    /*
     * Refresh when user comes back to the tab.
     */
    const handleFocus = () => {
      updateCartCount();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        CART_EVENT,
        updateCartCount
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      clearInterval(interval);
    };
  }, []);


   // ====================================================
  // WISHLIST COUNT
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const updateWishlist = async () => {
      try {
        const items = await getWishlist();

        if (!mounted) {
          return;
        }

        /*
         * Only count valid products.
         * Deleted / null / invalid wishlist items
         * should NOT appear in the badge.
         */
        const validItems = Array.isArray(items)
          ? items.filter((product) => {
              return (
                product &&
                typeof product === "object" &&
                (product._id || product.slug)
              );
            })
          : [];

        /*
         * Remove duplicate products
         * before calculating the badge count.
         */
        const uniqueItems = validItems.filter(
          (product, index, array) => {
            const productKey =
              product._id?.toString() ||
              product.slug;

            return (
              array.findIndex((item) => {
                const itemKey =
                  item._id?.toString() ||
                  item.slug;

                return itemKey === productKey;
              }) === index
            );
          }
        );

        setWishlistCount(
          uniqueItems.length
        );
      } catch (error) {
        console.error(
          "HEADER WISHLIST COUNT ERROR:",
          error
        );

        if (mounted) {
          setWishlistCount(0);
        }
      }
    };

    // Initial count
    updateWishlist();

    // Update when wishlist changes
    window.addEventListener(
      WISHLIST_EVENT,
      updateWishlist
    );

    /*
     * Re-check periodically so if a product is
     * deleted from backend, the badge also clears.
     */
    const interval = setInterval(() => {
      updateWishlist();
    }, 10000);

    /*
     * Re-check when user returns to the tab.
     */
    const handleFocus = () => {
      updateWishlist();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        WISHLIST_EVENT,
        updateWishlist
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      clearInterval(interval);
    };
  }, []);


  // ====================================================
  // SEARCH
  // ====================================================

  useEffect(() => {
    if (
      !search.trim()
    ) {
      setResults([]);
      setShowResults(false);

      return;
    }

    const timer =
      setTimeout(
        async () => {
          try {
            const apiBase =
              (
                process.env
                  .NEXT_PUBLIC_API_URL ||
                "http://localhost:5001/api/v1"
              ).replace(
                /\/$/,
                ""
              );

            const res =
              await fetch(
                `${apiBase}/products?search=${encodeURIComponent(
                  search
                )}`,
                {
                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              );

            if (!res.ok) {
              setResults([]);
              setShowResults(
                true
              );

              return;
            }

            const data =
              await res.json();

            setResults(
              data?.data
                ?.products ||
                []
            );

            setShowResults(
              true
            );
          } catch (
            error
          ) {
            console.error(
              "HEADER SEARCH ERROR:",
              error
            );

            setResults([]);
            setShowResults(
              false
            );
          }
        },
        300
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [
    search,
  ]);


  // ====================================================
  // ACTIVE LINK
  // ====================================================

  const isActiveLink =
    (href) => {
      if (
        href === "/"
      ) {
        return (
          pathname ===
          "/"
        );
      }

      return pathname.startsWith(
        href
      );
    };


  // ====================================================
  // ICON CLASS
  // ====================================================

  const iconClass =
    isSolid
      ? "text-[#234D35] hover:text-[#173A27] transition-colors"
      : "text-white/80 hover:text-white transition-colors";


  // ====================================================
  // ACCOUNT
  // ====================================================

  const goToAccount =
    () => {
      if (
        !isAuthenticated
      ) {
        router.push(
          "/login?redirect=/profile"
        );

        return;
      }

      router.push(
        "/profile"
      );
    };


  // ====================================================
  // WISHLIST
  // ====================================================

  const goToWishlist =
    () => {
      if (
        !isAuthenticated
      ) {
        router.push(
          "/login?redirect=/saved"
        );

        return;
      }

      router.push(
        "/saved"
      );
    };


  // ====================================================
  // CART
  // ====================================================

  const goToCart =
    () => {
      if (
        !isAuthenticated
      ) {
        router.push(
          "/login?redirect=/cart"
        );

        return;
      }

      router.push(
        "/cart"
      );
    };


  // ====================================================
  // NAV LINK CLASS
  // ====================================================

  const navLinkClass =
    (href) => {
      const active =
        isActiveLink(
          href
        );

      const base =
        "text-[18px] font-semibold tracking-normal uppercase transition-colors duration-300 whitespace-nowrap border-b pb-0.5 font-['Poppins']";

      if (
        isSolid
      ) {
        return `${base} ${
          active
            ? "text-[#234D35] border-[#234D35]"
            : "text-[#234D35] border-transparent hover:border-[#234D35]/50"
        }`;
      }

      return `${base} ${
        active
          ? "text-white border-white"
          : "text-white border-transparent hover:text-white/70"
      }`;
    };


  return (
    <>
      <header
        ref={headerRef}
        className={`w-full top-0 left-0 z-50 transition-all duration-300 ${
          isSolid
            ? "fixed shadow-sm"
            : "absolute"
        }`}
        style={{
          backgroundColor:
            isSolid
              ? SOLID_BG
              : "transparent",
        }}
      >

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div
          className={`w-full px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ${
            isSolid
              ? ""
              : "bg-black/20 backdrop-blur-[2px]"
          }`}
        >

          {/* LEFT — SEARCH */}

          <div
            className={`flex items-center transition-colors duration-300 w-auto lg:w-[220px] ${
              isSolid
                ? "lg:border-b lg:border-[#8a9071]"
                : "lg:border-b lg:border-white/50"
            }`}
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                isSolid
                  ? SOLID_FG
                  : "white"
              }
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-80"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />

              <path d="m21 21-4.35-4.35" />
            </svg>

            <div className="relative w-full">

              <input
                type="text"
                placeholder="SEARCH"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target
                      .value
                  )
                }
                onFocus={() =>
                  setShowResults(
                    true
                  )
                }
                onBlur={() => {
                  setTimeout(
                    () =>
                      setShowResults(
                        false
                      ),
                    200
                  );
                }}
                className={`hidden lg:block bg-transparent text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase outline-none w-full font-light transition-colors duration-300 ${
                  isSolid
                    ? "text-[#8a9071] placeholder-[#8a9071]/60"
                    : "text-white placeholder-white/70"
                }`}
              />

              {showResults && (
                <div className="absolute left-0 top-full mt-2 w-[380px] bg-white border border-gray-200 shadow-lg rounded-md max-h-[420px] overflow-y-auto z-[9999]">

                  {results.length >
                  0 ? (
                    results.map(
                      (
                        product
                      ) => (
                        <Link
                          key={
                            product._id
                          }
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setSearch(
                              ""
                            );

                            setShowResults(
                              false
                            );
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 transition"
                        >
                          <img
                            src={
                              product.mainImage
                            }
                            alt={
                              product.name
                            }
                            className="w-14 h-14 object-cover rounded"
                          />

                          <div className="flex-1">

                            <p className="text-sm font-medium text-gray-800 line-clamp-2">
                              {
                                product.name
                              }
                            </p>

                            <p className="text-xs text-[#8a9071] font-semibold mt-1">
                              ₹
                              {
                                product.price
                              }
                            </p>

                          </div>
                        </Link>
                      )
                    )
                  ) : (
                    search.trim() !==
                      "" && (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No products found
                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              CENTER — LOGO
          ================================================== */}

          <Link
            href="/"
            aria-label="Nikita Home Furnishings"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 sm:gap-2.5 lg:gap-3 whitespace-nowrap"
          >
            <img
              src="/images/logo3.png"
              alt="Nikita Home Furnishings"
              className={`object-contain shrink-0 transition-all duration-300 w-[40px] h-[40px] sm:w-[40px] sm:h-[40px] lg:w-[48px] lg:h-[48px] ${
                isSolid
                  ? "header-logo-solid"
                  : ""
              }`}
            />

            <span
        className={`text-[12px] sm:text-[16px] lg:text-[22px] font-bold tracking-[0.08em] sm:tracking-[0.1em] uppercase transition-colors duration-300 ${
  isSolid
    ? "text-[#234D35]"
    : "text-white"
}`}
style={{
  fontFamily:
    '"Times New Roman", Times, serif',
  fontWeight: 700,
}}>
              NIKITA HOME FURNISHINGS
            </span>
          </Link>


          {/* ==================================================
              RIGHT — ACCOUNT / WISHLIST / CART / MENU
          ================================================== */}

          <div className="flex items-center gap-3 sm:gap-5">

            {/* ACCOUNT */}

            <button
              aria-label="Account"
              className={`hidden sm:block ${iconClass}`}
              onClick={
                goToAccount
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                <circle
                  cx="12"
                  cy="7"
                  r="4"
                />
              </svg>
            </button>


            {/* WISHLIST */}

            <button
              aria-label="Wishlist"
              className={`hidden sm:block ${iconClass} relative`}
              onClick={
                goToWishlist
              }
            >
              {wishlistCount >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: "-8px",
                    right: "-8px",
                    width:
                      "18px",
                    height:
                      "18px",
                    borderRadius:
                      "50%",
                    background:
                      "#8A8D67",
                    color:
                      "#fff",
                    fontSize:
                      "10px",
                    fontWeight:
                      "700",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  {
                    wishlistCount
                  }
                </span>
              )}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>


            {/* CART */}

            <button
              aria-label="Cart"
              className={`${iconClass} relative`}
              onClick={
                goToCart
              }
            >
              {cartCount >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: "-8px",
                    right: "-8px",
                    width:
                      "18px",
                    height:
                      "18px",
                    borderRadius:
                      "50%",
                    background:
                      "#8A8D67",
                    color:
                      "#fff",
                    fontSize:
                      "10px",
                    fontWeight:
                      "700",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  {
                    cartCount
                  }
                </span>
              )}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />

                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                />

                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>


            {/* HAMBURGER */}

            <button
              className={`lg:hidden ml-1 transition-colors ${iconClass}`}
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <>
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                    />

                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                    />
                  </>
                ) : (
                  <>
                    <line
                      x1="3"
                      y1="6"
                      x2="21"
                      y2="6"
                    />

                    <line
                      x1="3"
                      y1="12"
                      x2="21"
                      y2="12"
                    />

                    <line
                      x1="3"
                      y1="18"
                      x2="21"
                      y2="18"
                    />
                  </>
                )}
              </svg>
            </button>

          </div>

        </div>


        {/* ==================================================
            DESKTOP NAV
        ================================================== */}

        <nav
          className={`hidden lg:flex w-full items-center justify-center gap-6 xl:gap-8 py-3 px-10 transition-all duration-300 ${
            isSolid
              ? ""
              : "bg-black/20 backdrop-blur-[2px]"
          }`}
        >
          {navLinks.map(
            (
              link
            ) => (
              <Link
                key={
                  link.href
                }
                href={
                  link.href
                }
                className={navLinkClass(
                  link.href
                )}
              >
                {
                  link.label
                }
              </Link>
            )
          )}
        </nav>


        {/* ==================================================
            MOBILE MENU
        ================================================== */}

        {menuOpen && (
          <div
            className={`lg:hidden px-6 py-6 flex flex-col gap-4 transition-colors duration-300 ${
              isSolid
                ? "bg-[#fdfdf4] border-t border-[#8a9071]/20"
                : "bg-black/80 backdrop-blur-md"
            }`}
          >

            {/* ACCOUNT + WISHLIST */}

            <div className="flex items-center gap-5 pb-3 border-b border-current/10 sm:hidden">

              {/* ACCOUNT */}

              <button
                aria-label="Account"
                className={
                  iconClass
                }
                onClick={() => {
                  setMenuOpen(
                    false
                  );

                  goToAccount();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </button>


              {/* WISHLIST */}

              <button
                aria-label="Wishlist"
                className={`${iconClass} relative`}
                onClick={() => {
                  setMenuOpen(
                    false
                  );

                  goToWishlist();
                }}
              >
                {wishlistCount >
                  0 && (
                  <span
                    style={{
                      position:
                        "absolute",
                      top: "-8px",
                      right: "-8px",
                      width:
                        "18px",
                      height:
                        "18px",
                      borderRadius:
                        "50%",
                      background:
                        "#8A8D67",
                      color:
                        "#fff",
                      fontSize:
                        "10px",
                      fontWeight:
                        "700",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    {
                      wishlistCount
                    }
                  </span>
                )}

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

            </div>


            {/* NAV LINKS */}

            {navLinks.map(
              (
                link
              ) => (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className={`text-[14px] tracking-[0.15em] uppercase font-semibold transition-colors ${
                    isSolid
                      ? isActiveLink(
                          link.href
                        )
                        ? "text-[#8a9071] border-b border-[#8a9071] pb-1 w-fit"
                        : "text-[#8a9071] hover:text-[#6f7459]"
                      : "text-white hover:text-white/70"
                  }`}
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                >
                  {
                    link.label
                  }
                </Link>
              )
            )}

          </div>
        )}

      </header>
    </>
  );
}