import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createUnitAction } from "../actions";
import { TypeSelector } from "../type-selector";

export default async function NewUnitPage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/units" className="text-[13.5px] font-semibold text-muted hover:text-foreground">
        &larr; All units
      </Link>

      <Card className="flex max-w-lg flex-col gap-5 p-6 sm:p-[28px_32px]">
        <h1 className="text-xl font-bold text-foreground">Add a care unit</h1>
        <form action={createUnitAction} className="flex flex-col gap-4">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" type="text" placeholder="e.g. Dr. Tan Wei Ming" required />
          </Field>
          <Field label="Type" htmlFor="type">
            <TypeSelector />
          </Field>
          {/* hospital_or_facility_name is required by the schema but has no
              matching field in the mockup's form (Name/Type/Address/Phone
              only) — kept since the data is genuinely required elsewhere
              (card titles, detail subtitle). Phone has no backing column
              at all, so it's dropped rather than added as a dead field —
              see BUILD_NOTES.md if this needs revisiting. */}
          <Field label="Facility name" htmlFor="hospital_or_facility_name">
            <Input
              id="hospital_or_facility_name"
              name="hospital_or_facility_name"
              type="text"
              placeholder="e.g. Gleneagles Penang"
              required
            />
          </Field>
          <Field label="Address" htmlFor="location_area" helper="Optional, e.g. Georgetown, Bayan Lepas">
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
