"use client";

import { useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { TrendDownIcon } from "@phosphor-icons/react";
import ScrollStackImpl, { ScrollStackItem as ScrollStackItemImpl } from "@/components/vendor/ScrollStack";

// ScrollStack.jsx is vendored plain JS (see src/components/vendor/
// ScrollStack.jsx) — its `onStackComplete` prop has no default value, so
// TypeScript's checkJs infers it as required rather than optional.
// Narrowing the type to the props actually used here avoids touching the
// vendored file.
const ScrollStack = ScrollStackImpl as ComponentType<{
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
}>;

const ScrollStackItem = ScrollStackItemImpl as ComponentType<{
  children: ReactNode;
  itemClassName?: string;
}>;

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

const staticCardClass =
  "rounded-2xl border border-border bg-tint p-8 text-base leading-relaxed text-foreground sm:p-10 sm:text-lg";

type WhyScrollStackProps = {
  bodyOne: string;
  bodyTwo: string;
  bodyThree: string;
  stat: string;
};

// PRODUCT.md requires a prefers-reduced-motion fallback on every animation —
// the stack's pin/scale/blur effect is driven by a Lenis-smoothed scroll
// listener, not CSS, so it needs the same client-side gate HeroBallpit uses
// rather than a media-query-only fix. Reduced motion falls back to the four
// cards in plain vertical flow, no pinning or scroll listener at all.
export function WhyScrollStack({ bodyOne, bodyTwo, bodyThree, stat }: WhyScrollStackProps) {
  const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-6">
        <p className={staticCardClass}>{bodyOne}</p>
        <p className={staticCardClass}>{bodyTwo}</p>
        <p className={staticCardClass}>{bodyThree}</p>
        <div className={`${staticCardClass} flex flex-row items-start gap-4`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-accent-hover">
            <TrendDownIcon size={22} weight="duotone" />
          </span>
          <p>{stat}</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollStack
      className="why-stack"
      itemDistance={32}
      itemScale={0.04}
      itemStackDistance={24}
      stackPosition="15%"
      scaleEndPosition="8%"
      baseScale={0.9}
      rotationAmount={0}
      blurAmount={4}
    >
      <ScrollStackItem itemClassName="flex flex-col justify-center">
        <p className="text-base leading-relaxed text-foreground sm:text-lg">{bodyOne}</p>
      </ScrollStackItem>
      <ScrollStackItem itemClassName="flex flex-col justify-center">
        <p className="text-base leading-relaxed text-foreground sm:text-lg">{bodyTwo}</p>
      </ScrollStackItem>
      <ScrollStackItem itemClassName="flex flex-col justify-center">
        <p className="text-base leading-relaxed text-foreground sm:text-lg">{bodyThree}</p>
      </ScrollStackItem>
      <ScrollStackItem itemClassName="flex flex-row items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-accent-hover">
          <TrendDownIcon size={22} weight="duotone" />
        </span>
        <p className="text-base leading-relaxed text-foreground sm:text-lg">{stat}</p>
      </ScrollStackItem>
    </ScrollStack>
  );
}
