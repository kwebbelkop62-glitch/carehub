import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { formatDate, todayIso } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { addDependantAction } from "./actions";

export default async function ProfilePage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();
  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });

  const patientList = (patients ?? []) as Patient[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Account details and the people you manage appointments for.
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Name
          </p>
          <p className="text-sm text-foreground">{appUser.full_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Email
          </p>
          <p className="text-sm text-foreground">{appUser.email}</p>
        </div>
        <p className="text-xs text-zinc-400">
          Manage sign-in details from the account menu in the top-right corner.
        </p>
      </Card>

      <div>
        <h2 className="text-lg font-medium text-foreground">
          Patients you manage
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Add yourself and any dependants whose appointments you book.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
          Couldn&apos;t load patients right now. Try refreshing.
        </Card>
      )}

      {!error && patientList.length === 0 && (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          No patients yet. Add yourself below to start booking.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {patientList.map((patient) => (
          <Card key={patient.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{patient.full_name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {patient.relationship_to_owner} &middot; born{" "}
                {formatDate(patient.date_of_birth)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Add a patient</p>
        <form action={addDependantAction} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="full_name">
            <Input id="full_name" name="full_name" type="text" required />
          </Field>
          <Field label="Date of birth" htmlFor="date_of_birth">
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              max={todayIso()}
              required
            />
          </Field>
          <Field
            label="Relationship"
            htmlFor="relationship_to_owner"
            helper="e.g. Self, Child, Parent, Spouse"
          >
            <Input id="relationship_to_owner" name="relationship_to_owner" type="text" required />
          </Field>
          <Button type="submit" className="self-start">
            Add patient
          </Button>
        </form>
      </Card>
    </div>
  );
}
