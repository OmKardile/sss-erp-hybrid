"use client";

import { Flame, Sparkles, Star, Heart, Moon, Flag, Gift, TicketPercent } from "lucide-react";
import { useActiveTheme } from "@/lib/use-active-theme";

const STRIP_ICONS = {
  flame: Flame,
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  moon: Moon,
  flag: Flag,
  gift: Gift,
} as const;

/**
 * Festive strip — thin banner directly under the header on every page,
 * the way quick-commerce apps (Blinkit/Zepto) surface festival offers.
 *
 * Snapshot-based: nothing on the server, the strip appears post-hydration
 * when a festival window is active. Static — no animation.
 */
export function FestiveStrip() {
  const theme = useActiveTheme();

  if (!theme) return null;

  const Icon = STRIP_ICONS[theme.stripIcon] ?? Flame;

  return (
    <section
      aria-label={`${theme.festival} offers`}
      className={theme.stripClass}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {theme.greeting}
        </span>
        {theme.coupon && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/25 bg-black/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide">
            <TicketPercent className="h-3 w-3 shrink-0" aria-hidden />
            Use code {theme.coupon.code}
          </span>
        )}
        <span className="hidden text-[11px] opacity-80 sm:inline">
          {theme.endsLabel}
        </span>
      </div>
    </section>
  );
}
