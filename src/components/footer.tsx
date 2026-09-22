import { Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sprout className="size-5" aria-hidden="true" />
            <span>AgriMitra AI</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">{t("quickLinks")}</p>
          <nav className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="w-fit hover:text-primary">
              {t("home")}
            </Link>
            <Link href="/login" className="w-fit hover:text-primary">
              {t("login")}
            </Link>
            <Link href="/register" className="w-fit hover:text-primary">
              {t("register")}
            </Link>
          </nav>
        </div>

        <div className="space-y-2 md:text-right">
          <p className="text-xs text-muted-foreground md:ml-auto md:max-w-xs">
            {t("disclaimer")}
          </p>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        &copy; {year} AgriMitra AI &mdash; {t("rights")}
      </div>
    </footer>
  );
}
