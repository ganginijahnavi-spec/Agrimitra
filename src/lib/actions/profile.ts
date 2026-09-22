"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { ProfileActionState } from "@/lib/actions/profile-state";

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", errorKey: "unauthorized" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const village = String(formData.get("village") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();
  const farmSizeRaw = String(formData.get("farmSizeAcres") ?? "").trim();
  const preferredLanguage = formData.get("preferredLanguage") === "te" ? "te" : "en";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      village: village || null,
      district: district || null,
      state: state || null,
      latitude: latitudeRaw ? Number(latitudeRaw) : null,
      longitude: longitudeRaw ? Number(longitudeRaw) : null,
      farm_size_acres: farmSizeRaw ? Number(farmSizeRaw) : null,
      preferred_language: preferredLanguage,
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", errorKey: "generic" };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/profile`);

  return { status: "success" };
}
