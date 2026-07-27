"use client";

import { motion, useReducedMotion } from "framer-motion";

// "How it works" timeline step — reveals on scroll (fade + slide in from
// its own side) rather than on mount, since the steps are stacked down the
// page and should read as unfolding one by one as the visitor scrolls
// through them, not all at once on load.
export function HowStep({
  side,
  number,
  tone,
  title,
  body,
  last = false,
}: {
  side: "left" | "right";
  number: number;
  tone: "accent" | "accent-secondary";
  title: string;
  body: string;
  last?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const slideFrom = side === "left" ? 24 : -24;

  // Mobile (<sm): single left-aligned column, circle always in col 1 —
  // the desktop alternating-sides layout has no room to work with at
  // narrow widths. Desktop (sm+): circle explicitly placed in the middle
  // column regardless of DOM order, text explicitly placed left or right
  // per `side` — explicit grid-column placement overrides source order,
  // so this needs no separate mobile/desktop markup, just responsive
  // column-start utilities on a template that itself changes at sm:.
  const circle = (
    <motion.div
      className="col-start-1 flex justify-center sm:col-start-2"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-extrabold text-surface ${
          tone === "accent" ? "bg-accent" : "bg-accent-secondary"
        }`}
      >
        {number}
      </div>
    </motion.div>
  );

  const text = (
    <motion.div
      className={`col-start-2 pl-4 text-left ${
        side === "left" ? "sm:col-start-1 sm:pr-7 sm:pl-0 sm:text-right" : "sm:col-start-3 sm:pl-7 sm:text-left"
      } ${last ? "" : "pb-[60px]"}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16, x: slideFrom }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      <div className="mb-2 font-serif text-lg font-semibold">{title}</div>
      <div className="text-[15px] leading-relaxed text-muted">{body}</div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-[44px_1fr] items-start sm:grid-cols-[1fr_44px_1fr]">
      {circle}
      {text}
    </div>
  );
}
