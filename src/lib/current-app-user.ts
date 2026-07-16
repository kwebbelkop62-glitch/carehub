import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "./supabase/server";
import type { User } from "./types";

// The brief doesn't specify how a `users` row gets created for a new Clerk
// identity (no webhook is set up). This lazily creates it on first server
// access instead, keyed on clerk_user_id. Relies on the `users` table RLS
// insert policy allowing a signed-in user to create their own row — not
// verified end-to-end, see BUILD_NOTES.md.
//
// Wrapped in React's cache() so the several server components on one page
// (layout + page + nested components) share a single lookup/insert per
// request instead of racing each other.
export const getOrCreateAppUser = cache(async (): Promise<User | null> => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const supabase = createServerSupabaseClient();

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser.id)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing as User;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";
  const fullName =
    clerkUser.fullName ??
    ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      "New user");

  const { data: created, error: insertError } = await supabase
    .from("users")
    .insert({
      clerk_user_id: clerkUser.id,
      full_name: fullName,
      email,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (insertError) {
    // Concurrent first-requests can race on the unique clerk_user_id.
    // If someone else's insert won, just read back their row.
    if (insertError.code === "23505") {
      const { data: retried, error: retryError } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_user_id", clerkUser.id)
        .single();
      if (retryError) throw retryError;
      return retried as User;
    }
    throw insertError;
  }

  return created as User;
});
