"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
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

export const navItems: NavItem[] = [
  { href: "/upcoming", label: "Overview", icon: HouseIcon },
  { href: "/history", label: "History", icon: CalendarCheckIcon },
  { href: "/units", label: "Units", icon: BuildingsIcon },
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
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
              active ? "bg-tint text-foreground" : "text-muted hover:bg-tint hover:text-foreground"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                active
                  ? "border-accent-fill bg-accent-fill text-white"
                  : "border-border bg-surface text-muted"
              }`}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Fixed bottom tab bar, mobile only (md:hidden — see AppShell). Reuses the
// same navItems as the sidebar rather than a separate mobile-specific list.
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface px-1 py-2 md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium ${
              active ? "text-accent-hover" : "text-muted"
            }`}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
