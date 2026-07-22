import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Patient } from "@/lib/types";
import { BookingProgress, StepEyebrow } from "../booking-progress";

// Step 2 of CareHub Booking Flow.dc.html — only meaningful for caregivers
// (more than one patient). A self-only user has nothing to choose here, so
// this redirects straight through to Date & Time rather than showing a
// one-option picker, same isCaregiver-gated pattern used on Upcoming.
export default async function SelectDependantPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.unit) {
    redirect("/appointments/new/unit");
  }

  const supabase = createServerSupabaseClient();
  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });
  const patientList = (patients ?? []) as Patient[];

  if (!error && patientList.length === 0) {
    redirect("/profile");
  }

  if (!error && patientList.length === 1) {
    redirect(`/appointments/new/time?patient=${patientList[0].id}&unit=${params.unit}`);
  }

  return (
    <div className="mx-auto w-full max-w-[520px] rounded-[20px] border border-border bg-surface p-6 sm:p-[36px_40px]">
      <BookingProgress step={2} />
      <StepEyebrow step={2} />
      <h1 className="mb-2 text-xl font-bold text-foreground">Who&apos;s this appointment for?</h1>
      <p className="mb-5 text-sm leading-relaxed text-muted">
        Choose which of your patients this is for.
      </p>

      {error && <p className="mb-4 text-sm text-error">Couldn&apos;t load your patients right now.</p>}

      <div className="mb-6 flex flex-col gap-2">
        {patientList.map((patient) => (
          <Link
            key={patient.id}
            href={`/appointments/new/time?patient=${patient.id}&unit=${params.unit}`}
            className="rounded-[10px] border-[1.5px] border-border px-3.5 py-[13px] text-sm font-bold text-foreground transition-colors hover:border-accent"
          >
            {patient.relationship_to_owner}
          </Link>
        ))}
        <Link href="/profile" className="pt-1 text-[13.5px] font-semibold text-accent-hover hover:underline">
          + Add a dependant
        </Link>
      </div>

      <Link
        href="/appointments/new/unit"
        className="inline-flex items-center justify-center rounded-[10px] border border-border px-4 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-tint"
      >
        Back
      </Link>
    </div>
  );
}
