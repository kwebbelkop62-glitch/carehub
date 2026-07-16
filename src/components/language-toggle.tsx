"use client";

import { useState } from "react";

// Visual only for now — wired to the real next-intl locale switch in Step 5.
const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ms", label: "BM" },
] as const;

export function LanguageToggle() {
  const [active, setActive] = useState<(typeof LANGUAGES)[number]["code"]>("en");

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border bg-surface text-xs">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setActive(lang.code)}
          aria-pressed={active === lang.code}
          className={
            active === lang.code
              ? "bg-accent px-2.5 py-1 font-medium text-white"
              : "px-2.5 py-1 text-accent"
          }
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
