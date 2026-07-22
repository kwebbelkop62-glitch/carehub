"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function addUnitAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const facility = String(formData.get("hospital_or_facility_name") ?? "").trim();
  const location = String(formData.get("location_area") ?? "").trim();

  if (!name || !type || !facility) {
    throw new Error("Name, type, and facility name are required.");
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("units")
    .insert({
      name,
      type,
      hospital_or_facility_name: facility,
      location_area: location || null,
      added_by_user_id: appUser.id,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;

  redirect(`/appointments/new/dependant?unit=${data.id}`);
}
