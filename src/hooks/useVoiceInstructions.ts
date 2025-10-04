import { useCallback, useEffect, useRef } from 'react';

export const useVoiceInstructions = (enabled: boolean) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!cleanText) return;

    utteranceRef.current = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current.rate = 1.0;
    utteranceRef.current.pitch = 1.0;
    utteranceRef.current.volume = 1.0;

    synthRef.current.speak(utteranceRef.current);
  }, [enabled]);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return { speak, cancel };
};
