// lib/cart.js
// Simple localStorage-based cart. No external state library needed.
// Dispatches "cart-updated" so any mounted component (Header badge, Cart page) can react.

const CART_KEY = "tukdi_cart";
const EVENT_NAME = "cart-updated";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(EVENT_NAME));
}

/**
 * product = { slug, name, item (used as short description), images: [], price }
 */
export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.slug === product.slug);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      slug: product.slug,
      name: product.name,
      description: product.item || "",
      image: product.images?.[0] || "",
      price: product.price || 0,
      qty,
    });
  }
  saveCart(cart);
  return cart;
}

export function updateQty(slug, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((i) => i.slug !== slug);
  } else {
    cart = cart.map((i) => (i.slug === slug ? { ...i, qty } : i));
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(slug) {
  const cart = getCart().filter((i) => i.slug !== slug);
  saveCart(cart);
  return cart;
}

export function getCartCount(cart = getCart()) {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

export function getCartSubtotal(cart = getCart()) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function formatPrice(n) {
  return `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const CART_EVENT = EVENT_NAME;