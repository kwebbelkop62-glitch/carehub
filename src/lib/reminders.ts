// Reminder lead time isn't a stored column — only `reminders.remind_at`
// (an absolute timestamp) exists in the schema. These presets compute that
// timestamp from an appointment's date/time, so a UI can offer a picker
// without a schema change. See BUILD_NOTES.md re: the original flat 24h
// guess this replaces.

export type ReminderLeadTimeKey = "1hr" | "morning" | "1day" | "2day";

export const REMINDER_LEAD_TIME_LABELS: Record<ReminderLeadTimeKey, string> = {
  "1hr": "1 hour before",
  morning: "Morning of",
  "1day": "1 day before",
  "2day": "2 days before",
};

const HOURS_BEFORE: Record<Exclude<ReminderLeadTimeKey, "morning">, number> = {
  "1hr": 1,
  "1day": 24,
  "2day": 48,
};

// "Morning of" is a fixed time-of-day (7am on the appointment's own date),
// not a fixed duration before — the other three presets are.
const MORNING_OF_HOUR = 7;

// `time` is "HH:MM" when it comes fresh from the booking flow's own presets,
// but "HH:MM:SS" once it's round-tripped through Postgres's `time` column
// (appointments.appointment_time) — normalize before building a Date string
// or the seconds get double-appended (e.g. "11:00:00:00", an invalid Date).
function toHHMM(time: string): string {
  return time.slice(0, 5);
}

export function computeRemindAt(
  date: string,
  time: string,
  leadTime: ReminderLeadTimeKey,
): string {
  if (leadTime === "morning") {
    return new Date(
      `${date}T${String(MORNING_OF_HOUR).padStart(2, "0")}:00:00`,
    ).toISOString();
  }
  const appointmentDateTime = new Date(`${date}T${toHHMM(time)}:00`);
  return new Date(
    appointmentDateTime.getTime() - HOURS_BEFORE[leadTime] * 60 * 60 * 1000,
  ).toISOString();
}

// Which preset (if any) an existing remind_at matches, so a picker can show
// its active state. Returns null for rows that don't line up with a preset
// exactly (e.g. a reschedule-preserved custom delta).
export function matchLeadTime(
  date: string,
  time: string,
  remindAt: string,
): ReminderLeadTimeKey | null {
  const keys = Object.keys(REMINDER_LEAD_TIME_LABELS) as ReminderLeadTimeKey[];
  for (const key of keys) {
    if (computeRemindAt(date, time, key) === remindAt) return key;
  }
  return null;
}

// Reschedule support: keep the same lead time (the gap between the old
// remind_at and the old appointment datetime) applied to the new datetime,
// rather than resetting every reschedule back to a flat default.
export function preserveLeadTime(
  oldDate: string,
  oldTime: string,
  oldRemindAt: string,
  newDate: string,
  newTime: string,
): string {
  const oldDateTime = new Date(`${oldDate}T${toHHMM(oldTime)}:00`).getTime();
  const delta = oldDateTime - new Date(oldRemindAt).getTime();
  const newDateTime = new Date(`${newDate}T${toHHMM(newTime)}:00`).getTime();
  return new Date(newDateTime - delta).toISOString();
}
