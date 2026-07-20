"use client";

import { useSyncExternalStore } from "react";
import Aurora from "@/components/vendor/Aurora";
import { WebglBoundary } from "@/components/webgl-boundary";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerFalse() {
  return false;
}

type CtaAuroraProps = {
  className?: string;
};

// Same prefers-reduced-motion gate as HeroLightfall/HeroBallpit — Aurora's
// render loop runs via WebGL/ogl, not CSS, so a media query alone can't
// stop it.
export function CtaAurora({ className = "" }: CtaAuroraProps) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getServerFalse);

  if (reducedMotion) {
    return <div className={className} />;
  }

  return (
    <WebglBoundary fallback={<div className={className} />}>
      {/* Aurora's own root div hardcodes className="aurora-container" (fills
          its parent at 100%/100%) rather than accepting one as a prop, so
          sizing/positioning has to come from this wrapper instead. */}
      <div className={className}>
        <Aurora colorStops={["#0f6032", "#34c774", "#1f9d55"]} amplitude={1.0} blend={0.6} speed={0.5} />
      </div>
    </WebglBoundary>
  );
}
