import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { greeting, todayIso, addDaysIso, formatShortDate, formatTime } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

const WINDOW_DAYS = 14;

function dayLabel(isoDate: string, today: string): string {
  if (isoDate === today) return `Today · ${formatShortDate(isoDate)}`;
  if (isoDate === addDaysIso(today, 1)) return `Tomorrow · ${formatShortDate(isoDate)}`;
  return formatShortDate(isoDate);
}

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });

  const patientList = (patients ?? []) as Patient[];
  const hasPatients = patientList.length > 0;
  const isCaregiver = patientList.length > 1;
  const selectedPatientId = isCaregiver ? params.patient : undefined;

  const today = todayIso();
  const windowEnd = addDaysIso(today, WINDOW_DAYS - 1);
  const firstName = appUser?.full_name?.split(" ")[0] ?? "there";

  let query = hasPatients
    ? supabase
        .from("appointments")
        .select("*, units(*), patients(*)")
        .gte("appointment_date", today)
        .lte("appointment_date", windowEnd)
        .neq("status", "cancelled")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
    : null;
  if (query && selectedPatientId) {
    query = query.eq("patient_id", selectedPatientId);
  }

  const { data: appointments, error } = query ? await query : { data: [], error: null };
  const upcoming = (appointments ?? []) as AppointmentWithUnitAndPatient[];

  const dueToday = upcoming.filter((a) => a.appointment_date === today);

  const daysWithAppointments = new Set(upcoming.map((a) => a.appointment_date));
  const calendarDays = Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const date = addDaysIso(today, i);
    const d = new Date(`${date}T00:00:00`);
    return {
      date,
      weekday: d.toLocaleDateString("en-MY", { weekday: "short" }).slice(0, 2),
      num: d.getDate(),
      isToday: i === 0,
      hasAppointment: daysWithAppointments.has(date),
    };
  });

  const groups: { date: string; items: AppointmentWithUnitAndPatient[] }[] = [];
  for (const appointment of upcoming) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === appointment.appointment_date) {
      lastGroup.items.push(appointment);
    } else {
      groups.push({ date: appointment.appointment_date, items: [appointment] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greeting()}, {firstName}
          </h1>
        </div>
        {hasPatients && (
          <Link
            href="/appointments/new/unit"
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-[18px] py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            + Add appointment
          </Link>
        )}
      </div>

      {isCaregiver && (
        <div className="flex w-fit flex-wrap gap-1 rounded-full bg-tint p-1">
          <Link
            href="/upcoming"
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              !selectedPatientId ? "bg-surface text-foreground" : "text-muted"
            }`}
          >
            Everyone
          </Link>
          {patientList.map((patient) => (
            <Link
              key={patient.id}
              href={`/upcoming?patient=${patient.id}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                selectedPatientId === patient.id ? "bg-surface text-foreground" : "text-muted"
              }`}
            >
              {patient.relationship_to_owner}
            </Link>
          ))}
        </div>
      )}

      {patientsError && (
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load your account right now. Try refreshing.
        </Card>
      )}

      {!patientsError && !hasPatients && (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Add yourself or a dependant to start booking appointments.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-[18px] py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            Add a patient
          </Link>
        </Card>
      )}

      {error && (
        <Card className="border-error-border text-sm text-error">
          Couldn&apos;t load appointments right now. Try refreshing.
        </Card>
      )}

      {!error && hasPatients && upcoming.length === 0 && (
        <div className="rounded-2xl border-[1.5px] border-dashed border-border px-8 py-16 text-center">
          <div className="mx-auto mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-tint">
            <span className="h-5 w-5 rounded-[5px] border-2 border-accent" />
          </div>
          <h2 className="mb-2 text-[19px] font-bold text-foreground">No appointments yet</h2>
          <p className="mx-auto mb-6 max-w-[360px] text-[14.5px] leading-relaxed text-muted">
            {isCaregiver
              ? "Add a dependant and their first appointment to start building a shared calendar and reminders."
              : "Add the next appointment you've already booked to get a reminder and keep a running history."}
          </p>
          <Link
            href="/appointments/new/unit"
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-[22px] py-3 text-[14.5px] font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            Add your first appointment
          </Link>
        </div>
      )}

      {!error && upcoming.length > 0 && (
        <>
          <div>
            <p className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">
              Next {WINDOW_DAYS} days at a glance
            </p>
            <div className="flex gap-1.5">
              {calendarDays.map((day) => {
                const inner = (
                  <>
                    <div className={`text-[10.5px] font-bold tracking-wide uppercase ${day.hasAppointment ? "text-muted" : "text-muted-icon"}`}>
                      {day.weekday}
                    </div>
                    <div className={`text-sm font-bold ${day.hasAppointment || day.isToday ? "text-foreground" : "text-muted-icon"}`}>
                      {day.num}
                    </div>
                    <span
                      className={`h-[5px] w-[5px] rounded-full ${day.hasAppointment ? "bg-accent" : "bg-transparent"}`}
                    />
                  </>
                );
                const className = `flex flex-1 flex-col items-center gap-1 rounded-[10px] border-[1.5px] py-2 ${
                  day.isToday ? "border-accent bg-tint" : "border-transparent bg-surface"
                }`;
                return day.hasAppointment ? (
                  <a key={day.date} href={`#day-${day.date}`} className={`${className} cursor-pointer`}>
                    {inner}
                  </a>
                ) : (
                  <div key={day.date} className={className}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

          {dueToday.length > 0 && (
            <div>
              <p className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">Due today</p>
              <div className="flex flex-wrap gap-2.5">
                {dueToday.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/appointments/${appointment.id}`}
                    className="flex items-center gap-2.5 rounded-[10px] bg-status-missed-bg px-3.5 py-2.5"
                  >
                    <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-status-missed-dot" />
                    <span className="text-[13.5px] font-semibold text-foreground">
                      {appointment.units.name} &middot; {appointment.units.hospital_or_facility_name}
                    </span>
                    <span className="text-[13px] text-muted">{formatTime(appointment.appointment_time)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-3.5 text-[13px] font-bold tracking-wide text-muted uppercase">
              Next {WINDOW_DAYS} days
            </p>
            <div className="flex flex-col gap-[22px]">
              {groups.map((group) => (
                <div key={group.date} id={`day-${group.date}`}>
                  <p className="mb-2 text-[13px] font-bold text-muted">{dayLabel(group.date, today)}</p>
                  <div className="flex flex-col gap-2">
                    {group.items.map((appointment) => (
                      <Link
                        key={appointment.id}
                        href={`/appointments/${appointment.id}`}
                        className="flex flex-wrap items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3 transition-colors hover:border-accent sm:gap-[14px]"
                      >
                        <p className="w-[52px] shrink-0 text-[13px] font-bold text-muted">
                          {formatTime(appointment.appointment_time)}
                        </p>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px] font-bold text-foreground">
                            {appointment.units.name} &middot; {appointment.units.hospital_or_facility_name}
                          </p>
                          <p className="text-[12.5px] text-muted">{appointment.patients.relationship_to_owner}</p>
                        </div>
                        <Badge status={appointment.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
