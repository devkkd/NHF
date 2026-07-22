// lib/wishlist.js
// Simple localStorage based wishlist ("Saved") store.
// Mirrors the style of your existing lib/cart.js (addToCart / updateQty).

const WISHLIST_KEY = "wishlist";
export const WISHLIST_EVENT = "wishlist-updated";
function readWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWishlist(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  // lets other components (e.g. a header wishlist count) react to changes
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

// Returns the full saved product list
export function getWishlist() {
  return readWishlist();
}

// true / false whether a slug is already saved
export function isWishlisted(slug) {
  return readWishlist().some((item) => item.slug === slug);
}

export function addToWishlist(product) {
  const list = readWishlist();
  if (!list.some((item) => item.slug === product.slug)) {
    list.push(product);
    writeWishlist(list);
  }
  return list;
}

export function removeFromWishlist(slug) {
  const list = readWishlist().filter((item) => item.slug !== slug);
  writeWishlist(list);
  return list;
}

// Toggles saved state for a product. Returns true if it is now saved,
// false if it was just removed. Use this directly on the heart button.
export function toggleWishlist(product) {
  const list = readWishlist();
  const exists = list.some((item) => item.slug === product.slug);
  const updated = exists
    ? list.filter((item) => item.slug !== product.slug)
    : [...list, product];
  writeWishlist(updated);
  return !exists;
}