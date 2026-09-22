import { Droplets, MapPin, Wind } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFarmingHints, getWeather } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";

export default async function WeatherPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Weather");
  const format = await getFormatter();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("village, district, state, latitude, longitude")
    .eq("id", user.id)
    .single();

  const location = [profile?.village, profile?.district, profile?.state]
    .filter(Boolean)
    .join(", ");

  if (profile?.latitude == null || profile?.longitude == null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={MapPin}
          title={t("noLocationTitle")}
          description={t("noLocationDescription")}
          action={
            <Button render={<Link href="/profile" />} className="mt-2">
              {t("setLocation")}
            </Button>
          }
        />
      </div>
    );
  }

  let weather;
  try {
    weather = await getWeather(profile.latitude, profile.longitude);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title={t("errorTitle")} />
      </div>
    );
  }

  const hints = getFarmingHints(weather);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        {location && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {location}
          </p>
        )}
      </div>

      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <WeatherIcon code={weather.current.weatherCode} className="size-14 text-primary" />
            <div>
              <p className="text-4xl font-bold text-foreground">
                {Math.round(weather.current.temperature)}°C
              </p>
              <p className="text-muted-foreground">
                {t(`conditions.${weather.current.weatherCode}`)}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Droplets className="size-4" aria-hidden="true" />
              {t("humidity")}: {weather.current.humidity}%
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wind className="size-4" aria-hidden="true" />
              {t("wind")}: {Math.round(weather.current.windSpeed)} km/h
            </div>
          </div>
        </CardContent>
      </Card>

      {hints.length > 0 && (
        <Card className="mb-6 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("farmingHints")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hints.map((hint) => (
              <p key={hint.key} className="text-sm text-foreground">
                &bull; {t(`hints.${hint.key}`, hint.values)}
              </p>
            ))}
            <p className="text-xs text-muted-foreground">{t("farmingHintsDisclaimer")}</p>
          </CardContent>
        </Card>
      )}

      <h2 className="mb-3 text-lg font-semibold text-foreground">{t("sevenDayForecast")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {weather.daily.map((day) => (
          <Card key={day.date} className="border-none text-center shadow-sm">
            <CardContent className="flex flex-col items-center gap-1">
              <p className="text-xs font-medium text-muted-foreground">
                {format.dateTime(new Date(day.date), { weekday: "short" })}
              </p>
              <WeatherIcon code={day.weatherCode} className="size-6 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
              </p>
              <p className="text-xs text-muted-foreground">{day.precipitationProbability}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("source")} &middot;{" "}
        {t("updated", {
          time: format.dateTime(new Date(weather.current.time), { timeStyle: "short" }),
        })}
      </p>
    </div>
  );
}
