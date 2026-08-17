import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("auth_role") || "Learner";
  });

  const login = async (email, password) => {
    try {
      console.log("Attempting login...");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data.access_token;

      if (!token) {
        console.error("No access token received!");
        return false;
      }

      console.log("TOKEN RECEIVED:", token);

      localStorage.setItem("token", token);

      console.log(
        "TOKEN AFTER SAVE:",
        localStorage.getItem("token")
      );

      const userResponse = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("USER RESPONSE:", userResponse.data);

      const loggedUser = userResponse.data;

      setUser(loggedUser);
      setRole(loggedUser.role);

      localStorage.setItem(
        "auth_user",
        JSON.stringify(loggedUser)
      );

      localStorage.setItem(
        "auth_role",
        loggedUser.role
      );

      console.log("LOGIN SUCCESS");

      return true;
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("DATA:", error.response.data);
      }

      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      await api.post("/auth/register", {
        full_name: name,
        email,
        password,
        role: "Learner",
      });

      return await login(email, password);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
  };

  const changeRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("auth_role", newRole);
  };

  const updateProfile = (updatedData) => {
    const merged = {
      ...user,
      ...updatedData,
    };

    setUser(merged);

    localStorage.setItem(
      "auth_user",
      JSON.stringify(merged)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        signup,
        logout,
        changeRole,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);