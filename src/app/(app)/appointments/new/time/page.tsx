import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { formatDate, formatTime, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient, Unit } from "@/lib/types";

export default async function SelectTimePage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; unit?: string; date?: string; time?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.patient || !params.unit) {
    redirect("/appointments/new/unit");
  }

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
  const dateIsPast = date !== "" && date < todayIso();

  let conflicts: AppointmentWithUnitAndPatient[] = [];
  if (date && time && !dateIsPast) {
    const { data: userPatients } = await supabase.from("patients").select("id");
    const patientIds = (userPatients ?? []).map((p) => p.id);

    const { data: conflictRows } = await supabase
      .from("appointments")
      .select("*, units(*), patients(*)")
      .in("patient_id", patientIds.length > 0 ? patientIds : [params.patient])
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .neq("status", "cancelled");

    conflicts = (conflictRows ?? []) as AppointmentWithUnitAndPatient[];
  }

  const canContinue = Boolean(date && time && !dateIsPast);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Select a date and time
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          For {typedPatient.full_name} at {typedUnit.name},{" "}
          {typedUnit.hospital_or_facility_name}
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
        CareHub checks this slot against appointments already booked in your own
        account. It cannot check the unit&apos;s real availability — confirm the
        time works with them directly if it matters.
      </Card>

      <form method="GET" className="flex flex-col gap-4">
        <input type="hidden" name="patient" value={params.patient} />
        <input type="hidden" name="unit" value={params.unit} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="date" error={dateIsPast ? "Pick a date that isn't in the past." : undefined}>
            <Input id="date" name="date" type="date" min={todayIso()} defaultValue={date} required />
          </Field>
          <Field label="Time" htmlFor="time">
            <Input id="time" name="time" type="time" defaultValue={time} required />
          </Field>
        </div>
        <Button type="submit" variant="secondary" className="self-start">
          Check this slot
        </Button>
      </form>

      {date && time && !dateIsPast && (
        <Card className={conflicts.length > 0 ? "border-amber-300" : "border-emerald-300"}>
          {conflicts.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                You already have an appointment at this time
              </p>
              {conflicts.map((c) => (
                <p key={c.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                  {c.patients.full_name} at {c.units.name} — {formatDate(c.appointment_date)}{" "}
                  {formatTime(c.appointment_time)}
                </p>
              ))}
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You can still continue if this is intentional.
              </p>
            </div>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              No conflicts with your other appointments.
            </p>
          )}
        </Card>
      )}

      {canContinue && (
        <LinkButton
          href={`/appointments/new/confirm?patient=${params.patient}&unit=${params.unit}&date=${date}&time=${time}`}
          className="self-start"
        >
          Continue
        </LinkButton>
      )}
    </div>
  );
}
