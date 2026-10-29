"use client";

import { ParallaxX } from "@/components/parallax";

/**
 * GiantWord — huge outlined display word drifting horizontally on
 * scroll, layered behind a section (Awwwards backdrop typography).
 * Decorative only (aria-hidden); pointer-events disabled.
 */
export function GiantWord({
  word,
  className = "",
  drift = -90,
}: {
  word: string;
  className?: string;
  /** horizontal px drift across the section's viewport travel */
  drift?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -z-0 select-none overflow-hidden ${className}`}
    >
      <ParallaxX from={30} to={drift}>
        <span className="text-outline font-display block whitespace-nowrap text-center text-[clamp(5rem,18vw,16rem)] font-extrabold leading-none tracking-tight">
          {word}
        </span>
      </ParallaxX>
    </div>
  );
}
