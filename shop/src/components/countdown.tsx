"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * DealCountdown — live "deal ends in HH:MM:SS" timer to the next
 * midnight IST, the moment the daily deal rotates (quick-commerce
 * urgency pattern — Blinkit/Zepto style).
 *
 * - Hydration-safe: the server and first client paint render a stable
 *   placeholder ("--:--:--"); ticking starts after mount.
 * - IST-correct on any device: computed from UTC + 5:30, never from
 *   the visitor's local clock.
 * - Digit segments slide vertically when their value changes; only the
 *   changing segment animates (seconds ticks, minutes/Hours follow).
 * - prefers-reduced-motion: values swap as plain text.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Milliseconds remaining until the next midnight IST. */
function msUntilMidnightIST(now = Date.now()): number {
  const ist = new Date(now + IST_OFFSET_MS);
  const msIntoDay =
    ist.getUTCHours() * 3600_000 +
    ist.getUTCMinutes() * 60_000 +
    ist.getUTCSeconds() * 1000 +
    ist.getUTCMilliseconds();
  return DAY_MS - msIntoDay;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function DigitSlot({ value }: { value: string }) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <span className="tabular-nums">{value}</span>;
  }

  return (
    <span
      className="relative block h-[1.15em] w-[2ch] overflow-hidden"
      aria-hidden
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="absolute inset-0 flex items-center justify-center tabular-nums"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface DealCountdownProps {
  className?: string;
  /** `onDark` renders glass-digit chips for dark/gradient surfaces. */
  variant?: "default" | "onDark";
}

export function DealCountdown({ className, variant = "default" }: DealCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(msUntilMidnightIST());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = remaining === null ? null : Math.floor(remaining / 1000);
  const hours = totalSeconds === null ? null : Math.floor(totalSeconds / 3600);
  const minutes =
    totalSeconds === null ? null : Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds === null ? null : totalSeconds % 60;

  const segments =
    hours === null || minutes === null || seconds === null
      ? null
      : [
          { key: "h", value: pad(hours), label: "hrs" },
          { key: "m", value: pad(minutes), label: "min" },
          { key: "s", value: pad(seconds), label: "sec" },
        ];

  const onDark = variant === "onDark";

  return (
    <div
      className={cn("flex flex-col items-center gap-1 sm:items-end", className)}
      role="timer"
      aria-label="Time remaining for today's deal"
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          onDark ? "text-amber-100/90" : "text-stone-500",
        )}
      >
        Deal ends in
      </p>
      <p className="flex items-center gap-1">
        {segments === null ? (
          <span
            className={cn(
              "font-mono text-sm font-bold tabular-nums",
              onDark ? "text-white" : "text-stone-900",
            )}
          >
            --:--:--
          </span>
        ) : (
          segments.map((seg, i) => (
            <span key={seg.key} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  className={cn(
                    "font-mono text-sm font-bold",
                    onDark ? "text-white/70" : "text-stone-400",
                  )}
                  aria-hidden
                >
                  :
                </span>
              )}
              <span className="inline-flex flex-col items-center">
                <span
                  className={cn(
                    "inline-flex h-6 min-w-[2.1rem] items-center justify-center rounded-md px-1 font-mono text-sm font-bold shadow-sm",
                    onDark
                      ? "border border-white/25 bg-white/15 text-white backdrop-blur"
                      : "border border-amber-200 bg-white text-stone-900",
                  )}
                >
                  <DigitSlot value={seg.value} />
                </span>
                <span className="sr-only">
                  {seg.value} {seg.label}
                </span>
              </span>
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase",
                  onDark ? "text-amber-100/80" : "text-stone-400",
                )}
                aria-hidden
              >
                {seg.label}
              </span>
            </span>
          ))
        )}
      </p>
    </div>
  );
}
