"use client";

/**
 * Recently viewed — localStorage tracker + home rail.
 * No accounts needed (session-cookie store), so history lives in the
 * browser only. We keep the last 8 product slugs.
 */

const KEY = "sss:recently-viewed";

/** Snapshot cache so useSyncExternalStore sees a stable reference. */
let cache: string[] | null = null;

export function recordRecentlyViewed(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(next));
    cache = null; // invalidate for the next snapshot read
  } catch {
    /* storage unavailable — non-critical */
  }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Cached variant — stable reference between calls (React snapshot rules). */
export function getRecentlyViewedSnapshot(): string[] {
  if (!cache) cache = getRecentlyViewed();
  return cache;
}

/** Test hook — not used in production code paths. */
export function invalidateRecentlyViewedCache(): void {
  cache = null;
}
