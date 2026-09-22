import { LogIn } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.login");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 sm:px-6">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="size-6" aria-hidden="true" />
      </div>
      <Card className="w-full border-none shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
