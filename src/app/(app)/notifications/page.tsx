import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime, relativeTime, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Reminder } from "@/lib/types";

type ReminderWithAppointment = Reminder & { appointments: AppointmentWithUnitAndPatient | null };

// Minimal reminders-backed notification feed per CareHub Lists.dc.html's
// Notifications screen — the mockup's "Earlier" examples (status changes,
// new units) come from an activity log that doesn't exist in this schema,
// so every item here is a real reminder record, not a general activity
// feed. Grouped by whether the linked appointment falls on today's date,
// matching the mockup's Today/Earlier split.
function notificationCopy(reminder: ReminderWithAppointment): { title: string; isToday: boolean } {
  const appt = reminder.appointments;
  if (!appt) return { title: "Reminder for a deleted appointment", isToday: false };

  const isToday = appt.appointment_date === todayIso();
  const when = isToday ? `today at ${formatTime(appt.appointment_time)}` : formatDate(appt.appointment_date);
  return { title: `Reminder: ${appt.units.name} ${when}`, isToday };
}

export default async function NotificationsPage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*, appointments(*, units(*), patients(*))")
    .order("remind_at", { ascending: false })
    .limit(50);

  const reminderList = ((reminders ?? []) as ReminderWithAppointment[]).filter((r) => r.appointments);

  const today = reminderList.filter((r) => notificationCopy(r).isToday);
  const earlier = reminderList.filter((r) => !notificationCopy(r).isToday);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Notifications</h1>

      {error && (
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load notifications right now. Try refreshing.
        </Card>
      )}

      {!error && reminderList.length === 0 && (
        <EmptyState
          title="No notifications yet"
          subtitle="Reminders and activity for your appointments will show up here."
        />
      )}

      {!error && today.length > 0 && (
        <NotificationGroup label="Today" reminders={today} active />
      )}

      {!error && earlier.length > 0 && (
        <NotificationGroup label="Earlier" reminders={earlier} />
      )}
    </div>
  );
}

function NotificationGroup({
  label,
  reminders,
  active = false,
}: {
  label: string;
  reminders: ReminderWithAppointment[];
  active?: boolean;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[12.5px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <div className="flex flex-col gap-2">
        {reminders.map((reminder) => {
          const { title } = notificationCopy(reminder);
          return (
            <div
              key={reminder.id}
              className="flex items-start gap-3 rounded-[10px] border border-border bg-surface px-4 py-3"
            >
              <span
                className={`mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full ${active ? "bg-accent" : "bg-border"}`}
              />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${active ? "text-foreground" : "text-[oklch(.35_.02_60)] dark:text-muted"}`}>
                  {title}
                </p>
                <p className="mt-0.5 text-[12.5px] text-muted">{relativeTime(reminder.remind_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-border px-8 py-[52px] text-center">
      <h2 className="mb-2 text-[17px] font-bold text-foreground">{title}</h2>
      <p className="mx-auto max-w-[360px] text-sm leading-relaxed text-muted">{subtitle}</p>
    </div>
  );
}
