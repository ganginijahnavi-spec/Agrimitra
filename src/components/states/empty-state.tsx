import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("States");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center",
        className,
      )}
    >
      <Icon className="mb-2 size-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium text-foreground">{title ?? t("emptyDefaultTitle")}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? t("emptyDefaultDescription")}
      </p>
      {action}
    </div>
  );
}
