import { cookies } from "next/headers";

export type ViewMode = "self" | "caregiver";

export const VIEW_MODE_COOKIE = "carehub-view-mode";

// No `users` column for this — CLAUDE.md's schema is finalized and not to
// be altered — so the choice lives in a cookie. Defaults to caregiver once
// a second patient exists (matches the behavior before this was a real
// toggle) until the user explicitly picks one.
//
// Caregiver mode requires a dependant to manage — with 0 or 1 patients this
// always resolves to "self" regardless of what's stored, so a stale cookie
// (e.g. from before a dependant was removed) can't leave the account stuck
// showing caregiver-only UI with nothing to manage.
export async function getViewMode(patientCount: number): Promise<ViewMode> {
  if (patientCount <= 1) return "self";
  const store = await cookies();
  const stored = store.get(VIEW_MODE_COOKIE)?.value;
  if (stored === "self" || stored === "caregiver") return stored;
  return "caregiver";
}

export function canUseCaregiverMode(patientCount: number): boolean {
  return patientCount > 1;
}
