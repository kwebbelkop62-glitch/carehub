"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeRemindAt,
  preserveLeadTime,
  REMINDER_LEAD_TIME_LABELS,
  type ReminderLeadTimeKey,
} from "@/lib/reminders";

export async function confirmAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const patientId = String(formData.get("patient") ?? "");
  const unitId = String(formData.get("unit") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const reminderInput = String(formData.get("reminder") ?? "1day");
  const leadTime: ReminderLeadTimeKey =
    reminderInput in REMINDER_LEAD_TIME_LABELS ? (reminderInput as ReminderLeadTimeKey) : "1day";

  if (!patientId || !unitId || !date || !time) {
    throw new Error("Missing appointment details.");
  }

  const supabase = createServerSupabaseClient();

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      unit_id: unitId,
      appointment_date: date,
      appointment_time: time,
      status: "pending",
      notes: notes || null,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (appointmentError) throw appointmentError;

  // Lead time picked in the Reminder step (step 4 of the booking flow),
  // defaulting to 1 day before if that step was somehow skipped. This only
  // inserts the row; the actual send job is intentionally not built, see
  // BUILD_NOTES.md.
  const { error: reminderError } = await supabase.from("reminders").insert({
    appointment_id: appointment.id,
    remind_at: computeRemindAt(date, time, leadTime),
    channel: "email",
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (reminderError) throw reminderError;

  redirect(`/appointments/${appointment.id}`);
}

// Reschedule reuses the Date & Time + Confirm steps of the booking flow to
// update an existing appointment in place (same unit/patient/notes), rather
// than creating a new appointment row.
export async function rescheduleAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!appointmentId || !date || !time) {
    throw new Error("Missing appointment details.");
  }

  const supabase = createServerSupabaseClient();

  const [{ data: appointment }, { data: reminder }] = await Promise.all([
    supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("id", appointmentId)
      .maybeSingle(),
    supabase
      .from("reminders")
      .select("remind_at")
      .eq("appointment_id", appointmentId)
      .maybeSingle(),
  ]);

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ appointment_date: date, appointment_time: time })
    .eq("id", appointmentId);

  if (updateError) throw updateError;

  if (reminder) {
    const remindAt = preserveLeadTime(
      appointment.appointment_date,
      appointment.appointment_time,
      reminder.remind_at,
      date,
      time,
    );
    await supabase
      .from("reminders")
      .update({ remind_at: remindAt, status: "pending" })
      .eq("appointment_id", appointmentId);
  }

  redirect(`/appointments/${appointmentId}`);
}
