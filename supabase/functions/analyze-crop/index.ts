import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { groqVisionAnalysis, GroqError } from "../_shared/groq.ts";

const DAILY_ANALYZE_LIMIT = 10;
const MAX_SYMPTOM_NOTE_LENGTH = 500;

type AnalysisResult = {
  is_plant_image: boolean;
  possible_issue: string;
  confidence: "low" | "medium" | "high";
  visible_symptoms: string[];
  possible_causes: string[];
  general_next_steps: string[];
  see_expert: boolean;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let body: {
    image_path?: string;
    crop_id?: string | null;
    symptom_note?: string;
    language?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const imagePath = body.image_path?.trim();
  const cropId = body.crop_id || null;
  const symptomNote = (body.symptom_note ?? "").trim().slice(0, MAX_SYMPTOM_NOTE_LENGTH);
  const language = body.language === "te" ? "te" : "en";

  if (!imagePath) {
    return jsonResponse({ error: "missing_image_path" }, 400);
  }
  // Defense in depth: the service role below bypasses Storage RLS, so we
  // must confirm ownership ourselves before reading anyone's file.
  if (!imagePath.startsWith(`${user.id}/`)) {
    return jsonResponse({ error: "forbidden" }, 403);
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { allowed } = await checkRateLimit(admin, user.id, "analyze", DAILY_ANALYZE_LIMIT);
  if (!allowed) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  const { data: imageBlob, error: downloadError } = await admin.storage
    .from("crop-images")
    .download(imagePath);
  if (downloadError || !imageBlob) {
    console.error("analyze-crop: failed to download image", downloadError);
    return jsonResponse({ error: "image_not_found" }, 404);
  }

  const mimeType = imageBlob.type || "image/jpeg";
  const imageBase64 = btoa(
    new Uint8Array(await imageBlob.arrayBuffer()).reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      "",
    ),
  );

  let cropContext = "No specific crop selected.";
  if (cropId) {
    const { data: crop } = await userClient
      .from("crops")
      .select("crop_name, variety")
      .eq("id", cropId)
      .maybeSingle();
    if (crop) {
      cropContext = `Selected crop: ${crop.crop_name}${crop.variety ? ` (${crop.variety})` : ""}.`;
    }
  }

  const systemPrompt = buildSystemPrompt(language);
  const userText = `${cropContext}\n${symptomNote ? `Farmer's note: ${symptomNote}` : "No additional note from the farmer."}\n\nAnalyze this crop photo.`;

  let raw: string;
  try {
    raw = await groqVisionAnalysis(systemPrompt, userText, imageBase64, mimeType, {
      maxTokens: 700,
    });
  } catch (error) {
    console.error("analyze-crop: groq call failed", error);
    const status = error instanceof GroqError && error.status === 429 ? 429 : 502;
    return jsonResponse({ error: status === 429 ? "vision_busy" : "vision_unavailable" }, status);
  }

  const result = parseAnalysisResult(raw);
  if (!result) {
    return jsonResponse({ error: "invalid_analysis" }, 502);
  }

  if (!result.is_plant_image) {
    return jsonResponse({ analysis: result, saved: null }, 200);
  }

  const { data: saved, error: insertError } = await userClient
    .from("image_analyses")
    .insert({
      user_id: user.id,
      crop_id: cropId,
      image_path: imagePath,
      result,
      confidence: result.confidence,
      language,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("analyze-crop: failed to save result", insertError);
  }

  return jsonResponse(
    { analysis: result, saved: saved ? { id: saved.id, created_at: saved.created_at } : null },
    200,
  );
});

function buildSystemPrompt(language: "en" | "te"): string {
  const languageInstruction =
    language === "te"
      ? "Write all text field values in Telugu — simple, everyday Telugu a farmer would understand."
      : "Write all text field values in English — simple, everyday language a farmer would understand.";

  return `You are AgriMitra AI, a decision-support assistant analyzing a crop photo for an Indian farmer. You are NOT a licensed expert and must never claim to be one.

Rules:
- If the photo is not a plant/crop photo, set is_plant_image to false and leave the other fields minimal (empty strings/arrays, confidence "low", see_expert false).
- Never state certainty. Use cautious, advisory language like "possible issue" — never "your crop definitely has X".
- NEVER give a specific pesticide, fungicide, herbicide, or fertilizer dosage, concentration, ratio, or mixing instruction of any kind (no numbers). Name only a general category (e.g. "a copper-based fungicide") and say the farmer must confirm the exact product and dose with a local agriculture officer, Krishi Vigyan Kendra (KVK), or a licensed dealer.
- Set see_expert to true for anything serious, spreading, or uncertain.
- ${languageInstruction}

Respond with ONLY a JSON object matching exactly this shape — no markdown fences, no extra text:
{
  "is_plant_image": boolean,
  "possible_issue": string,
  "confidence": "low" | "medium" | "high",
  "visible_symptoms": string[],
  "possible_causes": string[],
  "general_next_steps": string[],
  "see_expert": boolean
}`;
}

function parseAnalysisResult(raw: string): AnalysisResult | null {
  try {
    const parsed = JSON.parse(raw);
    const confidence: AnalysisResult["confidence"] = ["low", "medium", "high"].includes(
      parsed.confidence,
    )
      ? parsed.confidence
      : "low";

    return {
      is_plant_image: Boolean(parsed.is_plant_image),
      possible_issue: typeof parsed.possible_issue === "string" ? parsed.possible_issue : "",
      confidence,
      visible_symptoms: Array.isArray(parsed.visible_symptoms)
        ? parsed.visible_symptoms.filter((s: unknown) => typeof s === "string")
        : [],
      possible_causes: Array.isArray(parsed.possible_causes)
        ? parsed.possible_causes.filter((s: unknown) => typeof s === "string")
        : [],
      general_next_steps: Array.isArray(parsed.general_next_steps)
        ? parsed.general_next_steps.filter((s: unknown) => typeof s === "string")
        : [],
      see_expert: Boolean(parsed.see_expert),
    };
  } catch (error) {
    console.error("analyze-crop: failed to parse model output", error, raw);
    return null;
  }
}
