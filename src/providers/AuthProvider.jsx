"use client";

import {
  useEffect,
  useState,
} from "react";

import AuthContext from "@/context/AuthContext";

import {
  getMe,
  loginUser,
  logoutUser,
  googleLogin,
} from "@/lib/authApi";

import {
  addToCart,
} from "@/lib/cart";

import {
  addToWishlist,
} from "@/lib/wishlist";


const AuthProvider = ({
  children,
}) => {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ====================================================
  // LOAD USER
  // ====================================================

  const loadUser =
    async () => {
      try {
        /*
         * Guest user ke liye
         * /auth/me call hi mat karo.
         */
        const token =
          typeof window !==
          "undefined"
            ? localStorage.getItem(
                "accessToken"
              )
            : null;

        if (!token) {
          setUser(null);
          return;
        }

        /*
         * Authenticated user.
         *
         * Axios interceptor:
         * 401 -> refresh -> retry
         */
        const {
          data,
        } = await getMe();

        setUser(
          data?.user || null
        );
      } catch (error) {
        console.error(
          "LOAD USER FAILED:",
          error
        );

        /*
         * Access token + refresh
         * dono invalid hone par
         * local token remove.
         */
        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.removeItem(
            "accessToken"
          );
        }

        setUser(null);
      } finally {
        setLoading(false);
      }
    };


  // ====================================================
  // PROCESS PENDING ACTION
  // ====================================================

  const processPendingAction =
    async () => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      /*
       * ----------------------------------------------
       * 1. PENDING CART
       * ----------------------------------------------
       */

      const pendingCart =
        sessionStorage.getItem(
          "pendingCartProduct"
        );

      if (pendingCart) {
        try {
          const parsed =
            JSON.parse(
              pendingCart
            );

          const product =
            parsed?.product;

          const quantity =
            Number(
              parsed?.quantity
            ) || 1;

          if (
            product
          ) {
            await addToCart(
              product,
              quantity
            );
          }

          sessionStorage.removeItem(
            "pendingCartProduct"
          );
        } catch (
          error
        ) {
          console.error(
            "PENDING CART ERROR:",
            error
          );

          /*
           * Invalid pending data
           * ko repeat nahi karna.
           */
          sessionStorage.removeItem(
            "pendingCartProduct"
          );
        }
      }


      /*
       * ----------------------------------------------
       * 2. PENDING WISHLIST
       * ----------------------------------------------
       */

      const pendingWishlist =
        sessionStorage.getItem(
          "pendingWishlistProduct"
        );

      if (pendingWishlist) {
        try {
          const parsed =
            JSON.parse(
              pendingWishlist
            );

          const product =
            parsed?.product;

          if (
            product
          ) {
            await addToWishlist(
              product
            );
          }

          sessionStorage.removeItem(
            "pendingWishlistProduct"
          );
        } catch (
          error
        ) {
          console.error(
            "PENDING WISHLIST ERROR:",
            error
          );

          sessionStorage.removeItem(
            "pendingWishlistProduct"
          );
        }
      }


      /*
       * ----------------------------------------------
       * 3. PENDING BUY NOW
       * ----------------------------------------------
       *
       * Buy Now mein product pehle
       * cart mein add hoga.
       * Uske baad checkout open hoga.
       */

      const pendingBuyNow =
        sessionStorage.getItem(
          "pendingBuyNowProduct"
        );

      if (pendingBuyNow) {
        try {
          const parsed =
            JSON.parse(
              pendingBuyNow
            );

          const product =
            parsed?.product;

          const quantity =
            Number(
              parsed?.quantity
            ) || 1;

          if (
            product
          ) {
            await addToCart(
              product,
              quantity
            );

            sessionStorage.removeItem(
              "pendingBuyNowProduct"
            );

            /*
             * Login complete hone ke baad
             * checkout par bhejo.
             */
            window.location.href =
              "/checkout";

            return;
          }

          sessionStorage.removeItem(
            "pendingBuyNowProduct"
          );
        } catch (
          error
        ) {
          console.error(
            "PENDING BUY NOW ERROR:",
            error
          );

          sessionStorage.removeItem(
            "pendingBuyNowProduct"
          );
        }
      }


      /*
       * ----------------------------------------------
       * 4. NORMAL REDIRECT
       * ----------------------------------------------
       */

      const pendingRedirect =
        sessionStorage.getItem(
          "pendingCartRedirect"
        );

      if (
        pendingRedirect
      ) {
        sessionStorage.removeItem(
          "pendingCartRedirect"
        );

        /*
         * Same page par wapas.
         */
        if (
          pendingRedirect !==
          window.location.pathname
        ) {
          window.location.href =
            pendingRedirect;
        }
      }
    };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadUser();
  }, []);


  // ====================================================
  // EMAIL LOGIN
  // ====================================================

  const login =
    async (body) => {
      const {
        data,
      } = await loginUser(
        body
      );

      if (
        data?.accessToken
      ) {
        localStorage.setItem(
          "accessToken",
          data.accessToken
        );
      }

      setUser(
        data?.user || null
      );

      /*
       * Login successful.
       *
       * Ab jo user action login se
       * pehle karna chahta tha
       * woh complete karo.
       */
      await processPendingAction();

      return data;
    };


  // ====================================================
  // GOOGLE LOGIN
  // ====================================================

  const loginWithGoogle =
    async (
      idToken
    ) => {
      const {
        data,
      } = await googleLogin({
        idToken,
      });

      if (
        data?.accessToken
      ) {
        localStorage.setItem(
          "accessToken",
          data.accessToken
        );
      }

      setUser(
        data?.user || null
      );

      /*
       * Google login ke baad bhi
       * same pending action process.
       */
      await processPendingAction();

      return data;
    };


  // ====================================================
  // LOGOUT
  // ====================================================

  const logout =
    async () => {
      try {
        await logoutUser();
      } catch (
        error
      ) {
        console.error(
          "LOGOUT ERROR:",
          error
        );
      } finally {
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

          /*
           * Old pending actions ko
           * bhi clear karo.
           */
          sessionStorage.removeItem(
            "pendingCartProduct"
          );

          sessionStorage.removeItem(
            "pendingCartRedirect"
          );

          sessionStorage.removeItem(
            "pendingWishlistProduct"
          );

          sessionStorage.removeItem(
            "pendingBuyNowProduct"
          );
        }

        setUser(null);
      }
    };


  // ====================================================
  // CONTEXT
  // ====================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        setUser,

        loading,

        isAuthenticated:
          !!user,

        login,

        loginWithGoogle,

        logout,

        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export default AuthProvider;