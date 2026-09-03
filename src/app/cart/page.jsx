"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getCartResponse,
  updateQty,
  updateCartVariant,
  removeFromCart,
  formatPrice,
  CART_EVENT,
} from "@/lib/cart";

import { addToWishlist } from "@/lib/wishlist";

/* ======================================================
   HELPERS
====================================================== */

function getProductId(item) {
  return (
    item?.product?._id ||
    item?.product?.id ||
    item?.productId ||
    null
  );
}

function normalizeText(value) {
  return String(
    value ?? ""
  ).trim();
}

function getColors(product) {
  if (
    !Array.isArray(
      product?.colors
    )
  ) {
    return [];
  }

  return product.colors.filter(
    (color) =>
      normalizeText(color)
  );
}

function getSizes(product) {
  if (
    !Array.isArray(
      product?.sizes
    )
  ) {
    return [];
  }

  return product.sizes.filter(
    (size) =>
      normalizeText(
        size?.name
      )
  );
}

function getSelectedSize(
  product,
  selectedSize
) {
  const sizes =
    getSizes(product);

  if (!selectedSize) {
    return null;
  }

  return (
    sizes.find(
      (size) =>
        normalizeText(
          size.name
        ).toLowerCase() ===
        normalizeText(
          selectedSize
        ).toLowerCase()
    ) || null
  );
}

function getItemSellingPrice(
  item
) {
  const product =
    item?.product || {};

  const selectedSize =
    getSelectedSize(
      product,
      item?.selectedSize
    );

  if (
    Number.isFinite(
      Number(
        item?.selectedSellingPrice
      )
    ) &&
    Number(
      item?.selectedSellingPrice
    ) > 0
  ) {
    return Number(
      item.selectedSellingPrice
    );
  }

  if (
    Number.isFinite(
      Number(
        item?.selectedSizeSellingPrice
      )
    ) &&
    Number(
      item?.selectedSizeSellingPrice
    ) > 0
  ) {
    return Number(
      item.selectedSizeSellingPrice
    );
  }

  if (
    selectedSize &&
    Number(
      selectedSize.sellingPrice
    ) > 0
  ) {
    return Number(
      selectedSize.sellingPrice
    );
  }

  return Number(
    product?.sellingPrice ??
      product?.price ??
      0
  );
}

function getItemActualPrice(
  item
) {
  const product =
    item?.product || {};

  const selectedSize =
    getSelectedSize(
      product,
      item?.selectedSize
    );

  if (
    Number(
      item?.selectedActualPrice ||
        0
    ) > 0
  ) {
    return Number(
      item.selectedActualPrice
    );
  }

  if (
    Number(
      item?.selectedSizeActualPrice ||
        0
    ) > 0
  ) {
    return Number(
      item.selectedSizeActualPrice
    );
  }

  if (
    selectedSize &&
    Number(
      selectedSize.actualPrice
    ) > 0
  ) {
    return Number(
      selectedSize.actualPrice
    );
  }

  return Number(
    product?.actualPrice ??
      product?.price ??
      0
  );
}

function getItemShipping(
  item
) {
  const backendShipping =
    Number(
      item?.selectedShippingCost
    );

  if (
    Number.isFinite(
      backendShipping
    )
  ) {
    return Math.max(
      backendShipping,
      0
    );
  }

  return Math.max(
    Number(
      item?.product
        ?.shippingCost || 0
    ),
    0
  );
}

function getItemKey(
  item,
  index
) {
  return (
    item?._id ||
    `${getProductId(item) || "item"}-${index}-${item?.selectedColor || ""}-${item?.selectedSize || ""}`
  );
}
function isValidCartItem(item) {
  const product = item?.product;

  return (
    item &&
    product &&
    typeof product === "object" &&
    (
      product._id ||
      product.id ||
      item.productId
    )
  );
}

/* ======================================================
   PAGE
====================================================== */

export default function CartPage() {
  const router =
    useRouter();

  const [
    cart,
    setCart,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    grandTotal: 0,
    itemCount: 0,
  });

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [
    variantLoading,
    setVariantLoading,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  /* ======================================================
     LOAD CART
  ====================================================== */

  const syncCart =
    async () => {
      try {
        setError("");

        const response =
          await getCartResponse();

       const rawItems =
  Array.isArray(
    response?.cart?.items
  )
    ? response.cart.items
    : [];

/*
 * Remove products that no longer exist
 * in the backend/product collection.
 */
const validItems = rawItems.filter(
  isValidCartItem
);

setCart(validItems);

        /*
         * Backend calculation is
         * now the source of truth.
         */
        setSummary({
          subtotal:
            Number(
              response?.summary
                ?.subtotal || 0
            ),

          shipping:
            Number(
              response?.summary
                ?.shipping || 0
            ),

          tax:
            Number(
              response?.summary
                ?.tax || 0
            ),

          grandTotal:
            Number(
              response?.summary
                ?.grandTotal || 0
            ),

          itemCount:
            Number(
              response?.summary
                ?.itemCount || 0
            ),
        });
      } catch (error) {
        console.error(
          "FAILED TO LOAD CART:",
          error
        );

        setCart([]);

        setSummary({
          subtotal: 0,
          shipping: 0,
          tax: 0,
          grandTotal: 0,
          itemCount: 0,
        });

        setError(
          error?.message ||
            "Unable to load your cart. Please try again."
        );
      } finally {
        setLoaded(true);
      }
    };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError("");

        const response =
          await getCartResponse();

        if (!mounted) {
          return;
        }

       const rawItems =
  Array.isArray(
    response?.cart?.items
  )
    ? response.cart.items
    : [];

const validItems =
  rawItems.filter(
    isValidCartItem
  );

setCart(validItems);

        setSummary({
          subtotal:
            Number(
              response?.summary
                ?.subtotal || 0
            ),

          shipping:
            Number(
              response?.summary
                ?.shipping || 0
            ),

          tax:
            Number(
              response?.summary
                ?.tax || 0
            ),

          grandTotal:
            Number(
              response?.summary
                ?.grandTotal || 0
            ),

          itemCount:
            Number(
              response?.summary
                ?.itemCount || 0
            ),
        });
      } catch (error) {
        console.error(
          "FAILED TO LOAD CART:",
          error
        );

        if (mounted) {
          setCart([]);
          setError(
            error?.message ||
              "Unable to load your cart. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    load();

    const handleCartUpdated =
      () => {
        syncCart();
      };

    const handleStorage =
      () => {
        syncCart();
      };

    window.addEventListener(
      CART_EVENT,
      handleCartUpdated
    );

    window.addEventListener(
      "CART_UPDATED",
      handleCartUpdated
    );

    const handleFocus = () => {
  syncCart();
};

window.addEventListener("focus", handleFocus);

const interval = setInterval(() => {
  syncCart();
}, 10000);

return () => {
  window.removeEventListener(CART_EVENT, syncCart);
  window.removeEventListener("CART_UPDATED", syncCart);
  window.removeEventListener("storage", handleStorage);
  window.removeEventListener("focus", handleFocus);

  clearInterval(interval);
};
  }, []);

  /* ======================================================
     DISPLAY COUNT
  ====================================================== */

  const itemCount = useMemo(() => {
  return cart.reduce((total, item) => {
    if (!isValidCartItem(item)) return total;

    return total + Number(item?.quantity || 0);
  }, 0);
}, [cart]);

  /* ======================================================
     UPDATE QUANTITY
  ====================================================== */

  const handleQty =
    async (
      item,
      quantity
    ) => {
      const productId =
        getProductId(item);

      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const nextQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          nextQuantity
        )
      ) {
        return;
      }

      const actionKey =
        `qty-${getItemKey(
          item,
          0
        )}`;

      try {
        setError("");

        setActionLoading(
          actionKey
        );

        await updateQty(
          productId,
          nextQuantity,
          {
            selectedColor:
              item?.selectedColor ||
              "",

            selectedSize:
              item?.selectedSize ||
              "",
          }
        );

        await syncCart();
      } catch (error) {
        console.error(
          "FAILED TO UPDATE QUANTITY:",
          error
        );

        setError(
          error?.message ||
            "Failed to update quantity."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  /* ======================================================
     CHANGE COLOUR
  ====================================================== */

  const handleColorChange =
    async (
      item,
      selectedColor
    ) => {
      const productId =
        getProductId(item);

      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const key =
        getItemKey(item, 0);

      try {
        setError("");

        setVariantLoading(
          `color-${key}`
        );

        const product =
          item?.product ||
          {};

        await updateCartVariant(
          {
            productId,

            currentColor:
              item?.selectedColor ||
              "",

            currentSize:
              item?.selectedSize ||
              "",

            selectedColor,

            selectedColorName:
              selectedColor,

            selectedSize:
              item?.selectedSize ||
              "",
          }
        );

        await syncCart();
      } catch (error) {
        console.error(
          "COLOR CHANGE ERROR:",
          error
        );

        setError(
          error?.message ||
            "Failed to change colour."
        );
      } finally {
        setVariantLoading(
          null
        );
      }
    };

  /* ======================================================
     CHANGE SIZE
  ====================================================== */

  const handleSizeChange =
    async (
      item,
      selectedSize
    ) => {
      const productId =
        getProductId(item);

      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const key =
        getItemKey(item, 0);

      try {
        setError("");

        setVariantLoading(
          `size-${key}`
        );

        await updateCartVariant(
          {
            productId,

            currentColor:
              item?.selectedColor ||
              "",

            currentSize:
              item?.selectedSize ||
              "",

            selectedColor:
              item?.selectedColor ||
              "",

            selectedColorName:
              item?.selectedColorName ||
              item?.selectedColor ||
              "",

            selectedSize,
          }
        );

        await syncCart();
      } catch (error) {
        console.error(
          "SIZE CHANGE ERROR:",
          error
        );

        setError(
          error?.message ||
            "Failed to change size."
        );
      } finally {
        setVariantLoading(
          null
        );
      }
    };

  /* ======================================================
     REMOVE ITEM
  ====================================================== */

  const handleRemove =
    async (
      item
    ) => {
      const productId =
        getProductId(item);

      if (!productId) {
        setError(
          "Product ID is missing."
        );
        return;
      }

      const key =
        getItemKey(item, 0);

      try {
        setError("");

        setActionLoading(
          `remove-${key}`
        );

        await removeFromCart(
          item
        );

        await syncCart();
      } catch (error) {
        console.error(
          "FAILED TO REMOVE ITEM:",
          error
        );

        setError(
          error?.message ||
            "Failed to remove item."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  /* ======================================================
     SAVE FOR LATER
  ====================================================== */

  const handleSaveForLater =
    async (
      item
    ) => {
      const product =
        item?.product;

      const productId =
        getProductId(item);

      if (
        !product ||
        !productId
      ) {
        setError(
          "Unable to save this product."
        );
        return;
      }

      const key =
        getItemKey(item, 0);

      try {
        setError("");

        setActionLoading(
          `save-${key}`
        );

        await addToWishlist(
          product
        );

        await removeFromCart(
          item
        );

        await syncCart();

        router.push(
          "/saved"
        );
      } catch (error) {
        console.error(
          "SAVE FOR LATER FAILED:",
          error
        );

        setError(
          error?.message ||
            "Could not save the item for later."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  /* ======================================================
     CHECKOUT
  ====================================================== */

  const handleCheckout =
    () => {
      if (
        cart.length ===
        0
      ) {
        return;
      }

      router.push(
        "/checkout"
      );
    };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <ProtectedRoute>
      <>
        <Header />

        <main className="crt-page-bg">

          <div className="crt-outer-wrap">

            {/* =================================================
                TITLE
            ================================================= */}

            <h1 className="crt-title">
              Shopping Cart ({itemCount})
            </h1>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="crt-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {!loaded ? (
              <div className="crt-loading">
                Loading your cart...
              </div>
            ) : cart.length === 0 ? (

              /* ================================================
                 EMPTY CART
              ================================================= */

              <div className="crt-empty">

                <div className="crt-empty-icon">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>

                <p>
                  Your cart is empty.
                </p>

                <Link
                  href="/"
                  className="crt-continue-link"
                >
                  Continue Shopping →
                </Link>

              </div>

            ) : (

              /* ================================================
                 CART CONTENT
              ================================================= */

              <div className="crt-layout">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="crt-items-col">

                  <div className="crt-hr" />

                  {cart.map(
                    (
                      item,
                      index
                    ) => {

                      const product =
                        item?.product ||
                        {};

                      const productId =
                        getProductId(
                          item
                        );

                      const itemKey =
                        getItemKey(
                          item,
                          index
                        );

                      const quantity =
                        Number(
                          item?.quantity ||
                          1
                        );

                      const sellingPrice =
                        getItemSellingPrice(
                          item
                        );

                      const actualPrice =
                        getItemActualPrice(
                          item
                        );

                      const shippingCost =
                        getItemShipping(
                          item
                        );

                      const lineTotal =
                        sellingPrice *
                        quantity;

                      const image =
                        product?.mainImage ||
                        product?.image ||
                        item?.images?.[0] ||
                        "/placeholder-product.png";

                      const colors =
                        getColors(
                          product
                        );

                      const sizes =
                        getSizes(
                          product
                        );

                      const selectedColor =
                        item?.selectedColor ||
                        "";

                      const selectedSize =
                        item?.selectedSize ||
                        "";

                      const isQtyUpdating =
                        actionLoading ===
                        `qty-${itemKey}`;

                      const isRemoving =
                        actionLoading ===
                        `remove-${itemKey}`;

                      const isSaving =
                        actionLoading ===
                        `save-${itemKey}`;

                      const isColorChanging =
                        variantLoading ===
                        `color-${itemKey}`;

                      const isSizeChanging =
                        variantLoading ===
                        `size-${itemKey}`;

                      const disabled =
                        isQtyUpdating ||
                        isRemoving ||
                        isSaving ||
                        isColorChanging ||
                        isSizeChanging;

                      return (
                        <div
                          key={itemKey}
                          className="crt-item-row"
                        >

                          {/* =================================================
                              IMAGE
                          ================================================= */}

                          <Link
                            href={`/products/${product?.slug || ""}`}
                            className="crt-item-image"
                          >
                            <img
                              src={image}
                              alt={
                                product?.name ||
                                "Product image"
                              }
                            />
                          </Link>

                          {/* =================================================
                              BODY
                          ================================================= */}

                          <div className="crt-item-body">

                            <div className="crt-item-top">

                              <div className="crt-item-heading-block">

                                <Link
                                  href={`/products/${product?.slug || ""}`}
                                  className="crt-item-name"
                                >
                                  {product?.name ||
                                    "Unnamed Product"}
                                </Link>

                                {product?.sku && (
                                  <p className="crt-item-sku">
                                    SKU: {product.sku}
                                  </p>
                                )}

                              </div>

                              <div className="crt-item-price-block">

                                <p className="crt-item-price">
                                  {formatPrice(
                                    lineTotal
                                  )}
                                </p>

                                {actualPrice >
                                  sellingPrice && (
                                  <p className="crt-item-unit-old-price">
                                    {formatPrice(
                                      actualPrice
                                    )}
                                  </p>
                                )}

                              </div>

                            </div>

                            {/* =================================================
                                COLOUR
                            ================================================= */}

                            {colors.length > 0 && (
                              <div className="crt-variant-block">

                                <div className="crt-variant-heading">
                                  <span>
                                    Colour
                                  </span>

                                  {isColorChanging && (
                                    <small>
                                      Updating...
                                    </small>
                                  )}
                                </div>

                                <div className="crt-color-list">

                                  {colors.map(
                                    (
                                      color,
                                      colorIndex
                                    ) => {

                                      const isSelected =
                                        normalizeText(
                                          selectedColor
                                        ).toLowerCase() ===
                                        normalizeText(
                                          color
                                        ).toLowerCase();

                                      return (
                                        <button
                                          key={`${itemKey}-color-${colorIndex}`}
                                          type="button"
                                          className={`crt-color-button${
                                            isSelected
                                              ? " selected"
                                              : ""
                                          }`}
                                          style={{
                                            backgroundColor:
                                              color,
                                          }}
                                          disabled={
                                            disabled
                                          }
                                          title={color}
                                          aria-label={`Select colour ${color}`}
                                          onClick={() =>
                                            handleColorChange(
                                              item,
                                              color
                                            )
                                          }
                                        >
                                          {isSelected && (
                                            <span>
                                              ✓
                                            </span>
                                          )}
                                        </button>
                                      );
                                    }
                                  )}

                                </div>

                                {selectedColor && (
                                  <div className="crt-selected-value">
                                    Selected:{" "}
                                    {item?.selectedColorName ||
                                      selectedColor}
                                  </div>
                                )}

                              </div>
                            )}

                            {/* =================================================
                                SIZE
                            ================================================= */}

                            {sizes.length > 0 && (
                              <div className="crt-variant-block">

                                <div className="crt-variant-heading">
                                  <span>
                                    Size
                                  </span>

                                  {isSizeChanging && (
                                    <small>
                                      Updating...
                                    </small>
                                  )}
                                </div>

                                <div className="crt-size-list">

                                  {sizes.map(
                                    (
                                      size,
                                      sizeIndex
                                    ) => {

                                      const sizeName =
                                        normalizeText(
                                          size?.name
                                        );

                                      const selected =
                                        normalizeText(
                                          selectedSize
                                        ).toLowerCase() ===
                                        sizeName.toLowerCase();

                                      return (
                                        <button
                                          key={`${itemKey}-size-${sizeIndex}`}
                                          type="button"
                                          className={`crt-size-button${
                                            selected
                                              ? " selected"
                                              : ""
                                          }`}
                                          disabled={
                                            disabled
                                          }
                                          onClick={() =>
                                            handleSizeChange(
                                              item,
                                              sizeName
                                            )
                                          }
                                        >
                                          {sizeName}
                                        </button>
                                      );
                                    }
                                  )}

                                </div>

                              </div>
                            )}

                            {/* =================================================
                                PRICE INFO
                            ================================================= */}

                            <div className="crt-item-pricing">

                              <div className="crt-price-info">

                                <span>
                                  Unit Price
                                </span>

                                <strong>
                                  {formatPrice(
                                    sellingPrice
                                  )}
                                </strong>

                              </div>

                              <div className="crt-price-info shipping-row">

                                <span>
                                  Shipping
                                </span>

                                <strong>
                                  {shippingCost >
                                  0
                                    ? formatPrice(
                                        shippingCost
                                      )
                                    : "Free"}
                                </strong>

                              </div>

                            </div>

                            {/* =================================================
                                CONTROLS
                            ================================================= */}

                            <div className="crt-item-controls">

                              {/* QUANTITY */}

                              <div className="crt-qty-box">

                                <button
                                  type="button"
                                  className="crt-qty-btn"
                                  aria-label={`Decrease quantity of ${
                                    product?.name ||
                                    "product"
                                  }`}
                                  disabled={
                                    disabled ||
                                    quantity <=
                                      1
                                  }
                                  onClick={() =>
                                    handleQty(
                                      item,
                                      quantity -
                                        1
                                    )
                                  }
                                >
                                  −
                                </button>

                                <span className="crt-qty-value">
                                  {isQtyUpdating
                                    ? "..."
                                    : quantity}
                                </span>

                                <button
                                  type="button"
                                  className="crt-qty-btn"
                                  aria-label={`Increase quantity of ${
                                    product?.name ||
                                    "product"
                                  }`}
                                  disabled={
                                    disabled
                                  }
                                  onClick={() =>
                                    handleQty(
                                      item,
                                      quantity +
                                        1
                                    )
                                  }
                                >
                                  +
                                </button>

                              </div>

                              {/* REMOVE */}

                              <button
                                type="button"
                                className="crt-text-link"
                                disabled={
                                  disabled
                                }
                                onClick={() =>
                                  handleRemove(
                                    item
                                  )
                                }
                              >
                                {isRemoving
                                  ? "Removing..."
                                  : "Remove"}
                              </button>

                              {/* SAVE */}

                              <button
                                type="button"
                                className="crt-text-link"
                                disabled={
                                  disabled
                                }
                                onClick={() =>
                                  handleSaveForLater(
                                    item
                                  )
                                }
                              >
                                {isSaving
                                  ? "Saving..."
                                  : "Save for Later"}
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                  <div className="crt-hr bottom-hr" />

                  <Link
                    href="/"
                    className="crt-text-link crt-continue-bottom"
                  >
                    ← Continue Shopping
                  </Link>

                </div>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="crt-summary-col">

                  <div className="crt-summary-card">

                    <h2 className="crt-summary-title">
                      Order Summary
                    </h2>

                    <div className="crt-summary-line">
                      <span>
                        Subtotal
                      </span>

                      <span>
                        {formatPrice(
                          summary.subtotal
                        )}
                      </span>
                    </div>

                    <div className="crt-summary-line">
                      <span>
                        Shipping Charges
                      </span>

                      <span>
                        {summary.shipping >
                        0
                          ? formatPrice(
                              summary.shipping
                            )
                          : "Free"}
                      </span>
                    </div>

                    {Number(
                      summary.tax || 0
                    ) > 0 && (
                      <div className="crt-summary-line">
                        <span>
                          Tax
                        </span>

                        <span>
                          {formatPrice(
                            summary.tax
                          )}
                        </span>
                      </div>
                    )}

                    <div className="crt-summary-divider" />

                    <div className="crt-summary-total">
                      <span>
                        Total Amount
                      </span>

                      <strong>
                        {formatPrice(
                          summary.grandTotal
                        )}
                      </strong>
                    </div>

                    <p className="crt-summary-note">
                      Shipping charges are calculated from the
                      selected product variants.
                    </p>

                    <button
                      type="button"
                      className="crt-checkout-btn"
                      onClick={
                        handleCheckout
                      }
                      disabled={
                        cart.length ===
                        0
                      }
                    >
                      PROCEED TO CHECKOUT
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

        </main>

        <Footer />

        {/* =====================================================
            STYLES
        ===================================================== */}

        <style jsx>{`

          /* ==================================================
             BASE
          ================================================== */

          .crt-page-bg {
            min-height: 100vh;
            background: #fdfff1;
            color: #0e0e0e;
            font-family:
              "Mona Sans",
              "Inter",
              Arial,
              sans-serif;
          }

          .crt-outer-wrap {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 120px 48px 80px;
            box-sizing: border-box;
          }

          /* ==================================================
             TITLE
          ================================================== */

          .crt-title {
            margin: 0 0 42px;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;

            text-align: center;

            color: #0e0e0e;
          }

          /* ==================================================
             ERROR
          ================================================== */

          .crt-error {
            width: 100%;
            margin: 0 0 24px;
            padding: 12px 16px;

            border:
              1px solid #e7b2b2;

            border-radius: 6px;

            background: #fff5f5;
            color: #a52d2d;

            font-size: 13px;
            line-height: 1.4;

            text-align: center;
          }

          /* ==================================================
             LOADING
          ================================================== */

          .crt-loading {
            padding: 80px 20px;

            color: #777;

            font-size: 14px;

            text-align: center;
          }

          /* ==================================================
             EMPTY
          ================================================== */

          .crt-empty {
            padding:
              80px
              20px
              110px;

            text-align: center;
          }

          .crt-empty-icon {
            width: 82px;
            height: 82px;

            margin:
              0 auto
              18px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background:
              #f0f2de;

            color:
              #8a8d67;
          }

          .crt-empty p {
            margin: 0;

            color: #333;

            font-size: 16px;
          }

          .crt-continue-link {
            display:
              inline-block;

            margin-top:
              16px;

            color:
              #8a8d67;

            font-weight:
              600;

            text-decoration:
              none;
          }

          .crt-continue-link:hover {
            color:
              #747854;
          }

          /* ==================================================
             LAYOUT
          ================================================== */

          .crt-layout {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              380px;

            gap: 48px;

            align-items: start;
          }

          .crt-items-col {
            min-width: 0;
          }

          .crt-summary-col {
            position: sticky;
            top: 24px;
          }

          .crt-hr {
            width: 100%;

            border: none;

            border-top:
              1px solid #c8cab4;

            margin:
              0
              0
              28px;
          }

          .crt-hr.bottom-hr {
            margin:
              28px
              0
              18px;
          }

          /* ==================================================
             ITEM
          ================================================== */

          .crt-item-row {
            display: grid;

            grid-template-columns:
              180px
              minmax(0, 1fr);

            gap: 24px;

            margin-bottom:
              28px;

            padding-bottom:
              28px;

            border-bottom:
              1px solid
              #e2e3d5;
          }

          .crt-item-image {
            width: 180px;
            height: 180px;

            display: block;

            overflow: hidden;

            background:
              #f0f2de;

            text-decoration:
              none;
          }

          .crt-item-image img {
            width: 100%;
            height: 100%;

            display: block;

            object-fit: cover;

            transition:
              transform
              0.35s
              ease;
          }

          .crt-item-image:hover img {
            transform:
              scale(1.035);
          }

          /* ==================================================
             BODY
          ================================================== */

          .crt-item-body {
            min-width: 0;

            display: flex;
            flex-direction: column;

            gap: 13px;
          }

          .crt-item-top {
            display:
              flex;

            align-items:
              flex-start;

            justify-content:
              space-between;

            gap: 20px;
          }

          .crt-item-heading-block {
            min-width: 0;
          }

          .crt-item-name {
            display:
              block;

            margin:
              0;

            color:
              #0e0e0e;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size:
              20px;

            font-weight:
              700;

            line-height:
              1.25;

            text-decoration:
              none;
          }

          .crt-item-name:hover {
            color:
              #747854;
          }

          .crt-item-sku {
            margin:
              5px
              0
              0;

            color:
              #888888;

            font-size:
              11px;
          }

          .crt-item-price-block {
            flex-shrink:
              0;

            text-align:
              right;
          }

          .crt-item-price {
            margin:
              0;

            color:
              #0e0e0e;

            font-size:
              17px;

            font-weight:
              700;

            white-space:
              nowrap;
          }

          .crt-item-unit-old-price {
            margin:
              4px
              0
              0;

            color:
              #888888;

            font-size:
              11px;

            text-decoration:
              line-through;
          }

          /* ==================================================
             VARIANT BLOCK
          ================================================== */

          .crt-variant-block {
            width: 100%;
          }

          .crt-variant-heading {
            display:
              flex;

            align-items:
              center;

            gap:
              10px;

            margin-bottom:
              7px;

            color:
              #333333;

            font-size:
              11px;

            font-weight:
              700;
          }

          .crt-variant-heading small {
            color:
              #8a8d67;

            font-size:
              9px;

            font-weight:
              600;
          }

          /* ==================================================
             COLORS
          ================================================== */

          .crt-color-list {
            display:
              flex;

            align-items:
              center;

            flex-wrap:
              wrap;

            gap:
              9px;
          }

          .crt-color-button {
            position: relative;

            width:
              28px;

            height:
              28px;

            padding:
              0;

            border:
              1px solid
              #bababa;

            border-radius:
              50%;

            cursor:
              pointer;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            transition:
              transform
              0.15s
              ease,
              box-shadow
              0.15s
              ease;
          }

          .crt-color-button:hover:not(
            :disabled
          ) {
            transform:
              scale(1.08);
          }

          .crt-color-button.selected {
            box-shadow:
              0 0 0 2px
              #fdfff1,
              0 0 0 3px
              #111111;
          }

          .crt-color-button span {
            color:
              #ffffff;

            font-size:
              13px;

            font-weight:
              800;

            line-height:
              1;

            text-shadow:
              0
              1px
              2px
              rgba(
                0,
                0,
                0,
                0.35
              );
          }

          .crt-color-button:disabled {
            opacity:
              0.55;

            cursor:
              not-allowed;
          }

          .crt-selected-value {
            margin-top:
              6px;

            color:
              #777777;

            font-size:
              10px;
          }

          /* ==================================================
             SIZE
          ================================================== */

          .crt-size-list {
            display:
              flex;

            align-items:
              center;

            flex-wrap:
              wrap;

            gap:
              6px;
          }

          .crt-size-button {
            min-width:
              44px;

            height:
              32px;

            padding:
              0 10px;

            border:
              1px
              solid
              #c8cab4;

            border-radius:
              5px;

            background:
              #fdfff1;

            color:
              #111111;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size:
              10px;

            font-weight:
              700;

            cursor:
              pointer;

            transition:
              background
              0.15s
              ease,
              color
              0.15s
              ease,
              border-color
              0.15s
              ease;
          }

          .crt-size-button:hover:not(
            :disabled
          ) {
            border-color:
              #7b7f5c;
          }

          .crt-size-button.selected {
            background:
              #7b7f5c;

            border-color:
              #7b7f5c;

            color:
              #ffffff;
          }

          .crt-size-button:disabled {
            opacity:
              0.55;

            cursor:
              not-allowed;
          }

          /* ==================================================
             PRICE
          ================================================== */

          .crt-item-pricing {
            display:
              flex;

            align-items:
              center;

            flex-wrap:
              wrap;

            gap:
              20px;
          }

          .crt-price-info {
            display:
              flex;

            align-items:
              center;

            gap:
              8px;

            color:
              #666666;

            font-size:
              11px;
          }

          .crt-price-info strong {
            color:
              #0e0e0e;

            font-size:
              12px;
          }

          .crt-price-info.shipping-row strong {
            color:
              #3f4a2b;
          }

          /* ==================================================
             CONTROLS
          ================================================== */

          .crt-item-controls {
            display:
              flex;

            align-items:
              center;

            flex-wrap:
              wrap;

            gap:
              20px;

            margin-top:
              2px;
          }

          /* ==================================================
             QTY
          ================================================== */

          .crt-qty-box {
            width:
              118px;

            height:
              38px;

            display:
              flex;

            align-items:
              center;

            justify-content:
              space-between;

            border:
              1px
              solid
              #c8cab4;
          }

          .crt-qty-btn {
            width:
              34px;

            height:
              36px;

            padding:
              0;

            border:
              none;

            background:
              transparent;

            color:
              #0e0e0e;

            font-size:
              18px;

            line-height:
              1;

            cursor:
              pointer;
          }

          .crt-qty-btn:hover:not(
            :disabled
          ) {
            background:
              #f0f2de;
          }

          .crt-qty-btn:disabled {
            opacity:
              0.4;

            cursor:
              not-allowed;
          }

          .crt-qty-value {
            min-width:
              30px;

            color:
              #0e0e0e;

            font-size:
              13px;

            font-weight:
              700;

            text-align:
              center;
          }

          /* ==================================================
             LINKS
          ================================================== */

          .crt-text-link {
            padding:
              0;

            border:
              none;

            background:
              none;

            color:
              #0e0e0e;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size:
              12px;

            font-weight:
              600;

            text-decoration:
              underline;

            cursor:
              pointer;
          }

          .crt-text-link:hover:not(
            :disabled
          ) {
            color:
              #747854;
          }

          .crt-text-link:disabled {
            opacity:
              0.45;

            cursor:
              not-allowed;
          }

          .crt-continue-bottom {
            display:
              inline-block;

            color:
              #8a8d67;

            text-decoration:
              none;
          }

          /* ==================================================
             SUMMARY
          ================================================== */

          .crt-summary-card {
            padding:
              25px;

            border:
              1px
              solid
              #dcddce;

            background:
              #ffffff;
          }

          .crt-summary-title {
            margin:
              0
              0
              22px;

            color:
              #0e0e0e;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size:
              23px;

            font-weight:
              600;
          }

          .crt-summary-line {
            display:
              flex;

            align-items:
              flex-start;

            justify-content:
              space-between;

            gap:
              18px;

            margin-bottom:
              15px;

            color:
              #444444;

            font-size:
              13px;
          }

          .crt-summary-line span:last-child {
            flex-shrink:
              0;

            color:
              #111111;

            font-weight:
              600;
          }

          .crt-summary-divider {
            width:
              100%;

            margin:
              22px
              0;

            border-top:
              1px
              solid
              #c8cab4;
          }

          .crt-summary-total {
            display:
              flex;

            align-items:
              center;

            justify-content:
              space-between;

            gap:
              18px;

            margin-bottom:
              10px;

            color:
              #0e0e0e;

            font-family:
              "Tobias TRIAL",
              "Playfair Display",
              Georgia,
              serif;

            font-size:
              21px;

            font-weight:
              700;
          }

          .crt-summary-total strong {
            white-space:
              nowrap;
          }

          .crt-summary-note {
            margin:
              0
              0
              22px;

            color:
              #888888;

            font-size:
              11px;

            line-height:
              1.6;
          }

          .crt-checkout-btn {
            width:
              100%;

            height:
              55px;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            border:
              none;

            background:
              #8a8d67;

            color:
              #ffffff;

            font-family:
              "Mona Sans",
              "Inter",
              sans-serif;

            font-size:
              13px;

            font-weight:
              700;

            letter-spacing:
              0.05em;

            cursor:
              pointer;

            transition:
              background
              0.2s
              ease,
              opacity
              0.2s
              ease;
          }

          .crt-checkout-btn:hover:not(
            :disabled
          ) {
            background:
              #747854;
          }

          .crt-checkout-btn:disabled {
            opacity:
              0.45;

            cursor:
              not-allowed;
          }

          /* ==================================================
             TABLET
          ================================================== */

          @media (max-width: 960px) {

            .crt-outer-wrap {
              padding:
                90px
                24px
                60px;
            }

            .crt-layout {
              grid-template-columns:
                1fr;

              gap:
                38px;
            }

            .crt-summary-col {
              position:
                static;
            }

            .crt-summary-card {
              max-width:
                560px;

              margin:
                0 auto;
            }

            .crt-title {
              font-size:
                28px;
            }

          }

          /* ==================================================
             MOBILE
          ================================================== */

          @media (max-width: 700px) {

            .crt-outer-wrap {
              padding:
                88px
                14px
                45px;
            }

            .crt-title {
              margin:
                0
                0
                30px;

              font-size:
                28px;

              line-height:
                1.15;

              text-align:
                left;
            }

            .crt-layout {
              display:
                flex;

              flex-direction:
                column;

              gap:
                32px;
            }

            .crt-hr {
              margin-bottom:
                20px;
            }

            /* ==============================================
               ITEM
            ============================================== */

            .crt-item-row {
              display:
                grid;

              grid-template-columns:
                112px
                minmax(0, 1fr);

              gap:
                13px;

              margin-bottom:
                20px;

              padding-bottom:
                20px;
            }

            .crt-item-image {
              width:
                112px;

              height:
                112px;
            }

            .crt-item-body {
              gap:
                9px;
            }

            .crt-item-top {
              gap:
                8px;
            }

            .crt-item-name {
              font-family:
                "Mona Sans",
                "Inter",
                sans-serif;

              font-size:
                13px;

              font-weight:
                700;

              line-height:
                1.35;
            }

            .crt-item-sku {
              margin-top:
                3px;

              font-size:
                8px;
            }

            .crt-item-price {
              font-size:
                13px;
            }

            .crt-item-unit-old-price {
              font-size:
                8px;
            }

            /* ==============================================
               VARIANTS
            ============================================== */

            .crt-variant-heading {
              margin-bottom:
                5px;

              font-size:
                9px;
            }

            .crt-color-list {
              gap:
                7px;
            }

            .crt-color-button {
              width:
                22px;

              height:
                22px;
            }

            .crt-color-button span {
              font-size:
                10px;
            }

            .crt-selected-value {
              margin-top:
                4px;

              font-size:
                8px;
            }

            .crt-size-list {
              gap:
                4px;
            }

            .crt-size-button {
              min-width:
                34px;

              height:
                27px;

              padding:
                0 7px;

              font-size:
                8px;
            }

            /* ==============================================
               PRICE
            ============================================== */

            .crt-item-pricing {
              display:
                grid;

              grid-template-columns:
                1fr
                1fr;

              gap:
                5px 8px;
            }

            .crt-price-info {
              gap:
                5px;

              font-size:
                8px;
            }

            .crt-price-info strong {
              font-size:
                9px;
            }

            /* ==============================================
               CONTROLS
            ============================================== */

            .crt-item-controls {
              display:
                grid;

              grid-template-columns:
                1fr
                1fr;

              gap:
                7px;

              margin-top:
                2px;
            }

            .crt-qty-box {
              width:
                100%;

              height:
                35px;

              grid-column:
                1 / -1;
            }

            .crt-qty-btn {
              width:
                34px;

              height:
                33px;

              font-size:
                17px;
            }

            .crt-qty-value {
              font-size:
                11px;
            }

            .crt-text-link {
              width:
                100%;

              min-height:
                34px;

              display:
                flex;

              align-items:
                center;

              justify-content:
                center;

              border:
                1px
                solid
                #c8cab4;

              background:
                #ffffff;

              font-size:
                9px;

              text-decoration:
                none;
            }

            .crt-continue-bottom {
              display:
                inline-flex;

              min-height:
                auto;

              border:
                none;

              background:
                transparent;

              font-size:
                11px;
            }

            /* ==============================================
               SUMMARY
            ============================================== */

            .crt-summary-card {
              width:
                100%;

              padding:
                18px;
            }

            .crt-summary-title {
              font-size:
                21px;

              margin-bottom:
                18px;
            }

            .crt-summary-line {
              font-size:
                12px;

              margin-bottom:
                13px;
            }

            .crt-summary-total {
              font-size:
                20px;
            }

            .crt-summary-note {
              font-size:
                10px;

              margin-bottom:
                18px;
            }

            .crt-checkout-btn {
              height:
                50px;

              font-size:
                12px;
            }

          }

          /* ==================================================
             VERY SMALL MOBILE
          ================================================== */

          @media (max-width: 380px) {

            .crt-outer-wrap {
              padding:
                80px
                9px
                40px;
            }

            .crt-title {
              font-size:
                25px;
            }

            .crt-item-row {
              grid-template-columns:
                96px
                minmax(0, 1fr);

              gap:
                10px;
            }

            .crt-item-image {
              width:
                96px;

              height:
                96px;
            }

            .crt-item-name {
              font-size:
                11px;
            }

            .crt-item-price {
              font-size:
                12px;
            }

            .crt-color-button {
              width:
                20px;

              height:
                20px;
            }

            .crt-size-button {
              min-width:
                31px;

              height:
                25px;

              padding:
                0 5px;

              font-size:
                7px;
            }

            .crt-text-link {
              min-height:
                32px;

              font-size:
                8px;
            }

          }

        `}</style>

      </>
    </ProtectedRoute>
  );
}