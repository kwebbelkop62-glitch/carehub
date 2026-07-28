"use client";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed";
const secondaryClasses =
  "bg-surface text-foreground border border-border hover:bg-tint active:scale-[0.98] disabled:text-muted";

// Plain `href="#notes"` only scrolls to the notes section -- on a short
// page where Notes is already fully visible (nothing to scroll to), that's
// zero visible effect, so the button reads as broken even though the jump
// technically happens. Focusing the textarea guarantees something visible
// (cursor, browser focus ring) regardless of scroll position.
export function EditNotesButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="#notes"
      className={`${base} ${secondaryClasses} ${className}`}
      onClick={() => document.getElementById("notes")?.querySelector("textarea")?.focus()}
    >
      Edit
    </a>
  );
}
