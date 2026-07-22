import Link from "next/link";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { ArrowLeftIcon, SignOutIcon } from "@phosphor-icons/react/ssr";
import { NavLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav, MobileTabBar } from "@/components/nav-links";
import { getOrCreateAppUser } from "@/lib/current-app-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/format";

// Two-step lookup (today's appointment ids, then any reminder against
// them) rather than an embedded-relationship filter
// (reminders.select("*, appointments!inner(...)").eq("appointments.x", y))
// — that syntax needs PostgREST to resolve the relationship correctly and
// wasn't worth the risk for a nav badge; this mirrors the plain .in()
// pattern already used elsewhere (e.g. the booking flow's conflict
// check). Wrapped defensively so a transient query failure never breaks
// the shell every authenticated page renders through.
async function hasTodayReminders(): Promise<boolean> {
  try {
    const appUser = await getOrCreateAppUser();
    if (!appUser) return false;
    const supabase = createServerSupabaseClient();

    const { data: todaysAppointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", todayIso());
    const appointmentIds = (todaysAppointments ?? []).map((a) => a.id);
    if (appointmentIds.length === 0) return false;

    const { data: reminders } = await supabase
      .from("reminders")
      .select("id")
      .in("appointment_id", appointmentIds)
      .limit(1);
    return (reminders?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const hasUnread = await hasTodayReminders();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:border-r md:border-border md:bg-surface">
        <Link href="/upcoming" className="flex items-center px-6 py-6">
          <NavLogo className="h-7" />
        </Link>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-1 border-t border-border px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-tint hover:text-foreground"
          >
            <ArrowLeftIcon size={20} />
            Back to site
          </Link>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-error-bg hover:text-error"
            >
              <SignOutIcon size={20} />
              Log out
            </button>
          </SignOutButton>
          <div className="mt-2 flex items-center gap-2 px-3">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </aside>

      <div className="flex min-h-full flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link href="/upcoming" className="flex items-center">
            <NavLogo className="h-6" />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              aria-label="Back to site"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-tint hover:text-foreground"
            >
              <ArrowLeftIcon size={20} />
            </Link>
            <SignOutButton>
              <button
                type="button"
                aria-label="Log out"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error-bg hover:text-error"
              >
                <SignOutIcon size={20} />
              </button>
            </SignOutButton>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 md:px-8 md:pb-8">
          {children}
        </main>

        <MobileTabBar hasUnread={hasUnread} />
      </div>
    </div>
  );
}
