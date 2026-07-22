"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  StackIcon,
  PlusIcon,
  BellIcon,
  CalendarCheckIcon,
  BuildingsIcon,
  FileTextIcon,
  UserCircleIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

type NavItem = {
  href: string;
  label: string;
  icon: PhosphorIcon;
};

// Desktop sidebar only. CareHub Lists.dc.html turns out to show a real
// desktop side-nav pattern (Dependants/Documents/Notifications/History/
// Settings) that IMPLEMENTATION_PLAN.md's step 6 didn't know about when it
// said "no desktop mockup exists" — full pixel-parity with that pattern is
// a separate pass; this just adds Notifications to the existing list with
// the current visual language now that the screen is real.
const sidebarNavItems: NavItem[] = [
  { href: "/upcoming", label: "Overview", icon: HouseIcon },
  { href: "/units", label: "Units", icon: BuildingsIcon },
  { href: "/history", label: "History", icon: CalendarCheckIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon },
  { href: "/documents", label: "Documents", icon: FileTextIcon },
  { href: "/profile", label: "Profile", icon: UserCircleIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {sidebarNavItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-tint text-foreground" : "text-muted hover:bg-tint hover:text-foreground"
            }`}
          >
            <Icon size={20} weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Fixed bottom tab bar, mobile only (md:hidden — see AppShell). Five items
// per CareHub Bottom Nav.dc.html: Home, Units, a raised center Book FAB,
// Alerts, Profile. History/Documents are desktop-sidebar-only now (see
// sidebarNavItems above) — dropped here to match the mockup exactly.
export function MobileTabBar({ hasUnread = false }: { hasUnread?: boolean }) {
  const pathname = usePathname();

  const tabs: NavItem[] = [
    { href: "/upcoming", label: "Home", icon: HouseIcon },
    { href: "/units", label: "Units", icon: StackIcon },
  ];
  const trailingTabs: NavItem[] = [
    { href: "/notifications", label: "Alerts", icon: BellIcon },
    { href: "/profile", label: "Profile", icon: UserCircleIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-end justify-around border-t border-border bg-surface px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-bold ${
              active ? "text-accent-hover" : "text-muted"
            }`}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}

      <Link
        href="/upcoming"
        aria-label="Add appointment"
        className="-mt-[22px] flex flex-1 flex-col items-center gap-1"
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface"
          style={{ boxShadow: "0 6px 14px oklch(.6 .14 45 / .35)" }}
        >
          <PlusIcon size={18} weight="bold" />
        </span>
        <span className="text-center text-[9.5px] leading-tight font-bold text-accent">Add appointment</span>
      </Link>

      {trailingTabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href.split("?")[0]);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-bold ${
              active ? "text-accent-hover" : "text-muted"
            }`}
          >
            <span className="relative">
              <Icon size={22} weight={active ? "fill" : "regular"} />
              {label === "Alerts" && hasUnread && (
                <span className="absolute top-0 right-0 h-[7px] w-[7px] rounded-full border-[1.5px] border-surface bg-status-missed-dot" />
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
