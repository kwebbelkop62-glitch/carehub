"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Assumes a Storage bucket named "documents" — it does not exist yet as of
// this build (verified read-only via the Storage API), so this action will
// fail until the bucket is created with policies scoping access to the
// owning patient's account. See BUILD_NOTES.md.
export async function uploadDocumentAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const appointmentId = String(formData.get("appointment") ?? "");
  const file = formData.get("file");

  if (!appointmentId || !(file instanceof File) || file.size === 0) {
    throw new Error("Choose an appointment and a file to upload.");
  }

  const supabase = createServerSupabaseClient();

  const path = `${appointmentId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type || undefined });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("documents").insert({
    appointment_id: appointmentId,
    uploaded_by_user_id: appUser.id,
    file_name: file.name,
    // Stores the storage path, not a public URL — documents are private,
    // so a signed URL is generated on demand when displaying the list.
    file_url: path,
    uploaded_at: new Date().toISOString(),
  });

  if (insertError) throw insertError;

  redirect(`/documents?appointment=${appointmentId}`);
}
