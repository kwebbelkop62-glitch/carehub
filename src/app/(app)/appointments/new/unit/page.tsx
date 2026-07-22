import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Field, Input, Select } from "@/components/ui/field";
import { UNIT_TYPE_LABELS, unitTypeLabel } from "@/lib/types";
import type { Patient, Unit } from "@/lib/types";
import { addUnitAction } from "./actions";
import { BookingProgress, StepEyebrow } from "../booking-progress";

export default async function SelectUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*");
  const patientList = (patients ?? []) as Patient[];

  if (!patientsError && patientList.length === 0) {
    redirect("/profile");
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
    <div className="mx-auto w-full max-w-[520px] rounded-[20px] border border-border bg-surface p-6 sm:p-[36px_40px]">
      <BookingProgress step={1} />
      <StepEyebrow step={1} />
      <h1 className="mb-2 text-xl font-bold text-foreground">Where&apos;s this appointment?</h1>
      <p className="mb-5 text-sm leading-relaxed text-muted">
        Search a unit you&apos;ve added before, or add a new one.
      </p>

      <form method="GET" className="mb-4">
        <Input id="q" name="q" type="text" defaultValue={q} placeholder="Search your units…" aria-label="Search your units" />
      </form>

      {patientsError && (
        <p className="mb-4 text-sm text-error">Couldn&apos;t load your patients right now.</p>
      )}
      {error && <p className="mb-4 text-sm text-error">Couldn&apos;t load units right now.</p>}

      {!error && results.length === 0 && (
        <p className="mb-4 rounded-[10px] bg-accent-secondary-tint px-3.5 py-3 text-[13.5px] text-accent-secondary">
          No unit matches &quot;{q}&quot;
        </p>
      )}

      <div className="mb-3 flex flex-col gap-2">
        {results.map((unit) => (
          <Link
            key={unit.id}
            href={`/appointments/new/dependant?unit=${unit.id}`}
            className="rounded-[10px] border-[1.5px] border-border px-3.5 py-3 transition-colors hover:border-accent"
          >
            <p className="text-sm font-bold text-foreground">{unit.name}</p>
            <p className="text-[12.5px] text-muted">
              {unitTypeLabel(unit.type)} &middot; {unit.hospital_or_facility_name}
              {unit.location_area ? ` · ${unit.location_area}` : ""}
            </p>
          </Link>
        ))}
      </div>

      <details className="group">
        <summary className="mb-5 cursor-pointer list-none rounded-[9px] bg-accent-secondary-tint px-3.5 py-2.5 text-center text-sm font-semibold text-accent-secondary">
          + Add a new unit
        </summary>
        <form action={addUnitAction} className="mt-3 mb-5 flex flex-col gap-3.5">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" type="text" placeholder="e.g. Island Hospital" required />
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
          <button
            type="submit"
            className="w-full rounded-[10px] bg-accent px-3 py-3 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            Add and continue
          </button>
        </form>
      </details>
    </div>
  );
}
