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
      <Link href="/units" className="text-[13.5px] font-semibold text-muted hover:text-foreground">
        &larr; All units
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-xl font-bold text-foreground">{typedUnit.name}</h1>
          <p className="text-sm text-muted">
            {unitTypeLabel(typedUnit.type)} · {typedUnit.hospital_or_facility_name}
            {typedUnit.location_area ? ` · ${typedUnit.location_area}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwnUnit && (
            <Link
              href={`/units/${typedUnit.id}/edit`}
              className="inline-flex items-center justify-center rounded-[9px] border border-border px-3.5 py-2 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-tint"
            >
              Edit unit
            </Link>
          )}
          {patientList.length > 0 && (
            <Link
              href={`/appointments/new/time?patient=${patientList[0].id}&unit=${typedUnit.id}`}
              className="inline-flex items-center justify-center rounded-[9px] bg-accent px-3.5 py-2 text-[13.5px] font-bold text-surface transition-colors hover:bg-accent-hover"
            >
              + Add appointment
            </Link>
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
        <p className="mt-2.5 mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">
          Visit history
        </p>
        {visitList.length === 0 ? (
          <Card className="text-sm text-muted">No appointments here yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {visitList.map((visit) => (
              <Link
                key={visit.id}
                href={`/appointments/${visit.id}`}
                className="flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-surface px-4 py-3 transition-colors hover:border-accent sm:gap-[14px]"
              >
                <p className="w-24 shrink-0 text-[13px] font-bold text-muted">
                  {formatDate(visit.appointment_date)}
                </p>
                <p className="flex-1 text-sm font-semibold text-foreground">
                  {formatTime(visit.appointment_time)}
                  {showPatientName ? ` · ${visit.patients.full_name}` : ""}
                </p>
                <Badge status={visit.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
