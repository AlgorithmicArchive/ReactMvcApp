import { useEffect } from 'react';
import { useScreenReader } from './ScreenReaderContext';

const useScreenReaderEffect = () => {
  const { screenReaderEnabled } = useScreenReader();

  useEffect(() => {
    if (screenReaderEnabled) {
      const speakText = (text) => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
        }
      };

      const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };

      // Select all elements that should have the screen reader enabled
      const elements = document.querySelectorAll('[data-screen-reader]');

      elements.forEach((element) => {
        element.addEventListener('mouseenter', () => {
          const text = element.innerText || element.getAttribute('aria-label');
          if (text) {
            speakText(text);
          }
        });

        element.addEventListener('mouseleave', stopSpeaking);
      });

      // Cleanup function to remove event listeners when screen reader is disabled
      return () => {
        elements.forEach((element) => {
          element.removeEventListener('mouseenter', speakText);
          element.removeEventListener('mouseleave', stopSpeaking);
        });
      };
    }
  }, [screenReaderEnabled]);
};

export default useScreenReaderEffect;
