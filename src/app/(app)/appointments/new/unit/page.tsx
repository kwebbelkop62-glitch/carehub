import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { UNIT_TYPE_LABELS, unitTypeLabel } from "@/lib/types";
import type { Patient, Unit } from "@/lib/types";
import { addUnitAction } from "./actions";

export default async function SelectUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; q?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });
  const patientList = (patients ?? []) as Patient[];

  if (!appUser) {
    redirect("/sign-in");
  }

  if (patientsError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Select a unit
        </h1>
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load your patients right now. Try refreshing.
        </Card>
      </div>
    );
  }

  if (patientList.length === 0) {
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
        <p className="mt-1 text-sm text-muted">
          Search specialist clinics, labs, scan centers, and more.
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
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load units right now. Try refreshing.
        </Card>
      )}

      {!error && results.length === 0 && (
        <Card className="text-sm text-muted">
          No units matched &quot;{q}&quot;. Try a different search, or add it below.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {results.map((unit) => (
          <Link
            key={unit.id}
            href={`/appointments/new/time?patient=${selectedPatientId}&unit=${unit.id}`}
          >
            <Card className="transition-colors hover:border-accent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{unit.name}</p>
                  <p className="text-sm text-muted">
                    {unit.hospital_or_facility_name}
                    {unit.location_area ? ` · ${unit.location_area}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-tint px-2.5 py-1 text-xs font-medium capitalize text-accent-hover">
                  {unitTypeLabel(unit.type)}
                </span>
              </div>
              {unit.added_by_user_id === appUser.id && (
                <p className="mt-2 text-xs text-muted">Added by you</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <details className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Can&apos;t find it? Add a clinic
        </summary>
        <form action={addUnitAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="patient" value={selectedPatientId} />
          <Field label="Clinic or unit name" htmlFor="name">
            <Input id="name" name="name" type="text" required />
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" name="type" defaultValue="private_clinic" required>
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
