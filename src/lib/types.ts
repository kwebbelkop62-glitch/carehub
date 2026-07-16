// Mirrors the live Supabase schema exactly (introspected via the PostgREST
// OpenAPI endpoint, six tables: users, patients, units, appointments,
// reminders, documents). Do not add or rename columns here without a
// matching, deliberate change to the live schema.

export type User = {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
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

export type UnitType = "hospital" | "clinic" | "lab" | "scan_center";

// UnitType values above are a guess inferred from the brief's wording
// ("hospital units, clinics, labs, and scan centers") — the `type` column
// itself is free text with no visible CHECK constraint. See BUILD_NOTES.md.
export type Unit = {
  id: string;
  name: string;
  type: string;
  hospital_or_facility_name: string;
  location_area: string | null;
  added_by_user_id: string | null;
  created_at: string;
};

// Guessed from the brief's History screen wording ("attended, completed, or
// pending") plus the need for a cancel action on Appointment Detail. Free
// text column, no visible CHECK constraint. See BUILD_NOTES.md.
export type AppointmentStatus = "pending" | "attended" | "completed" | "cancelled";

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

// Guessed lifecycle for a Resend-backed reminder row. Free text column.
// "cancelled" is set by app code when the parent appointment is cancelled,
// so a not-yet-built send job would know to skip it. See BUILD_NOTES.md.
export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";

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
