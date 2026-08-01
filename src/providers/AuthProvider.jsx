"use client";

import { useEffect, useState } from "react";
import AuthContext from "@/context/AuthContext";
import {
  getMe,
  loginUser,
  logoutUser,
  refreshToken,
  googleLogin,
} from "@/lib/authApi";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // Load logged in user
  const loadUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch (error) {
      try {
        const refresh = await refreshToken();

        localStorage.setItem(
          "accessToken",
          refresh.data.accessToken
        );

        const me = await getMe();

        setUser(me.data.user);
      } catch (err) {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Email Login
  const login = async (body) => {
    const { data } = await loginUser(body);

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    setUser(data.user);

    return data;
  };

  // Google Login
  const loginWithGoogle = async (idToken) => {
    const { data } = await googleLogin({
      idToken,
    });

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    setUser(data.user);

    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,

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