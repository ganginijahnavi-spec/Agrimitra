import { Plus, Sprout } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CropCard } from "@/components/crops/crop-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";

export default async function CropsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crops");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { data: crops, error } = await supabase
    .from("crops")
    .select("id, crop_name, variety, area_acres, sowing_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button render={<Link href="/crops/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          {t("addCrop")}
        </Button>
      </div>

      {error ? (
        <ErrorState />
      ) : !crops || crops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            <Button render={<Link href="/crops/new" />} className="mt-2">
              <Plus className="size-4" aria-hidden="true" />
              {t("addCrop")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={{
                id: crop.id,
                cropName: crop.crop_name,
                variety: crop.variety,
                areaAcres: crop.area_acres,
                sowingDate: crop.sowing_date,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
