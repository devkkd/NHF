// ======================================================
// FRONTEND API
// src/lib/api.js
// ======================================================

const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

// ======================================================
// COMMON API FETCH
// ======================================================

export async function apiFetch(
  path,
  opts = {}
) {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "accessToken"
        )
      : null;

  const makeRequest =
    async (accessToken) => {
      const headers = {
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),

        ...(opts.headers || {}),
      };

      /*
       * FormData ke case mein
       * Content-Type manually mat set karo.
       */
      if (
        !(
          opts.body instanceof
          FormData
        )
      ) {
        headers[
          "Content-Type"
        ] = "application/json";
      }

      const res =
        await fetch(
          `${BASE}${path}`,
          {
            credentials:
              "include",

            ...opts,

            headers,
          }
        );

      const data =
        await res
          .json()
          .catch(
            () => ({})
          );

      return {
        ok: res.ok,

        status:
          res.status,

        data,
      };
    };

  try {
    let response =
      await makeRequest(token);

    // ==================================================
    // ACCESS TOKEN EXPIRED
    // ==================================================

    if (
      response.status ===
        401 &&
      response.data?.message !==
        "Refresh token missing."
    ) {
      const refreshRes =
        await fetch(
          `${BASE}/auth/refresh`,
          {
            method: "POST",

            credentials:
              "include",
          }
        );

      const refreshData =
        await refreshRes
          .json()
          .catch(
            () => ({})
          );

      if (
        refreshRes.ok &&
        refreshData.accessToken
      ) {
        token =
          refreshData.accessToken;

        localStorage.setItem(
          "accessToken",
          refreshData.accessToken
        );

        response =
          await makeRequest(
            token
          );
      } else {
        localStorage.removeItem(
          "accessToken"
        );
      }
    }

    return response;
  } catch (error) {
    console.error(
      "API Error:",
      error
    );

    return {
      ok: false,

      status: 500,

      data: {
        message:
          "Network Error",
      },
    };
  }
}


// ======================================================
// CATEGORIES
// ======================================================

/**
 * Get all active categories.
 *
 * Default endpoint:
 * GET /categories
 */
export async function getAllCategories() {
  const res =
    await apiFetch(
      "/categories"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get Home categories.
 *
 * Only categories with:
 * showInHome = true
 *
 * Endpoint:
 * GET /categories?home=true
 */
export async function getHomeCategories() {
  const res =
    await apiFetch(
      "/categories?home=true"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get Wardrobe categories.
 *
 * Only categories with:
 * showInWardrobe = true
 *
 * Endpoint:
 * GET /categories?wardrobe=true
 */
export async function getWardrobeCategories() {
  const res =
    await apiFetch(
      "/categories?wardrobe=true"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get complete category tree.
 *
 * Category
 *   ├── Subcategory
 *   ├── Subcategory
 *   └── Subcategory
 *
 * Endpoint:
 * GET /categories?tree=true
 */
export async function getCategoryTree() {
  const res =
    await apiFetch(
      "/categories?tree=true"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get Home category tree.
 *
 * Only Home-enabled categories.
 *
 * Endpoint:
 * GET /categories?home=true&tree=true
 */
export async function getHomeCategoryTree() {
  const res =
    await apiFetch(
      "/categories?home=true&tree=true"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get Wardrobe category tree.
 *
 * Only Wardrobe-enabled categories.
 *
 * Endpoint:
 * GET /categories?wardrobe=true&tree=true
 */
export async function getWardrobeCategoryTree() {
  const res =
    await apiFetch(
      "/categories?wardrobe=true&tree=true"
    );

  return (
    res.data?.data
      ?.categories ?? []
  );
}


/**
 * Get direct subcategories
 * of one category.
 *
 * Endpoint:
 * GET /categories/:id/subcategories
 */
export async function getSubcategories(
  categoryId
) {
  if (!categoryId) {
    return [];
  }

  const res =
    await apiFetch(
      `/categories/${categoryId}/subcategories`
    );

  return (
    res.data?.data
      ?.subcategories ?? []
  );
}


/**
 * Get category by slug.
 *
 * Backend response:
 *
 * {
 *   ok: true,
 *   data: {
 *     category,
 *     children
 *   }
 * }
 */
export async function getCategoryBySlug(
  slug
) {
  if (!slug) {
    return null;
  }

  const res =
    await apiFetch(
      `/categories/${encodeURIComponent(
        slug
      )}`
    );

  if (!res.ok) {
    return null;
  }

  return (
    res.data?.data ?? null
  );
}


// ======================================================
// PRODUCTS
// ======================================================

/**
 * Get products.
 *
 * IMPORTANT:
 * category = SUBCATEGORY ID
 */
export async function getProducts({
  category,
  featured,
  newArrivals,
  search,
  page = 1,
  limit = 20,
} = {}) {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(page)
  );

  params.set(
    "limit",
    String(limit)
  );

  if (category) {
    params.set(
      "category",
      category
    );
  }

  if (featured) {
    params.set(
      "featured",
      "true"
    );
  }

  if (newArrivals) {
    params.set(
      "newArrivals",
      "true"
    );
  }

  if (search) {
    params.set(
      "search",
      search
    );
  }

  const res =
    await apiFetch(
      `/products?${params.toString()}`
    );

  return (
    res.data?.data ?? {
      products: [],
      total: 0,
      pages: 1,
    }
  );
}


/**
 * Get products inside
 * a specific subcategory.
 */
export async function getProductsBySubcategory(
  subcategoryId,
  {
    page = 1,
    limit = 20,
    search,
    featured,
    newArrivals,
  } = {}
) {
  if (!subcategoryId) {
    return {
      products: [],
      total: 0,
      pages: 1,
    };
  }

  return getProducts({
    category:
      subcategoryId,

    page,

    limit,

    search,

    featured,

    newArrivals,
  });
}


/**
 * Get products for Wardrobe.
 *
 * NOTE:
 * This function is kept for other
 * pages/components that may still
 * need all Wardrobe products.
 */
export async function getWardrobeProducts({
  page = 1,
  limit = 20,
  search,
  featured,
  newArrivals,
} = {}) {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(page)
  );

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "wardrobe",
    "true"
  );

  if (search) {
    params.set(
      "search",
      search
    );
  }

  if (featured) {
    params.set(
      "featured",
      "true"
    );
  }

  if (newArrivals) {
    params.set(
      "newArrivals",
      "true"
    );
  }

  const res =
    await apiFetch(
      `/products?${params.toString()}`
    );

  return (
    res.data?.data ?? {
      products: [],
      total: 0,
      pages: 1,
    }
  );
}


/**
 * Get one product by slug.
 */
export async function getProductBySlug(
  slug
) {
  if (!slug) {
    return null;
  }

  const res =
    await apiFetch(
      `/products/${encodeURIComponent(
        slug
      )}`
    );

  return (
    res.data?.data
      ?.product ?? null
  );
}


/**
 * Get New Arrivals.
 */
export async function getNewArrivalProducts() {
  const res =
    await apiFetch(
      "/products?newArrivals=true&limit=20"
    );

  return (
    res.data?.data
      ?.products ?? []
  );
}


/**
 * Get Featured products.
 */
export async function getFeaturedProducts() {
  const res =
    await apiFetch(
      "/products?featured=true&limit=8"
    );

  return (
    res.data?.data
      ?.products ?? []
  );
}


// ======================================================
// ORDERS
// ======================================================

/**
 * Create Order
 *
 * POST /orders
 *
 * COD:
 * - paymentStatus = pending
 * - orderStatus = pending
 * - adminApproval = pending
 *
 * Razorpay:
 * - paymentStatus = pending
 * - orderStatus = pending
 * - adminApproval = pending
 */
export async function createOrder(
  payload
) {
  return await apiFetch(
    "/orders",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}


/**
 * Create Razorpay Order
 *
 * POST /orders/razorpay
 */
export async function createRazorpayOrder(
  payload
) {
  return await apiFetch(
    "/orders/razorpay",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}


/**
 * Verify Razorpay Payment
 *
 * POST /orders/verify
 *
 * IMPORTANT:
 * Payment verification only updates
 * payment-related information.
 *
 * Order remains pending until
 * admin approves it.
 */
export async function verifyRazorpayPayment(
  payload
) {
  return await apiFetch(
    "/orders/verify",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}


/**
 * Get logged-in user's orders.
 *
 * GET /orders/my-orders
 */
export async function getMyOrders() {
  const res =
    await apiFetch(
      "/orders/my-orders"
    );

  return res.data;
}


/**
 * Get one order by ID.
 *
 * GET /orders/:id
 */
export async function getOrderById(
  id
) {
  if (!id) {
    return null;
  }

  const res =
    await apiFetch(
      `/orders/${id}`
    );

  return res.data;
}


/**
 * Track order.
 *
 * GET /orders/track/:id
 *
 * Backend refreshes Shiprocket
 * tracking and updates local order.
 */
export async function trackOrder(
  id
) {
  if (!id) {
    return null;
  }

  const res =
    await apiFetch(
      `/orders/track/${id}`
    );

  return res.data;
}


// ======================================================
// ORDER REQUESTS
// Cancel / Return / Replacement
// ======================================================


/**
 * Create cancel / return / replacement
 * request.
 *
 * POST /orders/requests/:orderId
 *
 * Example:
 *
 * {
 *   type: "replacement",
 *   orderItemId: "0",
 *   reason: "damaged",
 *   description: "Product received damaged",
 *   images: [
 *     "https://..."
 *   ]
 * }
 */
export async function createOrderRequest(
  orderId,
  payload
) {
  if (!orderId) {
    return {
      ok: false,

      status: 400,

      data: {
        message:
          "Order ID is required.",
      },
    };
  }

  return await apiFetch(
    `/orders/requests/${orderId}`,
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}


/**
 * Get all logged-in user's
 * order requests.
 *
 * GET /orders/requests/my
 */
export async function getMyOrderRequests() {
  const res =
    await apiFetch(
      "/orders/requests/my"
    );

  return res.data;
}


/**
 * Get one user's request.
 *
 * GET /orders/requests/my/:requestId
 */
export async function getMyOrderRequestById(
  requestId
) {
  if (!requestId) {
    return null;
  }

  const res =
    await apiFetch(
      `/orders/requests/my/${requestId}`
    );

  return res.data;
}


/**
 * Cancel pending user request.
 *
 * PATCH /orders/requests/my/:requestId/cancel
 */
export async function cancelMyOrderRequest(
  requestId
) {
  if (!requestId) {
    return {
      ok: false,

      status: 400,

      data: {
        message:
          "Request ID is required.",
      },
    };
  }

  return await apiFetch(
    `/orders/requests/my/${requestId}/cancel`,
    {
      method: "PATCH",
    }
  );
}


// ======================================================
// R2 FILE UPLOAD
// ======================================================

/**
 * Get R2 presigned upload URL.
 *
 * POST /upload/presign
 *
 * Example:
 *
 * {
 *   mimeType: "image/jpeg",
 *   fileSize: 500000,
 *   folder: "replacement-requests"
 * }
 */
export async function getUploadPresignedUrl(
  payload
) {
  return await apiFetch(
    "/upload/presign",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}


/**
 * Upload file directly to R2
 * using the presigned URL.
 */
export async function uploadFileToR2(
  uploadUrl,
  file
) {
  if (!uploadUrl || !file) {
    return {
      ok: false,

      status: 400,

      data: {
        message:
          "Upload URL and file are required.",
      },
    };
  }

  try {
    const response =
      await fetch(
        uploadUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              file.type ||
              "application/octet-stream",
          },

          body: file,
        }
      );

    return {
      ok: response.ok,

      status:
        response.status,

      data: {},
    };
  } catch (error) {
    console.error(
      "R2 Upload Error:",
      error
    );

    return {
      ok: false,

      status: 500,

      data: {
        message:
          "File upload failed.",
      },
    };
  }
}


// ======================================================
// ENQUIRIES
// ======================================================

export async function submitEnquiry(
  payload
) {
  return await apiFetch(
    "/enquiries",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}