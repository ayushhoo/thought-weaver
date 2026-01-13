import { useEffect, useCallback } from 'react';
import type { Session, WorryGraph } from '@/types/session';

const STORAGE_KEY = 'mindvista-session';
const HISTORY_KEY = 'mindvista-history';

interface SavedSession {
  id: string;
  timestamp: number;
  emotionBefore?: number;
  emotionAfter?: number;
  worryGraph?: WorryGraph;
  transcript?: string;
}

export function useSessionPersistence() {
  // Save current session state
  const saveSession = useCallback((session: Partial<Session>) => {
    try {
      const savedSession: SavedSession = {
        id: session.id || crypto.randomUUID(),
        timestamp: Date.now(),
        emotionBefore: session.emotionBefore,
        emotionAfter: session.emotionAfter,
        worryGraph: session.worryGraph ?? undefined,
        transcript: session.transcript,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSession));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Load saved session
  const loadSession = useCallback((): SavedSession | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only return if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Clear current session
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Add session to history
  const addToHistory = useCallback((session: Partial<Session>) => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      const history: SavedSession[] = historyStr ? JSON.parse(historyStr) : [];
      
      const newEntry: SavedSession = {
        id: session.id || crypto.randomUUID(),
        timestamp: Date.now(),
        emotionBefore: session.emotionBefore,
        emotionAfter: session.emotionAfter,
        worryGraph: session.worryGraph ?? undefined,
        transcript: session.transcript,
      };
      
      // Keep only last 10 sessions
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Get session history
  const getHistory = useCallback((): SavedSession[] => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch {
      return [];
    }
  }, []);

  return {
    saveSession,
    loadSession,
    clearSession,
    addToHistory,
    getHistory,
  };
}
