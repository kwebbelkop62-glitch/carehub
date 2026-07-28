import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button, LinkButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { formatDate, formatTime, isAppointmentPast } from "@/lib/format";
import { unitTypeLabel } from "@/lib/types";
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

// dot/bg/text token classes per status, matching CareHub Records.dc.html's
// "Status" pill (border = the same color as the list-badge dot) and its
// status-tinted action buttons — a bigger, bordered treatment distinct
// from the compact <Badge> used in card lists.
const statusPillClasses: Record<string, string> = {
  pending: "border-status-upcoming-dot bg-status-upcoming-bg text-status-upcoming-text",
  attended: "border-status-attended-dot bg-status-attended-bg text-status-attended-text",
  completed: "border-status-completed-dot bg-status-completed-bg text-status-completed-text",
  missed: "border-status-missed-dot bg-status-missed-bg text-status-missed-text",
  cancelled: "border-status-cancelled-dot bg-status-cancelled-bg text-status-cancelled-text",
};

const statusLabel: Record<string, string> = {
  pending: "Upcoming",
  attended: "Attended",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

// reminders.status (pending/sent/cancelled/failed) isn't part of DESIGN.md's
// five-status appointment table, so this reuses the closest semantic
// bucket, same mapping <Badge> uses: sent -> attended, failed -> missed,
// pending/cancelled -> the neutral cancelled tokens.
const reminderStatusTone: Record<string, { dot: string; text: string; label: string }> = {
  pending: { dot: "bg-status-cancelled-dot", text: "text-status-cancelled-text", label: "Pending" },
  sent: { dot: "bg-status-attended-dot", text: "text-status-attended-text", label: "Sent" },
  cancelled: { dot: "bg-status-cancelled-dot", text: "text-status-cancelled-text", label: "Cancelled — won't send" },
  failed: { dot: "bg-status-missed-dot", text: "text-status-missed-text", label: "Failed — retrying" },
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function documentIconBg(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "bg-status-upcoming-bg";
  if (IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "bg-status-attended-bg";
  return "bg-border";
}

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

  const isPast = isAppointmentPast(
    typedAppointment.appointment_date,
    typedAppointment.appointment_time,
  );
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

  const reminderTone = typedReminder
    ? reminderStatusTone[typedReminder.status] ?? reminderStatusTone.pending
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/upcoming" className="text-[13.5px] font-semibold text-muted hover:text-foreground">
        &larr; Back to dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-[26px_28px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground">{typedAppointment.units.name}</h1>
            <p className="text-sm text-muted">
              {unitTypeLabel(typedAppointment.units.type)} &middot; {typedAppointment.units.hospital_or_facility_name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-tint py-[5px] pr-3 pl-[5px]">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-avatar-bg text-[10px] font-bold text-avatar-text">
              {typedAppointment.patients.full_name.charAt(0).toUpperCase()}
            </span>
            <span className="text-[12.5px] font-semibold text-foreground">
              {typedAppointment.patients.relationship_to_owner}
            </span>
          </div>
        </div>
        <p className="mb-[22px] text-sm text-[oklch(.4_.02_60)] dark:text-muted">
          {formatDate(typedAppointment.appointment_date)} &middot; {formatTime(typedAppointment.appointment_time)}
        </p>

        <Eyebrow>Status</Eyebrow>
        <div
          className={`mb-3.5 inline-flex items-center rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-bold ${statusPillClasses[typedAppointment.status] ?? statusPillClasses.pending}`}
        >
          {statusLabel[typedAppointment.status] ?? typedAppointment.status}
        </div>

        {canMarkAttendedOrMissed && (
          <>
            <div className="mb-2.5 flex gap-2">
              <form action={markAppointmentStatusAction} className="flex-1">
                <input type="hidden" name="id" value={typedAppointment.id} />
                <input type="hidden" name="status" value="attended" />
                <button
                  type="submit"
                  className="w-full rounded-[9px] bg-status-attended-bg px-3 py-2.5 text-[13.5px] font-bold text-status-attended-text transition-opacity hover:opacity-90"
                >
                  Mark attended
                </button>
              </form>
              <form action={markAppointmentStatusAction} className="flex-1">
                <input type="hidden" name="id" value={typedAppointment.id} />
                <input type="hidden" name="status" value="missed" />
                <button
                  type="submit"
                  className="w-full rounded-[9px] bg-status-missed-bg px-3 py-2.5 text-[13.5px] font-bold text-status-missed-text transition-opacity hover:opacity-90"
                >
                  Did not attend
                </button>
              </form>
            </div>
            <p className="mb-6 text-xs leading-relaxed text-muted">
              Available once the appointment time has passed. &quot;Did not attend&quot; marks it Missed.
            </p>
          </>
        )}

        {canMarkCompleted && (
          <>
            <form action={markAppointmentStatusAction} className="mb-2.5">
              <input type="hidden" name="id" value={typedAppointment.id} />
              <input type="hidden" name="status" value="completed" />
              <button
                type="submit"
                className="w-full rounded-[9px] bg-status-completed-bg px-3 py-2.5 text-[13.5px] font-bold text-status-completed-text transition-opacity hover:opacity-90"
              >
                Mark completed
              </button>
            </form>
            <p className="mb-6 text-xs leading-relaxed text-muted">
              A separate manual step once everything about this visit (results, notes) is wrapped up.
            </p>
          </>
        )}

        {!canMarkAttendedOrMissed && !canMarkCompleted && <div className="mb-6" />}

        <Eyebrow>Reminder</Eyebrow>
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            Object.entries(REMINDER_LEAD_TIME_LABELS) as [ReminderLeadTimeKey, string][]
          ).map(([key, label]) =>
            canEditReminderLeadTime ? (
              <form key={key} action={setReminderLeadTimeAction}>
                <input type="hidden" name="appointmentId" value={typedAppointment.id} />
                <input type="hidden" name="leadTime" value={key} />
                <button
                  type="submit"
                  className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    activeLeadTime === key
                      ? "border-accent bg-surface text-foreground"
                      : "border-border bg-background text-muted"
                  }`}
                >
                  {label}
                </button>
              </form>
            ) : (
              <span
                key={key}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold ${
                  activeLeadTime === key
                    ? "border-accent bg-surface text-foreground"
                    : "border-border bg-background text-muted"
                }`}
              >
                {label}
              </span>
            ),
          )}
        </div>
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[12.5px] text-muted">Reminder status:</span>
          {typedReminder && reminderTone ? (
            reminderTone === reminderStatusTone.failed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-status-missed-dot bg-status-missed-bg px-2.5 py-1">
                <span className={`h-1.5 w-1.5 rounded-full ${reminderTone.dot}`} />
                <span className={`text-xs font-bold ${reminderTone.text}`}>{reminderTone.label}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${reminderTone.dot}`} />
                <span className={`text-[12.5px] ${reminderTone.text}`}>{reminderTone.label}</span>
              </span>
            )
          ) : (
            <span className="text-[12.5px] text-muted">No reminder scheduled.</span>
          )}
        </div>

        <Eyebrow>Notes</Eyebrow>
        {canEditOrCancel ? (
          <form id="notes" action={editAppointmentAction} className="mb-6 flex flex-col gap-3">
            <input type="hidden" name="id" value={typedAppointment.id} />
            <Textarea
              name="notes"
              aria-label="Notes"
              defaultValue={typedAppointment.notes ?? ""}
              className="!min-h-0 rounded-[10px] bg-[oklch(.96_.008_70)] px-3.5 py-3 text-sm leading-relaxed dark:bg-background"
            />
            <Button type="submit" variant="secondary" className="self-start">
              Save notes
            </Button>
          </form>
        ) : (
          <p
            id="notes"
            className="mb-6 rounded-[10px] bg-[oklch(.96_.008_70)] px-3.5 py-3 text-sm leading-relaxed text-[oklch(.35_.02_60)] dark:bg-background dark:text-foreground"
          >
            {typedAppointment.notes || "No notes added."}
          </p>
        )}

        <Eyebrow>Attached documents</Eyebrow>
        <div className="mb-6 flex flex-col gap-2">
          {documentList.length === 0 && <p className="text-sm text-muted">No documents attached yet.</p>}
          {documentList.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-2.5"
            >
              <span className={`h-8 w-8 shrink-0 rounded-[7px] ${documentIconBg(doc.file_name)}`} />
              <p className="flex-1 truncate text-[13.5px] font-semibold text-foreground">{doc.file_name}</p>
              {signedUrls.has(doc.id) ? (
                <a
                  href={signedUrls.get(doc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[13px] font-semibold text-accent-hover hover:underline"
                >
                  View
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted">Unavailable</span>
              )}
            </div>
          ))}
          <Link
            href={`/documents?appointment=${typedAppointment.id}`}
            className="self-start pt-1 text-[13.5px] font-semibold text-accent-secondary hover:underline"
          >
            + Add document
          </Link>
        </div>

        {canEditOrCancel && (
          <>
            <div className="flex flex-col gap-2.5 border-t border-border pt-3 sm:flex-row">
              <LinkButton href="#notes" variant="secondary" className="flex-1 justify-center">
                Edit
              </LinkButton>
              <LinkButton href={rescheduleHref} variant="secondary" className="flex-1 justify-center">
                Reschedule
              </LinkButton>
              <form action={cancelAppointmentAction} className="flex-1">
                <Button type="submit" variant="danger" className="w-full">
                  Cancel
                </Button>
                <input type="hidden" name="id" value={typedAppointment.id} />
              </form>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted">
              Reschedule keeps the same unit, dependant, and reminder lead-time — the reminder recalculates
              automatically off the new time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[12.5px] font-bold uppercase tracking-wide text-muted">{children}</p>
  );
}
