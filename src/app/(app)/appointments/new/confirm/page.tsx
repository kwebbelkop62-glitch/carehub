import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/format";
import type { Patient, Unit } from "@/lib/types";
import { confirmAppointmentAction, rescheduleAppointmentAction } from "./actions";

export default async function ConfirmAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    patient?: string;
    unit?: string;
    date?: string;
    time?: string;
    reschedule?: string;
  }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.patient || !params.unit || !params.date || !params.time) {
    redirect("/appointments/new/unit");
  }

  const isReschedule = Boolean(params.reschedule);
  const rescheduleQuery = params.reschedule ? `&reschedule=${params.reschedule}` : "";

  const supabase = createServerSupabaseClient();
  const [{ data: patient }, { data: unit }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", params.patient).maybeSingle(),
    supabase.from("units").select("*").eq("id", params.unit).maybeSingle(),
  ]);

  if (!patient || !unit) {
    redirect("/appointments/new/unit");
  }

  const typedPatient = patient as Patient;
  const typedUnit = unit as Unit;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isReschedule ? "Confirm reschedule" : "Confirm appointment"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isReschedule
            ? "Review the new date and time before saving."
            : "Review the details before booking."}
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Patient
          </p>
          <p className="text-sm text-foreground">{typedPatient.full_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Unit
          </p>
          <p className="text-sm text-foreground">{typedUnit.name}</p>
          <p className="text-sm text-muted">
            {typedUnit.hospital_or_facility_name}
            {typedUnit.location_area ? ` · ${typedUnit.location_area}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Date &amp; time
          </p>
          <p className="text-sm text-foreground">
            {formatDate(params.date)} at {formatTime(params.time)}
          </p>
        </div>
      </Card>

      <form
        action={isReschedule ? rescheduleAppointmentAction : confirmAppointmentAction}
        className="flex gap-3"
      >
        {isReschedule ? (
          <input type="hidden" name="appointmentId" value={params.reschedule} />
        ) : (
          <>
            <input type="hidden" name="patient" value={params.patient} />
            <input type="hidden" name="unit" value={params.unit} />
          </>
        )}
        <input type="hidden" name="date" value={params.date} />
        <input type="hidden" name="time" value={params.time} />
        <Button type="submit">
          {isReschedule ? "Save new time" : "Confirm appointment"}
        </Button>
        <LinkButton
          href={`/appointments/new/time?patient=${params.patient}&unit=${params.unit}&date=${params.date}&time=${params.time}${rescheduleQuery}`}
          variant="secondary"
        >
          Back
        </LinkButton>
      </form>
    </div>
  );
}
