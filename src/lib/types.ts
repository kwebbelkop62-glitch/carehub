// Mirrors the live Supabase schema exactly (introspected via the PostgREST
// OpenAPI endpoint, six tables: users, patients, units, appointments,
// reminders, documents). Do not add or rename columns here without a
// matching, deliberate change to the live schema.

export type User = {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  relationship_to_owner: string;
  created_at: string;
};

// Confirmed against the live CHECK constraint (not a guess) — 2026-07-16.
export type UnitType =
  | "specialist_clinic"
  | "laboratory"
  | "scan_center"
  | "physiotherapy"
  | "rehabilitation_clinic"
  | "general_clinic"
  | "private_clinic";

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  specialist_clinic: "Specialist Clinic",
  laboratory: "Laboratory",
  scan_center: "Scan Center",
  physiotherapy: "Physiotherapy",
  rehabilitation_clinic: "Rehabilitation Clinic",
  general_clinic: "General Clinic",
  private_clinic: "Private Clinic",
};

// `units.type` comes back from the DB as a plain string, not narrowed to
// UnitType, so callers look it up through this instead of indexing
// UNIT_TYPE_LABELS directly.
export function unitTypeLabel(type: string): string {
  return (UNIT_TYPE_LABELS as Record<string, string>)[type] ?? type;
}

export type Unit = {
  id: string;
  name: string;
  type: string;
  hospital_or_facility_name: string;
  location_area: string | null;
  added_by_user_id: string | null;
  created_at: string;
};

// Confirmed against the live CHECK constraint (not a guess) — 2026-07-16.
// Default is "pending". "missed" exists in the DB but no screen currently
// sets it — see BUILD_NOTES.md.
export type AppointmentStatus =
  | "pending"
  | "attended"
  | "completed"
  | "cancelled"
  | "missed";

export type Appointment = {
  id: string;
  patient_id: string;
  unit_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
};

// Guessed: Resend is email-only per the brief, so "email" is the only
// channel currently produced by app code. Free text column. See BUILD_NOTES.md.
export type ReminderChannel = "email";

// Confirmed against the live CHECK constraint (not a guess) — 2026-07-16.
// "cancelled" is set by app code when the parent appointment is cancelled,
// so a not-yet-built send job would know to skip it.
export type ReminderStatus = "pending" | "sent" | "cancelled" | "failed";

export type Reminder = {
  id: string;
  appointment_id: string;
  remind_at: string;
  channel: string;
  status: string;
  created_at: string;
};

export type Document = {
  id: string;
  appointment_id: string;
  uploaded_by_user_id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
};

export type AppointmentWithUnit = Appointment & { units: Unit };
export type AppointmentWithUnitAndPatient = Appointment & {
  units: Unit;
  patients: Patient;
};
