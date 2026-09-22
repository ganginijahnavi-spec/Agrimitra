"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useTranslations("States");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center",
        className,
      )}
    >
      <AlertTriangle className="mb-2 size-10 text-destructive" aria-hidden="true" />
      <p className="font-medium text-foreground">{title ?? t("errorDefaultTitle")}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? t("errorDefaultDescription")}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
