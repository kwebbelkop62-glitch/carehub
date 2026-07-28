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

// Single form on the Appointment Detail page covers date, time, and notes
// together -- there's no separate Reschedule page/step for an existing
// appointment anymore. If the date or time actually changed, recalculates
// the reminder's remind_at preserving the same lead-time gap (same logic
// the old reschedule-via-booking-flow path used), and resets its status to
// pending in case it had already sent/failed under the old time.
export async function updateAppointmentAction(formData: FormData) {
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

  const { data: existing, error: fetchError } = await supabase
    .from("appointments")
    .select("appointment_date, appointment_time")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error("Appointment not found.");

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      appointment_date: date,
      appointment_time: time,
      notes: notes || null,
    })
    .eq("id", id);

  if (updateError) throw updateError;

  const dateOrTimeChanged =
    existing.appointment_date !== date || existing.appointment_time.slice(0, 5) !== time;

  if (dateOrTimeChanged) {
    const { data: reminder } = await supabase
      .from("reminders")
      .select("remind_at")
      .eq("appointment_id", id)
      .maybeSingle();

    if (reminder) {
      const remindAt = preserveLeadTime(
        existing.appointment_date,
        existing.appointment_time,
        reminder.remind_at,
        date,
        time,
      );
      await supabase
        .from("reminders")
        .update({ remind_at: remindAt, status: "pending" })
        .eq("appointment_id", id);
    }
  }

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

// Lets the user pick when the reminder send job (supabase/functions/
// send-reminders) should fire — see computeRemindAt in lib/reminders.ts.
// Every appointment is *supposed* to get a reminder row at booking time
// (confirmAppointmentAction inserts one unconditionally), but some
// existing rows predate that guarantee or came from another path -- so
// this creates the reminder if none exists yet, rather than only ever
// updating one that's already there. That's also why the lead-time pills
// on the Appointment Detail page are always clickable now instead of
// being gated on a reminder already existing.
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

  const { data: existingReminder } = await supabase
    .from("reminders")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (existingReminder) {
    const { error } = await supabase
      .from("reminders")
      .update({ remind_at: remindAt })
      .eq("appointment_id", appointmentId);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("reminders").insert({
      appointment_id: appointmentId,
      remind_at: remindAt,
      channel: "email",
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  redirect(`/appointments/${appointmentId}`);
}
