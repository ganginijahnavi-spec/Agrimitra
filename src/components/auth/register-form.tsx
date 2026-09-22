"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, MailCheck } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import { initialAuthActionState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { GoogleButton } from "./google-button";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState(signUpAction, initialAuthActionState);

  if (state.status === "success") {
    return (
      <Alert>
        <MailCheck />
        <AlertTitle>{t("register.checkEmailTitle")}</AlertTitle>
        <AlertDescription>
          {t("register.checkEmailDescription", { email: state.email ?? "" })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <GoogleButton label={t("register.googleCta")} />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">{t("register.orDivider")}</span>
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
          <Label htmlFor="fullName">{t("register.fullName")}</Label>
          <Input id="fullName" name="fullName" type="text" autoComplete="name" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("register.email")}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("register.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <p className="text-xs text-muted-foreground">{t("register.passwordHint")}</p>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("register.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
