type HeroBrandMarkProps = {
  text: string;
  className?: string;
};

// Soft-focus blur-in reveal for the icon + "CareHub" wordmark on the hero
// card, done in pure CSS (see .hero-brand-mark in globals.css) rather than
// the JS/IntersectionObserver-driven reactbits BlurText component. Verified
// via Playwright that a JS-animated version stays permanently stuck at
// near-zero opacity whenever Ballpit's WebGL init fails and gets caught by
// BallpitBoundary (a real, documented failure mode — see BUILD_NOTES.md) —
// something on that recovery path stalls the sibling's effect/animation
// state. A CSS keyframe animation runs independent of React's effect
// scheduling, so brand-critical text can never be left invisible by an
// unrelated component's error recovery. prefers-reduced-motion is handled
// natively by the same stylesheet, no client-side gate needed.
//
// Sized to match the headline below it (text-2xl/3xl/4xl, same scale as the
// h1) rather than a small caption — a brand mark this close above the hero
// headline reading visibly smaller than it does looks like an afterthought.
export function HeroBrandMark({ text, className = "" }: HeroBrandMarkProps) {
  return (
    <div className={`hero-brand-mark flex items-center justify-center gap-3 ${className}`.trim()}>
      <img src="/logo/icon-mark.svg" alt="" className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11" />
      <span className="text-2xl font-semibold tracking-tight text-accent-hover sm:text-3xl lg:text-4xl">
        {text}
      </span>
    </div>
  );
}
