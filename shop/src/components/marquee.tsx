"use client";

/**
 * Marquee — infinite scrolling ticker (Awwwards staple).
 * Content is duplicated for a seamless -50% loop; the duplicate is
 * aria-hidden. Pauses on hover; respects prefers-reduced-motion
 * (static, no animation) via the .marquee-track CSS rules.
 */
export function Marquee({
  items,
  variant = "band",
  duration = 26,
  className = "",
}: {
  items: string[];
  /** band = vivid gradient band with white text | light = glass band */
  variant?: "band" | "light";
  /** seconds per loop */
  duration?: number;
  className?: string;
}) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-center whitespace-nowrap"
        >
          <span className="font-display text-sm font-bold uppercase tracking-[0.14em] sm:text-base">
            {item}
          </span>
          {/* Sparkle separator — rotates slowly for life */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-5 h-4 w-4 shrink-0 text-lime-300 sm:mx-7 sm:h-5 sm:w-5"
            fill="currentColor"
          >
            <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12C7.5 10.2 11.1 6.6 12 0Z" />
          </svg>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`marquee-paused relative overflow-hidden py-3 sm:py-3.5 ${
        variant === "band"
          ? "bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white shadow-[0_10px_36px_rgba(6,78,59,0.28)]"
          : "glass text-stone-800"
      } ${className}`}
    >
      {/* Specular top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />
      <div
        className="marquee-track"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
