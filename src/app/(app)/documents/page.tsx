import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { formatDate, formatTime } from "@/lib/format";
import type { AppointmentWithUnitAndPatient, Document } from "@/lib/types";
import { uploadDocumentAction } from "./actions";

type DocumentWithAppointment = Document & {
  appointments: AppointmentWithUnitAndPatient;
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const params = await searchParams;
  await getOrCreateAppUser();
  const supabase = createServerSupabaseClient();

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("*, units(*), patients(*)")
    .order("appointment_date", { ascending: false });
  const appointmentList = (appointments ?? []) as AppointmentWithUnitAndPatient[];

  let documentsQuery = supabase
    .from("documents")
    .select("*, appointments(*, units(*), patients(*))")
    .order("uploaded_at", { ascending: false });

  if (params.appointment) {
    documentsQuery = documentsQuery.eq("appointment_id", params.appointment);
  }

  const { data: documents, error: documentsError } = await documentsQuery;
  const documentList = (documents ?? []) as DocumentWithAppointment[];

  const signedUrls = new Map<string, string>();
  for (const doc of documentList) {
    const { data: signed } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 3600);
    if (signed) signedUrls.set(doc.id, signed.signedUrl);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Documents
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Files attached to your appointments.
        </p>
      </div>

      {appointmentsError ? (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
          Couldn&apos;t load your appointments right now. Try refreshing.
        </Card>
      ) : appointmentList.length === 0 ? (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          Book an appointment first — documents are attached to a specific
          appointment.
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">Upload a document</p>
          <form action={uploadDocumentAction} className="flex flex-col gap-4">
            <Field label="Appointment" htmlFor="appointment">
              <Select
                id="appointment"
                name="appointment"
                defaultValue={params.appointment ?? appointmentList[0].id}
                required
              >
                {appointmentList.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.patients.full_name} — {appointment.units.name} (
                    {formatDate(appointment.appointment_date)})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="File" htmlFor="file">
              <input
                id="file"
                name="file"
                type="file"
                required
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700 dark:text-zinc-400"
              />
            </Field>
            <Button type="submit" className="self-start">
              Upload
            </Button>
          </form>
        </Card>
      )}

      {documentsError && (
        <Card className="border-red-200 text-sm text-red-600 dark:border-red-900">
          Couldn&apos;t load documents right now. Try refreshing.
        </Card>
      )}

      {!documentsError && documentList.length === 0 && (
        <Card className="text-sm text-zinc-600 dark:text-zinc-400">
          No documents uploaded yet.
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {documentList.map((doc) => (
          <Card key={doc.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{doc.file_name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {doc.appointments.patients.full_name} — {doc.appointments.units.name}
                {" · "}
                {formatDate(doc.appointments.appointment_date)}{" "}
                {formatTime(doc.appointments.appointment_time)}
              </p>
              <p className="text-xs text-zinc-400">
                Uploaded {formatDate(doc.uploaded_at.slice(0, 10))}
              </p>
            </div>
            {signedUrls.has(doc.id) ? (
              <a
                href={signedUrls.get(doc.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Download
              </a>
            ) : (
              <span className="shrink-0 text-xs text-zinc-400">Unavailable</span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
