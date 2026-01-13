import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  calmMode: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = 'mindvista-accessibility';

function getInitialSettings(): AccessibilitySettings {
  // Check system preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Try to load saved settings
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        reducedMotion: parsed.reducedMotion ?? prefersReducedMotion,
        calmMode: parsed.calmMode ?? false,
        highContrast: parsed.highContrast ?? false,
      };
    }
  } catch {
    // Ignore parse errors
  }
  
  return {
    reducedMotion: prefersReducedMotion,
    calmMode: false,
    highContrast: false,
  };
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (settings.calmMode) {
      root.classList.add('calm-mode');
    } else {
      root.classList.remove('calm-mode');
    }
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleCalmMode = useCallback(() => {
    setSettings(prev => ({ ...prev, calmMode: !prev.calmMode }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  return {
    ...settings,
    toggleReducedMotion,
    toggleCalmMode,
    toggleHighContrast,
  };
}
