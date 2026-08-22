"use client";

// ======================================================
// WISHLIST API
// src/lib/wishlist.js
// ======================================================

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

export const WISHLIST_EVENT =
  "wishlist-updated";


// ======================================================
// TOKEN
// ======================================================

function getAccessToken() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return (
    localStorage.getItem(
      "accessToken"
    ) ||
    localStorage.getItem(
      "userAccessToken"
    ) ||
    localStorage.getItem(
      "token"
    ) ||
    null
  );
}


// ======================================================
// PRODUCT ID
// ======================================================

function getProductId(product) {
  if (
    typeof product === "string"
  ) {
    return product;
  }

  if (!product) {
    return null;
  }

  return (
    product._id ||
    product.id ||
    product.productId ||
    product.raw?._id ||
    product.raw?.id ||
    null
  );
}


// ======================================================
// AUTH HEADERS
// ======================================================

function getAuthHeaders() {
  const token =
    getAccessToken();

  const headers = {
    "Content-Type":
      "application/json",
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}


// ======================================================
// PARSE RESPONSE
// ======================================================

async function parseResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}


// ======================================================
// GET WISHLIST
// ======================================================

export async function getWishlist() {
  const token =
    getAccessToken();

  /*
   * Guest user:
   * wishlist API protected hai,
   * isliye request mat bhejo.
   */
  if (!token) {
    return [];
  }

  try {
    const response =
      await fetch(
        `${BASE}/wishlist`,
        {
          method: "GET",

          credentials:
            "include",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (
      response.status ===
      401
    ) {
      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          "accessToken"
        );
      }

      return [];
    }

    if (!response.ok) {
      console.error(
        "GET WISHLIST API ERROR:",
        {
          status:
            response.status,

          response:
            data,

          url:
            `${BASE}/wishlist`,
        }
      );

      return [];
    }

    /*
     * Backend response:
     *
     * {
     *   wishlist: {
     *     items: [...]
     *   }
     * }
     */
    return (
      data?.wishlist?.items ||
      data?.data?.wishlist?.items ||
      data?.items ||
      []
    ).map(
      (item) => ({
        ...(item?.product ||
          item),
      })
    );
  } catch (error) {
    console.error(
      "GET WISHLIST ERROR:",
      error
    );

    return [];
  }
}


// ======================================================
// CHECK WISHLIST
// ======================================================

export async function isWishlisted(
  productId
) {
  if (!productId) {
    return false;
  }

  const list =
    await getWishlist();

  return list.some(
    (item) =>
      String(
        item?._id ||
          item?.id
      ) ===
      String(productId)
  );
}


// ======================================================
// ADD WISHLIST
// ======================================================

export async function addToWishlist(
  product
) {
  const productId =
    getProductId(product);

  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Please login to add products to wishlist."
    );
  }

  try {
    const response =
      await fetch(
        `${BASE}/wishlist/add`,
        {
          method: "POST",

          credentials:
            "include",

          headers:
            getAuthHeaders(),

          body:
            JSON.stringify({
              productId:
                String(
                  productId
                ),
            }),
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (
      response.status ===
      401
    ) {
      localStorage.removeItem(
        "accessToken"
      );

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok) {
      console.error(
        "ADD WISHLIST API ERROR:",
        {
          status:
            response.status,

          response:
            data,

          url:
            `${BASE}/wishlist/add`,
        }
      );

      throw new Error(
        data?.message ||
          data?.error ||
          "Failed to add wishlist."
      );
    }

    if (
      typeof window !==
      "undefined"
    ) {
      window.dispatchEvent(
        new Event(
          WISHLIST_EVENT
        )
      );
    }

    return data;
  } catch (error) {
    console.error(
      "ADD WISHLIST ERROR:",
      error
    );

    throw error;
  }
}


// ======================================================
// REMOVE WISHLIST
// ======================================================

export async function removeFromWishlist(
  productId
) {
  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Please login to manage wishlist."
    );
  }

  try {
    const response =
      await fetch(
        `${BASE}/wishlist/remove`,
        {
          method: "DELETE",

          credentials:
            "include",

          headers:
            getAuthHeaders(),

          body:
            JSON.stringify({
              productId:
                String(
                  productId
                ),
            }),
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (
      response.status ===
      401
    ) {
      localStorage.removeItem(
        "accessToken"
      );

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok) {
      console.error(
        "REMOVE WISHLIST API ERROR:",
        {
          status:
            response.status,

          response:
            data,

          url:
            `${BASE}/wishlist/remove`,
        }
      );

      throw new Error(
        data?.message ||
          data?.error ||
          "Failed to remove wishlist item."
      );
    }

    if (
      typeof window !==
      "undefined"
    ) {
      window.dispatchEvent(
        new Event(
          WISHLIST_EVENT
        )
      );
    }

    return data;
  } catch (error) {
    console.error(
      "REMOVE WISHLIST ERROR:",
      error
    );

    throw error;
  }
}


// ======================================================
// TOGGLE WISHLIST
// ======================================================

export async function toggleWishlist(
  product
) {
  const productId =
    getProductId(product);

  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const saved =
    await isWishlisted(
      productId
    );

  if (saved) {
    await removeFromWishlist(
      productId
    );

    return false;
  }

  await addToWishlist(
    product
  );

  return true;
}