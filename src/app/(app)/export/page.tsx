import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";
import { unitTypeLabel } from "@/lib/types";
import type { AppointmentWithUnitAndPatient, Document, Patient } from "@/lib/types";
import { PrintButton } from "@/components/print-button";

type DocumentWithAppointment = Document & {
  appointments: AppointmentWithUnitAndPatient | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Upcoming",
  attended: "Attended",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

export default async function ExportPage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  const [{ data: patients }, { data: appointments, error: appointmentsError }, { data: documents, error: documentsError }] =
    await Promise.all([
      supabase.from("patients").select("*").order("created_at", { ascending: true }),
      supabase
        .from("appointments")
        .select("*, units(*), patients(*)")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false }),
      supabase
        .from("documents")
        .select("*, appointments(*, units(*), patients(*))")
        .order("uploaded_at", { ascending: false }),
    ]);

  const patientList = (patients ?? []) as Patient[];
  const appointmentList = (appointments ?? []) as AppointmentWithUnitAndPatient[];
  const documentList = (documents ?? []) as DocumentWithAppointment[];

  // Same signed-URL-on-demand pattern as Documents and Appointment Detail —
  // documents are private, so a fresh short-lived link is generated each
  // time this page renders rather than storing a public URL anywhere.
  const signedUrls = new Map<string, string>();
  for (const doc of documentList) {
    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(doc.file_url, 3600);
    if (signed) signedUrls.set(doc.id, signed.signedUrl);
  }

  const statusCounts = appointmentList.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const generatedAt = new Date().toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/profile"
        className="print:hidden text-[13.5px] font-semibold text-muted hover:text-foreground"
      >
        &larr; Back to profile
      </Link>

      <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-border bg-surface p-6 print:max-w-none print:border-0 print:bg-white print:p-0 print:text-black sm:p-8">
        <div className="mb-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted print:text-black">CareHub</p>
          <h1 className="mt-1 text-lg font-bold text-foreground print:text-black">Appointment &amp; Document Summary</h1>
          <p className="mt-1 text-xs text-muted print:text-black">
            {appUser.full_name} &middot; generated {generatedAt}
          </p>
        </div>

        <div className="border-t border-dashed border-border print:border-black" />

        <Section title="Appointments">
          {appointmentsError && <ErrorLine>Couldn&apos;t load appointments.</ErrorLine>}
          {!appointmentsError && appointmentList.length === 0 && <EmptyLine>No appointments yet.</EmptyLine>}
          {appointmentList.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 border-b border-dashed border-border py-2.5 text-sm last:border-b-0 print:border-black"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground print:text-black">
                  {a.units.name} &middot; {a.units.hospital_or_facility_name}
                </p>
                <p className="text-xs text-muted print:text-black">
                  {formatDate(a.appointment_date)} &middot; {formatTime(a.appointment_time)}
                  {patientList.length > 1 ? ` · ${a.patients.relationship_to_owner}` : ""}
                  {" · "}
                  {unitTypeLabel(a.units.type)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold tracking-wide text-muted uppercase print:text-black">
                {STATUS_LABEL[a.status] ?? a.status}
              </span>
            </div>
          ))}
        </Section>

        {appointmentList.length > 0 && (
          <>
            <div className="border-t border-dashed border-border print:border-black" />
            <div className="py-3 text-xs text-muted print:text-black">
              <p className="mb-1 font-bold uppercase tracking-wide">Totals</p>
              <p>
                {appointmentList.length} appointment{appointmentList.length === 1 ? "" : "s"} total
                {Object.entries(statusCounts)
                  .map(([status, count]) => ` · ${count} ${(STATUS_LABEL[status] ?? status).toLowerCase()}`)
                  .join("")}
              </p>
            </div>
          </>
        )}

        <div className="border-t border-dashed border-border print:border-black" />

        <Section title="Documents">
          {documentsError && <ErrorLine>Couldn&apos;t load documents.</ErrorLine>}
          {!documentsError && documentList.length === 0 && <EmptyLine>No documents uploaded yet.</EmptyLine>}
          {documentList.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 border-b border-dashed border-border py-2.5 text-sm last:border-b-0 print:border-black"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground print:text-black">{doc.file_name}</p>
                {doc.appointments && (
                  <p className="truncate text-xs text-muted print:text-black">
                    {doc.appointments.units.name} &middot; {formatDate(doc.appointments.appointment_date)}
                  </p>
                )}
              </div>
              {signedUrls.has(doc.id) ? (
                <a
                  href={signedUrls.get(doc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="print:hidden shrink-0 text-xs font-semibold text-accent-hover hover:underline"
                >
                  Download
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted print:text-black">Unavailable</span>
              )}
            </div>
          ))}
        </Section>

        <div className="border-t border-dashed border-border print:border-black" />

        <p className="pt-3 text-center text-[11px] leading-relaxed text-muted print:text-black">
          Generated by CareHub, an independent personal tracker. Not an official medical record
          — verify against your hospital or clinic&apos;s own documentation for anything
          clinically important.
        </p>
      </div>

      <div className="print:hidden flex justify-center gap-3">
        <PrintButton />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted print:text-black">{title}</p>
      {children}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-sm text-muted print:text-black">{children}</p>;
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-sm text-error print:text-black">{children}</p>;
}
