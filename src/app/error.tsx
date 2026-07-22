"use client";

import { useEffect } from "react";

export default function RootError({
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
      <p className="max-w-sm text-sm text-muted">This page hit an unexpected error. Try again.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}
