import { useEffect, useCallback, useState } from 'react';
import type { Persona } from '@/types/session';

interface PersonaTheme {
  fontClass: string;
  textureClass: string;
  accentHue: number;
  label: string;
}

const personaThemes: Record<Persona, PersonaTheme> = {
  stoic: {
    fontClass: 'persona-stoic',
    textureClass: 'texture-marble',
    accentHue: 200, // Cool, marble-like
    label: 'The Stoic Philosopher',
  },
  grandma: {
    fontClass: 'persona-grandma',
    textureClass: 'texture-warm',
    accentHue: 35, // Warm beige
    label: 'The Compassionate Grandma',
  },
  detective: {
    fontClass: 'persona-detective',
    textureClass: 'texture-dark-slate',
    accentHue: 220, // Dark slate blue
    label: 'The Logic Detective',
  },
};

export function usePersonaTheme(selectedPersona: Persona | null) {
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme | null>(null);

  // Apply persona-specific theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all persona classes first
    root.classList.remove('persona-stoic', 'persona-grandma', 'persona-detective');
    
    if (selectedPersona) {
      const theme = personaThemes[selectedPersona];
      setCurrentTheme(theme);
      
      // Add the persona font class
      root.classList.add(theme.fontClass);
      
      // Optionally adjust CSS custom properties for accent colors
      // This creates a subtle shift in the UI to match persona energy
      if (selectedPersona === 'stoic') {
        root.style.setProperty('--accent', '200 30% 45%'); // Cool blue-grey
      } else if (selectedPersona === 'grandma') {
        root.style.setProperty('--accent', '35 50% 60%'); // Warm peach
      } else if (selectedPersona === 'detective') {
        root.style.setProperty('--accent', '220 40% 35%'); // Dark analytical blue
      }
    } else {
      setCurrentTheme(null);
      // Reset to default accent
      root.style.setProperty('--accent', '270 40% 45%');
    }

    // Cleanup on unmount
    return () => {
      root.classList.remove('persona-stoic', 'persona-grandma', 'persona-detective');
      root.style.removeProperty('--accent');
    };
  }, [selectedPersona]);

  const getTextureClass = useCallback(() => {
    if (!selectedPersona) return '';
    return personaThemes[selectedPersona].textureClass;
  }, [selectedPersona]);

  const getPersonaLabel = useCallback(() => {
    if (!selectedPersona) return '';
    return personaThemes[selectedPersona].label;
  }, [selectedPersona]);

  return {
    currentTheme,
    textureClass: getTextureClass(),
    personaLabel: getPersonaLabel(),
    isActive: !!selectedPersona,
  };
}
