"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { transcribeAudioAction } from "@/lib/actions/voice";

// A short cap keeps recordings well under Groq's per-file limit and keeps
// the base64 JSON payload small; it's also a sane UX ceiling for a single
// voice message.
const MAX_RECORDING_MS = 60_000;

export type VoiceInputStatus = "idle" | "recording" | "transcribing" | "unsupported";
export type VoiceInputErrorKey =
  | "micDenied"
  | "unauthorized"
  | "rateLimited"
  | "tooLarge"
  | "unavailable"
  | "generic";

type Mode = "groq" | "webspeech";

// Feature support never changes over a component's lifetime, so it's read
// via useSyncExternalStore (a no-op subscription) rather than an effect +
// setState — that avoids both a hydration mismatch (browser-only APIs
// aren't available during SSR) and an extra render pass.
function subscribeNever() {
  return () => {};
}
function getVoiceSupportSnapshot(): boolean {
  const hasRecorder =
    typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const hasWebSpeech = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  return hasRecorder || hasWebSpeech;
}
function getVoiceSupportServerSnapshot(): boolean {
  return false;
}

export function useVoiceInput(language: "en" | "te") {
  const [status, setStatus] = useState<VoiceInputStatus>("idle");
  const [errorKey, setErrorKey] = useState<VoiceInputErrorKey | null>(null);
  const isSupported = useSyncExternalStore(
    subscribeNever,
    getVoiceSupportSnapshot,
    getVoiceSupportServerSnapshot,
  );

  const modeRef = useRef<Mode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const startGroqRecording = useCallback(
    async (onResult: (text: string) => void) => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        clearStopTimer();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setStatus("idle");
          return;
        }

        setStatus("transcribing");
        try {
          const audioBase64 = await blobToBase64(blob);
          const result = await transcribeAudioAction({ audioBase64, mimeType, language });
          if (result.status === "success") {
            if (result.text) onResult(result.text);
          } else {
            setErrorKey(result.errorKey);
          }
        } catch {
          setErrorKey("generic");
        } finally {
          setStatus("idle");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      stopTimerRef.current = setTimeout(() => recorder.stop(), MAX_RECORDING_MS);
    },
    [clearStopTimer, language],
  );

  const startWebSpeechRecording = useCallback(
    (onResult: (text: string) => void) => {
      const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Ctor) {
        setStatus("unsupported");
        return;
      }

      const recognition = new Ctor();
      recognition.lang = language === "te" ? "te-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        if (transcript) onResult(transcript);
      };
      recognition.onerror = (event) => {
        setErrorKey(event.error === "not-allowed" ? "micDenied" : "generic");
      };
      recognition.onend = () => setStatus("idle");

      recognitionRef.current = recognition;
      recognition.start();
      setStatus("recording");
    },
    [language],
  );

  const start = useCallback(
    async (onResult: (text: string) => void) => {
      setErrorKey(null);

      const hasRecorder =
        typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia;
      const hasWebSpeech =
        typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

      if (hasRecorder) {
        modeRef.current = "groq";
        try {
          await startGroqRecording(onResult);
        } catch {
          // Most likely mic permission was denied, or no mic is present.
          // Fall back to the browser's own speech recognition if it has one.
          if (hasWebSpeech) {
            modeRef.current = "webspeech";
            startWebSpeechRecording(onResult);
          } else {
            setStatus("unsupported");
            setErrorKey("micDenied");
          }
        }
      } else if (hasWebSpeech) {
        modeRef.current = "webspeech";
        startWebSpeechRecording(onResult);
      } else {
        setStatus("unsupported");
      }
    },
    [startGroqRecording, startWebSpeechRecording],
  );

  const stop = useCallback(() => {
    if (modeRef.current === "groq") {
      clearStopTimer();
      mediaRecorderRef.current?.stop();
    } else if (modeRef.current === "webspeech") {
      recognitionRef.current?.stop();
    }
  }, [clearStopTimer]);

  return { status, errorKey, isSupported, start, stop };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
