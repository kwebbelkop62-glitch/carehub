import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { Patient, Unit } from "@/lib/types";
import { addUnitAction } from "./actions";

// Guessed labels for the free-text `type` column — see BUILD_NOTES.md.
const UNIT_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  lab: "Lab",
  scan_center: "Scan Center",
};

export default async function SelectUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; q?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });
  const patientList = (patients ?? []) as Patient[];

  if (patientList.length === 0 || !appUser) {
    redirect("/profile");
  }

  const selectedPatientId = params.patient ?? patientList[0].id;
  if (!params.patient) {
    redirect(`/appointments/new/unit?patient=${selectedPatientId}`);
  }

  const q = params.q?.trim() ?? "";

  let query = supabase
    .from("units")
    .select("*")
    .or(`added_by_user_id.is.null,added_by_user_id.eq.${appUser.id}`);

  if (q) {
    const escaped = q.replace(/[%,()]/g, "");
    query = query.or(
      `name.ilike.%${escaped}%,hospital_or_facility_name.ilike.%${escaped}%,location_area.ilike.%${escaped}%`,
    );
  }

  const { data: units, error } = await query
    .order("name", { ascending: true })
    .limit(30);
  const results = (units ?? []) as Unit[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Select a unit
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Search hospital units, clinics, labs, and scan centers.
        </p>
      </div>

      {patientList.length > 1 && (
        <form method="GET" className="flex items-end gap-3">
          <input type="hidden" name="q" value={q} />
          <div className="flex-1">
            <Field label="For" htmlFor="patient">
              <Select id="patient" name="patient" defaultValue={selectedPatientId}>
                {patientList.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" variant="secondary">
            Switch
          </Button>
        </form>
      )}

      <form method="GET" className="flex items-end gap-3">
        <input type="hidden" name="patient" value={selectedPatientId} />
        <div className="flex-1">
          <Field label="Search" htmlFor="q">
            <Input
              id="q"
              name="q"
              type="text"
              defaultValue={q}
              placeholder="e.g. Penang General, cardiology, Bayan Lepas"
            />
          </Field>
        </div>
        <Button type="submit">Search</Button>
      </form>

      {error && (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
          Couldn&apos;t load units right now. Try refreshing.
        </Card>
      )}

      {!error && results.length === 0 && (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          No units matched &quot;{q}&quot;. Try a different search, or add it below.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {results.map((unit) => (
          <Link
            key={unit.id}
            href={`/appointments/new/time?patient=${selectedPatientId}&unit=${unit.id}`}
          >
            <Card className="transition-colors hover:border-emerald-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{unit.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {unit.hospital_or_facility_name}
                    {unit.location_area ? ` · ${unit.location_area}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {UNIT_TYPE_LABELS[unit.type] ?? unit.type}
                </span>
              </div>
              {unit.added_by_user_id === appUser.id && (
                <p className="mt-2 text-xs text-zinc-400">Added by you</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <details className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Can&apos;t find it? Add a clinic
        </summary>
        <form action={addUnitAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="patient" value={selectedPatientId} />
          <Field label="Clinic or unit name" htmlFor="name">
            <Input id="name" name="name" type="text" required />
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" name="type" defaultValue="clinic" required>
              {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Facility name" htmlFor="hospital_or_facility_name">
            <Input id="hospital_or_facility_name" name="hospital_or_facility_name" type="text" required />
          </Field>
          <Field label="Area" htmlFor="location_area" helper="Optional, e.g. Georgetown, Bayan Lepas">
            <Input id="location_area" name="location_area" type="text" />
          </Field>
          <Button type="submit" className="self-start">
            Add and continue
          </Button>
        </form>
      </details>
    </div>
  );
}
