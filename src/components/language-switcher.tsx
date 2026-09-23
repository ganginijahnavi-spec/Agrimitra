"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updatePreferredLanguageAction } from "@/lib/actions/language";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-label={t(locale as "en" | "te")}
          />
        }
      >
        <Languages className="size-4" aria-hidden="true" />
        <span>{t(locale as "en" | "te")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => {
              router.replace(pathname, { locale: loc });
              void updatePreferredLanguageAction(loc);
            }}
            className={loc === locale ? "font-semibold text-primary" : undefined}
          >
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
