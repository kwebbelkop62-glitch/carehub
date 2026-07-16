"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// The theme-init script in the root layout already applies the correct
// class before hydration. getServerSnapshot deliberately returns false
// (matching SSR, where there's no DOM to read) — useSyncExternalStore
// reconciles against the real getSnapshot() value right after hydration,
// without needing a manual useEffect + setState.
function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    // localStorage unavailable (private browsing, etc.) — toggle still
    // works for the session, it just won't persist.
  }
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setDark(!isDark)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-tint"
    >
      {isDark ? <SunIcon size={18} weight="bold" /> : <MoonIcon size={18} weight="bold" />}
    </button>
  );
}
