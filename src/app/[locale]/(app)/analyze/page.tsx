import { Camera } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ImageAnalysisRecord } from "@/lib/analyze";
import { Card, CardContent } from "@/components/ui/card";
import { ImageAnalysisForm } from "@/components/analyze/image-analysis-form";
import { EmptyState } from "@/components/states/empty-state";

const HISTORY_LIMIT = 6;
const SIGNED_URL_TTL_SECONDS = 3600;

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Analyze");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const [{ data: crops }, { data: history }] = await Promise.all([
    supabase
      .from("crops")
      .select("id, crop_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("image_analyses")
      .select("id, image_path, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT)
      .overrideTypes<ImageAnalysisRecord[]>(),
  ]);

  const historyWithUrls = await Promise.all(
    (history ?? []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from("crop-images")
        .createSignedUrl(item.image_path, SIGNED_URL_TTL_SECONDS);
      return { ...item, thumbnailUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="mb-8 border-none shadow-sm">
        <CardContent>
          <ImageAnalysisForm
            crops={crops ?? []}
            language={locale === "te" ? "te" : "en"}
            userId={user.id}
          />
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-foreground">{t("historyTitle")}</h2>
      {historyWithUrls.length === 0 ? (
        <EmptyState icon={Camera} title={t("noHistoryYet")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {historyWithUrls.map((item) => (
            <Link
              key={item.id}
              href={`/analyze/${item.id}`}
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-muted">
                  <Camera className="size-6 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
              <p className="truncate px-2 py-1.5 text-xs text-muted-foreground group-hover:text-foreground">
                {item.result.possible_issue || "—"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
