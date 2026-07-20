import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointment-card";
import { greeting, todayIso, formatDate, formatTime } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";
import { ClockIcon, CheckCircleIcon, WarningCircleIcon, UsersIcon } from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

type Stat = {
  label: string;
  value: number;
  hint: string;
  icon: PhosphorIcon;
  warn?: boolean;
};

export default async function UpcomingPage() {
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });

  const patientList = (patients ?? []) as Patient[];
  const hasPatients = patientList.length > 0;

  // Stats need two extra lightweight queries beyond the existing upcoming-list
  // fetch: every appointment's status (for the completed/missed counts, not
  // just the upcoming ones) and every reminder's status (failed-delivery
  // banner). Same direct-Supabase-in-Server-Component pattern as the rest of
  // the app — no repository layer to route through.
  const [appointmentsResult, statusResult, reminderResult] = hasPatients
    ? await Promise.all([
        supabase
          .from("appointments")
          .select("*, units(*), patients(*)")
          .gte("appointment_date", todayIso())
          .neq("status", "cancelled")
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true }),
        supabase.from("appointments").select("status"),
        supabase.from("reminders").select("status"),
      ])
    : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];

  const { data: appointments, error } = appointmentsResult;
  const upcoming = (appointments ?? []) as AppointmentWithUnitAndPatient[];
  const firstName = appUser?.full_name?.split(" ")[0] ?? "there";

  const statusCounts = ((statusResult.data ?? []) as { status: string }[]).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const completedCount = (statusCounts.attended ?? 0) + (statusCounts.completed ?? 0);
  const missedCount = statusCounts.missed ?? 0;

  const failedReminders = ((reminderResult.data ?? []) as { status: string }[]).filter(
    (reminder) => reminder.status === "failed",
  ).length;

  const nextAppointment = upcoming[0];

  const stats: Stat[] = [
    {
      label: "Upcoming",
      value: upcoming.length,
      hint: nextAppointment
        ? `Next ${formatDate(nextAppointment.appointment_date)} · ${formatTime(nextAppointment.appointment_time)}`
        : "Nothing scheduled",
      icon: ClockIcon,
    },
    {
      label: "Completed",
      value: completedCount,
      hint: "Attended or completed",
      icon: CheckCircleIcon,
    },
    {
      label: "Missed",
      value: missedCount,
      hint: missedCount > 0 ? "Needs a look" : "None so far",
      icon: WarningCircleIcon,
      warn: missedCount > 0,
    },
    {
      label: "Dependants",
      value: patientList.length,
      hint: "Under your care",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s coming up.</p>
      </div>

      {patientsError ? (
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load your account right now. Try refreshing.
        </Card>
      ) : !hasPatients ? (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Add yourself or a dependant to start booking appointments.
          </p>
          <LinkButton href="/profile">Add a patient</LinkButton>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ label, value, hint, icon: Icon, warn }) => (
              <Card key={label} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">
                    {label}
                  </span>
                  <Icon size={18} className={warn ? "text-error" : "text-accent"} />
                </div>
                <div>
                  <p
                    className={`text-2xl font-semibold tracking-tight ${warn ? "text-error" : "text-foreground"}`}
                  >
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{hint}</p>
                </div>
              </Card>
            ))}
          </div>

          {failedReminders > 0 && (
            <Card className="border-error-border text-sm text-error">
              {failedReminders} reminder{failedReminders > 1 ? "s" : ""} failed to send — check the
              affected appointments.
            </Card>
          )}

          <LinkButton href="/appointments/new/unit" className="self-start">
            Add Appointment
          </LinkButton>

          {error && (
            <Card className="border-error-border text-sm text-error">
              Couldn&apos;t load appointments right now. Try refreshing.
            </Card>
          )}

          {!error && upcoming.length === 0 && (
            <Card className="text-sm text-muted">No upcoming appointments.</Card>
          )}

          {!error && upcoming.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Upcoming</h2>
                <p className="text-xs text-muted">Hover or tap a card for more</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
