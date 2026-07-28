export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "Fri, 24 Jul" — CareHub Dashboard.dc.html's day-section headers (no
// year, unlike formatDate).
export function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return date.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" });
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Combines an appointment's date + time into a real Date and checks it
// against right now — unlike a plain `appointment_date < todayIso()`
// comparison, this flips the moment the appointment's actual time passes,
// not just at midnight. appointment_time may come back from Supabase as
// "HH:MM" or "HH:MM:SS" (see the reminder-crash fix), so pad it to
// seconds before parsing. Falls back to a date-only comparison if
// appointmentTime is missing/empty, same behavior as before.
//
// CareHub is Penang/Malaysia-only (see src/lib/reminders.ts's MY_OFFSET
// comment for the full reasoning) -- the "+08:00" below is required, not
// optional. Without it, this string is parsed as local time of whatever
// machine runs the code (UTC on Vercel), not Malaysia time, which is the
// exact bug computeRemindAt had before that fix: every check would flip
// 8 hours later than a real Malaysia clock.
export function isAppointmentPast(appointmentDate: string, appointmentTime?: string | null): boolean {
  if (!appointmentTime) {
    return appointmentDate < todayIso();
  }
  const time = appointmentTime.length === 5 ? `${appointmentTime}:00` : appointmentTime;
  const appointmentDateTime = new Date(`${appointmentDate}T${time}+08:00`);
  return appointmentDateTime.getTime() < Date.now();
}

export function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(`${baseIso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// "In 2 hours" / "Yesterday" / "3 days ago" — CareHub Lists.dc.html's
// Notifications screen style. Falls back to whole days beyond a week
// rather than guessing at a mockup value for weeks/months, since none is
// shown there.
export function relativeTime(isoTimestamp: string): string {
  const diffMs = new Date(isoTimestamp).getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);

  if (Math.abs(minutes) < 1) return "Just now";
  if (diffMs > 0) {
    if (Math.abs(minutes) < 60) return `In ${minutes} minute${minutes === 1 ? "" : "s"}`;
    if (Math.abs(hours) < 24) return `In ${hours} hour${hours === 1 ? "" : "s"}`;
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  }
  const absMinutes = Math.abs(minutes);
  const absHours = Math.abs(hours);
  const absDays = Math.abs(days);
  if (absMinutes < 60) return `${absMinutes} minute${absMinutes === 1 ? "" : "s"} ago`;
  if (absHours < 24) return `${absHours} hour${absHours === 1 ? "" : "s"} ago`;
  if (absDays === 1) return "Yesterday";
  return `${absDays} days ago`;
}
