import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CropForm } from "@/components/crops/crop-form";
import { updateCropAction } from "@/lib/actions/crops";
import { createClient } from "@/lib/supabase/server";

export default async function EditCropPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crops");
  const tForm = await getTranslations("Crops.form");

  const supabase = await createClient();
  const { data: crop } = await supabase.from("crops").select("*").eq("id", id).single();

  if (!crop) {
    notFound();
  }

  const updateThisCrop = updateCropAction.bind(null, crop.id);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Pencil className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("editTitle")}</h1>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="sr-only">{t("editTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CropForm
            action={updateThisCrop}
            defaultValues={{
              cropName: crop.crop_name,
              variety: crop.variety ?? undefined,
              areaAcres: crop.area_acres ?? 0,
              soilType: crop.soil_type ?? undefined,
              sowingDate: crop.sowing_date ?? undefined,
              expectedHarvestDate: crop.expected_harvest_date ?? undefined,
              irrigationType: crop.irrigation_type ?? undefined,
              notes: crop.notes ?? undefined,
            }}
            submitLabel={tForm("update")}
            pendingLabel={tForm("updating")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
