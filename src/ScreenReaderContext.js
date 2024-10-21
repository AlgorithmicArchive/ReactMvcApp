import React, { createContext, useState, useContext } from 'react';

const ScreenReaderContext = createContext();

export const ScreenReaderProvider = ({ children }) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  const toggleScreenReader = () => {
    setScreenReaderEnabled((prev) => !prev);
  };

  return (
    <ScreenReaderContext.Provider value={{ screenReaderEnabled, toggleScreenReader }}>
      {children}
    </ScreenReaderContext.Provider>
  );
};

export const useScreenReader = () => useContext(ScreenReaderContext);
