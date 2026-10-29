"use client";

import { useSyncExternalStore } from "react";

/**
 * usePrefersReducedMotion — hydration-safe prefers-reduced-motion.
 *
 * framer-motion's `useReducedMotion()` returns `null` on the server but the
 * real browser preference during client hydration. Any component that
 * branches its rendered output on it (`initial={reduce ? false : {...}}`,
 * `style={reduce ? undefined : { y }}`, or a whole-tree swap) therefore
 * produces React 19 hydration mismatches for users with "reduce motion"
 * enabled: the server HTML carries the animated initial states while the
 * client renders the static ones.
 *
 * This hook pins the value to `false` for SSR AND the hydration render
 * (via getServerSnapshot — React's sanctioned pattern; it renders the
 * server snapshot first, then re-reads the client snapshot right after
 * hydration without warning). Components render identically on both
 * sides; reduced-motion users get their static variant one commit later.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

let cachedMql: MediaQueryList | null = null;

function getMql(): MediaQueryList {
  if (!cachedMql) {
    cachedMql = window.matchMedia(QUERY);
  }
  return cachedMql;
}

function subscribe(onStoreChange: () => void): () => void {
  const mql = getMql();
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return getMql().matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
