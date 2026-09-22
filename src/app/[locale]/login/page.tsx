import { LogIn } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="size-6" aria-hidden="true" />
      </div>
      <Card className="w-full border-none shadow-sm">
        <CardHeader>
          <CardTitle>{t("login")}</CardTitle>
          <CardDescription>
            Email/password and Google sign-in are coming in the next build phase.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
