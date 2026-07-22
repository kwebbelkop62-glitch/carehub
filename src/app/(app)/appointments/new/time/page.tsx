import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Field, Input } from "@/components/ui/field";
import { formatDate, formatTime, todayIso, addDaysIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient, Unit } from "@/lib/types";
import { BookingProgress, StepEyebrow } from "../booking-progress";

const TIME_PRESETS = ["09:00", "11:00", "14:00", "16:00"];

export default async function SelectTimePage({
  searchParams,
}: {
  searchParams: Promise<{
    patient?: string;
    unit?: string;
    date?: string;
    time?: string;
    reschedule?: string;
  }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.patient || !params.unit) {
    redirect("/appointments/new/unit");
  }

  const isReschedule = Boolean(params.reschedule);
  const rescheduleQuery = params.reschedule ? `&reschedule=${params.reschedule}` : "";
  const baseQuery = `patient=${params.patient}&unit=${params.unit}`;

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

  const date = params.date ?? "";
  const time = params.time ?? "";
  const today = todayIso();
  const dateIsPast = date !== "" && date < today;

  let conflicts: AppointmentWithUnitAndPatient[] = [];
  if (date && time && !dateIsPast) {
    const { data: userPatients } = await supabase.from("patients").select("id");
    const patientIds = (userPatients ?? []).map((p) => p.id);

    let conflictQuery = supabase
      .from("appointments")
      .select("*, units(*), patients(*)")
      .in("patient_id", patientIds.length > 0 ? patientIds : [params.patient])
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .neq("status", "cancelled");

    if (params.reschedule) {
      conflictQuery = conflictQuery.neq("id", params.reschedule);
    }

    const { data: conflictRows } = await conflictQuery;
    conflicts = (conflictRows ?? []) as AppointmentWithUnitAndPatient[];
  }

  const canContinue = Boolean(date && time && !dateIsPast);
  const nextHref = isReschedule
    ? `/appointments/new/confirm?${baseQuery}&date=${date}&time=${time}${rescheduleQuery}`
    : `/appointments/new/reminder?${baseQuery}&date=${date}&time=${time}`;

  const shortDay = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  const weekday = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", { weekday: "short" });
  const datePresetIsos = [today, addDaysIso(today, 1), addDaysIso(today, 2), addDaysIso(today, 7)];
  const datePresets = datePresetIsos.map((iso, i) => ({
    iso,
    label:
      i === 0
        ? `Today · ${shortDay(iso)}`
        : i === 1
          ? `Tomorrow · ${shortDay(iso)}`
          : `${weekday(iso)} · ${shortDay(iso)}`,
  }));

  function chipHref(overrides: Record<string, string>) {
    const merged = { patient: params.patient!, unit: params.unit!, date, time, ...overrides };
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v));
    if (params.reschedule) qs.set("reschedule", params.reschedule);
    return `/appointments/new/time?${qs.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-[520px] rounded-[20px] border border-border bg-surface p-6 sm:p-[36px_40px]">
      <BookingProgress step={3} />
      {isReschedule ? (
        <>
          <p className="mb-2.5 text-[12.5px] font-bold tracking-wide text-accent uppercase">Reschedule</p>
          <h1 className="mb-2 text-xl font-bold text-foreground">Pick a new date &amp; time</h1>
          <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
            {typedUnit.name} &middot; {typedUnit.hospital_or_facility_name}, {typedPatient.relationship_to_owner},
            and your reminder lead-time all stay the same — only the date and time change. CareHub checks this only
            against your own saved appointments, not real hospital or clinic availability.
          </p>
        </>
      ) : (
        <>
          <StepEyebrow step={3} />
          <h1 className="mb-2 text-xl font-bold text-foreground">When did you book it for?</h1>
          <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
            Enter the date and time you already have — CareHub checks this only against your own saved
            appointments, not real hospital or clinic availability.
          </p>
        </>
      )}

      <p className="mb-2 text-sm font-semibold text-foreground">Date</p>
      <div className="mb-3.5 flex flex-wrap gap-2">
        {datePresets.map((preset) => (
          <Link
            key={preset.iso}
            href={chipHref({ date: preset.iso })}
            className={`rounded-[9px] border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold ${
              date === preset.iso ? "border-accent bg-surface text-foreground" : "border-border bg-background text-muted"
            }`}
          >
            {preset.label}
          </Link>
        ))}
      </div>
      <form method="GET" className="mb-3.5 flex items-end gap-2">
        <input type="hidden" name="patient" value={params.patient} />
        <input type="hidden" name="unit" value={params.unit} />
        <input type="hidden" name="time" value={time} />
        {params.reschedule && <input type="hidden" name="reschedule" value={params.reschedule} />}
        <div className="flex-1">
          <Field label="Custom date" htmlFor="date" error={dateIsPast ? "Pick a date that isn't in the past." : undefined}>
            <Input id="date" name="date" type="date" min={today} defaultValue={date} />
          </Field>
        </div>
        <button
          type="submit"
          className="h-[42px] rounded-[9px] border border-border px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-tint"
        >
          Set
        </button>
      </form>

      <p className="mb-2 text-sm font-semibold text-foreground">Time</p>
      <div className="mb-3.5 flex flex-wrap gap-2">
        {TIME_PRESETS.map((preset) => (
          <Link
            key={preset}
            href={chipHref({ time: preset })}
            className={`rounded-[9px] border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold ${
              time === preset ? "border-accent bg-surface text-foreground" : "border-border bg-background text-muted"
            }`}
          >
            {formatTime(preset)}
          </Link>
        ))}
      </div>

      <form method="GET" className="mb-5 flex items-end gap-2">
        <input type="hidden" name="patient" value={params.patient} />
        <input type="hidden" name="unit" value={params.unit} />
        <input type="hidden" name="date" value={date} />
        {params.reschedule && <input type="hidden" name="reschedule" value={params.reschedule} />}
        <div className="flex-1">
          <Field label="Custom time" htmlFor="time">
            <Input id="time" name="time" type="time" defaultValue={time} />
          </Field>
        </div>
        <button
          type="submit"
          className="h-[42px] rounded-[9px] border border-border px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-tint"
        >
          Set
        </button>
      </form>

      {conflicts.length > 0 && (
        <div className="mb-5 flex gap-2.5 rounded-[10px] bg-status-missed-bg px-3.5 py-3">
          <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-status-missed-dot" />
          <div>
            <p className="mb-0.5 text-[13.5px] font-bold text-status-missed-text">
              This clashes with an appointment you already saved
            </p>
            <p className="text-[13px] leading-relaxed text-status-missed-text">
              You already have {conflicts[0].units.name} on {formatDate(conflicts[0].appointment_date)} at{" "}
              {formatTime(conflicts[0].appointment_time)}. This is only a check against your own CareHub entries —
              not live availability at the clinic.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2.5">
        <Link
          href={isReschedule ? `/appointments/${params.reschedule}` : "/appointments/new/dependant"}
          className="flex-1 rounded-[10px] border border-border px-3 py-3 text-center text-[15px] font-semibold text-foreground transition-colors hover:bg-tint"
        >
          {isReschedule ? "Cancel" : "Back"}
        </Link>
        {canContinue ? (
          <Link
            href={nextHref}
            className="flex-[2] rounded-[10px] bg-accent px-3 py-3 text-center text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            {isReschedule ? "Save changes" : "Continue"}
          </Link>
        ) : (
          <span className="flex-[2] cursor-not-allowed rounded-[10px] bg-border px-3 py-3 text-center text-[15px] font-bold text-muted">
            {isReschedule ? "Save changes" : "Continue"}
          </span>
        )}
      </div>
    </div>
  );
}
