"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useI18n } from "@/components/locale-provider";
import { MR_GLOSSARY, translateUnit } from "@/lib/mr-glossary";
import { CATEGORY_MR } from "@/lib/i18n";

/**
 * Marathi name store — translates DB-driven strings (product names, brands,
 * categories, unit strings) so the WHOLE site flips to Marathi, not just
 * the static chrome (v0.12).
 *
 * Resolution order: glossary + category seed (instant) → unit pattern
 * (instant) → localStorage cache → POST /api/translate (LLM, batched +
 * debounced), whose results land in the server cache for every subsequent
 * visitor.
 *
 * Hydration contract: the store snapshot starts as the SAME deterministic
 * glossary map on server and client (no localStorage read at module init —
 * that would desync hydration). The localStorage cache is merged in only
 * from effects (post-hydration), exactly like the v0.10.2 lesson.
 */

const LS_KEY = "sss-mr-names-v1";
const FLUSH_MS = 260;
const MAX_BATCH = 120;

/* ── store ─────────────────────────────────────────────────────── */

const listeners = new Set<() => void>();

function buildInitial(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(MR_GLOSSARY)) m.set(k, v);
  // Static categories resolve instantly too (filter pills, chips, tiles).
  for (const [k, v] of Object.entries(CATEGORY_MR)) {
    if (!m.has(k)) m.set(k, v);
  }
  return m;
}

/** Deterministic first snapshot — identical on server & client. */
const INITIAL: ReadonlyMap<string, string> = buildInitial();
let snapshot: ReadonlyMap<string, string> = INITIAL;

const pending = new Set<string>();
const failed = new Set<string>();
let lsLoaded = false;
let inflight = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function notify() {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot(): ReadonlyMap<string, string> {
  return snapshot;
}

function getServerSnapshot(): ReadonlyMap<string, string> {
  return INITIAL;
}

function put(entries: Record<string, string>, persist: boolean) {
  const next = new Map(snapshot);
  let changed = false;
  for (const [k, v] of Object.entries(entries)) {
    if (typeof v === "string" && v.trim() && v !== k && !next.has(k)) {
      next.set(k, v.trim());
      changed = true;
    }
  }
  if (!changed) return;
  snapshot = next;
  notify();
  if (persist) {
    try {
      const plain: Record<string, string> = {};
      for (const [k, v] of snapshot)
        if (!MR_GLOSSARY[k] && !CATEGORY_MR[k]) plain[k] = v;
      localStorage.setItem(LS_KEY, JSON.stringify(plain));
    } catch {
      /* quota / private mode — ignore */
    }
  }
}

function loadLocalStorageOnce() {
  if (lsLoaded) return;
  lsLoaded = true;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") put(parsed, false);
  } catch {
    /* corrupted cache — ignore */
  }
}

async function flush() {
  if (inflight || pending.size === 0) return;
  inflight = true;
  const batch = Array.from(pending).slice(0, MAX_BATCH);
  for (const s of batch) pending.delete(s);
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: batch }),
    });
    if (res.ok) {
      const data = await res.json();
      const translations = data?.translations;
      if (translations && typeof translations === "object") {
        const learned: Record<string, string> = {};
        for (const s of batch) {
          if (typeof translations[s] === "string") learned[s] = translations[s];
          else failed.add(s);
        }
        put(learned, true);
      } else {
        for (const s of batch) failed.add(s);
      }
    } else {
      for (const s of batch) failed.add(s);
    }
  } catch {
    for (const s of batch) failed.add(s);
  } finally {
    inflight = false;
    if (pending.size > 0) {
      timer = setTimeout(flush, FLUSH_MS);
    }
  }
}

/**
 * Queue strings for Marathi translation. Glossary/unit hits resolve
 * synchronously; the rest go to /api/translate in one debounced batch.
 */
export function ensureNames(items: string[]) {
  if (typeof window === "undefined") return;
  loadLocalStorageOnce();
  for (const raw of items) {
    if (typeof raw !== "string") continue;
    const s = raw.trim();
    if (!s || s.length > 160) continue;
    if (snapshot.has(s) || pending.has(s) || failed.has(s)) continue;
    const unit = translateUnit(s);
    if (unit) {
      put({ [s]: unit }, false);
      continue;
    }
    pending.add(s);
  }
  if (pending.size > 0 && !inflight) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, FLUSH_MS);
  }
}

/* ── hooks ─────────────────────────────────────────────────────── */

/**
 * Translate ONE DB string for the active locale. Returns the English
 * original until the Marathi lands (glossary hits are instant).
 */
export function useMrName(s: string): string {
  const { isMarathi } = useI18n();
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (isMarathi) ensureNames([s]);
  }, [isMarathi, s]);
  return isMarathi ? (snap.get(s) ?? s) : s;
}

/** Whole translation map — for search matching against Marathi names. */
export function useMrNamesMap(): ReadonlyMap<string, string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
