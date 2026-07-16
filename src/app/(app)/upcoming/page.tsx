import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointment-card";
import { greeting, todayIso } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Patient } from "@/lib/types";

export default async function UpcomingPage() {
  const appUser = await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: patients, error: patientsError } = await supabase
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
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s coming up.</p>
      </div>

      {patientsError ? (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
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
          <LinkButton href="/appointments/new/unit" className="self-start">
            Add Appointment
          </LinkButton>

          {error && (
            <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
              Couldn&apos;t load appointments right now. Try refreshing.
            </Card>
          )}

          {!error && upcoming.length === 0 && (
            <Card className="text-sm text-muted">No upcoming appointments.</Card>
          )}

          {!error && upcoming.length > 0 && (
            <>
              <p className="text-xs text-muted">Hover or tap a card for more</p>
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
