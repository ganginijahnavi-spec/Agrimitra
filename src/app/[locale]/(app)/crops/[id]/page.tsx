import { ArrowLeft, Pencil, Sprout } from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteCropButton } from "@/components/crops/delete-crop-button";

export default async function CropDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crops.detail");
  const tCrops = await getTranslations("Crops");
  const format = await getFormatter();

  const supabase = await createClient();
  const { data: crop } = await supabase.from("crops").select("*").eq("id", id).single();

  if (!crop) {
    notFound();
  }

  const fields: { label: string; value: string | null }[] = [
    { label: t("variety"), value: crop.variety },
    {
      label: t("area"),
      value: crop.area_acres != null ? tCrops("card.areaAcres", { area: crop.area_acres }) : null,
    },
    { label: t("soilType"), value: crop.soil_type },
    {
      label: t("sowingDate"),
      value: crop.sowing_date
        ? format.dateTime(new Date(crop.sowing_date), { dateStyle: "medium" })
        : null,
    },
    {
      label: t("expectedHarvestDate"),
      value: crop.expected_harvest_date
        ? format.dateTime(new Date(crop.expected_harvest_date), { dateStyle: "medium" })
        : null,
    },
    { label: t("irrigationType"), value: crop.irrigation_type },
    { label: t("notes"), value: crop.notes },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/crops"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {tCrops("backToCrops")}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sprout className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{crop.crop_name}</h1>
            {crop.variety && <p className="text-muted-foreground">{crop.variety}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/crops/${crop.id}/edit`} />}>
            <Pencil className="size-4" aria-hidden="true" />
            {t("edit")}
          </Button>
          <DeleteCropButton cropId={crop.id} cropName={crop.crop_name} />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent>
          <dl className="divide-y divide-border">
            {fields.map((field) => (
              <div key={field.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="text-right font-medium text-foreground">
                  {field.value ?? t("notSet")}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
