"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function editAppointmentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !date || !time) {
    throw new Error("Missing appointment details.");
  }

  const supabase = createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      appointment_date: date,
      appointment_time: time,
      notes: notes || null,
    })
    .eq("id", id);

  if (updateError) throw updateError;

  // Keep the reminder's lead time consistent with the new slot. Same 24h
  // guess as the Confirm screen — see BUILD_NOTES.md.
  const appointmentDateTime = new Date(`${date}T${time}:00`);
  const remindAt = new Date(
    appointmentDateTime.getTime() - 24 * 60 * 60 * 1000,
  ).toISOString();

  await supabase
    .from("reminders")
    .update({ remind_at: remindAt })
    .eq("appointment_id", id);

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

export async function markAppointmentStatusAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || (status !== "attended" && status !== "completed")) {
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
