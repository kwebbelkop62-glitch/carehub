import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format";
import type { AppointmentWithUnitAndPatient } from "@/lib/types";

// Same 3D-flip mechanism as design-reference/mockup.html (perspective,
// transform-3d, rotate-y-180, backface-hidden), rebuilt as a real
// component rather than copied — pure CSS, no JS, so no "use client"
// needed. Front: unit + date/time + status. Back (hover on desktop, tap /
// focus on mobile): which patient it's for, facility, and a details link.
export function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentWithUnitAndPatient;
}) {
  return (
    <div
      tabIndex={0}
      className="group h-32 rounded-2xl perspective-[1000px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative h-full w-full transform-3d transition-transform duration-500 group-hover:rotate-y-180 group-focus-within:rotate-y-180">
        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 rounded-2xl bg-tint p-4 backface-hidden">
          <Badge status={appointment.status} />
          <p className="font-medium text-foreground">{appointment.units.name}</p>
          <p className="text-sm text-accent-hover">
            {formatDate(appointment.appointment_date)},{" "}
            {formatTime(appointment.appointment_time)}
          </p>
        </div>
        <div className="absolute inset-0 flex rotate-y-180 flex-col justify-center gap-1 rounded-2xl bg-accent-fill p-4 text-white backface-hidden">
          <span className="text-sm font-medium text-white">
            For {appointment.patients.full_name}
          </span>
          <span className="text-sm text-white/90">
            {appointment.units.hospital_or_facility_name}
          </span>
          <Link
            href={`/appointments/${appointment.id}`}
            className="mt-2 text-sm font-medium underline-offset-2 hover:underline"
          >
            View details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
