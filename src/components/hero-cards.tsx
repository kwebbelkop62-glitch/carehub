"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const statusTokens = {
  pending: { bg: "bg-status-upcoming-bg", dot: "bg-status-upcoming-dot", text: "text-status-upcoming-text" },
  attended: { bg: "bg-status-attended-bg", dot: "bg-status-attended-dot", text: "text-status-attended-text" },
  missed: { bg: "bg-status-missed-bg", dot: "bg-status-missed-dot", text: "text-status-missed-text" },
} as const;

type CardData = {
  title: string;
  subtitle?: string;
  meta?: string;
  status: keyof typeof statusTokens;
  statusLabel: string;
  compact?: boolean;
  inline?: boolean;
};

// Decorative hero mockups — matching CareHub Landing Page.dc.html's exact
// per-card padding/sizing, which is smaller than the shared <Badge>
// component's own dimensions, so this hand-rolls the pill rather than
// reusing that component.
function CardBody({ title, subtitle, meta, status, statusLabel, compact = false, inline = false }: CardData) {
  const tokens = statusTokens[status];
  return (
    <div
      className="rounded-2xl border border-border bg-surface p-4"
      style={{ boxShadow: "0 12px 28px oklch(.4 .02 60 / .1)" }}
    >
      <div className={`flex items-start justify-between gap-2 ${meta || !inline ? "mb-2" : ""}`}>
        <div>
          <div className={`font-bold ${compact ? "text-sm" : "text-[15px]"}`}>{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
        <div className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 ${tokens.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tokens.dot}`} />
          <span className={`text-[10px] font-bold ${tokens.text}`}>{statusLabel}</span>
        </div>
      </div>
      {meta && <div className="text-xs text-muted">{meta}</div>}
    </div>
  );
}

// Mobile (<sm) stacked list — plain drop-in-one-by-one entrance, no
// rotation/idle float since there's no room to work with at narrow widths.
export function HeroCardsMobile({ cards }: { cards: CardData[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3 sm:hidden">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={reduceMotion ? false : { opacity: 0, y: -36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: index * 0.15, type: "spring", stiffness: 320, damping: 24 }}
        >
          <CardBody {...card} />
        </motion.div>
      ))}
    </div>
  );
}

type DesktopCardSpec = CardData & {
  top: number;
  left: string;
  width: string;
  rotate: number;
  floatDistance: number;
  floatDuration: number;
};

// Desktop floating mockup — each card drops in from above, one after
// another (staggered by index), then settles into its resting rotation
// and eases into a gentle infinite bob, matching the original CSS
// float1-4 keyframes but driven by Framer Motion so it can sequence the
// entrance first.
function FloatingHeroCard({ index, spec }: { index: number; spec: DesktopCardSpec }) {
  const [landed, setLanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const { top, left, width, rotate, floatDistance, floatDuration, ...card } = spec;

  if (reduceMotion) {
    return (
      <div className="absolute" style={{ top, left, width, transform: `rotate(${rotate}deg)` }}>
        <CardBody {...card} />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute"
      style={{ top, left, width }}
      initial={{ opacity: 0, y: -140, rotate: 0 }}
      animate={
        landed
          ? { opacity: 1, rotate, y: [0, -floatDistance, 0] }
          : { opacity: 1, rotate, y: 0 }
      }
      transition={
        landed
          ? { y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" } }
          : { delay: index * 0.15, type: "spring", stiffness: 260, damping: 20 }
      }
      onAnimationComplete={() => {
        if (!landed) setLanded(true);
      }}
    >
      <CardBody {...card} />
    </motion.div>
  );
}

export function HeroCardsDesktop({ cards }: { cards: DesktopCardSpec[] }) {
  return (
    <div className="relative hidden h-[440px] sm:block">
      {cards.map((spec, index) => (
        <FloatingHeroCard key={spec.title} index={index} spec={spec} />
      ))}
    </div>
  );
}
