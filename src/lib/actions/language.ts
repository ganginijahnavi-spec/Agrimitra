"use server";

import { createClient } from "@/lib/supabase/server";

// Persists the farmer's language choice so the app can greet them in it
// next time, wherever they log in from. Silently no-ops when signed out.
export async function updatePreferredLanguageAction(language: "en" | "te") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("profiles").update({ preferred_language: language }).eq("id", user.id);
}
