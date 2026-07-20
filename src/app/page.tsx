import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import {
  BuildingsIcon,
  ClockIcon,
  BellRingingIcon,
  ClipboardTextIcon,
  UserCircleIcon,
  HandHeartIcon,
} from "@phosphor-icons/react/ssr";
import { NavLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-accent-fill px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-fill-hover active:scale-[0.98]";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-tint active:scale-[0.98]";

// Decorative only (aria-hidden on the container below) — illustrates the
// real product UI (reusing the real Badge component/status vocabulary)
// rather than an invented marketing graphic. Malaysian sample names per
// CLAUDE.md's placeholder-data convention.
const previewCards: {
  name: string;
  detail?: string;
  meta?: string;
  status: "pending" | "attended" | "missed";
  position: string;
  duration: string;
  delay: string;
}[] = [
  {
    name: "Dr. Tan Wei Ming",
    detail: "Cardiology · Gleneagles Penang",
    meta: "Wed, 14 Aug · 10:30 AM",
    status: "pending",
    position: "left-[6%] top-0 w-[76%] -rotate-2",
    duration: "6s",
    delay: "0s",
  },
  {
    name: "Mum · Dr. Lakshmi",
    detail: "Island Hospital",
    status: "attended",
    position: "left-0 top-[140px] w-[68%] rotate-1",
    duration: "7s",
    delay: "-1.5s",
  },
  {
    name: "Physio · Sunway Medical",
    detail: "Mon, 22 Jun",
    status: "missed",
    position: "left-[20%] top-[260px] w-[68%] -rotate-1",
    duration: "6.5s",
    delay: "-3s",
  },
  {
    name: "Dentist · Dr. Farah",
    status: "pending",
    position: "left-[4%] top-[360px] w-[58%] rotate-2",
    duration: "7.5s",
    delay: "-4.5s",
  },
];

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/upcoming");
  }

  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLogo className="h-7" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#how" className="hover:text-foreground">
              {t("nav.how")}
            </a>
            <a href="#who" className="hover:text-foreground">
              {t("nav.who")}
            </a>
            <Link href="/sign-in" className="hover:text-foreground">
              {t("nav.signIn")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/sign-up" className={`${primaryButtonClass} hidden sm:inline-flex`}>
              {t("nav.cta")}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-block rounded-full bg-tint px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent-hover">
            {t("hero.eyebrow")}
          </span>
          <h1 className="mt-5 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-medium leading-[1.15] tracking-tight text-foreground">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className={primaryButtonClass}>
              {t("hero.ctaPrimary")}
            </Link>
            <a href="#how" className={secondaryButtonClass}>
              {t("hero.ctaSecondary")}
            </a>
          </div>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-muted">
            {t("hero.disclaimer")}
          </p>
        </div>

        <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
          {previewCards.map((card) => (
            <div
              key={card.name}
              style={{ animationDuration: card.duration, animationDelay: card.delay }}
              className={`hero-preview-card absolute rounded-2xl border border-border bg-surface p-4 ${card.position}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.name}</p>
                  {card.detail && <p className="mt-0.5 text-xs text-muted">{card.detail}</p>}
                </div>
                <Badge status={card.status} />
              </div>
              {card.meta && <p className="mt-2 text-xs text-muted">{card.meta}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="w-full bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {t("how.heading")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StepCard
              icon={<BuildingsIcon size={22} weight="duotone" />}
              title={t("how.step1Title")}
              body={t("how.step1Body")}
            />
            <StepCard
              icon={<ClockIcon size={22} weight="duotone" />}
              title={t("how.step2Title")}
              body={t("how.step2Body")}
            />
            <StepCard
              icon={<BellRingingIcon size={22} weight="duotone" />}
              title={t("how.step3Title")}
              body={t("how.step3Body")}
            />
            <StepCard
              icon={<ClipboardTextIcon size={22} weight="duotone" />}
              title={t("how.step4Title")}
              body={t("how.step4Body")}
            />
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {t("who.heading")}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PersonaCard
            icon={<HandHeartIcon size={22} weight="duotone" />}
            eyebrow={t("who.caregiverEyebrow")}
            title={t("who.caregiverTitle")}
            body={t("who.caregiverBody")}
            points={[t("who.caregiverPoint1"), t("who.caregiverPoint2"), t("who.caregiverPoint3")]}
            tone="tint"
          />
          <PersonaCard
            icon={<UserCircleIcon size={22} weight="duotone" />}
            eyebrow={t("who.patientEyebrow")}
            title={t("who.patientTitle")}
            body={t("who.patientBody")}
            points={[t("who.patientPoint1"), t("who.patientPoint2"), t("who.patientPoint3")]}
            tone="plain"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="rounded-3xl bg-foreground px-8 py-14 sm:px-14 sm:py-16">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="max-w-md text-2xl font-semibold leading-snug text-background sm:text-[1.75rem]">
                {t("cta.heading")}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/70">
                {t("cta.subtitle")}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl bg-accent-fill px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-fill-hover active:scale-[0.98]"
              >
                {t("cta.button")}
              </Link>
              <span className="text-xs text-background/60">{t("cta.note")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-xs">
            <NavLogo className="h-6" />
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("footer.tagline")}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how" className="text-muted hover:text-foreground">
              {t("nav.how")}
            </a>
            <a href="#who" className="text-muted hover:text-foreground">
              {t("nav.who")}
            </a>
            <Link href="/sign-in" className="text-muted hover:text-foreground">
              {t("nav.signIn")}
            </Link>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="max-w-xl text-xs leading-relaxed text-muted">{t("footer.disclaimer")}</p>
            <p className="shrink-0 text-xs text-muted">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-fill text-white">
        {icon}
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}

function PersonaCard({
  icon,
  eyebrow,
  title,
  body,
  points,
  tone,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  tone: "tint" | "plain";
}) {
  return (
    <div
      className={`rounded-2xl border border-border p-8 ${
        tone === "tint" ? "bg-tint" : "bg-background"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-fill text-white">
        {icon}
      </span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-accent-hover">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
