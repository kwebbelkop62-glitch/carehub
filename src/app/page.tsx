import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLogo } from "@/components/logo";
import { LandingNav } from "@/components/landing-nav";
import { HeroCardsMobile, HeroCardsDesktop } from "@/components/hero-cards";
import { HowStep } from "@/components/how-step";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/upcoming");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingNav
        howLabel="How it works"
        whoLabel="Who it's for"
        signInLabel="Sign in"
        ctaLabel="Get started free"
      />

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-[88px]">
        <div>
          <div className="hero-fade-up mb-[22px] inline-block rounded-full bg-accent-secondary-badge-bg px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wide text-accent-secondary">
            For patients & caregivers
          </div>
          <h1 className="hero-fade-up-1 mb-[22px] font-serif text-[clamp(2rem,1.4rem+2.5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight">
            Your appointments live in five different places. CareHub is the one place they don&apos;t get lost.
          </h1>
          <p className="hero-fade-up-2 mb-7 max-w-[520px] text-[17px] leading-relaxed text-[oklch(.42_.02_60)] dark:text-muted">
            Between GP visits, specialist follow-ups, physio, and a parent&apos;s check-ups — nobody remembers
            everything. CareHub keeps every appointment, every provider, and every reminder in one running list
            you actually keep up with.
          </p>
          <div className="hero-fade-up-3 mb-[18px] flex flex-wrap gap-3.5">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-3.5 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover active:scale-[0.98]"
            >
              Get started free
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-[10px] border border-border px-6 py-3.5 text-[15px] font-semibold transition-colors hover:bg-surface active:scale-[0.98]"
            >
              See how it works
            </a>
          </div>
          <p className="hero-fade-up-4 max-w-[460px] text-[13px] leading-relaxed text-[oklch(.55_.02_60)] dark:text-muted">
            CareHub tracks the appointments you tell it about — it doesn&apos;t book appointments or check
            real-time availability at any hospital or clinic.
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
              statusLabel: "Upcoming",
            },
            {
              title: "Mum · Dr. Lakshmi",
              subtitle: "Island Hospital",
              status: "attended",
              statusLabel: "Attended",
              compact: true,
            },
            {
              title: "Physio · Sunway Medical",
              subtitle: "Mon, 22 Jun",
              status: "missed",
              statusLabel: "Missed",
              compact: true,
            },
            {
              title: "Dentist · Dr. Farah",
              status: "pending",
              statusLabel: "Upcoming",
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
              statusLabel: "Upcoming",
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
              statusLabel: "Attended",
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
              statusLabel: "Missed",
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
              statusLabel: "Upcoming",
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
          <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-accent">How it works</div>
          <h2 className="max-w-[560px] font-serif text-3xl font-semibold sm:text-4xl">
            Four steps. No clinic account, no login for the hospital.
          </h2>
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

          <HowStep
            side="left"
            number={1}
            tone="accent"
            title="Add a unit"
            body="Search for the clinic, hospital, or doctor you're seeing — or add your own if it's not listed. This is a personal log, not a booking system, so anything goes in."
          />
          <HowStep
            side="right"
            number={2}
            tone="accent-secondary"
            title="Pick a time"
            body="Enter the date and time you already booked — by phone, in person, or through the provider's own app. CareHub doesn't check open slots; it just remembers what you told it."
          />
          <HowStep
            side="left"
            number={3}
            tone="accent"
            title="Get reminded"
            body="A reminder lands the day before, and again that morning, so you or the person you're caring for never shows up on the wrong day — or forgets entirely."
          />
          <HowStep
            side="right"
            number={4}
            tone="accent-secondary"
            title="Keep history"
            body={`Every visit rolls into a running timeline per person, so "when did Dad last see the cardiologist" has an actual answer.`}
            last
          />
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="mx-auto w-full max-w-[1280px] scroll-mt-20 px-6 py-4 sm:px-10 lg:px-14 lg:py-24">
        <div className="mb-11">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-accent">Who it&apos;s for</div>
          <h2 className="max-w-[560px] font-serif text-3xl font-semibold sm:text-4xl">
            Built for the person doing the remembering.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PersonaCard
            tone="accent"
            eyebrow="If you're keeping track of someone else"
            title="Caregivers"
            body="Add a profile for a parent, child, or anyone you support, and manage their appointments alongside your own. See who's up next, who missed a follow-up, and what's coming this week — across everyone you look after."
            points={[
              "Multiple care profiles in one account",
              "Shared reminders you can send to family",
              "One weekly view across everyone you support",
            ]}
          />
          <PersonaCard
            tone="accent-secondary"
            eyebrow="If you're managing your own care"
            title="Patients"
            body="Stop juggling three clinic apps and a paper card. Log every appointment as you make it, get reminded before it happens, and pull up your own history whenever a new doctor asks."
            points={[
              "One list across every provider",
              "Reminders that reach you, not just a portal login",
              "A visit history you can show any new doctor",
            ]}
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
              Start with the next appointment on your calendar.
            </h2>
            <p className="max-w-[440px] text-[15.5px] leading-relaxed text-[oklch(.78_.01_70)] dark:text-[oklch(.48_.02_60)]">
              Takes under a minute — no clinic integration, no hospital login, just yours.
            </p>
          </div>
          <div className="relative">
            <div className="mb-3 flex gap-2.5">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[10px] bg-accent px-[22px] py-3.5 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover active:scale-[0.98]"
              >
                Create free account
              </Link>
            </div>
            <div className="text-[13px] text-[oklch(.65_.01_70)] dark:text-[oklch(.55_.02_60)]">
              Free for individuals. Add family members anytime.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 pt-12 pb-10 sm:px-10 lg:px-14">
        <div className="mx-auto mb-9 grid max-w-[1280px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <NavLogo className="mb-3 h-6" />
            <p className="max-w-[280px] text-[13.5px] leading-relaxed text-muted">
              A personal appointment tracker for patients and caregivers in Penang.
            </p>
          </div>
          <FooterColumn heading="Product">
            <a href="#how">How it works</a>
            <a href="#who">For caregivers</a>
            <a href="#who">For patients</a>
          </FooterColumn>
          <FooterColumn heading="Company">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </FooterColumn>
          <FooterColumn heading="Legal">
            <Link href="/privacy">Privacy</Link>
          </FooterColumn>
        </div>
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-6 border-t border-border pt-6">
          <p className="max-w-[560px] text-xs leading-relaxed text-muted">
            CareHub is an independent personal tracking tool. It is not affiliated with, and does not exchange
            data with, any hospital, clinic, or insurance provider.
          </p>
          <p className="text-xs text-muted">© 2026 CareHub</p>
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
