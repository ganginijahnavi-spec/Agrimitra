import {
  Camera,
  CloudSun,
  Languages,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const featureIcons = {
  chatbot: MessageCircle,
  analysis: Camera,
  weather: CloudSun,
  market: TrendingUp,
  voice: Languages,
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const featureKeys = Object.keys(featureIcons) as (keyof typeof featureIcons)[];
  const stepKeys = ["step1", "step2", "step3", "step4"] as const;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t("hero.eyebrow")}
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              render={<Link href="/register" />}
            >
              {t("hero.cta")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              render={<Link href="/register" />}
            >
              {t("hero.secondaryCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("features.subtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = featureIcons[key];
            return (
              <Card key={key} className="border-none shadow-sm">
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5.5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{t(`features.${key}.title`)}</CardTitle>
                  <CardDescription className="text-base">
                    {t(`features.${key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{t("howItWorks.subtitle")}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stepKeys.map((step, index) => (
              <div key={step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p className="mt-1.5 text-muted-foreground">
                  {t(`howItWorks.${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
          <p className="max-w-xl text-lg text-primary-foreground/90">{t("cta.subtitle")}</p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base"
            render={<Link href="/register" />}
          >
            {t("cta.button")}
          </Button>
        </div>
      </section>
    </div>
  );
}
