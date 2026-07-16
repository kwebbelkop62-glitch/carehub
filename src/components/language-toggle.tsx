"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("Language");
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      setLocale(next);
    });
  }

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border bg-surface text-xs">
      {SUPPORTED_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSelect(code)}
          disabled={isPending}
          aria-pressed={locale === code}
          className={
            locale === code
              ? "bg-accent px-2.5 py-1 font-medium text-white"
              : "px-2.5 py-1 text-accent"
          }
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
