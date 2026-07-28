"use client";

// Kept as its own tiny client component rather than making the export page
// itself a client component -- the page needs to stay a Server Component to
// run the Supabase queries directly, and window.print() is the only piece
// that actually needs the browser.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-accent-hover"
    >
      Print / Save as PDF
    </button>
  );
}
