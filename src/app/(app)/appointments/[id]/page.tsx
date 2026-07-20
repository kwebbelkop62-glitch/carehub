import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Textarea } from "@/components/ui/field";
import { formatDate, formatTime, todayIso } from "@/lib/format";
import {
  matchLeadTime,
  REMINDER_LEAD_TIME_LABELS,
  type ReminderLeadTimeKey,
} from "@/lib/reminders";
import type { AppointmentWithUnitAndPatient, Document, Reminder } from "@/lib/types";
import {
  cancelAppointmentAction,
  editAppointmentAction,
  markAppointmentStatusAction,
  setReminderLeadTimeAction,
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

  const [{ data: appointment }, { data: reminder }, { data: documents }] =
    await Promise.all([
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
      supabase
        .from("documents")
        .select("*")
        .eq("appointment_id", id)
        .order("uploaded_at", { ascending: false }),
    ]);

  if (!appointment) {
    redirect("/upcoming");
  }

  const typedAppointment = appointment as AppointmentWithUnitAndPatient;
  const typedReminder = reminder as Reminder | null;
  const documentList = (documents ?? []) as Document[];

  const signedUrls = new Map<string, string>();
  for (const doc of documentList) {
    const { data: signed } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 3600);
    if (signed) signedUrls.set(doc.id, signed.signedUrl);
  }

  const isPast = typedAppointment.appointment_date < todayIso();
  const isPending = typedAppointment.status === "pending";
  const isAttended = typedAppointment.status === "attended";
  const canEditOrCancel = isPending && !isPast;
  const canMarkAttendedOrMissed = isPending && isPast;
  const canMarkCompleted = isAttended;
  const canEditReminderLeadTime = canEditOrCancel && Boolean(typedReminder);
  const activeLeadTime = typedReminder
    ? matchLeadTime(
        typedAppointment.appointment_date,
        typedAppointment.appointment_time,
        typedReminder.remind_at,
      )
    : null;
  const rescheduleHref =
    `/appointments/new/time?patient=${typedAppointment.patient_id}` +
    `&unit=${typedAppointment.unit_id}` +
    `&date=${typedAppointment.appointment_date}` +
    `&time=${typedAppointment.appointment_time.slice(0, 5)}` +
    `&reschedule=${typedAppointment.id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {typedAppointment.units.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            For {typedAppointment.patients.full_name}
          </p>
        </div>
        <Badge status={typedAppointment.status} />
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Date &amp; time
          </p>
          <p className="text-sm text-foreground">
            {formatDate(typedAppointment.appointment_date)} at{" "}
            {formatTime(typedAppointment.appointment_time)}
          </p>
        </div>
        {typedAppointment.notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Notes
            </p>
            <p className="text-sm text-foreground">{typedAppointment.notes}</p>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Reminder
          </p>
          {typedReminder && <Badge status={typedReminder.status} />}
        </div>
        {typedReminder ? (
          <p className="text-sm text-muted">
            {formatDate(typedReminder.remind_at.slice(0, 10))} at{" "}
            {formatTime(typedReminder.remind_at.slice(11, 16))} via email
          </p>
        ) : (
          <p className="text-sm text-muted">No reminder scheduled.</p>
        )}

        {canEditReminderLeadTime && (
          <div className="flex flex-wrap gap-2 pt-1">
            {(
              Object.entries(REMINDER_LEAD_TIME_LABELS) as [
                ReminderLeadTimeKey,
                string,
              ][]
            ).map(([key, label]) => (
              <form key={key} action={setReminderLeadTimeAction}>
                <input type="hidden" name="appointmentId" value={typedAppointment.id} />
                <input type="hidden" name="leadTime" value={key} />
                <button
                  type="submit"
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeLeadTime === key
                      ? "border-accent bg-accent-fill text-white"
                      : "border-border bg-surface text-muted hover:bg-tint"
                  }`}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        )}
      </Card>

      {canMarkAttendedOrMissed && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-muted">
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
              <input type="hidden" name="status" value="missed" />
              <Button type="submit" variant="danger">
                Did not attend
              </Button>
            </form>
          </div>
        </Card>
      )}

      {canMarkCompleted && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            A separate step once everything about this visit (results, notes)
            is wrapped up.
          </p>
          <form action={markAppointmentStatusAction}>
            <input type="hidden" name="id" value={typedAppointment.id} />
            <input type="hidden" name="status" value="completed" />
            <Button type="submit" variant="secondary" className="self-start">
              Mark completed
            </Button>
          </form>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Attached documents
        </p>
        {documentList.length === 0 ? (
          <p className="text-sm text-muted">No documents attached yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {documentList.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <p className="text-sm font-medium text-foreground">
                  {doc.file_name}
                </p>
                {signedUrls.has(doc.id) ? (
                  <a
                    href={signedUrls.get(doc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm font-medium text-accent-hover hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-muted">
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <LinkButton
          href={`/documents?appointment=${typedAppointment.id}`}
          variant="ghost"
          className="self-start px-0"
        >
          + Add document
        </LinkButton>
      </Card>

      {canEditOrCancel && (
        <Card className="flex flex-col gap-4">
          <form action={editAppointmentAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={typedAppointment.id} />
            <Field label="Notes" htmlFor="notes" helper="Optional">
              <Textarea id="notes" name="notes" defaultValue={typedAppointment.notes ?? ""} />
            </Field>
            <Button type="submit" variant="secondary" className="self-start">
              Save notes
            </Button>
          </form>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <LinkButton href={rescheduleHref} variant="secondary" className="flex-1">
              Reschedule
            </LinkButton>
            <form action={cancelAppointmentAction} className="flex-1">
              <input type="hidden" name="id" value={typedAppointment.id} />
              <Button type="submit" variant="danger" className="w-full">
                Cancel appointment
              </Button>
            </form>
          </div>
          <p className="text-xs text-muted">
            Reschedule keeps the same unit, dependant, and reminder
            lead-time — the reminder recalculates automatically off the new
            time.
          </p>
        </Card>
      )}
    </div>
  );
}
