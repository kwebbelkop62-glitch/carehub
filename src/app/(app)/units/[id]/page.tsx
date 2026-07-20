import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format";
import { unitTypeLabel } from "@/lib/types";
import type { Appointment, Patient, Unit } from "@/lib/types";

type AppointmentWithPatient = Appointment & { patients: Patient };

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  const [{ data: unit }, { data: visits }, { data: patients }] = await Promise.all([
    supabase.from("units").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("*, patients(*)")
      .eq("unit_id", id)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false }),
    supabase.from("patients").select("*").order("created_at", { ascending: true }),
  ]);

  if (!unit) {
    redirect("/units");
  }

  const typedUnit = unit as Unit;
  const visitList = (visits ?? []) as AppointmentWithPatient[];
  const patientList = (patients ?? []) as Patient[];
  const isOwnUnit = typedUnit.added_by_user_id === appUser.id;
  const showPatientName = patientList.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/units" className="text-sm font-medium text-muted hover:text-foreground">
        &larr; All units
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {typedUnit.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {unitTypeLabel(typedUnit.type)} · {typedUnit.hospital_or_facility_name}
            {typedUnit.location_area ? ` · ${typedUnit.location_area}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {isOwnUnit && (
            <LinkButton href={`/units/${typedUnit.id}/edit`} variant="secondary">
              Edit unit
            </LinkButton>
          )}
          {patientList.length > 0 && (
            <LinkButton href={`/appointments/new/time?patient=${patientList[0].id}&unit=${typedUnit.id}`}>
              + Add appointment
            </LinkButton>
          )}
        </div>
      </div>

      {patientList.length === 0 && (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Add yourself or a dependant before booking an appointment here.
          </p>
          <LinkButton href="/profile">Add a patient</LinkButton>
        </Card>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Visit history
        </p>
        {visitList.length === 0 ? (
          <Card className="text-sm text-muted">No appointments here yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {visitList.map((visit) => (
              <Link key={visit.id} href={`/appointments/${visit.id}`}>
                <Card className="flex flex-wrap items-center gap-3 transition-colors hover:border-accent">
                  <p className="w-28 shrink-0 text-sm font-medium text-muted">
                    {formatDate(visit.appointment_date)}
                  </p>
                  <p className="flex-1 text-sm text-foreground">
                    {formatTime(visit.appointment_time)}
                    {showPatientName ? ` · ${visit.patients.full_name}` : ""}
                  </p>
                  <Badge status={visit.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
