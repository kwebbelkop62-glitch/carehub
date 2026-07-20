"use client";

import { useSyncExternalStore } from "react";
import Ballpit from "@/components/vendor/Ballpit";
import { WebglBoundary } from "@/components/webgl-boundary";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TABLET_UP_QUERY = "(min-width: 640px)";
const DESKTOP_UP_QUERY = "(min-width: 1024px)";

function subscribeToQuery(query: string) {
  return (callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  };
}

const subscribeReducedMotion = subscribeToQuery(REDUCED_MOTION_QUERY);
const subscribeTabletUp = subscribeToQuery(TABLET_UP_QUERY);
const subscribeDesktopUp = subscribeToQuery(DESKTOP_UP_QUERY);

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getTabletUpSnapshot() {
  return window.matchMedia(TABLET_UP_QUERY).matches;
}

function getDesktopUpSnapshot() {
  return window.matchMedia(DESKTOP_UP_QUERY).matches;
}

function getServerFalse() {
  return false;
}

function getServerTrue() {
  return true;
}

type BallpitTier = "mobile" | "tablet" | "desktop";

// Ballpit's bounding box is derived from viewport aspect ratio (see
// createBallpit's wWidth/wHeight math in src/components/vendor/Ballpit.jsx)
// — a narrow portrait screen gets a much narrower box than a wide desktop
// one, so a ball count tuned to look right on desktop packs a phone screen
// edge to edge with no room to move. Scale the count down by viewport tier
// instead of using one fixed count everywhere.
function useBallpitTier(): BallpitTier {
  const isTabletUp = useSyncExternalStore(subscribeTabletUp, getTabletUpSnapshot, getServerTrue);
  const isDesktopUp = useSyncExternalStore(subscribeDesktopUp, getDesktopUpSnapshot, getServerTrue);
  if (isDesktopUp) return "desktop";
  if (isTabletUp) return "tablet";
  return "mobile";
}

const TIER_COUNT_MULTIPLIER: Record<BallpitTier, number> = {
  mobile: 0.35,
  tablet: 0.65,
  desktop: 1,
};

type HeroBallpitProps = {
  className?: string;
  colors?: number[];
  count?: number;
  followCursor?: boolean;
};

// PRODUCT.md requires a prefers-reduced-motion fallback on every animation —
// Ballpit's physics loop runs via Three.js, not CSS, so a media query alone
// can't stop it; this gates the whole component client-side instead.
export function HeroBallpit({ className = "", count = 200, ...props }: HeroBallpitProps) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getServerFalse);
  const tier = useBallpitTier();

  if (reducedMotion) {
    return <div className={className} />;
  }

  const scaledCount = Math.round(count * TIER_COUNT_MULTIPLIER[tier]);

  return (
    <WebglBoundary fallback={<div className={className} />}>
      {/* key remounts (disposes + re-initializes) the Three.js instance when
          crossing a breakpoint, since Ballpit's own effect only reads count
          once on mount rather than reacting to prop changes. */}
      <Ballpit key={tier} className={className} count={scaledCount} {...props} />
    </WebglBoundary>
  );
}
