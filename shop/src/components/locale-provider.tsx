"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_COOKIE,
  translate,
  type Locale,
} from "@/lib/i18n";

/**
 * Locale context — one-click Marathi (v0.12).
 *
 * Hydration contract: the server layout reads the `sss_locale` cookie and
 * passes `initialLocale` down, so the SSR HTML and the first client render
 * are identical BY CONSTRUCTION (no flash, no mismatch — the same pattern
 * lesson as v0.10.2). Toggling writes the cookie (so the next hard load
 * renders Marathi server-side) and updates <html lang> directly.
 */

interface I18nContextValue {
  locale: Locale;
  isMarathi: boolean;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l === "mr" ? "mr" : "en";
    } catch {
      /* non-browser — ignore */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "mr" : "en");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, isMarathi: locale === "mr", setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}

/** Accessible skip link — client so its label follows the locale. */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a className="skip-link" href="#main">
      {t("skip.content")}
    </a>
  );
}
