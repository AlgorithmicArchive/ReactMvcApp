import React, { useState, useEffect } from 'react';

const TextToSpeechToggle = () => {
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [voices, setVoices] = useState([]);
  let isSpeaking = false;

  // Load available voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        console.log('Voices loaded:', availableVoices);
      } else {
        console.warn('No voices available yet. Waiting for onvoiceschanged event.');
      }
    };

    // Initial attempt to load voices
    loadVoices();

    // Listen for voiceschanged event to load voices when they become available
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }, []);

  // Function to speak text content
  const speakText = (text) => {
    console.log('Attempting to speak text:', text);
  
    // Ensure that the Speech Synthesis API is available and voices are loaded
    if (!window.speechSynthesis) {
      console.error('Speech Synthesis API is not supported by this browser.');
      return;
    }
  
    if (isSpeaking) {
      console.warn('Already speaking. Skipping the request to speak.');
      return;
    }
  
    if (voices.length === 0) {
      console.error('No voices are available yet.');
      return; // Wait until voices are available
    }
  
    window.speechSynthesis.cancel(); // Clear any queued utterances
  
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((voice) => voice.lang === 'en-US') || voices[0];
  
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang; // Explicitly set the language based on the selected voice
      console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.error('No suitable voice found.');
    }
  
    utterance.volume = 1; // Set volume to full
    isSpeaking = true;
  
    // When the utterance ends, reset `isSpeaking` to false
    utterance.onend = () => {
      console.log('Speech has ended.');
      isSpeaking = false;
    };
  
    // Error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      isSpeaking = false;
    };
  
    console.log('Speaking:', utterance);
    window.speechSynthesis.speak(utterance);
  };
  
  // Toggle button click handler
  const toggleSpeech = () => {
    setSpeechEnabled((prev) => !prev); // Toggle the state

    // Speak a test message if enabling text-to-speech
    if (!speechEnabled) {
      console.log('Text-to-Speech enabled');
      speakText('Text to Speech is now enabled.');
    } else {
      console.log('Text-to-Speech disabled');
    }
  };

  return (
    <button
      id="toggleSpeech"
      onClick={toggleSpeech}
      aria-pressed={speechEnabled}
      aria-label={speechEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
      style={{ cursor: 'pointer', padding: '5px', margin: '0', fontSize: '12px',backgroundColor:'transparent',border:'2px solid #F0C38E',borderRadius:5,color:'#F0C38E' }}
    >
      {speechEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
    </button>
  );
};

export default TextToSpeechToggle;
