// ======================================================
// CART API
// src/lib/cart.js
// ======================================================

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");


// ======================================================
// EVENTS
// ======================================================

export const CART_EVENT =
  "cart-updated";

export const CART_UPDATED_EVENT =
  "CART_UPDATED";


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
    typeof product ===
    "string"
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
// NORMALIZE CART ITEMS
// ======================================================

function normalizeCartItems(
  data
) {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.cart)
  ) {
    return data.cart;
  }

  if (
    Array.isArray(
      data?.cart?.items
    )
  ) {
    return data.cart.items;
  }

  if (
    Array.isArray(data?.items)
  ) {
    return data.items;
  }

  return [];
}


// ======================================================
// COMMON REQUEST
// ======================================================

async function request(
  path,
  options = {}
) {
  const token =
    getAccessToken();

  const headers = {
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  /*
   * JSON request.
   *
   * FormData ke liye Content-Type
   * browser khud set karega.
   */
  if (
    options.body !==
      undefined &&
    !(
      options.body instanceof
      FormData
    )
  ) {
    headers[
      "Content-Type"
    ] = "application/json";
  }

  try {
    const response =
      await fetch(
        `${BASE}${path}`,
        {
          ...options,

          credentials:
            "include",

          headers,
        }
      );

    const data =
      await parseResponse(
        response
      );

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(
      "CART REQUEST ERROR:",
      {
        url:
          `${BASE}${path}`,
        error,
      }
    );

    return {
      ok: false,
      status: 0,
      data: {
        message:
          "Unable to connect to server.",
      },
    };
  }
}


// ======================================================
// CART EVENT
// ======================================================

function dispatchCartEvent(
  detail = null
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
   * New event.
   */
  window.dispatchEvent(
    new CustomEvent(
      CART_UPDATED_EVENT,
      {
        detail,
      }
    )
  );

  /*
   * Existing components.
   */
  window.dispatchEvent(
    new CustomEvent(
      CART_EVENT,
      {
        detail,
      }
    )
  );
}


// ======================================================
// ADD TO CART
// BACKEND:
// POST /api/v1/cart/add
// ======================================================

export async function addToCart(
  product,
  quantity = 1
) {
  // ----------------------------------------------------
  // PRODUCT ID
  // ----------------------------------------------------

  const productId =
    getProductId(product);

  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  // ----------------------------------------------------
  // ACCESS TOKEN
  // ----------------------------------------------------

  const token =
    getAccessToken();

  /*
   * Backend cart routes are protected:
   *
   * router.use(protect)
   *
   * So login required.
   */
  if (!token) {
    throw new Error(
      "Please login to add products to cart."
    );
  }

  // ----------------------------------------------------
  // QUANTITY
  // ----------------------------------------------------

  const normalizedQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      normalizedQuantity
    ) ||
    normalizedQuantity < 1
  ) {
    throw new Error(
      "Quantity must be at least 1."
    );
  }

  // ----------------------------------------------------
  // REQUEST
  // ----------------------------------------------------

  const response =
    await request(
      "/cart/add",
      {
        method: "POST",

        body: JSON.stringify({
          productId:
            String(productId),

          quantity:
            normalizedQuantity,
        }),
      }
    );

  // ----------------------------------------------------
  // AUTH ERROR
  // ----------------------------------------------------

  if (
    response.status === 401
  ) {
    /*
     * Token invalid / expired /
     * missing.
     */
    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "userAccessToken"
      );

      localStorage.removeItem(
        "token"
      );
    }

    throw new Error(
      response.data
        ?.message ===
        "Access token is missing."
        ? "Please login to add products to cart."
        : response.data
            ?.message ||
            "Your session has expired. Please login again."
    );
  }

  // ----------------------------------------------------
  // OTHER ERROR
  // ----------------------------------------------------

  if (!response.ok) {
    console.error(
      "ADD TO CART API ERROR:",
      {
        url:
          `${BASE}/cart/add`,

        status:
          response.status,

        response:
          response.data,

        productId,

        quantity:
          normalizedQuantity,
      }
    );

    throw new Error(
      response.data?.message ||
        response.data?.error ||
        "Failed to add product to cart."
    );
  }

  // ----------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------

  dispatchCartEvent(
    response.data
  );

  return (
    response.data || {
      ok: true,

      cart: {
        items: [],
      },
    }
  );
}


// ======================================================
// GET CART
// BACKEND:
// GET /api/v1/cart
// ======================================================

export async function getCart() {
  const token =
    getAccessToken();

  /*
   * Guest user.
   */
  if (!token) {
    return [];
  }

  const response =
    await request(
      "/cart",
      {
        method: "GET",
      }
    );

  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------

  if (
    response.status === 401
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

  // ----------------------------------------------------
  // ERROR
  // ----------------------------------------------------

  if (!response.ok) {
    console.error(
      "GET CART API ERROR:",
      {
        status:
          response.status,

        response:
          response.data,
      }
    );

    return [];
  }

  return normalizeCartItems(
    response.data
  );
}


// ======================================================
// GET COMPLETE CART RESPONSE
// ======================================================

export async function getCartResponse() {
  const token =
    getAccessToken();

  if (!token) {
    return {
      ok: true,

      cart: {
        items: [],
        subtotal: 0,
        itemCount: 0,
      },
    };
  }

  const response =
    await request(
      "/cart",
      {
        method: "GET",
      }
    );

  if (
    response.status === 401
  ) {
    return {
      ok: false,

      cart: {
        items: [],
        subtotal: 0,
        itemCount: 0,
      },
    };
  }

  if (!response.ok) {
    throw new Error(
      response.data?.message ||
        "Failed to load cart."
    );
  }

  return (
    response.data || {
      ok: true,

      cart: {
        items: [],
        subtotal: 0,
        itemCount: 0,
      },
    }
  );
}


// ======================================================
// FORMAT PRICE
// ======================================================

export function formatPrice(
  value
) {
  const amount =
    Number(value || 0);

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}


// ======================================================
// GET SUBTOTAL FROM ITEMS
// ======================================================

export function calculateCartSubtotal(
  cart = []
) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce(
    (
      total,
      item
    ) => {
      const product =
        item?.product ||
        {};

      const price =
        Number(
          product?.price ??
            item?.price ??
            0
        );

      const quantity =
        Number(
          item?.quantity || 1
        );

      return (
        total +
        price * quantity
      );
    },
    0
  );
}


// ======================================================
// GET CART SUBTOTAL
// ======================================================

export async function getCartSubtotal() {
  const cart =
    await getCart();

  return calculateCartSubtotal(
    cart
  );
}


// ======================================================
// UPDATE QUANTITY
//
// BACKEND:
// PUT /api/v1/cart/update
//
// BODY:
// {
//   productId,
//   quantity
// }
// ======================================================

export async function updateQty(
  productId,
  quantity
) {
  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const normalizedQuantity =
    Number(quantity);

  /*
   * Quantity zero means remove.
   */
  if (
    normalizedQuantity <=
    0
  ) {
    return removeCartItem(
      productId
    );
  }

  if (
    !Number.isInteger(
      normalizedQuantity
    )
  ) {
    throw new Error(
      "Quantity must be an integer."
    );
  }

  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Please login to update your cart."
    );
  }

  const response =
    await request(
      "/cart/update",
      {
        method: "PUT",

        body: JSON.stringify({
          productId:
            String(productId),

          quantity:
            normalizedQuantity,
        }),
      }
    );

  if (
    response.status === 401
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.removeItem(
        "accessToken"
      );
    }

    throw new Error(
      response.data?.message ||
        "Your session has expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      response.data?.message ||
        response.data?.error ||
        "Failed to update cart."
    );
  }

  dispatchCartEvent(
    response.data
  );

  return response.data;
}


// ======================================================
// REMOVE CART ITEM
//
// BACKEND:
// DELETE /api/v1/cart/remove
//
// BODY:
// {
//   productId
// }
// ======================================================

export async function removeCartItem(
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
      "Please login to manage your cart."
    );
  }

  const response =
    await request(
      "/cart/remove",
      {
        method: "DELETE",

        body: JSON.stringify({
          productId:
            String(productId),
        }),
      }
    );

  if (
    response.status === 401
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.removeItem(
        "accessToken"
      );
    }

    throw new Error(
      response.data?.message ||
        "Your session has expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      response.data?.message ||
        response.data?.error ||
        "Failed to remove cart item."
    );
  }

  dispatchCartEvent(
    response.data
  );

  return response.data;
}


// ======================================================
// REMOVE FROM CART ALIAS
// ======================================================

export async function removeFromCart(
  item
) {
  let productId = null;

  if (
    typeof item ===
    "string"
  ) {
    productId =
      item;
  } else if (
    item &&
    typeof item ===
      "object"
  ) {
    productId =
      item?.product?._id ||
      item?.product?.id ||
      item?.productId ||
      item?._id ||
      item?.id ||
      null;
  }

  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  return removeCartItem(
    productId
  );
}


// ======================================================
// CLEAR CART
//
// Backend mein direct clear route nahi hai,
// isliye har item ko remove endpoint se delete karenge.
// ======================================================

export async function clearCart() {
  const cart =
    await getCart();

  if (!cart.length) {
    return {
      ok: true,

      cart: {
        items: [],
      },
    };
  }

  for (
    const item of cart
  ) {
    const productId =
      item?.product?._id ||
      item?.product?.id ||
      item?.productId ||
      null;

    if (!productId) {
      continue;
    }

    await removeCartItem(
      productId
    );
  }

  dispatchCartEvent({
    ok: true,

    cart: {
      items: [],
    },
  });

  return {
    ok: true,

    cart: {
      items: [],
    },
  };
}


// ======================================================
// CART EVENT LISTENER
// ======================================================

export function onCartUpdated(
  callback
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  const handler =
    (event) => {
      try {
        callback?.(
          event.detail
        );
      } catch (error) {
        console.error(
          "CART EVENT CALLBACK ERROR:",
          error
        );
      }
    };

  window.addEventListener(
    CART_EVENT,
    handler
  );

  window.addEventListener(
    CART_UPDATED_EVENT,
    handler
  );

  return () => {
    window.removeEventListener(
      CART_EVENT,
      handler
    );

    window.removeEventListener(
      CART_UPDATED_EVENT,
      handler
    );
  };
}


// ======================================================
// CART ITEM COUNT
// ======================================================

export async function getCartItemCount() {
  const cart =
    await getCart();

  return cart.reduce(
    (
      total,
      item
    ) =>
      total +
      Number(
        item?.quantity || 0
      ),
    0
  );
}