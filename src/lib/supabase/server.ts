import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Clerk's session token is passed to Supabase via the native third-party
// auth integration (not the deprecated JWT template method). RLS policies
// check auth.jwt()->>'sub' against users.clerk_user_id. Do not use
// auth.uid() anywhere against this schema — Clerk IDs are text, not UUIDs.
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    },
  );
}
