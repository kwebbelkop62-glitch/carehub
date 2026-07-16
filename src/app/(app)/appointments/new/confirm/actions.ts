"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function confirmAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const patientId = String(formData.get("patient") ?? "");
  const unitId = String(formData.get("unit") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

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
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (appointmentError) throw appointmentError;

  // Reminder lead time (24h before) is a guess — the brief doesn't specify
  // one. This only inserts the row; the actual send job is intentionally
  // not built, see BUILD_NOTES.md.
  const appointmentDateTime = new Date(`${date}T${time}:00`);
  const remindAt = new Date(
    appointmentDateTime.getTime() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: reminderError } = await supabase.from("reminders").insert({
    appointment_id: appointment.id,
    remind_at: remindAt,
    channel: "email",
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (reminderError) throw reminderError;

  redirect(`/appointments/${appointment.id}`);
}
