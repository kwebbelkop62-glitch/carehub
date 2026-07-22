import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";
import { REMINDER_LEAD_TIME_LABELS, type ReminderLeadTimeKey } from "@/lib/reminders";
import type { Patient, Unit } from "@/lib/types";
import { confirmAppointmentAction, rescheduleAppointmentAction } from "./actions";
import { BookingProgress, StepEyebrow } from "../booking-progress";

export default async function ConfirmAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    patient?: string;
    unit?: string;
    date?: string;
    time?: string;
    reminder?: string;
    notes?: string;
    reschedule?: string;
  }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.patient || !params.unit || !params.date || !params.time) {
    redirect("/appointments/new/unit");
  }

  const isReschedule = Boolean(params.reschedule);
  const rescheduleQuery = params.reschedule ? `&reschedule=${params.reschedule}` : "";

  const supabase = createServerSupabaseClient();
  const [{ data: patient }, { data: unit }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", params.patient).maybeSingle(),
    supabase.from("units").select("*").eq("id", params.unit).maybeSingle(),
  ]);

  if (!patient || !unit) {
    redirect("/appointments/new/unit");
  }

  const typedPatient = patient as Patient;
  const typedUnit = unit as Unit;
  const reminderLabel = params.reminder
    ? REMINDER_LEAD_TIME_LABELS[params.reminder as ReminderLeadTimeKey]
    : undefined;

  return (
    <div className="mx-auto w-full max-w-[520px] rounded-[20px] border border-border bg-surface p-6 sm:p-[36px_40px]">
      <BookingProgress step={5} />
      <StepEyebrow step={5} />
      <h1 className="mb-2 text-xl font-bold text-foreground">Review &amp; confirm</h1>
      <p className="mb-5 text-sm leading-relaxed text-muted">Check the details before saving.</p>

      <div className="mb-5 rounded-xl border border-border px-4">
        <SummaryRow label="Unit" value={`${typedUnit.name} · ${typedUnit.hospital_or_facility_name}`} />
        <SummaryRow label="For" value={typedPatient.relationship_to_owner} />
        <SummaryRow label="When" value={`${formatDate(params.date)}, ${formatTime(params.time)}`} />
        {reminderLabel && <SummaryRow label="Reminder" value={reminderLabel} />}
        {params.notes && <SummaryRow label="Notes" value={params.notes} last />}
      </div>

      <p className="mb-5 text-[12.5px] leading-relaxed text-muted">
        This saves the appointment to your CareHub log. It doesn&apos;t send a booking request to the clinic or
        hospital — you&apos;re already booked there.
      </p>

      <form
        action={isReschedule ? rescheduleAppointmentAction : confirmAppointmentAction}
        className="flex gap-2.5"
      >
        {isReschedule ? (
          <input type="hidden" name="appointmentId" value={params.reschedule} />
        ) : (
          <>
            <input type="hidden" name="patient" value={params.patient} />
            <input type="hidden" name="unit" value={params.unit} />
            <input type="hidden" name="reminder" value={params.reminder ?? "1day"} />
            <input type="hidden" name="notes" value={params.notes ?? ""} />
          </>
        )}
        <input type="hidden" name="date" value={params.date} />
        <input type="hidden" name="time" value={params.time} />
        <Link
          href={
            isReschedule
              ? `/appointments/new/time?patient=${params.patient}&unit=${params.unit}&date=${params.date}&time=${params.time}${rescheduleQuery}`
              : `/appointments/new/reminder?patient=${params.patient}&unit=${params.unit}&date=${params.date}&time=${params.time}&reminder=${params.reminder ?? "1day"}`
          }
          className="flex-1 rounded-[10px] border border-border px-3 py-3 text-center text-[15px] font-semibold text-foreground transition-colors hover:bg-tint"
        >
          Back
        </Link>
        <button
          type="submit"
          className="flex-[2] rounded-[10px] bg-accent px-3 py-3 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover"
        >
          {isReschedule ? "Save changes" : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}

function SummaryRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-3 ${last ? "" : "border-b border-border"}`}>
      <span className="shrink-0 text-[13px] text-muted">{label}</span>
      <span className="text-right text-[13.5px] font-bold text-foreground">{value}</span>
    </div>
  );
}
