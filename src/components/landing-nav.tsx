"use client";

import { useState } from "react";
import Link from "next/link";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { NavLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navButtonClass =
  "inline-flex items-center justify-center rounded-[9px] bg-accent px-[18px] py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover active:scale-[0.98]";

export function LandingNav({
  howLabel,
  whoLabel,
  signInLabel,
  ctaLabel,
}: {
  howLabel: string;
  whoLabel: string;
  signInLabel: string;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3 sm:px-10 sm:py-3.5 lg:px-14">
        <NavLogo className="h-8" />

        {/* Desktop nav — hidden below md, everything crammed into one row
            below that width is exactly the bug this component fixes. */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[oklch(.4_.02_60)] md:flex dark:text-muted">
          <a href="#how" className="hover:text-foreground">
            {howLabel}
          </a>
          <a href="#who" className="hover:text-foreground">
            {whoLabel}
          </a>
          <Link href="/sign-in" className="hover:text-foreground">
            {signInLabel}
          </Link>
          <ThemeToggle />
          <Link href="/sign-up" className={navButtonClass}>
            {ctaLabel}
          </Link>
        </nav>

        {/* Mobile: theme toggle + hamburger, everything else moves into
            the dropdown panel below. */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-tint"
          >
            {open ? <XIcon size={18} weight="bold" /> : <ListIcon size={18} weight="bold" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-3 text-sm font-semibold text-[oklch(.4_.02_60)] md:hidden dark:text-muted">
          <a href="#how" className="rounded-lg px-2 py-2.5 hover:bg-tint hover:text-foreground" onClick={() => setOpen(false)}>
            {howLabel}
          </a>
          <a href="#who" className="rounded-lg px-2 py-2.5 hover:bg-tint hover:text-foreground" onClick={() => setOpen(false)}>
            {whoLabel}
          </a>
          <Link href="/sign-in" className="rounded-lg px-2 py-2.5 hover:bg-tint hover:text-foreground">
            {signInLabel}
          </Link>
          <Link href="/sign-up" className={`${navButtonClass} mt-1 justify-center`}>
            {ctaLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
