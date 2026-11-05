"use client";

import { Flame, Sparkles, Star, Heart, Moon, Flag, Gift, TicketPercent } from "lucide-react";
import { useActiveTheme } from "@/lib/use-active-theme";
import { festiveFor } from "@/lib/i18n";
import { AnimatedIcon } from "@/components/animated-icon";
import { useI18n } from "@/components/locale-provider";

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
 * when a festival window is active. Animated sparkle (reduced-motion safe).
 * Fully localized (v0.12) — festival name, greeting and ends-label come
 * from festiveFor(), so Marathi visitors see the strip in Marathi too.
 */
export function FestiveStrip() {
  const theme = useActiveTheme();
  const { t, locale } = useI18n();

  if (!theme) return null;

  const loc = festiveFor(theme, locale);
  const FallbackIcon = STRIP_ICONS[theme.stripIcon] ?? Star;

  return (
    <section
      aria-label={t("festive.offers-aria", { festival: loc.festival })}
      className={theme.stripClass}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <AnimatedIcon
            name="sparkle"
            size={14}
            trigger="loop"
            speed={0.7}
            fallback={FallbackIcon}
          />
          {loc.greeting}
        </span>
        {theme.coupon && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md">
            <TicketPercent className="h-3 w-3 shrink-0" aria-hidden />
            {t("festive.use-code", { code: theme.coupon.code })}
          </span>
        )}
        <span className="hidden text-[11px] opacity-80 sm:inline">
          {loc.endsLabel}
        </span>
      </div>
    </section>
  );
}
