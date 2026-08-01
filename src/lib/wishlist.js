"use client";
const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export const WISHLIST_EVENT = "wishlist-updated";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =====================
// Get Wishlist
// =====================
export async function getWishlist() {
  const res = await fetch(`${BASE}/wishlist`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return (data.wishlist?.items || []).map((item) => ({
    ...item.product,
  }));
}

// =====================
// Check Saved
// =====================
export async function isWishlisted(productId) {
  const list = await getWishlist();

  return list.some((item) => item._id === productId);
}

// =====================
// Add Wishlist
// =====================
export async function addToWishlist(product) {
  const res = await fetch(`${BASE}/wishlist/add`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: product._id,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add wishlist");
  }

  window.dispatchEvent(new Event(WISHLIST_EVENT));

  return await res.json();
}

// =====================
// Remove Wishlist
// =====================
export async function removeFromWishlist(productId) {
  const res = await fetch(`${BASE}/wishlist/remove`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to remove wishlist");
  }

  window.dispatchEvent(new Event(WISHLIST_EVENT));

  return await res.json();
}

// =====================
// Toggle Wishlist
// =====================
export async function toggleWishlist(product) {
  const saved = await isWishlisted(product._id);

  if (saved) {
    await removeFromWishlist(product._id);
    return false;
  }

  await addToWishlist(product);
  return true;
}