// Reminder send job. Invoked on a schedule by pg_cron (see
// supabase/migrations/20260728010000_reminder_send_job.sql), never called
// directly by app code or by end users. Reads reminders that are due, sends
// one email per reminder via Resend, and updates reminders.status to "sent"
// or "failed" accordingly.
//
// Auth: not a user-facing function, so verify_jwt is off (see the deploy
// call). Instead it checks a shared secret header set by the calling cron
// job, matched against the CRON_SECRET function secret.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CRON_SECRET = Deno.env.get("CRON_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");

// Brand colors approximated from DESIGN.md's clay/moss oklch tokens as flat
// hex -- email clients have effectively no oklch() support, so this is a
// deliberate one-off approximation for this surface only, not a value to
// treat as authoritative for anything in the actual app UI.
const COLOR = {
  bg: "#F5F1EA",
  card: "#FFFFFF",
  border: "#E3DACB",
  clay: "#C1662F",
  clayTint: "#FBF3EC",
  text: "#382F26",
  muted: "#7A6F60",
  mutedLight: "#A79C8B",
};

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

// User-entered values (patient/unit names, notes) end up interpolated into
// HTML -- escape them so a stray "<" or "&" in someone's notes can't break
// the markup or, worse, inject something into an email rendered by a real
// mail client.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateNice(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
  });
}

function formatTimeNice(time: string): string {
  const [hours, minutes] = time.split(":");
  const d = new Date();
  d.setHours(Number(hours), Number(minutes));
  return d.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" });
}

function buildEmailHtml(params: {
  recipientName: string;
  patientName: string;
  unitName: string;
  facilityName: string;
  dateNice: string;
  timeNice: string;
  notes: string | null;
}): string {
  const recipientName = escapeHtml(params.recipientName);
  const patientName = escapeHtml(params.patientName);
  const unitName = escapeHtml(params.unitName);
  const facilityName = escapeHtml(params.facilityName);
  const notes = params.notes ? escapeHtml(params.notes) : null;

  const notesRow = notes
    ? `<tr><td style="padding:0 32px 24px 32px;">
         <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.muted};">Notes</p>
         <p style="margin:0;font-size:14px;line-height:1.5;color:${COLOR.text};">${notes}</p>
       </td></tr>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:${COLOR.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${COLOR.card};border-radius:16px;border:1px solid ${COLOR.border};">
            <tr>
              <td style="padding:24px 32px;text-align:center;border-bottom:1px solid ${COLOR.border};">
                <span style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.clay};">CareHub</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 4px 32px;">
                <p style="margin:0 0 4px 0;font-size:15px;color:${COLOR.text};">Hi ${recipientName},</p>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.5;color:${COLOR.text};">
                  This is a reminder for <strong>${patientName}</strong>&rsquo;s upcoming appointment.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.clayTint};border-radius:12px;">
                  <tr>
                    <td style="padding:2px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="4" style="background-color:${COLOR.clay};border-radius:3px;">&nbsp;</td>
                          <td style="padding:16px 18px;">
                            <p style="margin:0 0 3px 0;font-size:16px;font-weight:700;color:${COLOR.text};">${unitName}</p>
                            <p style="margin:0 0 12px 0;font-size:13px;color:${COLOR.muted};">${facilityName}</p>
                            <p style="margin:0;font-size:14px;color:${COLOR.text};">
                              <strong>${params.dateNice}</strong> &middot; ${params.timeNice}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${notesRow}
            <tr>
              <td style="padding:0 32px 28px 32px;border-top:1px solid ${COLOR.border};">
                <p style="margin:20px 0 0 0;font-size:12px;line-height:1.5;color:${COLOR.mutedLight};">
                  Sent by CareHub, an independent personal appointment tracker &mdash; not an official
                  message from ${facilityName} or any hospital.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0 0;font-size:11px;color:${COLOR.mutedLight};">&copy; 2026 CareHub</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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

    const subject = `Reminder: ${appt.units.name} on ${formatDateShort(appt.appointment_date)}`;
    const html = buildEmailHtml({
      recipientName: appt.patients?.users?.full_name ?? "there",
      patientName: appt.patients?.full_name ?? "your",
      unitName: appt.units.name,
      facilityName: appt.units.hospital_or_facility_name,
      dateNice: formatDateNice(appt.appointment_date),
      timeNice: formatTimeNice(appt.appointment_time),
      notes: appt.notes,
    });

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
