// Most statuses share the purple tint treatment (matches
// design-reference/mockup.html's badge styling, and the tint token is
// explicitly described as "badge background" in the token spec).
// cancelled stays neutral/de-emphasized. missed/failed are kept as a
// genuine red warning rather than folded into purple — they're real
// problem states worth not blending into the calm palette.
const statusClasses: Record<string, string> = {
  pending: "bg-tint text-accent-hover",
  attended: "bg-tint text-accent-hover",
  completed: "bg-tint text-accent-hover",
  sent: "bg-tint text-accent-hover",
  cancelled: "bg-border text-muted",
  missed: "bg-error-bg text-error",
  failed: "bg-error-bg text-error",
};

export function Badge({ status }: { status: string }) {
  const classes = statusClasses[status] ?? "bg-tint text-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}>
      {status}
    </span>
  );
}
