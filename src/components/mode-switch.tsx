"use client";

import { useState, useTransition } from "react";
import { setViewModeAction } from "@/app/(app)/view-mode-actions";
import type { ViewMode } from "@/lib/view-mode";

// Client Component so the sliding pill can animate immediately on click
// instead of waiting on the server round-trip (setViewModeAction still does
// the real cookie write + redirect underneath — this is purely the
// perceived-motion layer on top).
export function ModeSwitch({
  mode,
  caregiverEligible,
  redirectTo,
}: {
  mode: ViewMode;
  caregiverEligible: boolean;
  redirectTo: string;
}) {
  const [optimisticMode, setOptimisticMode] = useState(mode);
  const [prevMode, setPrevMode] = useState(mode);
  const [, startTransition] = useTransition();

  // Resync once the server round-trip lands with the authoritative value —
  // covers the rare case a click races an unrelated re-render. Updating
  // state during render (not a useEffect) is the pattern React recommends
  // for "adjust state when a prop changes" — this repo's lint config makes
  // react-hooks/set-state-in-effect a hard error.
  if (mode !== prevMode) {
    setPrevMode(mode);
    setOptimisticMode(mode);
  }

  const isCaregiver = optimisticMode === "caregiver";

  function select(next: ViewMode) {
    if (next === optimisticMode) return;
    if (next === "caregiver" && !caregiverEligible) return;
    setOptimisticMode(next);
    startTransition(async () => {
      await setViewModeAction(next, redirectTo);
    });
  }

  return (
    <div className="relative flex w-fit gap-1 rounded-full bg-tint p-1">
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-sm transition-transform duration-300 ease-out ${
          isCaregiver ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />
      <button
        type="button"
        onClick={() => select("self")}
        className={`relative z-10 flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-300 ${
          !isCaregiver ? "text-foreground" : "text-muted"
        }`}
      >
        Just me
      </button>
      <button
        type="button"
        onClick={() => select("caregiver")}
        disabled={!caregiverEligible}
        title={caregiverEligible ? undefined : "Add a dependant in Profile to switch to caregiver mode"}
        className={`relative z-10 flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-300 ${
          isCaregiver
            ? "text-foreground"
            : caregiverEligible
              ? "text-muted"
              : "cursor-not-allowed text-muted-icon"
        }`}
      >
        Caregiver
      </button>
    </div>
  );
}
