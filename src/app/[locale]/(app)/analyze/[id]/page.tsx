import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ImageAnalysisRecord } from "@/lib/analyze";
import { AnalysisResultCard } from "@/components/analyze/analysis-result-card";

const SIGNED_URL_TTL_SECONDS = 3600;

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Analyze");

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("image_analyses")
    .select("id, image_path, result, created_at")
    .eq("id", id)
    .single<ImageAnalysisRecord>();

  if (!item) {
    notFound();
  }

  const { data: signed } = await supabase.storage
    .from("crop-images")
    .createSignedUrl(item.image_path, SIGNED_URL_TTL_SECONDS);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/analyze"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("back")}
      </Link>

      {signed?.signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
        <img
          src={signed.signedUrl}
          alt=""
          className="mb-4 max-h-80 w-full rounded-lg object-cover"
        />
      )}

      <AnalysisResultCard analysis={item.result} />
    </div>
  );
}
