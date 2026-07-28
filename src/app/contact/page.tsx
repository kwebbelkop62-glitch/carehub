import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

export const metadata = {
  title: "Contact — CareHub",
};

export default async function ContactPage() {
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
        <h1 className="mb-6 font-serif text-3xl font-semibold sm:text-4xl">Contact</h1>
        <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-muted">
          <p>
            Questions, bug reports, or feedback about CareHub are welcome by email:
          </p>
          <p>
            <a
              href="mailto:kwebbelkop62@gmail.com"
              className="text-lg font-semibold text-accent-hover hover:underline"
            >
              kwebbelkop62@gmail.com
            </a>
          </p>
          <p>
            CareHub is an independent project, not a staffed support line — replies may take a
            while, but every message gets read.
          </p>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-accent-hover hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
