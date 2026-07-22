import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { NavLogo } from "@/components/logo";
import { LandingNav } from "@/components/landing-nav";

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
            static stacked list instead — same card content/styling, no
            rotation or float animation. Desktop keeps the mockup's exact
            floating layout, swapped in at sm: and up. */}
        <div className="flex flex-col gap-3 sm:hidden">
          <HeroCard
            title="Dr. Tan Wei Ming"
            subtitle="Cardiology · Gleneagles Penang"
            meta="Wed, 14 Aug · 10:30 AM"
            status="pending"
            statusLabel={t("hero.card1Status")}
          />
          <HeroCard
            title="Mum · Dr. Lakshmi"
            subtitle="Island Hospital"
            status="attended"
            statusLabel={t("hero.card2Status")}
            compact
          />
          <HeroCard
            title="Physio · Sunway Medical"
            subtitle="Mon, 22 Jun"
            status="missed"
            statusLabel={t("hero.card3Status")}
            compact
          />
          <HeroCard
            title="Dentist · Dr. Farah"
            status="pending"
            statusLabel={t("hero.card4Status")}
            inline
            compact
          />
        </div>

        <div className="relative hidden h-[440px] sm:block">
          <HeroCard
            floatClassName="hero-float-1 top-5 left-[10%] w-[78%] p-[18px_20px]"
            title="Dr. Tan Wei Ming"
            subtitle="Cardiology · Gleneagles Penang"
            meta="Wed, 14 Aug · 10:30 AM"
            status="pending"
            statusLabel={t("hero.card1Status")}
          />
          <HeroCard
            floatClassName="hero-float-2 top-[150px] left-[2%] w-[70%] p-4"
            title="Mum · Dr. Lakshmi"
            subtitle="Island Hospital"
            status="attended"
            statusLabel={t("hero.card2Status")}
            compact
          />
          <HeroCard
            floatClassName="hero-float-3 top-[270px] left-[16%] w-[72%] p-4"
            title="Physio · Sunway Medical"
            subtitle="Mon, 22 Jun"
            status="missed"
            statusLabel={t("hero.card3Status")}
            compact
          />
          <HeroCard
            floatClassName="hero-float-4 top-[370px] left-[6%] w-[66%] p-[14px_16px]"
            title="Dentist · Dr. Farah"
            status="pending"
            statusLabel={t("hero.card4Status")}
            inline
            compact
          />
        </div>
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

const statusTokens = {
  pending: { bg: "bg-status-upcoming-bg", dot: "bg-status-upcoming-dot", text: "text-status-upcoming-text" },
  attended: { bg: "bg-status-attended-bg", dot: "bg-status-attended-dot", text: "text-status-attended-text" },
  missed: { bg: "bg-status-missed-bg", dot: "bg-status-missed-dot", text: "text-status-missed-text" },
} as const;

// Decorative hero mockups — matching CareHub Landing Page.dc.html's exact
// per-card padding/sizing, which is smaller than the shared <Badge>
// component's own dimensions, so this hand-rolls the pill rather than
// reusing that component. Renders statically (full-width, no rotation/
// animation, normal flow) when floatClassName is omitted — used for the
// <sm mobile stacked list, since the mockup's absolute-positioned floating
// layout has no room to work with at narrow widths.
function HeroCard({
  floatClassName,
  title,
  subtitle,
  meta,
  status,
  statusLabel,
  compact = false,
  inline = false,
}: {
  floatClassName?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  status: keyof typeof statusTokens;
  statusLabel: string;
  compact?: boolean;
  inline?: boolean;
}) {
  const tokens = statusTokens[status];
  const pill = (
    <div className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 ${tokens.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tokens.dot}`} />
      <span className={`text-[10px] font-bold ${tokens.text}`}>{statusLabel}</span>
    </div>
  );

  return (
    <div
      className={`rounded-2xl border border-border bg-surface ${floatClassName ? `absolute ${floatClassName}` : "relative w-full p-4"}`}
      style={{ boxShadow: "0 12px 28px oklch(.4 .02 60 / .1)" }}
    >
      <div className={`flex items-start justify-between gap-2 ${meta || !inline ? "mb-2" : ""}`}>
        <div>
          <div className={`font-bold ${compact ? "text-sm" : "text-[15px]"}`}>{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
        {pill}
      </div>
      {meta && <div className="text-xs text-muted">{meta}</div>}
    </div>
  );
}

function HowStep({
  side,
  number,
  tone,
  title,
  body,
  last = false,
}: {
  side: "left" | "right";
  number: number;
  tone: "accent" | "accent-secondary";
  title: string;
  body: string;
  last?: boolean;
}) {
  // Mobile (<sm): single left-aligned column, circle always in col 1 —
  // the desktop alternating-sides layout has no room to work with at
  // narrow widths. Desktop (sm+): circle explicitly placed in the middle
  // column regardless of DOM order, text explicitly placed left or right
  // per `side` — explicit grid-column placement overrides source order,
  // so this needs no separate mobile/desktop markup, just responsive
  // column-start utilities on a template that itself changes at sm:.
  const circle = (
    <div className="col-start-1 flex justify-center sm:col-start-2">
      <div
        className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-extrabold text-surface ${
          tone === "accent" ? "bg-accent" : "bg-accent-secondary"
        }`}
      >
        {number}
      </div>
    </div>
  );

  const text = (
    <div
      className={`col-start-2 pl-4 text-left ${
        side === "left" ? "sm:col-start-1 sm:pr-7 sm:pl-0 sm:text-right" : "sm:col-start-3 sm:pl-7 sm:text-left"
      } ${last ? "" : "pb-[60px]"}`}
    >
      <div className="mb-2 font-serif text-lg font-semibold">{title}</div>
      <div className="text-[15px] leading-relaxed text-muted">{body}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-[44px_1fr] items-start sm:grid-cols-[1fr_44px_1fr]">
      {circle}
      {text}
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
