"use server";

import { redirect } from "next/navigation";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Name + phone — email stays Clerk-managed (see the account card's own
// note). Phone is a free-text column, no format validation beyond trimming
// to empty -> null, same convention as patients.relationship_to_owner.
export async function updateProfileAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName) {
    throw new Error("Name is required.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", appUser.id);

  if (error) throw error;

  redirect("/profile");
}

export async function addDependantAction(formData: FormData) {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "");
  const relationship = String(formData.get("relationship_to_owner") ?? "").trim();

  if (!fullName || !dateOfBirth || !relationship) {
    throw new Error("Name, date of birth, and relationship are required.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("patients").insert({
    user_id: appUser.id,
    full_name: fullName,
    date_of_birth: dateOfBirth,
    relationship_to_owner: relationship,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;

  redirect("/profile");
}
