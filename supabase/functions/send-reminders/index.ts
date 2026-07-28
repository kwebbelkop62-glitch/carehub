// Reminder send job. Invoked on a schedule by pg_cron (see
// supabase/migrations/20260728_reminder_send_job.sql), never called directly
// by app code or by end users. Reads reminders that are due, sends one email
// per reminder via Resend, and updates reminders.status to "sent" or
// "failed" accordingly.
//
// Auth: not a user-facing function, so verify_jwt is off (see the deploy
// call). Instead it checks a shared secret header set by the calling cron
// job, matched against the CRON_SECRET function secret.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CRON_SECRET = Deno.env.get("CRON_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");

type ReminderRow = {
  id: string;
  appointments: {
    appointment_date: string;
    appointment_time: string;
    notes: string | null;
    units: { name: string; hospital_or_facility_name: string } | null;
    patients: {
      full_name: string;
      users: { email: string; full_name: string } | null;
    } | null;
  } | null;
};

Deno.serve(async (req: Request) => {
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fail closed without touching any reminder rows if the Resend side isn't
  // configured yet — safe to leave the cron schedule running while these
  // are still unset.
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return new Response(
      JSON.stringify({
        error:
          "RESEND_API_KEY and/or RESEND_FROM_EMAIL secrets are not set on this function yet.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select(
      "id, appointments(appointment_date, appointment_time, notes, units(name, hospital_or_facility_name), patients(full_name, users(email, full_name)))",
    )
    .eq("status", "pending")
    .lte("remind_at", new Date().toISOString())
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const due = (reminders ?? []) as unknown as ReminderRow[];
  let sent = 0;
  let failed = 0;

  for (const reminder of due) {
    const appt = reminder.appointments;
    const recipient = appt?.patients?.users?.email;

    if (!appt || !appt.units || !recipient) {
      failed++;
      await markStatus(supabase, reminder.id, "failed");
      console.error(
        `Reminder ${reminder.id}: missing appointment/unit/recipient data, marking failed.`,
      );
      continue;
    }

    const subject = `Reminder: ${appt.units.name} on ${appt.appointment_date}`;
    const html = `<p>Hi ${appt.patients?.users?.full_name ?? "there"},</p>
<p>This is a reminder for ${appt.patients?.full_name}'s upcoming appointment:</p>
<p><strong>${appt.units.name}</strong> &mdash; ${appt.units.hospital_or_facility_name}<br>
${appt.appointment_date} at ${appt.appointment_time}</p>
${appt.notes ? `<p>Notes: ${appt.notes}</p>` : ""}
<p>&mdash; CareHub</p>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: recipient,
          subject,
          html,
        }),
      });

      if (res.ok) {
        sent++;
        await markStatus(supabase, reminder.id, "sent");
      } else {
        failed++;
        console.error(
          `Reminder ${reminder.id}: Resend responded ${res.status} ${await res.text()}`,
        );
        await markStatus(supabase, reminder.id, "failed");
      }
    } catch (err) {
      failed++;
      console.error(`Reminder ${reminder.id}: fetch to Resend failed`, err);
      await markStatus(supabase, reminder.id, "failed");
    }
  }

  return new Response(JSON.stringify({ processed: due.length, sent, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function markStatus(
  supabase: ReturnType<typeof createClient>,
  id: string,
  status: "sent" | "failed",
) {
  await supabase.from("reminders").update({ status }).eq("id", id);
}
