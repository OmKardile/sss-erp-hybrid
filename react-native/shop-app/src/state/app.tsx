/**
 * App-wide state: locale (EN/MR one-click), live API base URL, and the
 * Marathi name translator (glossary-first, learned-translations cache).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { categoryFor, translate, type Locale } from "../lib/i18n";
import { MR_GLOSSARY, translateUnit } from "../lib/glossary";
import { ShopApi } from "../lib/api";

const LOCALE_KEY = "sss.locale";
const API_BASE_KEY = "sss.apiBase";
const NAMES_KEY = "sss.mrNames";

interface AppContextValue {
  locale: Locale;
  isMr: boolean;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  /** Translate a static UI string (dict key). */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Translate a DB-driven string (product name / unit) for the current locale. */
  name: (s: string) => string;
  cat: (s: string) => string;
  /** Learn Marathi translations for a batch of strings (live mode only). */
  learnNames: (items: string[]) => void;
  apiBase: string;
  setApiBase: (v: string) => void;
  api: ShopApi;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [apiBase, setApiBaseState] = useState("");
  const [learned, setLearned] = useState<Record<string, string>>({});

  // hydrate persisted state once
  useEffect(() => {
    (async () => {
      try {
        const [l, b, n] = await Promise.all([
          AsyncStorage.getItem(LOCALE_KEY),
          AsyncStorage.getItem(API_BASE_KEY),
          AsyncStorage.getItem(NAMES_KEY),
        ]);
        if (l === "mr" || l === "en") setLocaleState(l);
        if (typeof b === "string") setApiBaseState(b);
        if (n) {
          try {
            setLearned(JSON.parse(n));
          } catch {}
        }
      } catch {}
    })();
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    AsyncStorage.setItem(LOCALE_KEY, l).catch(() => {});
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "en" ? "mr" : "en";
      AsyncStorage.setItem(LOCALE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const setApiBase = useCallback((v: string) => {
    const trimmed = v.trim();
    setApiBaseState(trimmed);
    AsyncStorage.setItem(API_BASE_KEY, trimmed).catch(() => {});
  }, []);

  const persistLearned = useCallback((map: Record<string, string>) => {
    AsyncStorage.setItem(NAMES_KEY, JSON.stringify(map)).catch(() => {});
  }, []);

  /**
   * Glossary → learned-cache → (live mode) batched /api/translate.
   * Newly learned strings are cached so the app stays instant afterwards.
   */
  const name = useCallback(
    (s: string): string => {
      if (locale !== "mr" || !s) return s;
      if (MR_GLOSSARY[s]) return MR_GLOSSARY[s];
      const unit = translateUnit(s);
      if (unit) return unit;
      return learned[s] ?? s;
    },
    [locale, learned],
  );

  /** Learn translations for a batch of strings (called after catalog loads in live mode). */
  const learnNames = useCallback(
    (items: string[]) => {
      if (locale !== "mr" || !/^https?:\/\//.test(apiBase)) return;
      const missing = Array.from(
        new Set(
          items.filter(
            (s) => s && s.length <= 160 && !MR_GLOSSARY[s] && !translateUnit(s) && !learned[s],
          ),
        ),
      ).slice(0, 60);
      if (missing.length === 0) return;
      fetch(`${apiBase.replace(/\/+$/, "")}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: missing }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const translations = data?.translations;
          if (translations && typeof translations === "object") {
            setLearned((prev) => {
              const next = { ...prev, ...translations };
              persistLearned(next);
              return next;
            });
          }
        })
        .catch(() => {});
    },
    [apiBase, locale, learned, persistLearned],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  const cat = useCallback((s: string) => categoryFor(locale, s), [locale]);

  const api = useMemo(() => new ShopApi(apiBase), [apiBase]);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      isMr: locale === "mr",
      setLocale,
      toggleLocale,
      t,
      name,
      cat,
      learnNames,
      apiBase,
      setApiBase,
      api,
    } as AppContextValue),
    [locale, setLocale, toggleLocale, t, name, cat, learnNames, apiBase, setApiBase, api],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
