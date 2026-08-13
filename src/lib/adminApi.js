// ======================================================
// ADMIN API
// src/lib/adminApi.js
// ======================================================

const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1";

// ======================================================
// ADMIN ACCESS TOKEN
// ======================================================

let _token = null;

// ======================================================
// TOKEN HELPERS
// ======================================================

export const setAccessToken = (token) => {
  _token = token || null;

  if (
    typeof window !== "undefined" &&
    token
  ) {
    localStorage.setItem("adminAccessToken", token);
  }
};

export const getAccessToken = () => {
  if (_token) {
    return _token;
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem("adminAccessToken");
  }

  return null;
};

export const clearAccessToken = () => {
  _token = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAccessToken");
  }
};

// ======================================================
// ADMIN REFRESH TOKEN
// ======================================================

async function tryRefresh() {
  try {
    const res = await fetch(
      `${BASE}/auth/admin/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!res.ok) {
      return false;
    }

    const json = await res.json().catch(() => ({}));

    if (!json.accessToken) {
      return false;
    }

    setAccessToken(json.accessToken);

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
// ADMIN API FETCH
// ======================================================

export async function apiFetch(path, options = {}) {
  try {
    const makeRequest = async (token) => {
      const headers = {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      };

      // JSON requests ke liye Content-Type
      // FormData ke liye browser khud boundary set karega
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] =
          "application/json";
      }

      return fetch(`${BASE}${path}`, {
        ...options,
        credentials: "include",
        headers,
      });
    };

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    let token = getAccessToken();

    let res = await makeRequest(token);

    // ==================================================
    // TOKEN EXPIRED
    // ==================================================

    if (res.status === 401) {
      const refreshed = await tryRefresh();

      if (!refreshed) {
        clearAccessToken();

        return {
          ok: false,
          status: 401,
          _sessionExpired: true,
          data: {
            message:
              "Session expired. Please login again.",
          },
        };
      }

      token = getAccessToken();

      res = await makeRequest(token);
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    const data = await res.json().catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error) {
    console.error("Admin API Error:", error);

    return {
      ok: false,
      status: 500,
      data: {
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
  const res = await apiFetch(
    "/orders/admin/all"
  );

  return res.data;
}

export async function getAdminOrder(id) {
  if (!id) {
    return {
      success: false,
      message: "Order ID is required.",
    };
  }

  const res = await apiFetch(
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
      message: "Order ID is required.",
    };
  }

  const res = await apiFetch(
    `/orders/admin/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
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
  const res = await apiFetch(
    "/enquiries/admin/all"
  );

  return res.data;
}

export async function getEnquiry(id) {
  if (!id) {
    return {
      success: false,
      message: "Enquiry ID is required.",
    };
  }

  const res = await apiFetch(
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
      message: "Enquiry ID is required.",
    };
  }

  const res = await apiFetch(
    `/enquiries/admin/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        adminNotes,
      }),
    }
  );

  return res.data;
}

export async function deleteEnquiry(id) {
  if (!id) {
    return {
      success: false,
      message: "Enquiry ID is required.",
    };
  }

  const res = await apiFetch(
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
    if (!(formData instanceof FormData)) {
      return {
        ok: false,
        status: 400,
        data: {
          message:
            "FormData is required for bulk upload.",
        },
      };
    }

    const makeRequest = async (token) => {
      return fetch(
        `${BASE}/products/bulk-upload`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          // IMPORTANT:
          // Content-Type yahan mat lagana.
          // Browser multipart/form-data boundary automatically lagayega.
          body: formData,
        }
      );
    };

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    let token = getAccessToken();

    let res = await makeRequest(token);

    // ==================================================
    // ACCESS TOKEN EXPIRED
    // ==================================================

    if (res.status === 401) {
      const refreshed = await tryRefresh();

      if (!refreshed) {
        clearAccessToken();

        return {
          ok: false,
          status: 401,
          data: {
            message:
              "Session expired. Please login again.",
          },
        };
      }

      token = getAccessToken();

      res = await makeRequest(token);
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    const data = await res
      .json()
      .catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
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
    const makeRequest = async (token) => {
      return fetch(
        `${BASE}/products/bulk-upload/template`,
        {
          method: "GET",
          credentials: "include",

          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );
    };

    // ==================================================
    // FIRST REQUEST
    // ==================================================

    let token = getAccessToken();

    let res = await makeRequest(token);

    // ==================================================
    // ACCESS TOKEN EXPIRED
    // ==================================================

    if (res.status === 401) {
      const refreshed = await tryRefresh();

      if (!refreshed) {
        clearAccessToken();

        return {
          ok: false,
          status: 401,
          data: {
            message:
              "Session expired. Please login again.",
          },
        };
      }

      token = getAccessToken();

      res = await makeRequest(token);
    }

    // ==================================================
    // ERROR
    // ==================================================

    if (!res.ok) {
      const data = await res
        .json()
        .catch(() => ({}));

      return {
        ok: false,
        status: res.status,
        data,
      };
    }

    // ==================================================
    // EXCEL BLOB
    // ==================================================

    const blob = await res.blob();

    return {
      ok: true,
      status: res.status,
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
  filename = "NHF-Bulk-Product-Template.xlsx"
) {
  if (!blob) {
    return false;
  }

  const url = window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);

  return true;
}