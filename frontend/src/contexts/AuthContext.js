import React, { createContext, useContext, useState, useEffect } from "react";
import mockEmailService from "../services/mockEmailService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authenticated user on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem("smoofriends_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Verify the email is still verified
        if (mockEmailService.isEmailVerified(userData.email)) {
          setUser(userData);
        } else {
          // Email verification was revoked, clear user
          localStorage.removeItem("smoofriends_user");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("smoofriends_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smoofriends_user");
    // Optionally clear verification data
    // mockEmailService.clearAllData();
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
