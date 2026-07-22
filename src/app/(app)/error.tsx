"use client";

import { useEffect } from "react";

// No error boundary existed anywhere in the app before this — if any
// server component in the (app) tree threw (a transient Supabase hiccup,
// a bad query, etc.), there was nothing to catch it, which can leave a
// client-side navigation stuck on a blank/black screen until a hard
// refresh forces a fresh full render. This gives that failure mode a
// recoverable UI instead.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">
        This page hit an unexpected error. Try again, or head back to Upcoming.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
        >
          Try again
        </button>
        <a
          href="/upcoming"
          className="rounded-[10px] border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-tint"
        >
          Back to Upcoming
        </a>
      </div>
    </div>
  );
}
