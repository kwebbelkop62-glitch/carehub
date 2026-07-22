// CareHub Booking Flow.dc.html's 5-dot progress indicator, shared across
// every step. Stays a fixed 5 positions even when step 2 (Dependant) gets
// silently skipped for single-patient users — the dots represent the
// flow's shape, not literally every screen a given user sees.
const TOTAL_STEPS = 5;

export function BookingProgress({ step }: { step: number }) {
  return (
    <div className="mb-7 flex gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${i < step ? "bg-accent" : "bg-border"}`}
        />
      ))}
    </div>
  );
}

export function StepEyebrow({ step }: { step: number }) {
  return (
    <p className="mb-2.5 text-[12.5px] font-bold tracking-wide text-accent uppercase">
      Step {step} of {TOTAL_STEPS}
    </p>
  );
}
