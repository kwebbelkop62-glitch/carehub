"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback: ReactNode };
type State = { hasError: boolean };

// WebGL can genuinely be unavailable (no GPU, hardware acceleration
// disabled, browser policy, exhausted context limit) for real users, not
// just during dev-mode hot reloads. Ballpit is a decorative hero, not
// core functionality, so a failed mount should fall back to a static
// background instead of crashing the page. Error boundaries must be
// class components — no hook equivalent exists.
export class BallpitBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Ballpit failed to initialize, falling back to static background:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
