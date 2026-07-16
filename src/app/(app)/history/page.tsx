import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

const UNIT_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  lab: "Lab",
  scan_center: "Scan Center",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string; type?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*");
  const patientList = (patients ?? []) as Patient[];

  const { data: appointments, error: appointmentsError } =
    patientList.length > 0
      ? await supabase
          .from("appointments")
          .select("*, units(*), patients(*)")
          .lt("appointment_date", todayIso())
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false })
      : { data: [], error: null };

  const error = patientsError || appointmentsError;
  const allHistory = (appointments ?? []) as AppointmentWithUnitAndPatient[];

  const availableUnits = Array.from(
    new Map(allHistory.map((a) => [a.units.id, a.units])).values(),
  );
  const availableTypes = Array.from(new Set(allHistory.map((a) => a.units.type)));

  const filtered = allHistory.filter((a) => {
    if (params.unit && a.units.id !== params.unit) return false;
    if (params.type && a.units.type !== params.type) return false;
    if (params.from && a.appointment_date < params.from) return false;
    if (params.to && a.appointment_date > params.to) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">History</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Past appointments across units.
        </p>
      </div>

      {allHistory.length > 0 && (
        <form method="GET" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Unit" htmlFor="unit">
              <Select id="unit" name="unit" defaultValue={params.unit ?? ""}>
                <option value="">All units</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue={params.type ?? ""}>
                <option value="">All types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {UNIT_TYPE_LABELS[type] ?? type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From" htmlFor="from">
              <Input id="from" name="from" type="date" defaultValue={params.from ?? ""} />
            </Field>
            <Field label="To" htmlFor="to">
              <Input id="to" name="to" type="date" defaultValue={params.to ?? ""} />
            </Field>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="secondary">
              Apply filters
            </Button>
            <Link
              href="/history"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Clear
            </Link>
          </div>
        </form>
      )}

      {error && (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
          Couldn&apos;t load history right now. Try refreshing.
        </Card>
      )}

      {!error && allHistory.length === 0 && (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          No past appointments yet.
        </Card>
      )}

      {!error && allHistory.length > 0 && filtered.length === 0 && (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          No appointments match these filters.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((appointment) => (
          <Link key={appointment.id} href={`/appointments/${appointment.id}`}>
            <Card className="transition-colors hover:border-emerald-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{appointment.units.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {appointment.units.hospital_or_facility_name}
                  </p>
                  {patientList.length > 1 && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      For {appointment.patients.full_name}
                    </p>
                  )}
                </div>
                <Badge status={appointment.status} />
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                {formatDate(appointment.appointment_date)} &middot;{" "}
                {formatTime(appointment.appointment_time)}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
