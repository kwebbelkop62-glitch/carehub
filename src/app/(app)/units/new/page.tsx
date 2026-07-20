import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { UNIT_TYPE_LABELS } from "@/lib/types";
import { createUnitAction } from "../actions";

export default async function NewUnitPage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/units" className="text-sm font-medium text-muted hover:text-foreground">
        &larr; All units
      </Link>

      <Card className="flex max-w-lg flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Add a care unit
        </h1>
        <form action={createUnitAction} className="flex flex-col gap-4">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" type="text" placeholder="e.g. Dr. Tan Wei Ming" required />
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
            <Input
              id="hospital_or_facility_name"
              name="hospital_or_facility_name"
              type="text"
              placeholder="e.g. Gleneagles Penang"
              required
            />
          </Field>
          <Field label="Area" htmlFor="location_area" helper="Optional, e.g. Georgetown, Bayan Lepas">
            <Input id="location_area" name="location_area" type="text" />
          </Field>
          <Button type="submit" className="self-start">
            Save unit
          </Button>
        </form>
      </Card>
    </div>
  );
}
