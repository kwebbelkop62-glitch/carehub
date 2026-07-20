"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeRemindAt,
  REMINDER_LEAD_TIME_LABELS,
  type ReminderLeadTimeKey,
} from "@/lib/reminders";

// Date/time changes now go through Reschedule (which reuses the booking
// flow's Date & Time step) instead of this inline form, so Edit only ever
// touches notes — see appointments/new/confirm/actions.ts for the
// reschedule path.
export async function editAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) {
    throw new Error("Missing appointment id.");
  }

  const supabase = createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ notes: notes || null })
    .eq("id", id);

  if (updateError) throw updateError;

  redirect(`/appointments/${id}`);
}

export async function cancelAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing appointment id.");

  const supabase = createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) throw updateError;

  await supabase
    .from("reminders")
    .update({ status: "cancelled" })
    .eq("appointment_id", id);

  redirect(`/appointments/${id}`);
}

const SETTABLE_STATUSES = ["attended", "completed", "missed"];

export async function markAppointmentStatusAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !SETTABLE_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) throw error;

  redirect(`/appointments/${id}`);
}

// Lets the user pick when the (not-yet-built) reminder send job should fire
// — see computeRemindAt in lib/reminders.ts for why this doesn't need a
// schema change.
export async function setReminderLeadTimeAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const leadTime = String(formData.get("leadTime") ?? "") as ReminderLeadTimeKey;

  if (!appointmentId || !(leadTime in REMINDER_LEAD_TIME_LABELS)) {
    throw new Error("Invalid reminder lead time.");
  }

  const supabase = createServerSupabaseClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("appointment_date, appointment_time")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  const remindAt = computeRemindAt(
    appointment.appointment_date,
    appointment.appointment_time,
    leadTime,
  );

  const { error } = await supabase
    .from("reminders")
    .update({ remind_at: remindAt })
    .eq("appointment_id", appointmentId);

  if (error) throw error;

  redirect(`/appointments/${appointmentId}`);
}
