"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { signInAction } from "@/lib/actions/auth";
import { initialAuthActionState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(signInAction, initialAuthActionState);

  return (
    <div className="space-y-6">
      <GoogleButton label={t("login.googleCta")} />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">{t("login.orDivider")}</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-4">
        {state.status === "error" && state.errorKey && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{t(`errors.${state.errorKey}`)}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </div>
  );
}
