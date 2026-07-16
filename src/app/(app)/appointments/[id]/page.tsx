import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";
import { formatDate, formatTime, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Reminder } from "@/lib/types";
import {
  cancelAppointmentAction,
  editAppointmentAction,
  markAppointmentStatusAction,
} from "./actions";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  const [{ data: appointment }, { data: reminder }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, units(*), patients(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("reminders")
      .select("*")
      .eq("appointment_id", id)
      .maybeSingle(),
  ]);

  if (!appointment) {
    redirect("/upcoming");
  }

  const typedAppointment = appointment as AppointmentWithUnitAndPatient;
  const typedReminder = reminder as Reminder | null;

  const isPast = typedAppointment.appointment_date < todayIso();
  const isPending = typedAppointment.status === "pending";
  const canEditOrCancel = isPending && !isPast;
  const canMarkOutcome = isPending && isPast;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {typedAppointment.units.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            For {typedAppointment.patients.full_name}
          </p>
        </div>
        <Badge status={typedAppointment.status} />
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Unit
          </p>
          <p className="text-sm text-foreground">
            {typedAppointment.units.hospital_or_facility_name}
            {typedAppointment.units.location_area
              ? ` · ${typedAppointment.units.location_area}`
              : ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Date &amp; time
          </p>
          <p className="text-sm text-foreground">
            {formatDate(typedAppointment.appointment_date)} at{" "}
            {formatTime(typedAppointment.appointment_time)}
          </p>
        </div>
        {typedAppointment.notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Notes
            </p>
            <p className="text-sm text-foreground">{typedAppointment.notes}</p>
          </div>
        )}
      </Card>

      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Reminder
          </p>
          {typedReminder ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDate(typedReminder.remind_at.slice(0, 10))} at{" "}
              {formatTime(typedReminder.remind_at.slice(11, 16))} via email
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              No reminder scheduled.
            </p>
          )}
        </div>
        {typedReminder && <Badge status={typedReminder.status} />}
      </Card>

      {canMarkOutcome && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This appointment&apos;s date has passed. Update its status:
          </p>
          <div className="flex gap-3">
            <form action={markAppointmentStatusAction}>
              <input type="hidden" name="id" value={typedAppointment.id} />
              <input type="hidden" name="status" value="attended" />
              <Button type="submit" variant="secondary">
                Mark attended
              </Button>
            </form>
            <form action={markAppointmentStatusAction}>
              <input type="hidden" name="id" value={typedAppointment.id} />
              <input type="hidden" name="status" value="completed" />
              <Button type="submit" variant="secondary">
                Mark completed
              </Button>
            </form>
          </div>
        </Card>
      )}

      {canEditOrCancel && (
        <Card className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">Edit appointment</p>
          <form action={editAppointmentAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={typedAppointment.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="date">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  min={todayIso()}
                  defaultValue={typedAppointment.appointment_date}
                  required
                />
              </Field>
              <Field label="Time" htmlFor="time">
                <Input
                  id="time"
                  name="time"
                  type="time"
                  defaultValue={typedAppointment.appointment_time.slice(0, 5)}
                  required
                />
              </Field>
            </div>
            <Field label="Notes" htmlFor="notes" helper="Optional">
              <Textarea id="notes" name="notes" defaultValue={typedAppointment.notes ?? ""} />
            </Field>
            <Button type="submit" className="self-start">
              Save changes
            </Button>
          </form>

          <form action={cancelAppointmentAction} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <input type="hidden" name="id" value={typedAppointment.id} />
            <Button type="submit" variant="danger">
              Cancel appointment
            </Button>
          </form>
        </Card>
      )}

      <LinkButton href={`/documents?appointment=${typedAppointment.id}`} variant="secondary" className="self-start">
        View documents
      </LinkButton>
    </div>
  );
}
