// src/UserContext.js

import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize userType from localStorage
  const [userType, setUserType] = useState(() => {
    const savedUserType = localStorage.getItem("userType");
    return savedUserType ? JSON.parse(savedUserType) : null;
  });

  // Initialize token from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Initialize username from localStorage
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || null;
  });

  // Initialize profile from localStorage
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  // Initialize verified status from localStorage
  const [verified, setVerified] = useState(() => {
    const savedVerified = localStorage.getItem("verified");
    return savedVerified ? JSON.parse(savedVerified) : false;
  });

  // Initialize designation from localStorage
  const [designation, setDesignation] = useState(() => {
    const savedDesignation = localStorage.getItem("designation");
    return savedDesignation ? JSON.parse(savedDesignation) : null;
  });

  // Persist userType to localStorage
  useEffect(() => {
    if (userType) {
      localStorage.setItem("userType", JSON.stringify(userType));
    } else {
      localStorage.removeItem("userType");
    }
  }, [userType]);

  // Persist token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Persist username to localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }, [username]);

  // Persist profile to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem("profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("profile");
    }
  }, [profile]);

  // Persist verified status to localStorage
  useEffect(() => {
    localStorage.setItem("verified", JSON.stringify(verified));
  }, [verified]);

  // Persist designation to localStorage
  useEffect(() => {
    if (designation) {
      localStorage.setItem("designation", JSON.stringify(designation));
    } else {
      localStorage.removeItem("designation");
    }
  }, [designation]);

  return (
    <UserContext.Provider
      value={{
        userType,
        setUserType,
        token,
        setToken,
        username,
        setUsername,
        profile,
        setProfile,
        verified,
        setVerified,
        designation,
        setDesignation, // Added designation and its setter
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
