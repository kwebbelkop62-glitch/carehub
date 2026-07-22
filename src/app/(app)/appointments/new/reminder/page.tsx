import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { REMINDER_LEAD_TIME_LABELS, type ReminderLeadTimeKey } from "@/lib/reminders";
import { BookingProgress, StepEyebrow } from "../booking-progress";

export default async function ReminderNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; unit?: string; date?: string; time?: string; reminder?: string }>;
}) {
  const params = await searchParams;
  const appUser = await getOrCreateAppUser();
  if (!appUser) redirect("/sign-in");

  if (!params.patient || !params.unit || !params.date || !params.time) {
    redirect("/appointments/new/unit");
  }

  const activeReminder = (params.reminder as ReminderLeadTimeKey) || "1day";

  return (
    <div className="mx-auto w-full max-w-[520px] rounded-[20px] border border-border bg-surface p-6 sm:p-[36px_40px]">
      <BookingProgress step={4} />
      <StepEyebrow step={4} />
      <h1 className="mb-2 text-xl font-bold text-foreground">When should we remind you?</h1>
      <p className="mb-5 text-sm leading-relaxed text-muted">You can pick whichever works best.</p>

      <form method="GET" action="/appointments/new/confirm" className="flex flex-col gap-1">
        <input type="hidden" name="patient" value={params.patient} />
        <input type="hidden" name="unit" value={params.unit} />
        <input type="hidden" name="date" value={params.date} />
        <input type="hidden" name="time" value={params.time} />

        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.entries(REMINDER_LEAD_TIME_LABELS) as [ReminderLeadTimeKey, string][]).map(([key, label]) => (
            <label key={key} className="cursor-pointer">
              <input type="radio" name="reminder" value={key} defaultChecked={key === activeReminder} className="peer sr-only" />
              <span className="inline-block rounded-[9px] border-[1.5px] border-border bg-background px-3.5 py-2 text-[13.5px] font-semibold text-muted peer-checked:border-accent peer-checked:bg-surface peer-checked:text-foreground">
                {label}
              </span>
            </label>
          ))}
        </div>

        <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-foreground">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Bring last blood test results, fasting required, etc."
          className="mb-6 min-h-[80px] w-full resize-y rounded-[9px] border border-border bg-background px-3.5 py-2.5 text-[14.5px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <div className="flex gap-2.5">
          <Link
            href={`/appointments/new/time?patient=${params.patient}&unit=${params.unit}&date=${params.date}&time=${params.time}`}
            className="flex-1 rounded-[10px] border border-border px-3 py-3 text-center text-[15px] font-semibold text-foreground transition-colors hover:bg-tint"
          >
            Back
          </Link>
          <button
            type="submit"
            className="flex-[2] rounded-[10px] bg-accent px-3 py-3 text-[15px] font-bold text-surface transition-colors hover:bg-accent-hover"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
