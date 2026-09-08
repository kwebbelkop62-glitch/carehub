import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

export const metadata = {
  title: "Privacy Policy — CareHub",
};

export default async function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingNav
        howLabel="How it works"
        whoLabel="Who it's for"
        signInLabel="Sign in"
        ctaLabel="Get started free"
      />
      <div className="mx-auto w-full max-w-[720px] flex-1 px-6 py-16 sm:px-10 lg:px-14">
        <h1 className="mb-6 font-serif text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
        <div className="flex flex-col gap-6 text-[15.5px] leading-relaxed text-muted">
          <p>
            This page explains what CareHub does with your information, in plain terms — not a
            legal document, just an honest account of how the app works.
          </p>
          <div>
            <h2 className="mb-2 text-base font-bold text-foreground">What we store</h2>
            <p>
              Your name and email from your sign-in account, the patients you manage, the
              appointments, units, and documents you add, and the reminders you schedule.
              That&apos;s it — nothing beyond what you put in yourself.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-base font-bold text-foreground">Who can see it</h2>
            <p>
              Only you. Every appointment, patient, and document is scoped to your account at
              the database level — there&apos;s no shared or public view, and other
              users&apos; data is never visible to you, or yours to them. Uploaded documents
              are stored privately and served through short-lived links, never a public URL.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-base font-bold text-foreground">Reminders</h2>
            <p>
              If you set a reminder, CareHub sends it as an email through Resend, a
              transactional email provider. That&apos;s the only outbound communication the
              app sends.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-base font-bold text-foreground">What we don&apos;t do</h2>
            <p>
              CareHub doesn&apos;t share your data with, or receive data from, any hospital,
              clinic, insurance provider, or government health system. There&apos;s no
              integration with MySejahtera. We don&apos;t sell data, run ads, or track you
              across other sites.
            </p>
          </div>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-accent-hover hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
