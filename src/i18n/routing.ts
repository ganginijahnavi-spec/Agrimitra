import { defineRouting } from "next-intl/routing";

// Add new locales here later (e.g. "hi", "ta", "kn") and provide a
// matching src/messages/<locale>.json file — nothing else needs to change.
export const routing = defineRouting({
  locales: ["en", "te"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
