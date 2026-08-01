"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { getCart, getCartSubtotal, formatPrice } from "@/lib/cart";
import Link from "next/link";
import Script from "next/script";

/* -------------------------------------------------------------------------- */
/*  CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

// Flat shipping + tax rules — swap for API-driven values when the
// rates service is ready.
const FREE_SHIPPING_THRESHOLD = 5000;
const STANDARD_SHIPPING_FEE = 199;
const TAX_RATE = 0.03; // 3% GST on jewellery, adjust per finance guidance

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    label: "Pay Online",
    description: "Cards, UPI, Netbanking & Wallets via Razorpay",
  },
  {
    id: "cod",
    label: "Cash On Delivery",
    description: "Pay in cash when your order arrives",
  },
];

/* -------------------------------------------------------------------------- */
/*  PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function CheckoutPage() {
  /* ---------------------------- Core state ---------------------------- */
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [tempAddress, setTempAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  /* ---------------------------- Aux state ------------------------------ */
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
 const [newAddress,setNewAddress]=useState({

label:"Home",

firstName:"",

lastName:"",

address1:"",

address2:"",

city:"",

state:"",

country:"India",

pin:"",

mobile:"",

altMobile:""

});
  const [savingAddress, setSavingAddress] = useState(false);

  const modalRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /*  DATA LOADING                                                               */
  /* -------------------------------------------------------------------------- */

  const loadCheckout = useCallback(async () => {
    setLoading(true);
    try {
     const cartItems = await getCart();
      setCart(Array.isArray(cartItems) ? cartItems : []);

  const response = await apiFetch("/user/addresses");

const addressList = response.data?.addresses || [];

      setAddresses(addressList);

      const defaultAddress =
        addressList.find((addr) => addr.isDefault) || addressList[0] || null;
      setSelectedAddress(defaultAddress);
      setTempAddress(defaultAddress);
    } catch (error) {
      console.error("Failed to load checkout data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCheckout();
  }, [loadCheckout]);

  /* -------------------------------------------------------------------------- */
  /*  MODAL — ESC + OUTSIDE CLICK                                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!showAddressModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAddressModal();
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeAddressModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddressModal]);

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setShowAddAddressForm(false);
    setTempAddress(selectedAddress);
  };

  const handleUseSelectedAddress = () => {
    setSelectedAddress(tempAddress);
    setShowAddressModal(false);
    setShowAddAddressForm(false);
  };

  /* -------------------------------------------------------------------------- */
  /*  ADD ADDRESS                                                                */
  /* -------------------------------------------------------------------------- */

  const handleNewAddressChange = (field, value) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewAddress = async () => {
  const required = [
"firstName",
"lastName",
"address1",
"city",
"state",
"pin",
"mobile"
];
    const missing = required.some((field) => !newAddress[field]?.trim());
    if (missing) return;

    setSavingAddress(true);
    try {
      const saved = await apiFetch("/user/addresses", {
        method: "POST",
        body: JSON.stringify(newAddress),
      });

   const savedAddress =
saved.data?.address || newAddress;
      setAddresses((prev) => [...prev, savedAddress]);
    setSelectedAddress(savedAddress);
setShowAddressModal(false);
    setNewAddress({

label:"Home",

firstName:"",

lastName:"",

address1:"",

address2:"",

city:"",

state:"",

country:"India",

pin:"",

mobile:"",

altMobile:""

});
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setSavingAddress(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*  COUPON                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await apiFetch("/checkout/coupon/apply", {
        method: "POST",
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });

     if(!response.ok) {
        setCouponError(response?.message || "This coupon is not valid.");
        setCoupon(null);
        return;
      }

     setCoupon({
  code: response.data?.code || code.toUpperCase(),
  discount: response.data?.discount ?? 0,
  type: response.data?.type || "flat",
});
    } catch (error) {
      console.error("Coupon apply failed:", error);
      setCouponError("Couldn't apply this coupon. Please try again.");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  /* -------------------------------------------------------------------------- */
  /*  PRICE CALCULATIONS                                                         */
  /* -------------------------------------------------------------------------- */

  const subtotal = useMemo(() => {
    if (typeof getCartSubtotal === "function") {
      return getCartSubtotal(cart) || 0;
    }
    return cart.reduce(
      (sum, item) => sum + (item.product.price || 0) * (item.quantity || 1),
      0
    );
  }, [cart]);

  const shipping = useMemo(() => {
    if (cart.length === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal, cart.length]);

  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") {
      return Math.round((subtotal * coupon.discount) / 100);
    }
    return Math.min(coupon.discount, subtotal);
  }, [coupon, subtotal]);

  const grandTotal = useMemo(
    () => Math.max(subtotal + shipping + tax - discount, 0),
    [subtotal, shipping, tax, discount]
  );

  /* -------------------------------------------------------------------------- */
  /*  PLACE ORDER                                                                */
  /* -------------------------------------------------------------------------- */

 const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    setOrderError("Please select a delivery address.");
    return;
  }

  if (cart.length === 0) {
    setOrderError("Your bag is empty.");
    return;
  }

  setOrderError("");
  setPlacingOrder(true);

  try {
    // STEP 1 - Create Order
    const orderRes = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        addressId: selectedAddress._id,
        paymentMethod,
      }),
    });

    if (!orderRes.ok) {
      throw new Error(
        orderRes.data?.message || "Failed to create order."
      );
    }

    // COD Order
    if (paymentMethod === "cod") {
      window.location.href = "/checkout/success";
      return;
    }

    // STEP 2 - Create Razorpay Order
    const razorpayRes = await apiFetch("/orders/razorpay", {
      method: "POST",
      body: JSON.stringify({
        orderId: orderRes.data.order._id,
      }),
    });

    if (!razorpayRes.ok) {
      throw new Error(
        razorpayRes.data?.message || "Failed to create payment."
      );
    }

    // STEP 3 - Open Razorpay
    const options = {
      key: razorpayRes.data.key,
      amount: razorpayRes.data.order.amount,
      currency: razorpayRes.data.order.currency,
      name: "Nikita Home Furnishings",
      description: "Order Payment",
      order_id: razorpayRes.data.order.id,

      handler: async function (response) {
        const verifyRes = await apiFetch("/orders/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        if (verifyRes.ok) {
          window.location.href = "/checkout/success";
        } else {
          alert(
            verifyRes.data?.message ||
              "Payment verification failed."
          );
        }
      },

      modal: {
    ondismiss: function () {
      window.location.href = "/checkout/failed";
    },
  },

      theme: {
        color: "#111111",
      },
    };
    if (!window.Razorpay) {
  throw new Error("Razorpay SDK failed to load.");
}

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Order placement failed:", error);

    setOrderError(
      error.message ||
        "We couldn't place your order. Please try again."
    );
  } finally {
    setPlacingOrder(false);
  }
};

  /* -------------------------------------------------------------------------- */
  /*  DERIVED HELPERS                                                            */
  /* -------------------------------------------------------------------------- */

  const isPlaceOrderDisabled =
    placingOrder || cart.length === 0 || !selectedAddress || loading;

  /* -------------------------------------------------------------------------- */
  /*  RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <ProtectedRoute>
        <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="lazyOnload"
/>
      

      <main className="chk-page">
        <div className="chk-container">
          <div className="chk-eyebrow">Secure Checkout</div>
          <h1 className="chk-title">Complete Your Order</h1>

          {loading ? (
            <CheckoutSkeleton />
          ) : (
            <div className="chk-grid">
              {/* ---------------------------------------------------------- */}
              {/* LEFT COLUMN                                                 */}
              {/* ---------------------------------------------------------- */}
              <div className="chk-left">
                {/* ---------------- Delivery Address ---------------- */}
                <section className="chk-card" aria-labelledby="address-heading">
                  <div className="chk-card-header">
                    <h2 id="address-heading" className="chk-card-title">
                      Delivery Address
                    </h2>
                  </div>

                  {selectedAddress ? (
                    <div className="chk-address-block">
                      <div className="chk-address-top">
                        <span className="chk-address-label">
                          {selectedAddress.label || "Address"}
                        </span>
                        {selectedAddress.isDefault && (
                          <span className="chk-badge">Default</span>
                        )}
                      </div>
                      <p className="chk-address-name">{`${selectedAddress.firstName}
${selectedAddress.lastName}`}</p>
                      <p className="chk-address-line">{selectedAddress.mobile}</p>
                      <p className="chk-address-line">
                        {selectedAddress.address1}
                        {selectedAddress.address2 ? `, ${selectedAddress.address2}` : ""}
                      </p>
                      <p className="chk-address-line">
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.pin}
                      </p>
                      <p className="chk-address-line">
                        {selectedAddress.country || "India"}
                      </p>

                      <div className="chk-address-actions">
                        <button
                          type="button"
                          className="chk-btn-outline"
                          onClick={() => setShowAddressModal(true)}
                        >
                          Change Address
                        </button>
                        <button
                          type="button"
                          className="chk-btn-ghost"
                          onClick={() => {
                            setShowAddAddressForm(true);
                            setShowAddressModal(true);
                          }}
                        >
                          + Add New Address
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="chk-address-empty">
                      <p>No delivery address saved yet.</p>
                      <button
                        type="button"
                        className="chk-btn-outline"
                        onClick={() => {
                          setShowAddAddressForm(true);
                          setShowAddressModal(true);
                        }}
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  )}
                </section>

                {/* ---------------- Cart Products ---------------- */}
                <section className="chk-card" aria-labelledby="bag-heading">
                  <div className="chk-card-header">
                    <h2 id="bag-heading" className="chk-card-title">
                      Your Bag
                    </h2>
                    <span className="chk-item-count">
                      {cart.length} {cart.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="chk-empty-state">
                      <div className="chk-empty-icon" aria-hidden="true">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        >
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </div>
                      <p className="chk-empty-title">Your bag is empty</p>
                      <p className="chk-empty-subtitle">
                        Discover pieces made to be kept forever.
                      </p>
                      <Link href="/" className="chk-btn-primary chk-btn-inline">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <ul className="chk-product-list">
                      {cart.map((item) => {
                        const image =
                         item.product.mainImage || item.images?.[0] || "/placeholder-product.png";
                        const key = item.cartItemId || item.id || item.slug;
                        return (
                          <li className="chk-product-row" key={key}>
                            <div className="chk-product-image">
                              <img src={image} alt={item.product.name || "Product image"} />
                            </div>
                            <div className="chk-product-info">
                              <p className="chk-product-name">{item.product.name}</p>
                              <div className="chk-product-meta">
                                {item.variant && (
                                  <span>Variant: {item.variant}</span>
                                )}
                                {item.color && <span>Color: {item.color}</span>}
                                {item.size && <span>Size: {item.size}</span>}
                              </div>
                              <div className="chk-product-qty">
                                Qty: {item.quantity || 1}
                              </div>
                            </div>
                            <div className="chk-product-price">
                              <span className="chk-product-unit">
                                {formatPrice(item.product.price || 0)} each
                              </span>
                              <span className="chk-product-total">
                                {formatPrice(
(item.product.price || 0) * (item.quantity || 1)
)}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* RIGHT COLUMN                                                */}
              {/* ---------------------------------------------------------- */}
              <div className="chk-right">
                <div className="chk-summary-sticky">
                  {/* ---------------- Order Summary ---------------- */}
                  <section className="chk-card" aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="chk-card-title">
                      Order Summary
                    </h2>

                    <div className="chk-summary-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="chk-summary-row">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="chk-summary-row">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="chk-summary-row chk-summary-discount">
                        <span>Discount ({coupon?.code})</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div className="chk-divider" />

                    <div className="chk-summary-row chk-summary-total">
                      <span>Grand Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>

                    {/* ---------------- Coupon ---------------- */}
                    <div className="chk-coupon">
                      {coupon ? (
                        <div className="chk-coupon-applied">
                          <span>
                            <strong>{coupon.code}</strong> applied
                          </span>
                          <button
                            type="button"
                            className="chk-coupon-remove"
                            onClick={handleRemoveCoupon}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="chk-coupon-input-row">
                          <label htmlFor="coupon-input" className="chk-visually-hidden">
                            Coupon code
                          </label>
                          <input
                            id="coupon-input"
                            type="text"
                            className="chk-coupon-input"
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) =>
                              setCouponInput(e.target.value.toUpperCase())
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCoupon();
                            }}
                          />
                          <button
                            type="button"
                            className="chk-btn-outline chk-coupon-apply"
                            onClick={handleCoupon}
                            disabled={couponLoading || !couponInput.trim()}
                          >
                            {couponLoading ? "Applying..." : "Apply"}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="chk-coupon-error" role="alert">
                          {couponError}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* ---------------- Payment ---------------- */}
                  <section className="chk-card" aria-labelledby="payment-heading">
                    <h2 id="payment-heading" className="chk-card-title">
                      Payment Method
                    </h2>
                    <div className="chk-payment-list" role="radiogroup" aria-labelledby="payment-heading">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.id}
                          className={`chk-payment-option ${
                            paymentMethod === method.id ? "chk-payment-option-active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <span className="chk-payment-radio" aria-hidden="true" />
                          <span className="chk-payment-text">
                            <span className="chk-payment-label">{method.label}</span>
                            <span className="chk-payment-desc">{method.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* ---------------- Security / Trust ---------------- */}
                  <section className="chk-trust-card" aria-label="Purchase assurances">
                    <div className="chk-trust-item">
                      <TrustIcon type="secure" />
                      <span>100% Secure Payment</span>
                    </div>
                    <div className="chk-trust-item">
                      <TrustIcon type="shipping" />
                      <span>Free Shipping</span>
                    </div>
                    <div className="chk-trust-item">
                      <TrustIcon type="returns" />
                      <span>Easy Returns</span>
                    </div>
                    <div className="chk-trust-item">
                      <TrustIcon type="packaging" />
                      <span>Premium Packaging</span>
                    </div>
                  </section>

                  {orderError && (
                    <p className="chk-order-error" role="alert">
                      {orderError}
                    </p>
                  )}

                  <button
                    type="button"
                    className="chk-place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={isPlaceOrderDisabled}
                  >
                    {placingOrder ? (
                      <span className="chk-btn-loading">
                        <span className="chk-spinner" aria-hidden="true" />
                        Placing Order...
                      </span>
                    ) : (
                      `Place Order — ${formatPrice(grandTotal)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* MOBILE STICKY CHECKOUT BAR                                        */}
      {/* ---------------------------------------------------------------- */}
      {!loading && cart.length > 0 && (
        <div className="chk-mobile-bar">
          <div className="chk-mobile-bar-total">
            <span className="chk-mobile-bar-label">Total</span>
            <span className="chk-mobile-bar-amount">{formatPrice(grandTotal)}</span>
          </div>
          <button
            type="button"
            className="chk-mobile-bar-btn"
            onClick={handlePlaceOrder}
            disabled={isPlaceOrderDisabled}
          >
            {placingOrder ? "Placing..." : "Place Order"}
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ADDRESS MODAL                                                     */}
      {/* ---------------------------------------------------------------- */}
      {showAddressModal && (
        <div className="chk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="chk-modal" ref={modalRef}>
            <div className="chk-modal-header">
              <h2 id="modal-title" className="chk-modal-title">
                {showAddAddressForm ? "Add New Address" : "Select Delivery Address"}
              </h2>
              <button
                type="button"
                className="chk-modal-close"
                onClick={closeAddressModal}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="chk-modal-body">
              {showAddAddressForm ? (
                <form
                  className="chk-address-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveNewAddress();
                  }}
                >
                  <div className="chk-form-row">
                   <div className="chk-form-grid">
  <div className="chk-form-row">
    <label>First Name</label>
    <input
      type="text"
      value={newAddress.firstName}
      onChange={(e)=>handleNewAddressChange("firstName",e.target.value)}
      required
    />
  </div>

  <div className="chk-form-row">
    <label>Last Name</label>
    <input
      type="text"
      value={newAddress.lastName}
      onChange={(e)=>handleNewAddressChange("lastName",e.target.value)}
      required
    />
  </div>
</div>
                  </div>
                  <div className="chk-form-row">
                    <label htmlFor="addr-phone">Phone Number</label>
                    <input
                      id="addr-phone"
                      type="tel"
                    value={newAddress.mobile}

onChange={(e)=>
handleNewAddressChange("mobile",e.target.value)
}
                      required
                    />
                  </div>
                  <div className="chk-form-row">
                    <label htmlFor="addr-line1">Address 1</label>
                    <input
                      id="addr-line1"
                      type="text"
                  value={newAddress.address1}

onChange={(e)=>
handleNewAddressChange("address1",e.target.value)
}
                      required
                    />
                  </div>
                  <div className="chk-form-row">
  <label>Address Line 2 (Optional)</label>

  <input
    type="text"
    value={newAddress.address2}
    onChange={(e)=>
      handleNewAddressChange("address2",e.target.value)
    }
  />
</div>
                  <div className="chk-form-grid">
                    <div className="chk-form-row">
                      <label htmlFor="addr-city">City</label>
                      <input
                        id="addr-city"
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => handleNewAddressChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="chk-form-row">
                      <label htmlFor="addr-state">State</label>
                      <input
                        id="addr-state"
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => handleNewAddressChange("state", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="chk-form-grid">
                    <div className="chk-form-row">
                      <label htmlFor="addr-country">Country</label>
                      <input
                        id="addr-country"
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => handleNewAddressChange("country", e.target.value)}
                        required
                      />
                    </div>
                    <div className="chk-form-row">
  <label>Alternate Mobile (Optional)</label>

  <input
    type="tel"
    value={newAddress.altMobile}
    onChange={(e)=>
      handleNewAddressChange("altMobile",e.target.value)
    }
  />
</div>
                    <div className="chk-form-row">
                      <label htmlFor="addr-pin">Pincode</label>
                      <input
                        id="addr-pin"
                        type="text"
                        inputMode="numeric"
                     value={newAddress.pin}

onChange={(e)=>
handleNewAddressChange("pin",e.target.value)
}
                        required
                      />
                    </div>
                  </div>

                  <div className="chk-modal-footer">
                    <button
                      type="button"
                      className="chk-btn-ghost"
                      onClick={() => setShowAddAddressForm(false)}
                    >
                      Back to Saved Addresses
                    </button>
                    <button type="submit" className="chk-btn-primary" disabled={savingAddress}>
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <p className="chk-modal-empty">No saved addresses yet.</p>
                  ) : (
                    <div className="chk-address-radio-list" role="radiogroup" aria-label="Saved addresses">
                      {addresses.map((addr) => {
                        const isChecked =tempAddress?._id===addr._id;
                        return (
                          <label
                           key={addr._id}
                            className={`chk-address-radio ${
                              isChecked ? "chk-address-radio-active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryAddress"
                              checked={isChecked}
                              onChange={() => setTempAddress(addr)}
                            />
                            <span className="chk-payment-radio" aria-hidden="true" />
                            <span className="chk-address-radio-text">
                              <span className="chk-address-radio-top">
                                <strong>{addr.label || "Address"}</strong>
                                {addr.isDefault && <span className="chk-badge">Default</span>}
                              </span>
                              <span>{addr.firstName+" "+addr.lastName} • {addr.mobile}</span>
                              <span>
                                {addr.address1}, {addr.city}, {addr.state} {addr.pin}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="chk-modal-footer">
                    <button
                      type="button"
                      className="chk-btn-ghost"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      + Add Address
                    </button>
                    <button
                      type="button"
                      className="chk-btn-primary"
                      onClick={handleUseSelectedAddress}
                      disabled={!tempAddress}
                    >
                      Use Selected Address
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    

      <style jsx>{`
        /* ------------------------------------------------------------ */
        /* BASE / LAYOUT                                                  */
        /* ------------------------------------------------------------ */
        .chk-page {
          background: #fefff5;
          min-height: 100vh;
          padding: 48px 0 120px;
          font-family: "Mona Sans", "Inter", sans-serif;
          color: #111111;
        }

        .chk-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
        }

        .chk-eyebrow {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7b7f5c;
          font-weight: 600;
          margin-bottom: 8px;
          animation: chkFadeIn 0.5s ease both;
        }

        .chk-title {
          font-family: "Tobias TRIAL", "Playfair Display", serif;
          font-weight: 500;
          font-size: 36px;
          letter-spacing: 0.01em;
          margin: 0 0 36px;
          color: #111111;
          animation: chkFadeIn 0.6s ease both;
        }

        .chk-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .chk-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        .chk-right {
          min-width: 0;
        }

        .chk-summary-sticky {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ------------------------------------------------------------ */
        /* CARD                                                           */
        /* ------------------------------------------------------------ */
        .chk-card {
          background: #ffffff;
          border: 1px solid #e3e5d8;
          border-radius: 14px;
          padding: 28px;
          box-sizing: border-box;
          animation: chkFadeSlideUp 0.5s ease both;
        }

        .chk-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .chk-card-title {
          font-family: "Tobias TRIAL", "Playfair Display", serif;
          font-weight: 500;
          font-size: 20px;
          margin: 0 0 18px;
          color: #111111;
        }

        .chk-card-header .chk-card-title {
          margin-bottom: 0;
        }

        .chk-item-count {
          font-size: 13px;
          color: #666666;
        }

        /* ------------------------------------------------------------ */
        /* ADDRESS                                                        */
        /* ------------------------------------------------------------ */
        .chk-address-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .chk-address-label {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7b7f5c;
          font-weight: 700;
        }

        .chk-badge {
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: #fafbf3;
          border: 1px solid #e3e5d8;
          color: #7b7f5c;
          padding: 3px 9px;
          border-radius: 100px;
          font-weight: 700;
        }

        .chk-address-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .chk-address-line {
          font-size: 14px;
          color: #666666;
          margin: 0 0 2px;
          line-height: 1.6;
        }

        .chk-address-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .chk-address-empty {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          color: #666666;
        }

        /* ------------------------------------------------------------ */
        /* BUTTONS                                                        */
        /* ------------------------------------------------------------ */
        .chk-btn-outline {
          background: transparent;
          border: 1px solid #111111;
          color: #111111;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 11px 22px;
          border-radius: 100px;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease, transform 0.15s ease;
        }

        .chk-btn-outline:hover:not(:disabled) {
          background: #111111;
          color: #ffffff;
        }

        .chk-btn-outline:active:not(:disabled) {
          transform: scale(0.97);
        }

        .chk-btn-outline:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .chk-btn-ghost {
          background: transparent;
          border: none;
          color: #7b7f5c;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 11px 6px;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s ease;
        }

        .chk-btn-ghost:hover {
          opacity: 0.7;
        }

        .chk-btn-primary {
          background: #7b7f5c;
          border: 1px solid #7b7f5c;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          padding: 12px 26px;
          border-radius: 100px;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.15s ease;
        }

        .chk-btn-primary:hover:not(:disabled) {
          background: #666a4c;
        }

        .chk-btn-primary:active:not(:disabled) {
          transform: scale(0.97);
        }

        .chk-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chk-btn-inline {
          text-decoration: none;
          display: inline-block;
        }

        /* ------------------------------------------------------------ */
        /* EMPTY STATE                                                    */
        /* ------------------------------------------------------------ */
        .chk-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 20px;
          gap: 6px;
        }

        .chk-empty-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #fafbf3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7b7f5c;
          margin-bottom: 12px;
        }

        .chk-empty-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .chk-empty-subtitle {
          font-size: 14px;
          color: #666666;
          margin: 0 0 18px;
        }

        /* ------------------------------------------------------------ */
        /* PRODUCT LIST                                                   */
        /* ------------------------------------------------------------ */
        .chk-product-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .chk-product-row {
          display: grid;
          grid-template-columns: 84px 1fr auto;
          gap: 18px;
          padding: 20px 0;
          border-top: 1px solid #e3e5d8;
          align-items: center;
          transition: background 0.2s ease;
        }

        .chk-product-row:first-child {
          border-top: none;
        }

        .chk-product-image {
          width: 84px;
          height: 84px;
          border-radius: 10px;
          overflow: hidden;
          background: #fafbf3;
          border: 1px solid #e3e5d8;
          flex-shrink: 0;
        }

        .chk-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .chk-product-info {
          min-width: 0;
        }

        .chk-product-name {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 6px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chk-product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12.5px;
          color: #666666;
          margin-bottom: 6px;
        }

        .chk-product-qty {
          font-size: 12.5px;
          color: #666666;
        }

        .chk-product-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          text-align: right;
          white-space: nowrap;
        }

        .chk-product-unit {
          font-size: 12px;
          color: #666666;
        }

        .chk-product-total {
          font-size: 15px;
          font-weight: 700;
          color: #111111;
        }

        /* ------------------------------------------------------------ */
        /* ORDER SUMMARY                                                  */
        /* ------------------------------------------------------------ */
        .chk-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666666;
          padding: 8px 0;
        }

        .chk-summary-discount {
          color: #7b7f5c;
          font-weight: 600;
        }

        .chk-divider {
          height: 1px;
          background: #e3e5d8;
          margin: 10px 0;
        }

        .chk-summary-total {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
          padding-bottom: 4px;
        }

        /* ------------------------------------------------------------ */
        /* COUPON                                                         */
        /* ------------------------------------------------------------ */
        .chk-coupon {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px dashed #e3e5d8;
        }

        .chk-coupon-input-row {
          display: flex;
          gap: 10px;
        }

        .chk-coupon-input {
          flex: 1;
          min-width: 0;
          border: 1px solid #e3e5d8;
          border-radius: 100px;
          padding: 11px 18px;
          font-size: 13px;
          font-family: inherit;
          color: #111111;
          background: #fafbf3;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .chk-coupon-input:focus {
          border-color: #7b7f5c;
        }

        .chk-coupon-apply {
          flex-shrink: 0;
          padding: 11px 20px;
        }

        .chk-coupon-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbf3;
          border: 1px solid #e3e5d8;
          border-radius: 100px;
          padding: 10px 18px;
          font-size: 13px;
        }

        .chk-coupon-remove {
          background: none;
          border: none;
          color: #b23b3b;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .chk-coupon-error {
          color: #b23b3b;
          font-size: 12.5px;
          margin: 8px 0 0;
        }

        /* ------------------------------------------------------------ */
        /* PAYMENT                                                        */
        /* ------------------------------------------------------------ */
        .chk-payment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chk-payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e3e5d8;
          border-radius: 10px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .chk-payment-option:hover {
          border-color: #7b7f5c;
        }

        .chk-payment-option-active {
          border-color: #7b7f5c;
          background: #fafbf3;
        }

        .chk-payment-option input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .chk-payment-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #666666;
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.2s ease;
        }

        .chk-payment-option-active .chk-payment-radio,
        .chk-address-radio-active .chk-payment-radio {
          border-color: #7b7f5c;
        }

        .chk-payment-option-active .chk-payment-radio::after,
        .chk-address-radio-active .chk-payment-radio::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #7b7f5c;
        }

        .chk-payment-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chk-payment-label {
          font-size: 14px;
          font-weight: 600;
        }

        .chk-payment-desc {
          font-size: 12.5px;
          color: #666666;
        }

        /* ------------------------------------------------------------ */
        /* TRUST / SECURITY CARD                                         */
        /* ------------------------------------------------------------ */
        .chk-trust-card {
          background: #fafbf3;
          border: 1px solid #e3e5d8;
          border-radius: 14px;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .chk-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: #111111;
          font-weight: 500;
        }

        .chk-trust-item :global(svg) {
          flex-shrink: 0;
          color: #7b7f5c;
        }

        /* ------------------------------------------------------------ */
        /* PLACE ORDER                                                    */
        /* ------------------------------------------------------------ */
        .chk-place-order-btn {
          width: 100%;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 18px 24px;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.15s ease;
        }

        .chk-place-order-btn:hover:not(:disabled) {
          background: #7b7f5c;
        }

        .chk-place-order-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .chk-place-order-btn:disabled {
          background: #b8bba4;
          cursor: not-allowed;
        }

        .chk-btn-loading {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .chk-spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          animation: chkSpin 0.7s linear infinite;
        }

        .chk-order-error {
          color: #b23b3b;
          font-size: 13px;
          text-align: center;
          margin: 0;
        }

        /* ------------------------------------------------------------ */
        /* MOBILE STICKY BAR                                              */
        /* ------------------------------------------------------------ */
        .chk-mobile-bar {
          display: none;
        }

        /* ------------------------------------------------------------ */
        /* MODAL                                                          */
        /* ------------------------------------------------------------ */
        .chk-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 17, 17, 0.5);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          box-sizing: border-box;
          animation: chkOverlayFade 0.25s ease both;
        }

        .chk-modal {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          max-height: 86vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chkModalRise 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .chk-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px;
          border-bottom: 1px solid #e3e5d8;
          flex-shrink: 0;
        }

        .chk-modal-title {
          font-family: "Tobias TRIAL", "Playfair Display", serif;
          font-size: 19px;
          font-weight: 500;
          margin: 0;
        }

        .chk-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #111111;
          padding: 6px;
          display: flex;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .chk-modal-close:hover {
          background: #fafbf3;
        }

        .chk-modal-body {
          padding: 24px;
          overflow-y: auto;
        }

        .chk-modal-empty {
          color: #666666;
          font-size: 14px;
          text-align: center;
          padding: 24px 0;
        }

        .chk-address-radio-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chk-address-radio {
          display: flex;
          gap: 12px;
          border: 1px solid #e3e5d8;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .chk-address-radio:hover {
          border-color: #7b7f5c;
        }

        .chk-address-radio-active {
          border-color: #7b7f5c;
          background: #fafbf3;
        }

        .chk-address-radio input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .chk-address-radio-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13.5px;
          color: #666666;
        }

        .chk-address-radio-top {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #111111;
        }

        .chk-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        /* ------------------------------------------------------------ */
        /* ADD ADDRESS FORM                                               */
        /* ------------------------------------------------------------ */
        .chk-address-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chk-form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .chk-form-row label {
          font-size: 12px;
          font-weight: 600;
          color: #666666;
          letter-spacing: 0.02em;
        }

        .chk-form-row input {
          border: 1px solid #e3e5d8;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: inherit;
          color: #111111;
          background: #fafbf3;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .chk-form-row input:focus {
          border-color: #7b7f5c;
        }

        .chk-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .chk-visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }

        /* ------------------------------------------------------------ */
        /* SKELETON                                                       */
        /* ------------------------------------------------------------ */
        .chk-skeleton-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 32px;
        }

        .chk-skel-block {
          background: linear-gradient(90deg, #fafbf3 25%, #f0f1e6 37%, #fafbf3 63%);
          background-size: 400% 100%;
          animation: chkShimmer 1.4s ease infinite;
          border-radius: 14px;
        }

        /* ------------------------------------------------------------ */
        /* KEYFRAMES                                                      */
        /* ------------------------------------------------------------ */
        @keyframes chkFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes chkFadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chkSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes chkOverlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes chkModalRise {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chkShimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* ------------------------------------------------------------ */
        /* RESPONSIVE                                                     */
        /* ------------------------------------------------------------ */
        @media (max-width: 1024px) {
          .chk-container {
            padding: 0 24px;
          }

          .chk-grid,
          .chk-skeleton-grid {
            grid-template-columns: 1fr;
          }

          .chk-summary-sticky {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .chk-page {
            padding: 28px 0 110px;
          }

          .chk-container {
            padding: 0 20px;
          }

          .chk-title {
            font-size: 26px;
            margin-bottom: 24px;
          }

          .chk-card {
            padding: 20px;
            border-radius: 12px;
          }

          .chk-product-row {
            grid-template-columns: 64px 1fr;
            row-gap: 10px;
          }

          .chk-product-image {
            width: 64px;
            height: 64px;
          }

          .chk-product-price {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
          }

          .chk-trust-card {
            grid-template-columns: 1fr;
          }

          .chk-address-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .chk-coupon-input-row {
            flex-direction: column;
          }

          .chk-place-order-btn {
            display: none;
          }

          .chk-mobile-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid #e3e5d8;
            padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
            z-index: 500;
            box-shadow: 0 -4px 20px rgba(17, 17, 17, 0.06);
            animation: chkFadeSlideUp 0.4s ease both;
          }

          .chk-mobile-bar-total {
            display: flex;
            flex-direction: column;
          }

          .chk-mobile-bar-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #666666;
          }

          .chk-mobile-bar-amount {
            font-size: 18px;
            font-weight: 700;
            color: #111111;
          }

          .chk-mobile-bar-btn {
            background: #111111;
            color: #ffffff;
            border: none;
            border-radius: 100px;
            padding: 14px 28px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.25s ease;
          }

          .chk-mobile-bar-btn:disabled {
            background: #b8bba4;
            cursor: not-allowed;
          }

          .chk-form-grid {
            grid-template-columns: 1fr;
          }

          .chk-modal-footer {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .chk-modal-footer .chk-btn-primary,
          .chk-modal-footer .chk-btn-ghost {
            width: 100%;
            text-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chk-page *,
          .chk-page *::before,
          .chk-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}

/* -------------------------------------------------------------------------- */
/*  SMALL PRESENTATIONAL HELPERS                                              */
/* -------------------------------------------------------------------------- */

function TrustIcon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    "aria-hidden": true,
  };

  switch (type) {
    case "secure":
      return (
        <svg {...common}>
          <path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "shipping":
      return (
        <svg {...common}>
          <rect x="1" y="6" width="14" height="11" rx="1.5" />
          <path d="M15 10h4l3 3.5V17h-7" />
          <circle cx="6" cy="19" r="1.7" />
          <circle cx="17.5" cy="19" r="1.7" />
        </svg>
      );
    case "returns":
      return (
        <svg {...common}>
          <path d="M3 10a9 9 0 1 1 2.6 6.3" />
          <path d="M3 4v6h6" />
        </svg>
      );
    case "packaging":
      return (
        <svg {...common}>
          <path d="M21 8 12 3 3 8l9 5 9-5Z" />
          <path d="M3 8v9l9 5 9-5V8" />
          <path d="M12 13v9" />
        </svg>
      );
    default:
      return null;
  }
}

function CheckoutSkeleton() {
  return (
    <div className="chk-skeleton-grid" aria-busy="true" aria-label="Loading checkout">
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="chk-skel-block" style={{ height: 220 }} />
        <div className="chk-skel-block" style={{ height: 320 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="chk-skel-block" style={{ height: 280 }} />
        <div className="chk-skel-block" style={{ height: 140 }} />
        <div className="chk-skel-block" style={{ height: 100 }} />
        <div className="chk-skel-block" style={{ height: 56 }} />
      </div>
    </div>
  );
}