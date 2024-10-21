import React, { useEffect, useState } from 'react';

const ScreenReaderAccess = ({ onToggle }) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Ensure the Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech is not supported in this browser.');
    }
  }, []);

  // Toggle screen reader access
  const toggleScreenReaderAccess = () => {
    const newState = !screenReaderEnabled;
    setScreenReaderEnabled(newState);

    // Call the parent component's onToggle function if provided
    if (typeof onToggle === 'function') {
      onToggle(newState);
    }
  };

  return (
    <button
      onClick={toggleScreenReaderAccess}
      aria-pressed={screenReaderEnabled}
      aria-label={screenReaderEnabled ? 'Disable Screen Reader Access' : 'Enable Screen Reader Access'}
      style={{ fontSize: '12px', padding: '8px', cursor: 'pointer' }}
    >
      {screenReaderEnabled ? 'Disable Screen Reader Access' : 'Enable Screen Reader Access'}
    </button>
  );
};

export default ScreenReaderAccess;
