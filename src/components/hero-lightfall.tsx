"use client";

import { useSyncExternalStore } from "react";
import Lightfall from "@/components/vendor/Lightfall";
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

type HeroLightfallProps = {
  className?: string;
};

// PRODUCT.md requires a prefers-reduced-motion fallback on every animation —
// Lightfall's render loop runs via WebGL/ogl, not CSS, so a media query
// alone can't stop it; this gates the whole component client-side instead,
// same pattern as HeroBallpit.
export function HeroLightfall({ className = "" }: HeroLightfallProps) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getServerFalse);

  if (reducedMotion) {
    return <div className={className} />;
  }

  return (
    <WebglBoundary fallback={<div className={className} />}>
      <Lightfall
        className={className}
        colors={["#1f9d55", "#34c774", "#0f6032"]}
        backgroundColor="#0d0f0e"
        speed={0.4}
        streakCount={3}
        streakWidth={1}
        streakLength={1.1}
        glow={1}
        density={0.5}
        twinkle={0.8}
        zoom={3}
        backgroundGlow={0.6}
        opacity={1}
        mouseInteraction
        mouseStrength={0.4}
        mouseRadius={1}
      />
    </WebglBoundary>
  );
}
