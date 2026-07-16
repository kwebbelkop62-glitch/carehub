"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "./locales";

export async function setLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    locale = DEFAULT_LOCALE;
  }
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale);
  revalidatePath("/");
}
