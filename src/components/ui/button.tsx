import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent-fill text-white hover:bg-accent-fill-hover active:scale-[0.98] disabled:bg-border disabled:text-muted",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-tint active:scale-[0.98] disabled:text-muted",
  ghost:
    "text-muted hover:text-foreground hover:bg-tint active:scale-[0.98]",
  danger:
    "bg-surface text-error border border-error-border hover:bg-error-bg active:scale-[0.98]",
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
