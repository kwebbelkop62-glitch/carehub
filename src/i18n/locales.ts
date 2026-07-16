// Plain constants only — no server-only imports (next/headers etc.) — so
// this is safe to import from both Client and Server Components. Keep
// src/i18n/request.ts (which does import next/headers) out of anything a
// Client Component touches.
export const SUPPORTED_LOCALES = ["en", "ms"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export function isSupportedLocale(value: string | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
