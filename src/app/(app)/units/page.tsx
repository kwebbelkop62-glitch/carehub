import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { formatDate, todayIso } from "@/lib/format";
import { UNIT_TYPE_LABELS, unitTypeLabel } from "@/lib/types";
import type { AppointmentWithUnit, Unit } from "@/lib/types";

type UnitWithVisit = { unit: Unit; lastVisit: string | null };

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  const [{ data: appointments, error }, { data: ownUnits, error: ownError }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("*, units(*)")
        .order("appointment_date", { ascending: false }),
      supabase.from("units").select("*").eq("added_by_user_id", appUser.id),
    ]);

  // "Your care units" = units you've booked with (any status) plus units
  // you've added yourself but haven't booked yet — distinct from the
  // curated global search on the booking flow's Select Unit screen.
  const byUnit = new Map<string, UnitWithVisit>();
  const today = todayIso();

  for (const row of (appointments ?? []) as AppointmentWithUnit[]) {
    if (!row.units) continue;
    const isPastVisit = row.appointment_date <= today;
    const existing = byUnit.get(row.units.id);
    if (!existing) {
      byUnit.set(row.units.id, {
        unit: row.units,
        lastVisit: isPastVisit ? row.appointment_date : null,
      });
    } else if (
      isPastVisit &&
      (!existing.lastVisit || row.appointment_date > existing.lastVisit)
    ) {
      existing.lastVisit = row.appointment_date;
    }
  }

  for (const unit of (ownUnits ?? []) as Unit[]) {
    if (!byUnit.has(unit.id)) {
      byUnit.set(unit.id, { unit, lastVisit: null });
    }
  }

  const q = params.q?.trim().toLowerCase() ?? "";
  const filtered = Array.from(byUnit.values()).filter(({ unit }) => {
    if (!q) return true;
    return (
      unit.name.toLowerCase().includes(q) ||
      unit.hospital_or_facility_name.toLowerCase().includes(q) ||
      (unit.location_area ?? "").toLowerCase().includes(q)
    );
  });

  const typeOrder = Object.keys(UNIT_TYPE_LABELS);
  const presentTypes = Array.from(new Set(filtered.map(({ unit }) => unit.type)));
  presentTypes.sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    return (ai === -1 ? typeOrder.length : ai) - (bi === -1 ? typeOrder.length : bi);
  });

  const groups = presentTypes.map((type) => ({
    type,
    units: filtered
      .filter((entry) => entry.unit.type === type)
      .sort((a, b) => a.unit.name.localeCompare(b.unit.name)),
  }));

  const hasError = Boolean(error || ownError);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">Your care units</h1>
        <Link
          href="/units/new"
          className="inline-flex items-center justify-center rounded-[9px] bg-accent px-4 py-2.5 text-[13.5px] font-bold text-surface transition-colors hover:bg-accent-hover"
        >
          + Add unit
        </Link>
      </div>

      <form method="GET" className="flex items-end gap-3">
        <div className="flex-1">
          <Field label="Search" htmlFor="q">
            <Input
              id="q"
              name="q"
              type="text"
              defaultValue={params.q ?? ""}
              placeholder="Search units…"
            />
          </Field>
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {hasError && (
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load your units right now. Try refreshing.
        </Card>
      )}

      {!hasError && filtered.length === 0 && (
        <Card className="text-sm text-muted">
          {q
            ? `No units matched "${params.q}".`
            : "No care units yet. Add one, or book an appointment to start tracking one automatically."}
        </Card>
      )}

      {!hasError && filtered.length > 0 && (
        <div className="flex flex-col gap-[22px]">
          {groups.map((group) => (
            <div key={group.type}>
              <p className="mb-2.5 text-[12.5px] font-bold tracking-wide text-muted uppercase">
                {unitTypeLabel(group.type)}
              </p>
              <div className="flex flex-col gap-2">
                {group.units.map(({ unit, lastVisit }) => (
                  <Link
                    key={unit.id}
                    href={`/units/${unit.id}`}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 py-[13px] transition-colors hover:border-accent"
                  >
                    <p className="text-[14.5px] font-bold text-foreground">{unit.name}</p>
                    <p className="shrink-0 text-[13px] text-muted">
                      {lastVisit ? `Last visit ${formatDate(lastVisit)}` : "No visits yet"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
