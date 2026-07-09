import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('access-high-contrast') === 'true';
  });
  
  const [dyslexiaFont, setDyslexiaFont] = useState(() => {
    return localStorage.getItem('access-dyslexia-font') === 'true';
  });

  const [speakText, setSpeakText] = useState(() => {
    return localStorage.getItem('access-speak-text') === 'true';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('access-font-size') || 'normal'; // 'normal', 'large', 'xlarge'
  });

  useEffect(() => {
    localStorage.setItem('access-high-contrast', highContrast);
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('access-dyslexia-font', dyslexiaFont);
    if (dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
  }, [dyslexiaFont]);

  useEffect(() => {
    localStorage.setItem('access-speak-text', speakText);
  }, [speakText]);

  useEffect(() => {
    localStorage.setItem('access-font-size', fontSize);
    
    // Remove previous classes
    document.documentElement.classList.remove('text-lg', 'text-xl');
    
    if (fontSize === 'large') {
      document.documentElement.classList.add('text-lg');
    } else if (fontSize === 'xlarge') {
      document.documentElement.classList.add('text-xl');
    }
  }, [fontSize]);

  // Integrated Speech Synthesis Helper
  const speak = (text) => {
    if (!speakText || !window.speechSynthesis) return;
    
    // Cancel ongoing speak requests
    window.speechSynthesis.cancel();

    // Standard sanitize text (remove markdown symbols)
    const cleanText = text.replace(/[*#_`~-]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to set a matching voice if possible (default fallback)
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      setHighContrast,
      dyslexiaFont,
      setDyslexiaFont,
      speakText,
      setSpeakText,
      fontSize,
      setFontSize,
      speak,
      stopSpeaking
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
