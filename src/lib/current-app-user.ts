import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "./supabase/server";
import type { User } from "./types";

// The brief doesn't specify how a `users` row gets created for a new Clerk
// identity (no webhook is set up). This lazily creates it on first server
// access instead, keyed on clerk_user_id. Relies on the `users` table RLS
// insert policy allowing a signed-in user to create their own row — not
// verified end-to-end, see BUILD_NOTES.md.
//
// auth() reads the already-verified session JWT locally — no API call.
// currentUser() hits Clerk's Backend API (GET /v1/users/{id}) and counts
// against its rate limit, which dev instances hit fast if this runs on
// every page load. So: use auth() for the cheap clerk_user_id lookup on
// every call, and only pay for currentUser() the one time we actually
// need Clerk's profile data to create a new row.
//
// Wrapped in React's cache() so the several server components on one page
// (layout + page + nested components) share a single lookup/insert per
// request instead of racing each other.
export const getOrCreateAppUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerSupabaseClient();

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing as User;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

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
      clerk_user_id: userId,
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
        .eq("clerk_user_id", userId)
        .single();
      if (retryError) throw retryError;
      return retried as User;
    }
    throw insertError;
  }

  return created as User;
});
