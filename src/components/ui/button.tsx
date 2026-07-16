import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500",
  secondary:
    "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] disabled:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:scale-[0.98] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:scale-[0.98] dark:bg-zinc-900 dark:border-red-900 dark:hover:bg-red-950",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
