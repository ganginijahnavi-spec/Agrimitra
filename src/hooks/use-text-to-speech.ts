"use client";

import { useCallback, useEffect, useState } from "react";

export function useTextToSpeech(language: "en" | "te") {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported || !text) return;

      window.speechSynthesis.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "te" ? "te-IN" : "en-IN";
      utterance.onend = () => setSpeakingId((current) => (current === id ? null : current));
      utterance.onerror = () => setSpeakingId((current) => (current === id ? null : current));

      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [language, speakingId, supported],
  );

  return { supported, speakingId, speak };
}
