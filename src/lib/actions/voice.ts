"use server";

import { callEdgeFunction } from "@/lib/functions";

export type TranscribeErrorKey =
  | "unauthorized"
  | "rateLimited"
  | "tooLarge"
  | "unavailable"
  | "generic";

export type TranscribeResult =
  | { status: "success"; text: string }
  | { status: "error"; errorKey: TranscribeErrorKey };

const ERROR_MAP: Record<string, TranscribeErrorKey> = {
  unauthorized: "unauthorized",
  rate_limited: "rateLimited",
  audio_too_large: "tooLarge",
  transcription_unavailable: "unavailable",
};

export async function transcribeAudioAction(input: {
  audioBase64: string;
  mimeType: string;
  language: "en" | "te";
}): Promise<TranscribeResult> {
  const { data, error } = await callEdgeFunction<{ text: string }>("transcribe", {
    method: "POST",
    body: {
      audio_base64: input.audioBase64,
      mime_type: input.mimeType,
      language: input.language,
    },
  });

  if (error || !data?.text) {
    return { status: "error", errorKey: ERROR_MAP[error ?? ""] ?? "generic" };
  }

  return { status: "success", text: data.text };
}
