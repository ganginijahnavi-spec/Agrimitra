import { Sprout } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CropForm } from "@/components/crops/crop-form";
import { createCropAction } from "@/lib/actions/crops";

export default async function NewCropPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crops");
  const tForm = await getTranslations("Crops.form");

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sprout className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("newTitle")}</h1>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="sr-only">{t("newTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CropForm
            action={createCropAction}
            submitLabel={tForm("create")}
            pendingLabel={tForm("creating")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
