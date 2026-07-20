"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Standalone create/edit/delete for the "Your care units" records area —
// separate from appointments/new/unit/actions.ts's addUnitAction, which
// exists to add a unit mid-booking and redirects into the booking flow
// instead of back to a unit's own page.

export async function createUnitAction(formData: FormData) {
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

  redirect(`/units/${data.id}`);
}

export async function updateUnitAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const facility = String(formData.get("hospital_or_facility_name") ?? "").trim();
  const location = String(formData.get("location_area") ?? "").trim();

  if (!id || !name || !type || !facility) {
    throw new Error("Name, type, and facility name are required.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("units")
    .update({
      name,
      type,
      hospital_or_facility_name: facility,
      location_area: location || null,
    })
    .eq("id", id)
    .eq("added_by_user_id", appUser.id);

  if (error) throw error;

  redirect(`/units/${id}`);
}

export async function deleteUnitAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing unit id.");

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", id)
    .eq("added_by_user_id", appUser.id);

  // A unit with existing appointments will fail its FK constraint — surface
  // that plainly rather than guessing at cascade behavior the schema
  // doesn't define (see CLAUDE.md: schema is finalized, not ours to alter).
  if (error) {
    throw new Error(
      "Can't delete this unit — it still has appointments attached.",
    );
  }

  redirect("/units");
}
