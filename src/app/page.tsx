import { auth } from "@clerk/nextjs/server";
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
import { HeroLightfall } from "@/components/hero-lightfall";
import { CtaAurora } from "@/components/cta-aurora";
import Stepper, { Step } from "@/components/vendor/Stepper";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Reveal } from "@/components/reveal";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-accent-fill px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-fill-hover active:scale-[0.98]";

function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
        tone === "dark" ? "text-background/70" : "text-accent-hover"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export default async function RootPage() {
  // Deliberately does NOT redirect signed-in users away — AppShell's
  // "Back to site" link points here, and a signed-in visitor should
  // actually see the marketing page, not get bounced straight back into
  // the app. Sign-in/sign-up instead redirect straight to /upcoming via
  // fallbackRedirectUrl, so a fresh login never routes through here.
  const { userId } = await auth();
  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {/* HERO — full-bleed dark section, Lightfall WebGL background */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <HeroLightfall className="h-full w-full" />
        </div>

        {/* NAV — floating pill overlaid on the dark hero, stays visible on scroll */}
        <header className="sticky top-4 z-30 px-4 sm:top-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full border border-border/60 bg-surface/90 py-2 pl-4 pr-2 shadow-lg shadow-black/20 backdrop-blur-md">
            <NavLogo className="h-6" />
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
              <a href="#how" className="hover:text-foreground">
                {t("nav.how")}
              </a>
              <a href="#who" className="hover:text-foreground">
                {t("nav.who")}
              </a>
            </nav>
            <Link
              href={userId ? "/upcoming" : "/sign-up"}
              className={`${primaryButtonClass} hidden sm:inline-flex`}
            >
              {userId ? t("nav.ctaSignedIn") : t("nav.cta")}
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6 sm:pb-32 sm:pt-20 lg:px-8 lg:pb-40 lg:pt-24">
          <Reveal>
            <Eyebrow tone="dark">{t("hero.eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 text-[clamp(2rem,1.3rem+3vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-background">
              {t("hero.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-background/70">
              {t("hero.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9">
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-xl border border-background/25 px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-background/10 active:scale-[0.98]"
            >
              {t("hero.ctaSecondary")}
            </a>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mt-8 max-w-md text-xs leading-relaxed text-background/50">
              {t("hero.disclaimer")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* HIGHLIGHTS — light strip following the dark hero, bento wobble cards */}
      <section className="w-full border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8">
          <Reveal className="lg:col-span-2">
            <WobbleCard containerClassName="relative h-full min-h-[280px] overflow-hidden bg-foreground">
              <div className="max-w-xs">
                <h3 className="text-lg font-semibold text-white">{t("highlights.stat1Label")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{t("highlights.stat1Body")}</p>
              </div>
              <AppointmentPreview className="absolute -right-8 -bottom-6 hidden w-60 rotate-2 sm:block" />
            </WobbleCard>
          </Reveal>
          <Reveal delay={0.1}>
            <WobbleCard containerClassName="h-full min-h-[220px] bg-accent-fill">
              <h3 className="text-lg font-semibold text-white">{t("highlights.stat2Label")}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/80">
                {t("highlights.stat2Body")}
              </p>
            </WobbleCard>
          </Reveal>
          <Reveal delay={0.2} className="lg:col-span-3">
            <WobbleCard containerClassName="relative h-full min-h-[220px] overflow-hidden bg-foreground">
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold text-white">{t("highlights.stat3Label")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{t("highlights.stat3Body")}</p>
              </div>
              <AppointmentPreview className="absolute -right-6 -bottom-10 hidden w-64 -rotate-2 md:block" />
            </WobbleCard>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative w-full scroll-mt-24 overflow-hidden bg-tint">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {t("how.heading")}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <Stepper backButtonText={t("how.back")} nextButtonText={t("how.next")}>
              <Step>
                <StepIcon icon={<BuildingsIcon size={20} weight="duotone" />} />
                <h3>{t("how.step1Title")}</h3>
                <p>{t("how.step1Body")}</p>
              </Step>
              <Step>
                <StepIcon icon={<ClockIcon size={20} weight="duotone" />} />
                <h3>{t("how.step2Title")}</h3>
                <p>{t("how.step2Body")}</p>
              </Step>
              <Step>
                <StepIcon icon={<BellRingingIcon size={20} weight="duotone" />} />
                <h3>{t("how.step3Title")}</h3>
                <p>{t("how.step3Body")}</p>
              </Step>
              <Step>
                <StepIcon icon={<ClipboardTextIcon size={20} weight="duotone" />} />
                <h3>{t("how.step4Title")}</h3>
                <p>{t("how.step4Body")}</p>
              </Step>
            </Stepper>
          </Reveal>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="relative w-full scroll-mt-24 overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-accent-fill/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {t("who.heading")}
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch">
            <Reveal className="h-full">
              <PersonaCard
                icon={<HandHeartIcon size={22} weight="duotone" />}
                eyebrow={t("who.caregiverEyebrow")}
                title={t("who.caregiverTitle")}
                body={t("who.caregiverBody")}
                points={[t("who.caregiverPoint1"), t("who.caregiverPoint2"), t("who.caregiverPoint3")]}
                tone="dark"
              />
            </Reveal>
            <Reveal delay={0.1} className="h-full">
              <PersonaCard
                icon={<UserCircleIcon size={22} weight="duotone" />}
                eyebrow={t("who.patientEyebrow")}
                title={t("who.patientTitle")}
                body={t("who.patientBody")}
                points={[t("who.patientPoint1"), t("who.patientPoint2"), t("who.patientPoint3")]}
                tone="plain"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA — dark spotlight section, Aurora WebGL background, scale-in reveal */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 sm:px-14 sm:py-20">
            <div className="absolute inset-0">
              <CtaAurora className="h-full w-full" />
            </div>
            <div className="relative flex flex-col items-center gap-2 text-center">
              <h2 className="max-w-lg text-2xl font-semibold leading-snug text-background sm:text-[2rem]">
                {t("cta.heading")}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-background/70">
                {t("cta.subtitle")}
              </p>
              <Link
                href={userId ? "/upcoming" : "/sign-up"}
                className="mt-7 inline-flex items-center justify-center rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 active:scale-[0.98]"
              >
                {userId ? t("nav.ctaSignedIn") : t("cta.button")}
              </Link>
              <span className="mt-3 text-xs text-background/60">{t("cta.note")}</span>
            </div>
          </div>
        </Reveal>
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
            <Link href={userId ? "/upcoming" : "/sign-in"} className="text-muted hover:text-foreground">
              {userId ? t("nav.ctaSignedIn") : t("nav.signIn")}
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


// Decorative mock-up for the bento highlight cards — built from the app's
// own card/badge vocabulary rather than a hotlinked stock photo, so there's
// no external asset to go stale or fail to load.
function AppointmentPreview({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white">Dr. Tan Wei Ming</p>
        <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
          Pending
        </span>
      </div>
      <p className="mt-1 text-[10px] text-white/60">Cardiology · Gleneagles Penang</p>
      <div className="mt-3 h-px w-full bg-white/15" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white">Mum · Dr. Lakshmi</p>
        <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
          Attended
        </span>
      </div>
      <p className="mt-1 text-[10px] text-white/60">Island Hospital</p>
    </div>
  );
}

function StepIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-fill text-white">
      {icon}
    </span>
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
  tone: "dark" | "plain";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-8 shadow-xl backdrop-blur-xl ${
        dark ? "border-white/10 bg-foreground/70 shadow-black/20" : "border-white/40 bg-surface/50 shadow-black/5"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          dark ? "bg-background/10 text-background" : "bg-accent-fill text-white"
        }`}
      >
        {icon}
      </span>
      <div className="mt-5">
        <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>
      </div>
      <h3 className={`mt-2 text-xl font-semibold ${dark ? "text-background" : "text-foreground"}`}>
        {title}
      </h3>
      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-background/70" : "text-muted"}`}>
        {body}
      </p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {points.map((point) => (
          <li
            key={point}
            className={`flex items-start gap-2.5 text-sm ${dark ? "text-background" : "text-foreground"}`}
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
