"use client";
const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export const CART_EVENT = "cart-updated";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =====================
// Get Cart
// =====================
export async function getCart() {
 const res = await fetch(`${BASE}/cart`, {
  credentials: "include",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

  if (!res.ok) return [];

  const data = await res.json();
  return data.cart?.items || [];
}

// =====================
// Add To Cart
// =====================
export async function addToCart(product, qty = 1) {
  const res = await fetch(`${BASE}/cart/add`, {
    method: "POST",
    credentials: "include",
   headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: product._id,
      quantity: qty,
    }),
  });

  if (!res.ok) throw new Error("Failed to add product to cart");

  window.dispatchEvent(new Event(CART_EVENT));
  return await res.json();
}

// =====================
// Update Quantity
// =====================
export async function updateQty(productId, qty) {
  const res = await fetch(`${BASE}/cart/update`, {
    method: "PUT",
    credentials: "include",
  headers: getAuthHeaders(),
    body: JSON.stringify({
      productId,
      quantity: qty,
    }),
  });

  if (!res.ok) throw new Error("Failed to update cart");

  window.dispatchEvent(new Event(CART_EVENT));
  return await res.json();
}

// =====================
// Remove Item
// =====================
export async function removeFromCart(productId) {
  const res = await fetch(`${BASE}/cart/remove`, {
    method: "DELETE",
    credentials: "include",
   headers: getAuthHeaders(),
    body: JSON.stringify({
      productId,
    }),
  });

  if (!res.ok) throw new Error("Failed to remove item");

  window.dispatchEvent(new Event(CART_EVENT));
  return await res.json();
}

// =====================
// Cart Count
// =====================
export function getCartCount(cart = []) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// =====================
// Cart Total
// =====================
export function getCartSubtotal(cart = []) {
  return cart.reduce(
    (sum, item) =>
      sum + ((item.product?.price || 0) * item.quantity),
    0
  );
}

// =====================
// Format Price
// =====================
export function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}