import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

export const metadata = {
  title: "About — CareHub",
};

export default async function AboutPage() {
  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingNav
        howLabel={t("nav.how")}
        whoLabel={t("nav.who")}
        signInLabel={t("nav.signIn")}
        ctaLabel={t("nav.cta")}
      />
      <div className="mx-auto w-full max-w-[720px] flex-1 px-6 py-16 sm:px-10 lg:px-14">
        <h1 className="mb-6 font-serif text-3xl font-semibold sm:text-4xl">About CareHub</h1>
        <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-muted">
          <p>
            CareHub is a personal appointment tracker built for patients and caregivers
            managing care across Penang&apos;s hospitals, clinics, labs, and scan centers.
          </p>
          <p>
            Whether you&apos;re coordinating a parent&apos;s specialist visits or keeping your
            own appointments straight across a handful of clinics, CareHub keeps everything
            in one place — one dashboard, one history, one set of reminders — instead of
            scattered across paper slips and calendar apps.
          </p>
          <p>
            CareHub is an independent project, not affiliated with any hospital, clinic, or
            government health system. It doesn&apos;t integrate with MySejahtera or any
            hospital&apos;s own records — it&apos;s simply a tool for keeping track of what
            you&apos;ve already booked.
          </p>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-accent-hover hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
