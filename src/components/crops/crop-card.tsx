import { Sprout } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type CropSummary = {
  id: string;
  cropName: string;
  variety: string | null;
  areaAcres: number | null;
  sowingDate: string | null;
};

export function CropCard({ crop }: { crop: CropSummary }) {
  const t = useTranslations("Crops.card");
  const format = useFormatter();

  return (
    <Link href={`/crops/${crop.id}`} className="block">
      <Card className="h-full border-none shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sprout className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">{crop.cropName}</CardTitle>
          {crop.variety && <CardDescription>{crop.variety}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {crop.areaAcres != null && <p>{t("areaAcres", { area: crop.areaAcres })}</p>}
          {crop.sowingDate && (
            <p>{t("sowed", { date: format.dateTime(new Date(crop.sowingDate), { dateStyle: "medium" }) })}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
