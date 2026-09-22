"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { cropFormSchema } from "@/lib/validation/crop";
import type { CropActionState } from "@/lib/actions/crops-state";

function parseCropForm(formData: FormData) {
  return cropFormSchema.safeParse({
    cropName: formData.get("cropName"),
    variety: formData.get("variety"),
    areaAcres: formData.get("areaAcres"),
    soilType: formData.get("soilType"),
    sowingDate: formData.get("sowingDate"),
    expectedHarvestDate: formData.get("expectedHarvestDate"),
    irrigationType: formData.get("irrigationType"),
    notes: formData.get("notes"),
  });
}

export async function createCropAction(
  _prevState: CropActionState,
  formData: FormData,
): Promise<CropActionState> {
  const parsed = parseCropForm(formData);
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", errorMessage: "unauthorized" };
  }

  const { data, error } = await supabase
    .from("crops")
    .insert({
      user_id: user.id,
      crop_name: parsed.data.cropName,
      variety: parsed.data.variety ?? null,
      area_acres: parsed.data.areaAcres,
      soil_type: parsed.data.soilType ?? null,
      sowing_date: parsed.data.sowingDate ?? null,
      expected_harvest_date: parsed.data.expectedHarvestDate ?? null,
      irrigation_type: parsed.data.irrigationType ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", errorMessage: "generic" };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/crops`);
  return redirect({ href: `/crops/${data.id}`, locale });
}

export async function updateCropAction(
  cropId: string,
  _prevState: CropActionState,
  formData: FormData,
): Promise<CropActionState> {
  const parsed = parseCropForm(formData);
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("crops")
    .update({
      crop_name: parsed.data.cropName,
      variety: parsed.data.variety ?? null,
      area_acres: parsed.data.areaAcres,
      soil_type: parsed.data.soilType ?? null,
      sowing_date: parsed.data.sowingDate ?? null,
      expected_harvest_date: parsed.data.expectedHarvestDate ?? null,
      irrigation_type: parsed.data.irrigationType ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", cropId);

  if (error) {
    return { status: "error", errorMessage: "generic" };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/crops`);
  revalidatePath(`/${locale}/crops/${cropId}`);
  return redirect({ href: `/crops/${cropId}`, locale });
}

export async function deleteCropAction(cropId: string) {
  const supabase = await createClient();
  await supabase.from("crops").delete().eq("id", cropId);

  const locale = await getLocale();
  revalidatePath(`/${locale}/crops`);
  return redirect({ href: "/crops", locale });
}
