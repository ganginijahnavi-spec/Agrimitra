import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Everything else under a locale (dashboard, crops, weather, market, chat,
// analyze, profile, ...) lives in the (app) route group and is protected.
const AUTH_ONLY_PATHS = ["/login", "/register"];
const PUBLIC_PATHS = ["/", ...AUTH_ONLY_PATHS];

function stripLocale(pathname: string) {
  const locale = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (!locale) return { locale: routing.defaultLocale, path: pathname };
  return { locale, path: pathname.slice(`/${locale}`.length) || "/" };
}

export default async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const user = await updateSession(request, intlResponse);

  const { locale, path } = stripLocale(request.nextUrl.pathname);
  const isAuthPage = AUTH_ONLY_PATHS.includes(path);
  const isProtected = !PUBLIC_PATHS.includes(path);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
