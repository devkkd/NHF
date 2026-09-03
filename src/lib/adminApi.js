// ======================================================
// ADMIN API
// src/lib/adminApi.js
// ======================================================

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
)
  .trim()
  .replace(/\/$/, "");


// ======================================================
// ADMIN ACCESS TOKEN
// ======================================================

let _token = null;


// ======================================================
// TOKEN HELPERS
// ======================================================

export const setAccessToken = (
  token
) => {
  _token = token || null;

  if (
    typeof window !== "undefined"
  ) {
    if (token) {
      localStorage.setItem(
        "adminAccessToken",
        token
      );
    } else {
      localStorage.removeItem(
        "adminAccessToken"
      );
    }
  }
};


export const getAccessToken = () => {
  if (_token) {
    return _token;
  }

  if (
    typeof window !== "undefined"
  ) {
    return (
      localStorage.getItem(
        "adminAccessToken"
      ) || null
    );
  }

  return null;
};


export const clearAccessToken = () => {
  _token = null;

  if (
    typeof window !== "undefined"
  ) {
    localStorage.removeItem(
      "adminAccessToken"
    );
  }
};


// ======================================================
// PARSE RESPONSE
// ======================================================

async function parseResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  /*
   * JSON response
   */
  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response
      .json()
      .catch(() => ({}));
  }

  /*
   * Text response
   */
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  return {
    message: text,
  };
}


// ======================================================
// ADMIN REFRESH TOKEN
// ======================================================

async function tryRefresh() {
  /*
   * No admin token means this is
   * most likely a guest/admin-login page.
   *
   * Don't hit refresh unnecessarily.
   */
  const currentToken =
    getAccessToken();

  if (!currentToken) {
    return false;
  }

  try {
    const response =
      await fetch(
        `${BASE_URL}/auth/admin/refresh`,
        {
          method: "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (
      !response.ok ||
      !data?.accessToken
    ) {
      console.warn(
        "Admin refresh failed:",
        data
      );

      return false;
    }

    setAccessToken(
      data.accessToken
    );

    return true;
  } catch (error) {
    console.error(
      "Admin refresh error:",
      error
    );

    return false;
  }
}


// ======================================================
// COMMON REQUEST
// ======================================================

async function makeRequest(
  path,
  options = {},
  token = null
) {
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
   * JSON body ke liye
   * Content-Type set karo.
   *
   * FormData ke liye browser khud
   * multipart boundary set karega.
   */
  if (
    options.body !== undefined &&
    !(
      options.body instanceof
      FormData
    )
  ) {
    headers[
      "Content-Type"
    ] = "application/json";
  }

  return fetch(
    `${BASE_URL}${path}`,
    {
      ...options,

      credentials:
        "include",

      headers,
    }
  );
}


// ======================================================
// ADMIN API FETCH
// ======================================================

export async function apiFetch(
  path,
  options = {}
) {
  try {
    // ==================================================
    // CURRENT TOKEN
    // ==================================================

    let token =
      getAccessToken();

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    let response =
      await makeRequest(
        path,
        options,
        token
      );

    // ==================================================
    // FIRST RESPONSE
    // ==================================================

    let data =
      await parseResponse(
        response
      );

    // ==================================================
    // AUTH ERROR
    // ==================================================

    if (
      response.status === 401
    ) {
      /*
       * Agar token hi nahi hai,
       * to refresh karne ki zarurat nahi.
       *
       * Login page ke liye ye important hai.
       */
      if (!token) {
        return {
          ok: false,
          status: 401,
          _sessionExpired: false,
          data,
        };
      }

      /*
       * Already retry hua ho to
       * infinite loop mat karo.
       */
      if (
        !options._authRetry
      ) {
        const refreshed =
          await tryRefresh();

        if (refreshed) {
          token =
            getAccessToken();

          response =
            await makeRequest(
              path,
              {
                ...options,

                _authRetry: true,
              },
              token
            );

          data =
            await parseResponse(
              response
            );
        } else {
          clearAccessToken();

          return {
            ok: false,
            status: 401,
            _sessionExpired: true,
            data: {
              success: false,
              message:
                "Session expired. Please login again.",
            },
          };
        }
      }
    }

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return {
      ok:
        response.ok,

      status:
        response.status,

      data,
    };
  } catch (error) {
    console.error(
      "Admin API Error:",
      error
    );

    return {
      ok: false,

      status: 500,

      data: {
        success: false,
        message:
          error?.message ||
          "Network Error",
      },
    };
  }
}


// ======================================================
// ADMIN ORDERS
// ======================================================

export async function getAllOrders() {
  const res =
    await apiFetch(
      "/orders/admin/all"
    );

  return res.data;
}


export async function getAdminOrder(
  id
) {
  if (!id) {
    return {
      success: false,
      message:
        "Order ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/orders/admin/${id}`
    );

  return res.data;
}


export async function updateOrderStatus(
  id,
  orderStatus
) {
  if (!id) {
    return {
      success: false,
      message:
        "Order ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/orders/admin/${id}/status`,
      {
        method: "PATCH",

        body:
          JSON.stringify({
            orderStatus,
          }),
      }
    );

  return res.data;
}


// ======================================================
// ADMIN ENQUIRIES
// ======================================================

export async function getAllEnquiries() {
  const res =
    await apiFetch(
      "/enquiries/admin/all"
    );

  return res.data;
}


export async function getEnquiry(
  id
) {
  if (!id) {
    return {
      success: false,
      message:
        "Enquiry ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/enquiries/admin/${id}`
    );

  return res.data;
}


export async function updateEnquiryStatus(
  id,
  status,
  adminNotes = ""
) {
  if (!id) {
    return {
      success: false,
      message:
        "Enquiry ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/enquiries/admin/${id}/status`,
      {
        method: "PATCH",

        body:
          JSON.stringify({
            status,
            adminNotes,
          }),
      }
    );

  return res.data;
}


export async function deleteEnquiry(
  id
) {
  if (!id) {
    return {
      success: false,
      message:
        "Enquiry ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/enquiries/admin/${id}`,
      {
        method: "DELETE",
      }
    );

  return res.data;
}


// ======================================================
// ADMIN BULK PRODUCT UPLOAD
// ======================================================

export async function bulkUploadProducts(
  formData
) {
  try {
    if (
      !(
        formData instanceof
        FormData
      )
    ) {
      return {
        ok: false,
        status: 400,
        data: {
          success: false,
          message:
            "FormData is required for bulk upload.",
        },
      };
    }

    let token =
      getAccessToken();

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    const makeUploadRequest =
      async (
        accessToken
      ) => {
        return fetch(
          `${BASE_URL}/products/bulk-upload`,
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              ...(accessToken
                ? {
                    Authorization:
                      `Bearer ${accessToken}`,
                  }
                : {}),
            },

            /*
             * IMPORTANT:
             * Content-Type manually mat lagana.
             */
            body: formData,
          }
        );
      };

    let response =
      await makeUploadRequest(
        token
      );

    // ==================================================
    // TOKEN EXPIRED
    // ==================================================

    if (
      response.status === 401 &&
      token
    ) {
      const refreshed =
        await tryRefresh();

      if (!refreshed) {
        clearAccessToken();

        return {
          ok: false,
          status: 401,
          data: {
            success: false,
            message:
              "Session expired. Please login again.",
          },
        };
      }

      token =
        getAccessToken();

      response =
        await makeUploadRequest(
          token
        );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    const data =
      await parseResponse(
        response
      );

    return {
      ok:
        response.ok,

      status:
        response.status,

      data,
    };
  } catch (error) {
    console.error(
      "Bulk product upload error:",
      error
    );

    return {
      ok: false,
      status: 500,
      data: {
        success: false,
        message:
          error?.message ||
          "Bulk upload failed.",
      },
    };
  }
}


// ======================================================
// DOWNLOAD BULK PRODUCT EXCEL TEMPLATE
// ======================================================

export async function downloadBulkProductTemplate() {
  try {
    let token =
      getAccessToken();

    const makeTemplateRequest =
      async (
        accessToken
      ) => {
        return fetch(
          `${BASE_URL}/products/bulk-upload/template`,
          {
            method: "GET",

            credentials:
              "include",

            headers: {
              ...(accessToken
                ? {
                    Authorization:
                      `Bearer ${accessToken}`,
                  }
                : {}),
            },
          }
        );
      };

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    let response =
      await makeTemplateRequest(
        token
      );

    // ==================================================
    // TOKEN EXPIRED
    // ==================================================

    if (
      response.status === 401 &&
      token
    ) {
      const refreshed =
        await tryRefresh();

      if (!refreshed) {
        clearAccessToken();

        return {
          ok: false,
          status: 401,
          data: {
            success: false,
            message:
              "Session expired. Please login again.",
          },
        };
      }

      token =
        getAccessToken();

      response =
        await makeTemplateRequest(
          token
        );
    }

    // ==================================================
    // ERROR
    // ==================================================

    if (!response.ok) {
      const data =
        await parseResponse(
          response
        );

      return {
        ok: false,
        status:
          response.status,
        data,
      };
    }

    // ==================================================
    // EXCEL BLOB
    // ==================================================

    const blob =
      await response.blob();

    return {
      ok: true,
      status:
        response.status,
      blob,
    };
  } catch (error) {
    console.error(
      "Template download error:",
      error
    );

    return {
      ok: false,
      status: 500,
      data: {
        success: false,
        message:
          error?.message ||
          "Template download failed.",
      },
    };
  }
}


// ======================================================
// SAVE DOWNLOADED TEMPLATE
// ======================================================

export function saveBlobAsFile(
  blob,
  filename =
    "NHF-Bulk-Product-Template.xlsx"
) {
  if (!blob) {
    return false;
  }

  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;
  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url
  );

  return true;
}


// ======================================================
// ADMIN CATEGORIES
// ======================================================

export async function getAdminCategories(
  params = {}
) {
  const searchParams =
    new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(
        params.page
      )
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(
        params.limit
      )
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (
    params.parent !==
      undefined &&
    params.parent !== null
  ) {
    searchParams.set(
      "parent",
      String(
        params.parent
      )
    );
  }

  if (
    params.active !==
    undefined
  ) {
    searchParams.set(
      "active",
      String(
        params.active
      )
    );
  }

  if (
    params.home !==
    undefined
  ) {
    searchParams.set(
      "home",
      String(
        params.home
      )
    );
  }

  if (
    params.wardrobe !==
    undefined
  ) {
    searchParams.set(
      "wardrobe",
      String(
        params.wardrobe
      )
    );
  }

  const query =
    searchParams.toString();

  const res =
    await apiFetch(
      `/categories/admin/all${
        query
          ? `?${query}`
          : ""
      }`
    );

  return res.data;
}


// ======================================================
// GET PUBLIC CATEGORY TREE
// ======================================================

export async function getCategoryTree() {
  const res =
    await apiFetch(
      "/categories?tree=true"
    );

  return res.data;
}


// ======================================================
// GET SUBCATEGORIES
// ======================================================

export async function getSubcategories(
  categoryId
) {
  if (!categoryId) {
    return {
      ok: false,
      message:
        "Category ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/categories/${categoryId}/subcategories`
    );

  return res.data;
}


// ======================================================
// CREATE CATEGORY / SUBCATEGORY
// ======================================================

export async function createCategory(
  categoryData
) {
  if (!categoryData) {
    return {
      ok: false,
      message:
        "Category data is required.",
    };
  }

  const res =
    await apiFetch(
      "/categories",
      {
        method: "POST",

        body:
          JSON.stringify(
            categoryData
          ),
      }
    );

  return res.data;
}


// ======================================================
// UPDATE CATEGORY / SUBCATEGORY
// ======================================================

export async function updateCategory(
  id,
  categoryData
) {
  if (!id) {
    return {
      ok: false,
      message:
        "Category ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/categories/${id}`,
      {
        method: "PATCH",

        body:
          JSON.stringify(
            categoryData
          ),
      }
    );

  return res.data;
}


// ======================================================
// DELETE / DEACTIVATE CATEGORY
// ======================================================

export async function deleteCategory(
  id
) {
  if (!id) {
    return {
      ok: false,
      message:
        "Category ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/categories/${id}`,
      {
        method: "DELETE",
      }
    );

  return res.data;
}


// ======================================================
// ADMIN PRODUCTS
// ======================================================

export async function getAdminProducts(
  params = {}
) {
  const searchParams =
    new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(
        params.page
      )
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(
        params.limit
      )
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params.category) {
    searchParams.set(
      "category",
      params.category
    );
  }

  if (
    params.active !==
    undefined
  ) {
    searchParams.set(
      "active",
      String(
        params.active
      )
    );
  }

  const query =
    searchParams.toString();

  const res =
    await apiFetch(
      `/products/admin/all${
        query
          ? `?${query}`
          : ""
      }`
    );

  return res.data;
}


// ======================================================
// CREATE PRODUCT
// ======================================================

export async function createProduct(
  productData
) {
  if (!productData) {
    return {
      ok: false,
      message:
        "Product data is required.",
    };
  }

  const res =
    await apiFetch(
      "/products",
      {
        method: "POST",

        body:
          JSON.stringify(
            productData
          ),
      }
    );

  return res.data;
}


// ======================================================
// UPDATE PRODUCT
// ======================================================

export async function updateProduct(
  id,
  productData
) {
  if (!id) {
    return {
      ok: false,
      message:
        "Product ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/products/${id}`,
      {
        method: "PATCH",

        body:
          JSON.stringify(
            productData
          ),
      }
    );

  return res.data;
}


// ======================================================
// DELETE / DEACTIVATE PRODUCT
// ======================================================

export async function deleteProduct(
  id
) {
  if (!id) {
    return {
      ok: false,
      message:
        "Product ID is required.",
    };
  }

  const res =
    await apiFetch(
      `/products/${id}`,
      {
        method: "DELETE",
      }
    );

  return res.data;
}
// ======================================================
// ADMIN ORDER APPROVAL
// ======================================================

/**
 * Get all orders waiting for admin approval
 */
export async function getPendingOrders() {
  const res = await apiFetch(
    "/orders/admin/pending"
  );

  return res.data;
}


/**
 * Get complete approval details of an order
 */
export async function getAdminOrderApproval(
  id
) {
  if (!id) {
    return {
      success: false,
      message: "Order ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/admin/${id}/approval`
  );

  return res.data;
}


/**
 * Approve order
 *
 * Backend flow:
 * 1. Validate order
 * 2. Create Shiprocket order
 * 3. Assign AWB
 * 4. Request pickup
 * 5. Mark admin approval as approved
 * 6. Confirm order
 */
export async function approveAdminOrder(
  id
) {
  if (!id) {
    return {
      success: false,
      message: "Order ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/admin/${id}/approve`,
    {
      method: "PATCH",
    }
  );

  return res.data;
}


/**
 * Reject order
 */
export async function rejectAdminOrder(
  id,
  reason
) {
  if (!id) {
    return {
      success: false,
      message: "Order ID is required.",
    };
  }

  if (!reason?.trim()) {
    return {
      success: false,
      message: "Rejection reason is required.",
    };
  }

  const res = await apiFetch(
    `/orders/admin/${id}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({
        reason: reason.trim(),
      }),
    }
  );

  return res.data;
}


/**
 * Get latest Shiprocket tracking for admin
 */
export async function getAdminOrderTracking(
  id
) {
  if (!id) {
    return {
      success: false,
      message: "Order ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/admin/${id}/tracking`
  );

  return res.data;
}


// ======================================================
// ADMIN ORDER REQUESTS
// Cancel / Return / Replacement
// ======================================================


/**
 * Get all customer order requests
 *
 * Includes:
 * - cancel
 * - return
 * - replacement
 */
export async function getAllOrderRequests() {
  const res = await apiFetch(
    "/orders/requests/admin/all"
  );

  return res.data;
}


/**
 * Get one order request
 */
export async function getAdminOrderRequest(
  requestId
) {
  if (!requestId) {
    return {
      success: false,
      message: "Request ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/requests/admin/${requestId}`
  );

  return res.data;
}


/**
 * Approve cancel / return / replacement request
 */
export async function approveOrderRequest(
  requestId,
  adminNote = ""
) {
  if (!requestId) {
    return {
      success: false,
      message: "Request ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/requests/admin/${requestId}/approve`,
    {
      method: "PATCH",
      body: JSON.stringify({
        adminNote: adminNote?.trim() || "",
      }),
    }
  );

  return res.data;
}


/**
 * Reject cancel / return / replacement request
 */
export async function rejectOrderRequest(
  requestId,
  adminNote
) {
  if (!requestId) {
    return {
      success: false,
      message: "Request ID is required.",
    };
  }

  if (!adminNote?.trim()) {
    return {
      success: false,
      message: "Rejection reason is required.",
    };
  }

  const res = await apiFetch(
    `/orders/requests/admin/${requestId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({
        adminNote: adminNote.trim(),
      }),
    }
  );

  return res.data;
}