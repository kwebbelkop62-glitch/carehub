import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select, Input } from "@/components/ui/field";
import { AppointmentCard } from "@/components/appointment-card";
import { todayIso } from "@/lib/format";
import { unitTypeLabel } from "@/lib/types";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

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
        <p className="mt-1 text-sm text-muted">Past appointments across units.</p>
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
                    {unitTypeLabel(type)}
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
              className="inline-flex items-center text-sm text-muted hover:text-foreground"
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
        <Card className="text-sm text-muted">No past appointments yet.</Card>
      )}

      {!error && allHistory.length > 0 && filtered.length === 0 && (
        <Card className="text-sm text-muted">No appointments match these filters.</Card>
      )}

      {!error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
