// TEMPORARY dev-only preview harness for Profile & Settings — mock data,
// no auth/DB required. Delete before finishing this pass.
import { Field, Input } from "@/components/ui/field";
import { REMINDER_LEAD_TIME_LABELS } from "@/lib/reminders";

function SettingsCard({ children, noPadding = false }: { children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface ${noPadding ? "overflow-hidden" : "p-[22px_24px]"}`}>
      {children}
    </div>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">{children}</p>;
}
function ToggleRow({ label, hint, last = false }: { label: string; hint: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2.5 opacity-55 ${last ? "" : "border-b border-border"}`}>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="rounded-full bg-tint px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-muted uppercase">
            Coming soon
          </span>
        </div>
        <p className="text-[12.5px] text-muted">{hint}</p>
      </div>
      <span className="relative h-[22px] w-10 shrink-0 rounded-full bg-border">
        <span className="absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full bg-surface shadow-sm" />
      </span>
    </div>
  );
}

function ProfileMock({ isCaregiver }: { isCaregiver: boolean }) {
  const patients = isCaregiver
    ? [
        { name: "TJ", rel: "Self", dob: "12 Apr 1998" },
        { name: "Mum", rel: "Parent", dob: "12 Apr 1968" },
        { name: "Dad", rel: "Parent", dob: "2 Nov 1965" },
      ]
    : [{ name: "TJ", rel: "Self", dob: "12 Apr 1998" }];

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[13.5px] font-semibold text-muted">&larr; Back to dashboard</span>
      <h1 className="text-xl font-bold text-foreground">Profile &amp; settings</h1>

      <SettingsCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-base font-bold text-avatar-text">
              T
            </span>
            <div>
              <p className="text-base font-bold text-foreground">TJ Rahman</p>
              <p className="text-[13.5px] text-muted">tj@email.com</p>
              <p className="text-[13.5px] text-muted-icon">Phone &middot; Coming soon</p>
            </div>
          </div>
          <span className="rounded-[9px] border border-border px-3.5 py-2.5 text-[13.5px] font-semibold text-foreground">
            Edit profile
          </span>
        </div>
        <p className="mt-3 text-xs text-muted">
          Manage sign-in details from the account menu in the top-right corner.
        </p>
      </SettingsCard>

      <SettingsCard>
        <Eyebrow>Patients you manage</Eyebrow>
        <div className="mb-4 flex flex-col gap-2">
          {patients.map((p) => (
            <div key={p.name} className="rounded-[10px] border border-border px-3.5 py-3">
              <p className="text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-[12.5px] text-muted">
                {p.rel} &middot; born {p.dob}
              </p>
            </div>
          ))}
        </div>
        <span className="text-[13.5px] font-semibold text-accent-hover">+ Add a patient</span>
      </SettingsCard>

      <SettingsCard>
        <Eyebrow>Mode</Eyebrow>
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <div className={`rounded-xl border-[1.5px] px-4 py-3.5 ${!isCaregiver ? "border-accent bg-accent-tint" : "border-border bg-background"}`}>
            <p className="mb-0.5 text-sm font-bold text-foreground">Just me</p>
            <p className="text-xs leading-relaxed text-muted">I manage my own appointments</p>
          </div>
          <div className={`rounded-xl border-[1.5px] px-4 py-3.5 ${isCaregiver ? "border-accent bg-accent-tint" : "border-border bg-background"}`}>
            <p className="mb-0.5 text-sm font-bold text-foreground">Caregiver</p>
            <p className="text-xs leading-relaxed text-muted">I also manage others</p>
          </div>
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">
          {isCaregiver
            ? "You're in caregiver mode — the dashboard shows a dependant switcher since you manage more than one patient."
            : "Add a dependant above to switch into caregiver mode, which adds a dependant switcher to your dashboard."}
        </p>
      </SettingsCard>

      <SettingsCard>
        <Eyebrow>Notification preferences</Eyebrow>
        <ToggleRow label="Email" hint="Reminders and weekly summary" />
        <ToggleRow label="Push notifications" hint="Reminders on this device" />
        <ToggleRow label="SMS" hint="Text reminders" last />
        <p className="mt-4 mb-2 text-sm font-semibold text-foreground">Default reminder lead time</p>
        <div className="flex flex-wrap gap-2">
          {Object.values(REMINDER_LEAD_TIME_LABELS).map((label) => (
            <span key={label} className="rounded-full border-[1.5px] border-border bg-background px-3.5 py-2 text-[13px] font-semibold text-muted">
              {label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Not saved per-account yet — you&apos;ll choose it each time you book.</p>
      </SettingsCard>

      <SettingsCard noPadding>
        <div className="flex items-center justify-between border-b border-border px-6 py-4 text-[14.5px] font-semibold text-foreground md:border-b-0">
          Manage care units
          <span className="text-muted">&rarr;</span>
        </div>
        <div className="flex items-center justify-between border-b border-border px-6 py-4 text-[14.5px] font-semibold text-foreground">
          History
          <span className="text-muted">&rarr;</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-[14.5px] font-semibold text-foreground">
          Documents
          <span className="text-muted">&rarr;</span>
        </div>
      </SettingsCard>

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

      <span className="block w-full rounded-[10px] border border-border bg-surface px-3 py-3 text-center text-[14.5px] font-semibold text-foreground">
        Log out
      </span>

      <div className="mb-2 rounded-[10px] border border-border bg-background px-4 py-3 text-sm">
        <Field label="Full name (edit form preview)" htmlFor="fn">
          <Input id="fn" defaultValue="TJ Rahman" />
        </Field>
      </div>
    </div>
  );
}

export default function DevPreviewProfile() {
  return (
    <div className="flex flex-col gap-16 bg-background p-4 pb-32 sm:p-8">
      <Section title="SELF-ONLY MODE">
        <ProfileMock isCaregiver={false} />
      </Section>
      <Section title="CAREGIVER MODE">
        <ProfileMock isCaregiver={true} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-dashed border-border pt-4">
      <p className="mb-4 text-xs font-bold tracking-widest text-accent">{title}</p>
      {children}
    </div>
  );
}
