import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, greeting, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

export default async function UpcomingPage() {
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });

  const patientList = (patients ?? []) as Patient[];
  const hasPatients = patientList.length > 0;

  const { data: appointments, error } = hasPatients
    ? await supabase
        .from("appointments")
        .select("*, units(*), patients(*)")
        .gte("appointment_date", todayIso())
        .neq("status", "cancelled")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
    : { data: [], error: null };

  const upcoming = (appointments ?? []) as AppointmentWithUnitAndPatient[];
  const firstName = appUser?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Here&apos;s what&apos;s coming up.
        </p>
      </div>

      {!hasPatients ? (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add yourself or a dependant to start booking appointments.
          </p>
          <LinkButton href="/profile">Add a patient</LinkButton>
        </Card>
      ) : (
        <>
          <LinkButton href="/appointments/new/unit" className="self-start">
            Add Appointment
          </LinkButton>

          {error && (
            <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
              Couldn&apos;t load appointments right now. Try refreshing.
            </Card>
          )}

          {!error && upcoming.length === 0 && (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">
              No upcoming appointments.
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {upcoming.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.id}`}>
                <Card className="transition-colors hover:border-emerald-600">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {appointment.units.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {appointment.units.hospital_or_facility_name}
                      </p>
                      {patientList.length > 1 && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          For {appointment.patients.full_name}
                        </p>
                      )}
                    </div>
                    <Badge status={appointment.status} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(appointment.appointment_date)} &middot;{" "}
                    {formatTime(appointment.appointment_time)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
