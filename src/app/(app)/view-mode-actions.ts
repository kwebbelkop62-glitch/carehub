"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VIEW_MODE_COOKIE, type ViewMode } from "@/lib/view-mode";

// Shared by Profile's Mode card and Upcoming's top pill switch — one cookie,
// one source of truth. redirectTo drops any stale ?patient= filter query
// the caller's page might have had selected.
export async function setViewModeAction(mode: ViewMode, redirectTo: string) {
  const store = await cookies();
  store.set(VIEW_MODE_COOKIE, mode);
  redirect(redirectTo);
}
