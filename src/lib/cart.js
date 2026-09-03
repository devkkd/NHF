// ======================================================
// CART API
// src/lib/cart.js
// ======================================================

const BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");

/* ======================================================
   EVENTS
====================================================== */

export const CART_EVENT = "cart-updated";
export const CART_UPDATED_EVENT = "CART_UPDATED";

/* ======================================================
   TOKEN
====================================================== */

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("userAccessToken") ||
    localStorage.getItem("token") ||
    null
  );
}

/* ======================================================
   PRODUCT ID
====================================================== */

function getProductId(product) {
  if (typeof product === "string") {
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
    product.product?._id ||
    product.product?.id ||
    null
  );
}

/* ======================================================
   PARSE RESPONSE
====================================================== */

async function parseResponse(response) {
  const text = await response.text();

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

/* ======================================================
   NORMALIZE CART ITEMS
====================================================== */

function normalizeCartItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.cart)) {
    return data.cart;
  }

  if (Array.isArray(data?.cart?.items)) {
    return data.cart.items;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

/* ======================================================
   COMMON REQUEST
====================================================== */

async function request(path, options = {}) {
  const token = getAccessToken();

  const headers = {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers || {}),
  };

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(
      `${BASE}${path}`,
      {
        ...options,
        credentials: "include",
        headers,
      }
    );

    const data = await parseResponse(response);

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(
      "CART REQUEST ERROR:",
      {
        url: `${BASE}${path}`,
        error,
      }
    );

    return {
      ok: false,
      status: 0,
      data: {
        message: "Unable to connect to server.",
      },
    };
  }
}

/* ======================================================
   CART EVENT
====================================================== */

function dispatchCartEvent(detail = null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      CART_UPDATED_EVENT,
      {
        detail,
      }
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      CART_EVENT,
      {
        detail,
      }
    )
  );
}

/* ======================================================
   ADD TO CART
   POST /api/v1/cart/add
====================================================== */

export async function addToCart(
  product,
  quantity = 1
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
      "Please login to add products to cart."
    );
  }

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

  const body = {
    productId: String(productId),
    quantity: normalizedQuantity,
  };

  /* ====================================================
     VARIANT
  ==================================================== */

  if (
    product?.selectedColor !==
    undefined
  ) {
    body.selectedColor =
      product.selectedColor || "";
  }

  if (
    product?.selectedColorName !==
    undefined
  ) {
    body.selectedColorName =
      product.selectedColorName || "";
  }

  if (
    product?.selectedSize !==
    undefined
  ) {
    body.selectedSize =
      product.selectedSize || "";
  }

  const response =
    await request(
      "/cart/add",
      {
        method: "POST",
        body: JSON.stringify(
          body
        ),
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
      localStorage.removeItem(
        "userAccessToken"
      );
      localStorage.removeItem(
        "token"
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
        "Failed to add product to cart."
    );
  }

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

/* ======================================================
   GET CART
   Returns ONLY items for backward compatibility
====================================================== */

export async function getCart() {
  const token =
    getAccessToken();

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
      localStorage.removeItem(
        "userAccessToken"
      );
      localStorage.removeItem(
        "token"
      );
    }

    return [];
  }

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

/* ======================================================
   GET COMPLETE CART RESPONSE

   Returns:
   {
      ok,
      cart,
      summary
   }
====================================================== */

export async function getCartResponse() {
  const token =
    getAccessToken();

  if (!token) {
    return {
      ok: true,
      cart: {
        items: [],
      },
      summary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
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

    return {
      ok: false,
      cart: {
        items: [],
      },
      summary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
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

  const data =
    response.data || {};

  return {
    ok:
      data.ok ??
      true,

    cart:
      data.cart || {
        items: [],
      },

    summary:
      data.summary || {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
        itemCount: 0,
      },
  };
}

/* ======================================================
   FORMAT PRICE
====================================================== */

export function formatPrice(value) {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount)
  ) {
    return "₹0";
  }

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}

/* ======================================================
   LOCAL SUBTOTAL FALLBACK
====================================================== */

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
      const price =
        Number(
          item?.selectedSellingPrice ??
            item?.selectedSizeSellingPrice ??
            item?.product?.sellingPrice ??
            item?.product?.price ??
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

/* ======================================================
   GET CART SUBTOTAL
====================================================== */

export async function getCartSubtotal() {
  const response =
    await getCartResponse();

  return Number(
    response?.summary
      ?.subtotal || 0
  );
}

/* ======================================================
   UPDATE QUANTITY

   PUT /api/v1/cart/update

   Supports:
   productId
   quantity
   selectedColor
   selectedSize
====================================================== */

export async function updateQty(
  productId,
  quantity,
  variant = {}
) {
  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const normalizedQuantity =
    Number(quantity);

  if (
    normalizedQuantity <= 0
  ) {
    return removeCartItem(
      productId,
      variant
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

  const body = {
    productId:
      String(productId),

    quantity:
      normalizedQuantity,
  };

  if (
    variant?.selectedColor !==
    undefined
  ) {
    body.selectedColor =
      variant.selectedColor || "";
  }

  if (
    variant?.selectedSize !==
    undefined
  ) {
    body.selectedSize =
      variant.selectedSize || "";
  }

  const response =
    await request(
      "/cart/update",
      {
        method: "PUT",
        body: JSON.stringify(
          body
        ),
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
      localStorage.removeItem(
        "userAccessToken"
      );
      localStorage.removeItem(
        "token"
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

  return (
    response.data || {
      ok: true,
    }
  );
}

/* ======================================================
   UPDATE CART VARIANT

   PUT /api/v1/cart/variant
====================================================== */

export async function updateCartVariant({
  productId,
  currentColor = "",
  currentSize = "",
  selectedColor = "",
  selectedColorName = "",
  selectedSize = "",
}) {
  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Please login to update product variant."
    );
  }

  const response =
    await request(
      "/cart/variant",
      {
        method: "PUT",
        body: JSON.stringify({
          productId:
            String(productId),

          currentColor:
            currentColor || "",

          currentSize:
            currentSize || "",

          selectedColor:
            selectedColor || "",

          selectedColorName:
            selectedColorName ||
            selectedColor ||
            "",

          selectedSize:
            selectedSize || "",
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
        "Failed to update product variant."
    );
  }

  dispatchCartEvent(
    response.data
  );

  return (
    response.data || {
      ok: true,
    }
  );
}

/* ======================================================
   REMOVE CART ITEM

   DELETE /api/v1/cart/remove

   Optional variant support
====================================================== */

export async function removeCartItem(
  productId,
  variant = {}
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

  const body = {
    productId:
      String(productId),
  };

  if (
    variant?.selectedColor !==
    undefined
  ) {
    body.selectedColor =
      variant.selectedColor || "";
  }

  if (
    variant?.selectedSize !==
    undefined
  ) {
    body.selectedSize =
      variant.selectedSize || "";
  }

  const response =
    await request(
      "/cart/remove",
      {
        method: "DELETE",
        body: JSON.stringify(
          body
        ),
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
      localStorage.removeItem(
        "userAccessToken"
      );
      localStorage.removeItem(
        "token"
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

  return (
    response.data || {
      ok: true,
    }
  );
}

/* ======================================================
   REMOVE FROM CART ALIAS

   Accepts:
   removeFromCart(productId)
   OR
   removeFromCart(item)
====================================================== */

export async function removeFromCart(
  item,
  variant = {}
) {
  let productId = null;

  let selectedColor =
    variant?.selectedColor;

  let selectedSize =
    variant?.selectedSize;

  if (
    typeof item ===
    "string"
  ) {
    productId = item;
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

    if (
      selectedColor ===
      undefined
    ) {
      selectedColor =
        item?.selectedColor ||
        "";
    }

    if (
      selectedSize ===
      undefined
    ) {
      selectedSize =
        item?.selectedSize ||
        "";
    }
  }

  if (!productId) {
    throw new Error(
      "Product ID is missing."
    );
  }

  return removeCartItem(
    productId,
    {
      selectedColor:
        selectedColor || "",
      selectedSize:
        selectedSize || "",
    }
  );
}

/* ======================================================
   CLEAR CART
====================================================== */

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
      productId,
      {
        selectedColor:
          item?.selectedColor ||
          "",
        selectedSize:
          item?.selectedSize ||
          "",
      }
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

/* ======================================================
   CART EVENT LISTENER
====================================================== */

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

/* ======================================================
   CART ITEM COUNT
====================================================== */

export async function getCartItemCount() {
  const response =
    await getCartResponse();

  return Number(
    response?.summary
      ?.itemCount || 0
  );
}