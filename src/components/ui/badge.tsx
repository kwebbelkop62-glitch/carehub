// Five distinct status treatments per DESIGN.md §2 / CareHub Records.dc.html
// (dot + bg + text per status) — not collapsed into a single tint bucket.
// reminders.status ("sent"/"failed") isn't part of that table, so it
// reuses the closest semantic bucket: sent -> attended (done/success),
// failed -> missed (error), matching how those statuses were already
// grouped before this pass.
const statusClasses: Record<string, string> = {
  pending: "bg-status-upcoming-bg text-status-upcoming-text",
  attended: "bg-status-attended-bg text-status-attended-text",
  completed: "bg-status-completed-bg text-status-completed-text",
  sent: "bg-status-attended-bg text-status-attended-text",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-text",
  missed: "bg-status-missed-bg text-status-missed-text",
  failed: "bg-status-missed-bg text-status-missed-text",
};

const dotClasses: Record<string, string> = {
  pending: "bg-status-upcoming-dot",
  attended: "bg-status-attended-dot",
  completed: "bg-status-completed-dot",
  sent: "bg-status-attended-dot",
  cancelled: "bg-status-cancelled-dot",
  missed: "bg-status-missed-dot",
  failed: "bg-status-missed-dot",
};

// "pending" (appointments.status) reads as "Upcoming" everywhere in the
// mockups (hero cards, unit visit history, the appointment-detail status
// pill) — the raw enum value is never shown as-is. Other statuses match
// their capitalized raw form already, so only "pending" needs a mapping.
const statusText: Record<string, string> = {
  pending: "Upcoming",
};

export function Badge({ status }: { status: string }) {
  const classes = statusClasses[status] ?? "bg-tint text-muted";
  const dot = dotClasses[status] ?? "bg-muted-icon";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {statusText[status] ?? status}
    </span>
  );
}
