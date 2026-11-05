"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

/**
 * The one-click language toggle (v0.12).
 *
 * A single click flips the ENTIRE site between English and Marathi
 * (instant client-side switch — no reload). Two placements:
 *  - variant="header"  → pill button in the desktop header bar
 *  - variant="dock"    → 4th item in the mobile bottom dock
 *
 * The label always shows the language you'll switch TO: English users see
 * "मराठी", Marathi users see "English".
 */

export function LanguageToggle({
  variant = "header",
  className,
}: {
  variant?: "header" | "dock";
  className?: string;
}) {
  const { isMarathi, toggleLocale, t } = useI18n();
  const label = isMarathi ? "English" : "मराठी";
  const aria = isMarathi
    ? t("lang.toggle-aria-mr")
    : t("lang.toggle-aria-en");

  if (variant === "dock") {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        aria-label={aria}
        title={aria}
        className={cn(
          "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors",
          "text-stone-500 hover:text-stone-800 active:scale-95",
          className,
        )}
      >
        <Languages className="h-5 w-5" aria-hidden />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={aria}
      title={aria}
      className={cn(
        "pill-link inline-flex h-11 shrink-0 items-center gap-1.5 px-3.5 text-sm font-bold",
        "active:scale-95",
        className,
      )}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
