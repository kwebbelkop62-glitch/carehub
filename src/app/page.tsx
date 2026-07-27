import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { NavLogo } from "@/components/logo";
import { LandingNav } from "@/components/landing-nav";
import { HeroCardsMobile, HeroCardsDesktop } from "@/components/hero-cards";
import { HowStep } from "@/components/how-step";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/upcoming");
  }

  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingNav
        howLabel={t("nav.how")}
        whoLabel={t("nav.who")}
        signInLabel={t("nav.signIn")}
        ctaLabel={t("nav.cta")}
      />

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-[88px]">
        <div>
          <div className="hero-fade-up mb-[22px] inline-block rounded-full bg-accent-secondary-badge-bg px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wide text-accent-secondary">
            {t("hero.eyebrow")}
          </div>
          <h1 className="hero-fade-up-1 mb-[22px] font-serif text-[clamp(2rem,1.4rem+2.5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="hero-fade-up-2 mb-7 max-w-[520px] text-[17px] leading-relaxed text-[oklch(.42_.02_60)] dark:text-muted">
            {t("hero.subtitle")}
          </p>
          <div className="hero-fade-up-3 mb-[18px] flex flex-wrap gap-3.5">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-3.5 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover active:scale-[0.98]"
            >
              {t("hero.ctaPrimary")}
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-[10px] border border-border px-6 py-3.5 text-[15px] font-semibold transition-colors hover:bg-surface active:scale-[0.98]"
            >
              {t("hero.ctaSecondary")}
            </a>
          </div>
          <p className="hero-fade-up-4 max-w-[460px] text-[13px] leading-relaxed text-[oklch(.55_.02_60)] dark:text-muted">
            {t("hero.disclaimer")}
          </p>
        </div>

        {/* Mobile (<sm): the mockup's floating/rotated absolute layout has
            no room to work with at narrow widths, so this is a simple
            stacked list instead — same card content/styling, drop-in
            entrance but no rotation or idle float. Desktop keeps the
            mockup's exact floating layout, swapped in at sm: and up. Both
            use Framer Motion to drop the cards in one by one on mount. */}
        <HeroCardsMobile
          cards={[
            {
              title: "Dr. Tan Wei Ming",
              subtitle: "Cardiology · Gleneagles Penang",
              meta: "Wed, 14 Aug · 10:30 AM",
              status: "pending",
              statusLabel: t("hero.card1Status"),
            },
            {
              title: "Mum · Dr. Lakshmi",
              subtitle: "Island Hospital",
              status: "attended",
              statusLabel: t("hero.card2Status"),
              compact: true,
            },
            {
              title: "Physio · Sunway Medical",
              subtitle: "Mon, 22 Jun",
              status: "missed",
              statusLabel: t("hero.card3Status"),
              compact: true,
            },
            {
              title: "Dentist · Dr. Farah",
              status: "pending",
              statusLabel: t("hero.card4Status"),
              inline: true,
              compact: true,
            },
          ]}
        />

        <HeroCardsDesktop
          cards={[
            {
              title: "Dr. Tan Wei Ming",
              subtitle: "Cardiology · Gleneagles Penang",
              meta: "Wed, 14 Aug · 10:30 AM",
              status: "pending",
              statusLabel: t("hero.card1Status"),
              top: 20,
              left: "10%",
              width: "78%",
              rotate: -6,
              floatDistance: 10,
              floatDuration: 6,
            },
            {
              title: "Mum · Dr. Lakshmi",
              subtitle: "Island Hospital",
              status: "attended",
              statusLabel: t("hero.card2Status"),
              compact: true,
              top: 150,
              left: "2%",
              width: "70%",
              rotate: 3,
              floatDistance: 14,
              floatDuration: 7,
            },
            {
              title: "Physio · Sunway Medical",
              subtitle: "Mon, 22 Jun",
              status: "missed",
              statusLabel: t("hero.card3Status"),
              compact: true,
              top: 270,
              left: "16%",
              width: "72%",
              rotate: -2,
              floatDistance: 8,
              floatDuration: 6.5,
            },
            {
              title: "Dentist · Dr. Farah",
              status: "pending",
              statusLabel: t("hero.card4Status"),
              inline: true,
              compact: true,
              top: 370,
              left: "6%",
              width: "66%",
              rotate: 7,
              floatDistance: 12,
              floatDuration: 7.5,
            },
          ]}
        />
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto w-full max-w-[900px] scroll-mt-20 px-6 py-10 sm:px-10 lg:px-14 lg:py-24">
        <div className="mb-14 text-left">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-accent">{t("how.eyebrow")}</div>
          <h2 className="max-w-[560px] font-serif text-3xl font-semibold sm:text-4xl">{t("how.heading")}</h2>
        </div>

        <div className="relative isolate">
          {/* isolate on the wrapper + -z-10 on the line: without isolate,
              this div doesn't establish its own stacking context (plain
              position:relative doesn't), so the negative z-index escapes
              to an ancestor and paints behind the page's own opaque
              background instead of just behind the circles below —
              isolate scopes it locally so the line sits behind the
              circles but still above everything else. */}
          <div className="absolute top-2 bottom-2 left-[22px] -z-10 w-0.5 -translate-x-1/2 bg-border sm:left-1/2" />

          <HowStep side="left" number={1} tone="accent" title={t("how.step1Title")} body={t("how.step1Body")} />
          <HowStep side="right" number={2} tone="accent-secondary" title={t("how.step2Title")} body={t("how.step2Body")} />
          <HowStep side="left" number={3} tone="accent" title={t("how.step3Title")} body={t("how.step3Body")} />
          <HowStep
            side="right"
            number={4}
            tone="accent-secondary"
            title={t("how.step4Title")}
            body={t("how.step4Body")}
            last
          />
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="mx-auto w-full max-w-[1280px] scroll-mt-20 px-6 py-4 sm:px-10 lg:px-14 lg:py-24">
        <div className="mb-11">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-accent">{t("who.eyebrow")}</div>
          <h2 className="max-w-[560px] font-serif text-3xl font-semibold sm:text-4xl">{t("who.heading")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PersonaCard
            tone="accent"
            eyebrow={t("who.caregiverEyebrow")}
            title={t("who.caregiverTitle")}
            body={t("who.caregiverBody")}
            points={[t("who.caregiverPoint1"), t("who.caregiverPoint2"), t("who.caregiverPoint3")]}
          />
          <PersonaCard
            tone="accent-secondary"
            eyebrow={t("who.patientEyebrow")}
            title={t("who.patientTitle")}
            body={t("who.patientBody")}
            points={[t("who.patientPoint1"), t("who.patientPoint2"), t("who.patientPoint3")]}
          />
        </div>
      </section>

      {/* CTA — bg-foreground/text-background deliberately swap polarity
          with the page theme (dark box on the light page, light box on the
          dark page) so this band always reads as the "spotlight" section.
          Anything inside it that isn't already a foreground/background
          token (the subtitle/note below) needs an explicit dark: pair for
          the same reason, or it goes invisible when the box flips. */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-4 sm:px-10 lg:px-14 lg:py-24">
        <div className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl bg-foreground px-8 py-14 sm:grid-cols-[1fr_0.85fr] sm:px-14 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklab, var(--surface) 6%, transparent) 1.5px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <h2 className="mb-3.5 max-w-lg font-serif text-2xl font-semibold leading-tight text-background sm:text-[2rem]">
              {t("cta.heading")}
            </h2>
            <p className="max-w-[440px] text-[15.5px] leading-relaxed text-[oklch(.78_.01_70)] dark:text-[oklch(.48_.02_60)]">
              {t("cta.subtitle")}
            </p>
          </div>
          <div className="relative">
            <div className="mb-3 flex gap-2.5">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[10px] bg-accent px-[22px] py-3.5 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover active:scale-[0.98]"
              >
                {t("cta.button")}
              </Link>
            </div>
            <div className="text-[13px] text-[oklch(.65_.01_70)] dark:text-[oklch(.55_.02_60)]">{t("cta.note")}</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 pt-12 pb-10 sm:px-10 lg:px-14">
        <div className="mx-auto mb-9 grid max-w-[1280px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <NavLogo className="mb-3 h-6" />
            <p className="max-w-[280px] text-[13.5px] leading-relaxed text-muted">{t("footer.tagline")}</p>
          </div>
          <FooterColumn heading={t("footer.productHeading")}>
            <a href="#how">{t("footer.productHowItWorks")}</a>
            <a href="#who">{t("footer.productForCaregivers")}</a>
            <a href="#who">{t("footer.productForPatients")}</a>
          </FooterColumn>
          <FooterColumn heading={t("footer.companyHeading")}>
            <a href="#">{t("footer.companyAbout")}</a>
            <a href="#">{t("footer.companyContact")}</a>
          </FooterColumn>
          <FooterColumn heading={t("footer.legalHeading")}>
            <a href="#">{t("footer.legalPrivacy")}</a>
          </FooterColumn>
        </div>
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-6 border-t border-border pt-6">
          <p className="max-w-[560px] text-xs leading-relaxed text-muted">{t("footer.disclaimer")}</p>
          <p className="text-xs text-muted">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}

function PersonaCard({
  tone,
  eyebrow,
  title,
  body,
  points,
}: {
  tone: "accent" | "accent-secondary";
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}) {
  const isAccent = tone === "accent";
  return (
    <div
      className={`rounded-[20px] p-6 pb-7 transition-transform duration-200 ease-out sm:p-9 sm:pb-10 hover:-translate-y-1.5 ${
        isAccent ? "bg-accent-tint" : "bg-accent-secondary-tint"
      }`}
    >
      <div
        className={`mb-3.5 text-[13px] font-bold uppercase tracking-wide ${
          isAccent ? "text-accent-hover" : "text-accent-secondary"
        }`}
      >
        {eyebrow}
      </div>
      <h3 className="mb-3.5 font-serif text-2xl font-semibold">{title}</h3>
      <p className="mb-5 text-[15.5px] leading-relaxed text-[oklch(.35_.02_60)] dark:text-muted">{body}</p>
      <div className="flex flex-col gap-3">
        {points.map((point) => (
          <div key={point} className="flex items-baseline gap-2.5 text-sm text-[oklch(.3_.02_60)] dark:text-foreground">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isAccent ? "bg-accent-hover" : "bg-accent-secondary"}`} />
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterColumn({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3.5 text-xs font-bold uppercase tracking-wide text-muted">{heading}</div>
      <div className="flex flex-col gap-2.5 text-sm">{children}</div>
    </div>
  );
}
