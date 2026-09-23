"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { callEdgeFunction } from "@/lib/functions";
import type { AnalyzeCropResponse } from "@/lib/analyze";

export type AnalyzeErrorKey =
  | "unauthorized"
  | "rateLimited"
  | "busy"
  | "unavailable"
  | "notFound"
  | "generic";

export type AnalyzeCropActionResult =
  | { status: "success"; data: AnalyzeCropResponse }
  | { status: "error"; errorKey: AnalyzeErrorKey };

const ERROR_MAP: Record<string, AnalyzeErrorKey> = {
    unauthorized: "unauthorized",
    rate_limited: "rateLimited",
    vision_busy: "busy",
    vision_unavailable: "unavailable",
    invalid_analysis: "unavailable",
    image_not_found: "notFound",
    forbidden: "notFound",
    missing_image_path: "generic",
  };

export async function analyzeCropImageAction(input: {
  imagePath: string;
  cropId: string | null;
  symptomNote: string;
  language: "en" | "te";
}): Promise<AnalyzeCropActionResult> {
  const { data, error } = await callEdgeFunction<AnalyzeCropResponse>("analyze-crop", {
    method: "POST",
    body: {
      image_path: input.imagePath,
      crop_id: input.cropId,
      symptom_note: input.symptomNote,
      language: input.language,
    },
  });

  if (error || !data) {
    return { status: "error", errorKey: ERROR_MAP[error ?? ""] ?? "generic" };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/analyze`);

  return { status: "success", data };
}
