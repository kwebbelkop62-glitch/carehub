import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { UNIT_TYPE_LABELS } from "@/lib/types";
import type { Unit } from "@/lib/types";
import { deleteUnitAction, updateUnitAction } from "../../actions";

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();
  const { data: unit } = await supabase.from("units").select("*").eq("id", id).maybeSingle();

  if (!unit) {
    redirect("/units");
  }

  const typedUnit = unit as Unit;

  // Curated (shared) units have no owner and can't be edited by anyone.
  if (typedUnit.added_by_user_id !== appUser.id) {
    redirect(`/units/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/units/${id}`}
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        &larr; {typedUnit.name}
      </Link>

      <Card className="flex max-w-lg flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Edit care unit
        </h1>
        <form action={updateUnitAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={typedUnit.id} />
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" type="text" defaultValue={typedUnit.name} required />
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" name="type" defaultValue={typedUnit.type} required>
              {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Facility name" htmlFor="hospital_or_facility_name">
            <Input
              id="hospital_or_facility_name"
              name="hospital_or_facility_name"
              type="text"
              defaultValue={typedUnit.hospital_or_facility_name}
              required
            />
          </Field>
          <Field label="Area" htmlFor="location_area" helper="Optional, e.g. Georgetown, Bayan Lepas">
            <Input id="location_area" name="location_area" type="text" defaultValue={typedUnit.location_area ?? ""} />
          </Field>
          <Button type="submit" className="self-start">
            Save unit
          </Button>
        </form>

        <form action={deleteUnitAction} className="border-t border-border pt-4">
          <input type="hidden" name="id" value={typedUnit.id} />
          <Button type="submit" variant="danger">
            Delete unit
          </Button>
        </form>
      </Card>
    </div>
  );
}
