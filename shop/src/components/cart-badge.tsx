"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { POP_SPRING } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * CartBadge — the live item-count pill. Pops with a spring whenever the
 * count changes (add to cart, quantity update) — the classic quick-
 * commerce "something landed in your cart" delight.
 *
 * Positioning and colors come from the parent; this component only
 * owns the number and its entrance. Re-mounts per value via `key`.
 */
export function CartBadge({
  count,
  className,
  "aria-label": ariaLabel,
}: {
  count: number;
  className?: string;
  "aria-label"?: string;
}) {
  const reduce = usePrefersReducedMotion();

  return (
    <motion.span
      key={count}
      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : POP_SPRING}
      aria-label={ariaLabel}
      className={cn(
        "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}
