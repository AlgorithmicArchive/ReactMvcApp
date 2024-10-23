// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => {
    const savedUserType = localStorage.getItem('userType');
    return savedUserType ? JSON.parse(savedUserType) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    if (userType) {
      localStorage.setItem('userType', JSON.stringify(userType));
    } else {
      localStorage.removeItem('userType');
    }
  }, [userType]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ userType, setUserType, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
