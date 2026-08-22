import axios from "axios";

// ======================================================
// BASE URL
// ======================================================

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api/v1"
).replace(/\/$/, "");


// ======================================================
// AXIOS INSTANCE
// ======================================================

const api = axios.create({
  baseURL: BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
  (config) => {
    if (
      typeof window !== "undefined"
    ) {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (token) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest =
      error.config;

    if (!originalRequest) {
      return Promise.reject(
        error
      );
    }

    // ==================================================
    // ONLY HANDLE 401
    // ==================================================

    if (
      error.response?.status !==
      401
    ) {
      return Promise.reject(
        error
      );
    }

    // ==================================================
    // IMPORTANT:
    // NO ACCESS TOKEN = GUEST USER
    //
    // Refresh API call mat karo.
    // ==================================================

    let accessToken = null;

    if (
      typeof window !==
      "undefined"
    ) {
      accessToken =
        localStorage.getItem(
          "accessToken"
        );
    }

    if (!accessToken) {
      return Promise.reject(
        error
      );
    }

    // ==================================================
    // PREVENT INFINITE RETRY
    // ==================================================

    if (
      originalRequest._retry
    ) {
      return Promise.reject(
        error
      );
    }

    originalRequest._retry =
      true;

    // ==================================================
    // REFRESH TOKEN
    // ==================================================

    try {
      const refreshResponse =
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials:
              true,

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const newAccessToken =
        refreshResponse.data
          ?.accessToken;

      if (!newAccessToken) {
        throw new Error(
          refreshResponse.data
            ?.message ||
            "Access token refresh failed."
        );
      }

      // ==================================================
      // SAVE NEW TOKEN
      // ==================================================

      localStorage.setItem(
        "accessToken",
        newAccessToken
      );

      // ==================================================
      // RETRY ORIGINAL REQUEST
      // ==================================================

      originalRequest.headers =
        originalRequest.headers ||
        {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      console.error(
        "TOKEN REFRESH FAILED:",
        refreshError
          ?.response
          ?.data ||
          refreshError?.message ||
          refreshError
      );

      // ==================================================
      // INVALID SESSION
      // ==================================================

      if (
        typeof window !==
        "undefined"
      ) {
        localStorage.removeItem(
          "accessToken"
        );
      }

      return Promise.reject(
        refreshError
      );
    }
  }
);


// ======================================================
// EXPORT
// ======================================================

export default api;