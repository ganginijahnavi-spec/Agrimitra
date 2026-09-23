import { AlertTriangle, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analyze";

const confidenceVariant: Record<AnalysisResult["confidence"], "outline" | "secondary" | "default"> =
  {
    low: "outline",
    medium: "secondary",
    high: "default",
  };

export function AnalysisResultCard({ analysis }: { analysis: AnalysisResult }) {
  const t = useTranslations("Analyze");

  if (!analysis.is_plant_image) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertTriangle className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium text-foreground">{t("notPlantTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("notPlantDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  const confidenceLabelKey = {
    low: "confidenceLow",
    medium: "confidenceMedium",
    high: "confidenceHigh",
  }[analysis.confidence] as "confidenceLow" | "confidenceMedium" | "confidenceHigh";

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{t("resultTitle")}</CardTitle>
          <Badge variant={confidenceVariant[analysis.confidence]}>
            {t("confidence")}: {t(confidenceLabelKey)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-foreground">{analysis.possible_issue}</p>

        {analysis.visible_symptoms.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{t("symptoms")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {analysis.visible_symptoms.map((symptom, i) => (
                <li key={i}>{symptom}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.possible_causes.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{t("causes")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {analysis.possible_causes.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.general_next_steps.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{t("nextSteps")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {analysis.general_next_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.see_expert && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("seeExpertWarning")}
          </p>
        )}

        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>

        <Button
          variant="outline"
          size="sm"
          render={
            <Link
              href={{
                pathname: "/chat",
                query: { prefill: t("chatPrefill", { issue: analysis.possible_issue }) },
              }}
            />
          }
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {t("askChatbot")}
        </Button>
      </CardContent>
    </Card>
  );
}
