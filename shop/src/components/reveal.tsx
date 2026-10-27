"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Shared motion language for the storefront.
 *
 * Photography-first: small travel (12–20px), ~400ms, a soft editorial
 * ease that pairs with the Fraunces display face. Everything here is
 * disabled for prefers-reduced-motion users — they get the static page.
 */

/** Soft ease-out used by every reveal/entrance in the app. */
export const EASE_OUT: [number, number, number, number] = [
  0.22, 0.61, 0.36, 1,
];

/** Gentle spring for small UI feedback (badges, pills). */
export const POP_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 24,
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after entering the viewport (stagger support). */
  delay?: number;
  /** Vertical travel in px (default 16). Keep it small — this is a nudge. */
  y?: number;
  /** Re-animate every time it re-enters the viewport (default: once). */
  once?: boolean;
}

/**
 * Reveal — fade + rise as a section scrolls into view.
 *
 * Below-the-fold sections only (never wrap sticky or fixed children —
 * the transform would change their containing block). The 48px bottom
 * margin means content starts revealing just before it fully enters,
 * so nothing ever feels late.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -48px 0px" }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
