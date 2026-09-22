import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

function isValidLocale(value: string | null): value is (typeof routing.locales)[number] {
  return !!value && (routing.locales as readonly string[]).includes(value);
}

// Handles the Supabase OAuth (Google) redirect: exchanges the auth code for
// a session, then sends the farmer on to their dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const localeParam = searchParams.get("locale");
  const locale = isValidLocale(localeParam) ? localeParam : routing.defaultLocale;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/${locale}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth`);
}
