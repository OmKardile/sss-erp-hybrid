"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Parallax — scroll-driven Y translation with depth.
 * `from`/`to` are pixel offsets applied across the element's travel
 * through the viewport (start end → end start). Reduced-motion users
 * get a static render (no transform).
 */
export function Parallax({
  children,
  from = 40,
  to = -40,
  className,
}: {
  children: ReactNode;
  /** px offset when the element enters the viewport bottom */
  from?: number;
  /** px offset when the element leaves the viewport top */
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/**
 * ParallaxX — horizontal drift (giant background words etc.).
 */
export function ParallaxX({
  children,
  from = 0,
  to = -80,
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { x }}>{children}</motion.div>
    </div>
  );
}
