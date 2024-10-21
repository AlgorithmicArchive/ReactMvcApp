import React, { useEffect } from 'react';

const GoogleTranslateWidget = () => {
  useEffect(() => {
    const googleTranslateScriptUrl =
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

    // Function to load Google Translate script
    const loadGoogleTranslateScript = () => {
      return new Promise((resolve, reject) => {
        if (!document.querySelector(`script[src="${googleTranslateScriptUrl}"]`)) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = googleTranslateScriptUrl;
          script.async = true;
          script.defer = true;

          script.onload = resolve;
          script.onerror = reject;

          document.body.appendChild(script);
        } else {
          // If script already exists, resolve immediately
          resolve();
        }
      });
    };

    // Initialize Google Translate widget after the script is loaded
    const initializeGoogleTranslateWidget = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,ur', // Only include English, Hindi, and Urdu
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        } catch (error) {
          console.error('Error initializing Google Translate Element:', error);
        }
      } else {
        // Retry initialization after a delay if google.translate is not ready yet
        setTimeout(initializeGoogleTranslateWidget, 500);
      }
    };

    // Assign the initialization function to the global scope
    window.googleTranslateElementInit = () => {
      initializeGoogleTranslateWidget();
    };

    // Load the script and try to initialize the widget
    loadGoogleTranslateScript()
      .then(() => {
        initializeGoogleTranslateWidget();
      })
      .catch((error) => {
        console.error('Error loading Google Translate script:', error);
      });

    // Use CSS to hide unnecessary elements after Google Translate widget loads
    const customizeGoogleTranslateDropdown = () => {
      const observer = new MutationObserver(() => {
        const googleSelectElement = document.querySelector('.goog-te-combo');
        if (googleSelectElement) {
          // Remove all other languages except for English, Hindi, and Urdu
          for (let option of googleSelectElement.options) {
            if (!['en', 'hi', 'ur'].includes(option.value)) {
              option.remove();
            }
          }
          observer.disconnect(); // Stop observing once the dropdown is modified
        }
      });

      // Observe changes in the document to identify when the dropdown becomes available
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    // Wait until the Google Translate script loads to customize the dropdown
    loadGoogleTranslateScript()
      .then(() => {
        customizeGoogleTranslateDropdown();
      })
      .catch((error) => {
        console.error('Error customizing Google Translate dropdown:', error);
      });
  }, []);

  return <div id="google_translate_element" />;
};

export default GoogleTranslateWidget;
