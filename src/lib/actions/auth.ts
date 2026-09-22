"use server";

import { headers } from "next/headers";
import { redirect as externalRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { mapAuthErrorToKey } from "@/lib/auth-errors";
import { redirect } from "@/i18n/navigation";
import type { AuthActionState } from "@/lib/actions/auth-state";

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = await getLocale();

  if (!fullName || !email || !password) {
    return { status: "error", errorKey: "missingFields" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, preferred_language: locale },
    },
  });

  if (error) {
    return { status: "error", errorKey: mapAuthErrorToKey(error.message) };
  }

  // Email confirmation is on by default: no session yet, so show a
  // "check your email" state instead of redirecting into the app.
  if (!data.session) {
    return { status: "success", email };
  }

  return redirect({ href: "/profile", locale });
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = await getLocale();

  if (!email || !password) {
    return { status: "error", errorKey: "missingFields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", errorKey: mapAuthErrorToKey(error.message) };
  }

  return redirect({ href: "/profile", locale });
}

export async function signInWithGoogleAction() {
  const locale = await getLocale();
  const origin = await getOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?locale=${locale}`,
    },
  });

  if (error || !data.url) {
    redirect({ href: "/login", locale });
    return;
  }

  externalRedirect(data.url);
}

export async function signOutAction() {
  const locale = await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/", locale });
}
