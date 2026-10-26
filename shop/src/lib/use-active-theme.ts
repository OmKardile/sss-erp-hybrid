"use client";

/**
 * useActiveTheme — hydration-safe client hook for the festive theme.
 *
 * The theme is derived from the IST date, so the server snapshot is always
 * null (no festive chrome during SSR) and the client snapshot is the active
 * theme. useSyncExternalStore handles the post-hydration swap without a
 * setState-in-effect, and the snapshot is cached per IST date so React's
 * Object.is comparison stays stable.
 */

import { useSyncExternalStore } from "react";
import { getActiveTheme, istDateStr, type FestiveTheme } from "./festive";

const noopSubscribe = () => () => {};

let cache: { dateKey: string; theme: FestiveTheme | null } | null = null;

function clientSnapshot(): FestiveTheme | null {
  const key = istDateStr();
  if (!cache || cache.dateKey !== key) {
    cache = { dateKey: key, theme: getActiveTheme() };
  }
  return cache.theme;
}

function serverSnapshot(): FestiveTheme | null {
  return null;
}

export function useActiveTheme(): FestiveTheme | null {
  return useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot);
}
