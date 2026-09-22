import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function LoadingState({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const t = useTranslations("States");

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label ?? t("loading")}</p>
    </div>
  );
}
