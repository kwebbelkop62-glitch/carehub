import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, todayIso } from "@/lib/format";
import { unitTypeLabel } from "@/lib/types";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

// CareHub Lists.dc.html's compact date-input treatment — smaller/denser
// than the shared Field/Input (which is tuned for full forms, not a
// filter row), so this is hand-rolled rather than reused, same call as
// the unit-detail/appointment-detail passes.
const filterLabelClass = "mb-1 block text-xs font-semibold text-muted";
const filterInputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-[13.5px] text-foreground focus:border-accent focus:outline-none";

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
      <h1 className="text-xl font-bold text-foreground">History</h1>

      {allHistory.length > 0 && (
        <form method="GET" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2.5">
            <div>
              <label className={filterLabelClass} htmlFor="unit">
                Unit
              </label>
              <select id="unit" name="unit" defaultValue={params.unit ?? ""} className={filterInputClass}>
                <option value="">All units</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={filterLabelClass} htmlFor="type">
                Type
              </label>
              <select id="type" name="type" defaultValue={params.type ?? ""} className={filterInputClass}>
                <option value="">All types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {unitTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={filterLabelClass} htmlFor="from">
                From
              </label>
              <input id="from" name="from" type="date" defaultValue={params.from ?? ""} className={filterInputClass} />
            </div>
            <div>
              <label className={filterLabelClass} htmlFor="to">
                To
              </label>
              <input id="to" name="to" type="date" defaultValue={params.to ?? ""} className={filterInputClass} />
            </div>
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
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load history right now. Try refreshing.
        </Card>
      )}

      {!error && allHistory.length === 0 && (
        <EmptyState
          title="No history yet"
          subtitle="Appointments marked attended or missed will build your history here."
        />
      )}

      {!error && allHistory.length > 0 && filtered.length === 0 && (
        <EmptyState title="No appointments in this range" subtitle="Try widening the date range." />
      )}

      {!error && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-surface px-4 py-3 transition-colors hover:border-accent sm:gap-[14px]"
            >
              <p className="w-24 shrink-0 text-[13px] font-bold text-muted">
                {formatDate(appointment.appointment_date)}
              </p>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {appointment.units.name} &middot; {appointment.units.hospital_or_facility_name}
                </p>
                <p className="text-[12.5px] text-muted">
                  {formatTime(appointment.appointment_time)} &middot; {appointment.patients.full_name}
                </p>
              </div>
              <Badge status={appointment.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// CareHub Lists.dc.html's empty-state treatment (dashed border, centered
// title+subtitle) — used for both "no history at all" and "no results in
// this date range" per the mockup's own two empty variants.
function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-border px-8 py-[52px] text-center">
      <h2 className="mb-2 text-[17px] font-bold text-foreground">{title}</h2>
      <p className="mx-auto max-w-[360px] text-sm leading-relaxed text-muted">{subtitle}</p>
    </div>
  );
}
