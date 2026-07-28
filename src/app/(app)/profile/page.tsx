import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Field, Input } from "@/components/ui/field";
import { formatDate, todayIso } from "@/lib/format";
import { REMINDER_LEAD_TIME_LABELS } from "@/lib/reminders";
import type { Patient } from "@/lib/types";
import { canUseCaregiverMode, getViewMode } from "@/lib/view-mode";
import { addDependantAction, updateProfileAction } from "./actions";
import { setViewModeAction } from "../view-mode-actions";

export default async function ProfilePage() {
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  const supabase = createServerSupabaseClient();
  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: true });

  const patientList = (patients ?? []) as Patient[];
  const mode = await getViewMode(patientList.length);
  const isCaregiver = mode === "caregiver";
  const caregiverEligible = canUseCaregiverMode(patientList.length);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/upcoming" className="text-[13.5px] font-semibold text-muted hover:text-foreground">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-xl font-bold text-foreground">Profile &amp; settings</h1>

      {/* ACCOUNT */}
      <SettingsCard>
        <details>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-base font-bold text-avatar-text">
                {appUser.full_name.charAt(0).toUpperCase()}
              </span>
              <span className="block">
                <span className="block text-base font-bold text-foreground">{appUser.full_name}</span>
                <span className="block text-[13.5px] text-muted">{appUser.email}</span>
                <span className="block text-[13.5px] text-muted">{appUser.phone || "No phone number added"}</span>
              </span>
            </span>
            <span className="rounded-[9px] border border-border px-3.5 py-2.5 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-tint">
              Edit profile
            </span>
          </summary>
          <EditProfileForm defaultName={appUser.full_name} defaultPhone={appUser.phone ?? ""} />
        </details>
        <p className="mt-3 text-xs text-muted">
          Manage sign-in details from the account menu in the top-right corner.
        </p>
      </SettingsCard>

      {/* PATIENTS — CLAUDE.md: this is also how a user adds themselves as a
          patient, kept inline on this screen rather than a separate
          "Manage dependants" destination like the mockup's own demo
          assumes (this app never split it into two screens). */}
      <SettingsCard>
        <Eyebrow>Patients you manage</Eyebrow>
        {error && <p className="mb-3 text-sm text-error">Couldn&apos;t load patients right now.</p>}
        {!error && patientList.length === 0 && (
          <p className="mb-3 text-sm text-muted">No patients yet. Add yourself below to start booking.</p>
        )}
        <div className="mb-4 flex flex-col gap-2">
          {patientList.map((patient) => (
            <div key={patient.id} className="rounded-[10px] border border-border px-3.5 py-3">
              <p className="text-sm font-bold text-foreground">{patient.full_name}</p>
              <p className="text-[12.5px] text-muted">
                {patient.relationship_to_owner} &middot; born {formatDate(patient.date_of_birth)}
              </p>
            </div>
          ))}
        </div>
        <details className="group">
          <summary className="mb-1 list-none cursor-pointer text-[13.5px] font-semibold text-accent-hover">
            + Add a patient
          </summary>
          <form action={addDependantAction} className="mt-3 flex flex-col gap-3.5">
            <Field label="Full name" htmlFor="full_name">
              <Input id="full_name" name="full_name" type="text" required />
            </Field>
            <Field label="Date of birth" htmlFor="date_of_birth">
              <Input id="date_of_birth" name="date_of_birth" type="date" max={todayIso()} required />
            </Field>
            <Field label="Relationship" htmlFor="relationship_to_owner" helper="e.g. Self, Child, Parent, Spouse">
              <Input id="relationship_to_owner" name="relationship_to_owner" type="text" required />
            </Field>
            <button
              type="submit"
              className="self-start rounded-[9px] bg-accent px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
            >
              Add patient
            </button>
          </form>
        </details>
      </SettingsCard>

      {/* MODE — a real stored preference (cookie, see src/lib/view-mode.ts),
          not derived from patient count. Also drives the pill switch at the
          top of Upcoming; both read/write the same cookie. */}
      <SettingsCard>
        <Eyebrow>Mode</Eyebrow>
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <form action={setViewModeAction.bind(null, "self", "/profile")}>
            <button
              type="submit"
              className={`w-full rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                !isCaregiver ? "border-accent bg-accent-tint" : "border-border bg-background hover:bg-tint"
              }`}
            >
              <p className="mb-0.5 text-sm font-bold text-foreground">Just me</p>
              <p className="text-xs leading-relaxed text-muted">I manage my own appointments</p>
            </button>
          </form>
          <form action={setViewModeAction.bind(null, "caregiver", "/profile")}>
            <button
              type="submit"
              disabled={!caregiverEligible}
              title={caregiverEligible ? undefined : "Add a dependant below to switch to caregiver mode"}
              className={`w-full rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                isCaregiver
                  ? "border-accent bg-accent-tint"
                  : caregiverEligible
                    ? "border-border bg-background hover:bg-tint"
                    : "cursor-not-allowed border-border bg-background opacity-50"
              }`}
            >
              <p className="mb-0.5 text-sm font-bold text-foreground">Caregiver</p>
              <p className="text-xs leading-relaxed text-muted">I also manage others</p>
            </button>
          </form>
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">
          {isCaregiver
            ? "You're in caregiver mode — the dashboard shows a mode switch you can use any time."
            : caregiverEligible
              ? "Switch to caregiver mode to unlock the mode switch on your dashboard."
              : "Add a dependant above to unlock caregiver mode."}
        </p>
      </SettingsCard>

      {/* NOTIFICATIONS — none of these are real per-user toggles, there's no
          column to persist a choice either way. Email is shown enabled
          because that's genuinely how reminders work (the send job always
          emails, unconditionally); Push/SMS stay greyed out as "Coming
          soon" since neither is built. */}
      <SettingsCard>
        <Eyebrow>Notification preferences</Eyebrow>
        <ToggleRow label="Email" hint="Reminders and weekly summary" enabled />
        <ToggleRow label="Push notifications" hint="Reminders on this device" comingSoon />
        <ToggleRow label="SMS" hint="Text reminders" comingSoon last />

        <p className="mt-4 mb-2 text-sm font-semibold text-foreground">Default reminder lead time</p>
        <div className="flex flex-wrap gap-2">
          {Object.values(REMINDER_LEAD_TIME_LABELS).map((label) => (
            <span
              key={label}
              className="rounded-full border-[1.5px] border-border bg-background px-3.5 py-2 text-[13px] font-semibold text-muted"
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Not saved per-account yet — you&apos;ll choose it each time you book.</p>
      </SettingsCard>

      {/* SHORTCUTS */}
      <SettingsCard noPadding>
        <Link
          href="/units"
          className="flex items-center justify-between px-6 py-4 text-[14.5px] font-semibold text-foreground border-b border-border md:border-b-0"
        >
          Manage care units
          <span className="text-muted">&rarr;</span>
        </Link>
        {/* History/Documents dropped out of the mobile bottom tab bar
            (5-item limit per CareHub Bottom Nav.dc.html) — surfaced here so
            mobile users don't lose access. Desktop already has both in the
            sidebar. */}
        <Link href="/history" className="flex items-center justify-between border-b border-border px-6 py-4 text-[14.5px] font-semibold text-foreground md:hidden">
          History
          <span className="text-muted">&rarr;</span>
        </Link>
        <Link href="/documents" className="flex items-center justify-between px-6 py-4 text-[14.5px] font-semibold text-foreground md:hidden">
          Documents
          <span className="text-muted">&rarr;</span>
        </Link>
      </SettingsCard>

      {/* DATA & PRIVACY — no export feature or policy content exists yet. */}
      <SettingsCard>
        <Eyebrow>Data &amp; privacy</Eyebrow>
        <div className="mb-3.5 flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-muted-icon">Export your data &middot; Coming soon</span>
          <span className="text-sm font-semibold text-muted-icon">Privacy policy &middot; Coming soon</span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">
          CareHub is an independent personal tracker. It does not share your data with, or receive data from, any
          hospital, clinic, or insurance provider.
        </p>
      </SettingsCard>

      {/* ACCOUNT ACTIONS — Delete account intentionally left out of this
          pass, see IMPLEMENTATION_PLAN.md discussion: it needs a real
          Clerk-deletion + cascading-delete design, not a stub button. */}
      <SignOutButton>
        <button
          type="button"
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-3 text-[14.5px] font-semibold text-foreground transition-colors hover:bg-tint"
        >
          Log out
        </button>
      </SignOutButton>
    </div>
  );
}

function SettingsCard({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface ${noPadding ? "overflow-hidden" : "p-[22px_24px]"}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">{children}</p>;
}

function ToggleRow({
  label,
  hint,
  comingSoon = false,
  enabled = false,
  last = false,
}: {
  label: string;
  hint: string;
  comingSoon?: boolean;
  enabled?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${enabled ? "" : "opacity-55"} ${last ? "" : "border-b border-border"}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {comingSoon && (
            <span className="rounded-full bg-tint px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-muted uppercase">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-muted">{hint}</p>
      </div>
      {/* Not a real interactive control either way — no per-user column to
          persist a choice (see the section comment above). Email always
          sends (that's how the reminder job works), so it's shown locked
          on rather than clickable; Push/SMS are shown locked off. */}
      <span className={`relative h-[22px] w-10 shrink-0 rounded-full ${enabled ? "bg-accent" : "bg-border"}`}>
        <span
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-surface shadow-sm ${enabled ? "left-[19px]" : "left-0.5"}`}
        />
      </span>
    </div>
  );
}

function EditProfileForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  return (
    <form action={updateProfileAction} className="mt-3.5 flex flex-col gap-3.5 border-t border-border pt-3.5">
      <Field label="Full name" htmlFor="full_name">
        <Input id="full_name" name="full_name" type="text" defaultValue={defaultName} required />
      </Field>
      <Field label="Phone" htmlFor="phone" helper="Optional">
        <Input id="phone" name="phone" type="tel" defaultValue={defaultPhone} placeholder="e.g. 012-345 6789" />
      </Field>
      <button
        type="submit"
        className="self-start rounded-[9px] bg-accent px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
      >
        Save
      </button>
    </form>
  );
}
