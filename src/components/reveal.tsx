"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const VARIANTS: Record<"fade-up" | "scale", Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
};

const STILL_VARIANTS: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

type RevealProps = {
  children: ReactNode;
  variant?: "fade-up" | "scale";
  className?: string;
  delay?: number;
};

// Scroll-triggered reveal for landing-page sections. Respects
// prefers-reduced-motion (via useReducedMotion) by skipping the
// transform/opacity animation entirely rather than just shortening it.
export function Reveal({ children, variant = "fade-up", className, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reduced ? STILL_VARIANTS : VARIANTS[variant]}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
