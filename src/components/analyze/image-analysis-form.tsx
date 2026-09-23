"use client";

import { useRef, useState, useTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Camera, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToJpeg } from "@/lib/image-resize";
import { analyzeCropImageAction } from "@/lib/actions/analyze";
import type { AnalyzeCropResponse } from "@/lib/analyze";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalysisResultCard } from "./analysis-result-card";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export function ImageAnalysisForm({
  crops,
  language,
  userId,
}: {
  crops: { id: string; crop_name: string }[];
  language: "en" | "te";
  userId: string;
}) {
  const t = useTranslations("Analyze");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropId, setCropId] = useState("");
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeCropResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorKey(null);
    setResult(null);

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setErrorKey("invalidType");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setErrorKey("tooLarge");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setNote("");
    setCropId("");
    setResult(null);
    setErrorKey(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || isPending) return;

    setErrorKey(null);

    startTransition(async () => {
      try {
        const resized = await resizeImageToJpeg(file);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("crop-images")
          .upload(path, resized, { contentType: "image/jpeg" });

        if (uploadError) {
          setErrorKey("uploadFailed");
          return;
        }

        const actionResult = await analyzeCropImageAction({
          imagePath: path,
          cropId: cropId || null,
          symptomNote: note,
          language,
        });

        if (actionResult.status === "error") {
          setErrorKey(actionResult.errorKey);
          return;
        }

        setResult(actionResult.data);
      } catch {
        setErrorKey("uploadFailed");
      }
    });
  }

  if (result) {
    return (
      <div className="space-y-4">
        <AnalysisResultCard analysis={result.analysis} />
        <Button variant="outline" onClick={reset}>
          {t("analyzeAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorKey && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${errorKey}`)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="photo">{t("uploadLabel")}</Label>
        {previewUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a servable asset */}
            <img src={previewUrl} alt="" className="max-h-72 w-full rounded-lg object-cover" />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="absolute top-2 right-2"
              onClick={reset}
              aria-label={t("changePhoto")}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor="photo"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            <Camera className="size-8" aria-hidden="true" />
            <span>{t("uploadHint")}</span>
          </label>
        )}
        <input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {crops.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="crop">
            {t("cropLabel")} <span className="text-muted-foreground">({t("optional")})</span>
          </Label>
          <select
            id="crop"
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className={selectClassName}
          >
            <option value="">{t("noCropSelected")}</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.crop_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="note">
          {t("noteLabel")} <span className="text-muted-foreground">({t("optional")})</span>
        </Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={!file || isPending}>
        <Upload className="size-4" aria-hidden="true" />
        {isPending ? t("analyzing") : t("submit")}
      </Button>
    </form>
  );
}
