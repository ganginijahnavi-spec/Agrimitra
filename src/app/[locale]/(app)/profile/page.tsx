import { LogOut } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Profile");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const initial = {
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    village: profile?.village ?? "",
    district: profile?.district ?? "",
    state: profile?.state ?? "",
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
    farmSizeAcres: profile?.farm_size_acres != null ? String(profile.farm_size_acres) : "",
    preferredLanguage: (profile?.preferred_language === "te" ? "te" : "en") as "en" | "te",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm" className="gap-1.5">
            <LogOut className="size-4" aria-hidden="true" />
            {t("logout")}
          </Button>
        </form>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {t("signedInAs", { email: user.email ?? "" })}
      </p>

      <ProfileForm initial={initial} />
    </div>
  );
}
