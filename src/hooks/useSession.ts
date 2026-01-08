import { useState, useCallback } from 'react';
import type { Session, SessionStep, EmotionLevel, Persona, WorryGraph } from '@/types/session';

export function useSession() {
  const [currentStep, setCurrentStep] = useState<SessionStep>('welcome');
  const [session, setSession] = useState<Partial<Session>>({
    id: crypto.randomUUID(),
    createdAt: new Date(),
  });

  const goToStep = useCallback((step: SessionStep) => {
    setCurrentStep(step);
  }, []);

  const setEmotionBefore = useCallback((level: EmotionLevel) => {
    setSession(prev => ({ ...prev, emotionBefore: level }));
  }, []);

  const setEmotionAfter = useCallback((level: EmotionLevel) => {
    setSession(prev => ({ ...prev, emotionAfter: level }));
  }, []);

  const setTranscript = useCallback((transcript: string) => {
    setSession(prev => ({ ...prev, transcript }));
  }, []);

  const setWorryGraph = useCallback((worryGraph: WorryGraph) => {
    setSession(prev => ({ ...prev, worryGraph }));
  }, []);

  const setSelectedPersona = useCallback((persona: Persona) => {
    setSession(prev => ({ ...prev, selectedPersona: persona }));
  }, []);

  const setReframedResponse = useCallback((response: string) => {
    setSession(prev => ({ ...prev, reframedResponse: response }));
  }, []);

  const resetSession = useCallback(() => {
    setSession({
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
    setCurrentStep('welcome');
  }, []);

  return {
    currentStep,
    session,
    goToStep,
    setEmotionBefore,
    setEmotionAfter,
    setTranscript,
    setWorryGraph,
    setSelectedPersona,
    setReframedResponse,
    resetSession,
  };
}
