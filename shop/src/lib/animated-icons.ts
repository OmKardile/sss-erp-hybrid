import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Home,
  LayoutGrid,
  Plus,
  Check,
  Flame,
  Truck,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";

/**
 * Animated icon registry — Lordicon "wired" Lottie icons, self-hosted.
 *
 * Licensing (recorded in decisions.md): the JSON files on disk are PRISTINE
 * downloads from cdn.lordicon.com (free plan, CC BY-ND 4.0). The
 * NoDerivatives clause means we never redistribute edited files — instead
 * the brand palette is applied at RUNTIME, in memory (see recolorLottie),
 * which mirrors how Lordicon's own embed player handles colors. Attribution
 * lives in the store footer ("Animated icons by Lordicon").
 *
 * Each variant pairs the Lottie source with a Lucide fallback used for
 * SSR, slow networks, and prefers-reduced-motion users.
 */

export type AnimatedIconName =
  | "cart"
  | "cart-light"
  | "home"
  | "grid"
  | "plus"
  | "check"
  | "check-white"
  | "fire"
  | "truck"
  | "clock"
  | "sparkle"
  | "trash";

export interface AnimatedIconSpec {
  /** Pristine Lordicon Lottie JSON (public/). Never edited on disk. */
  src: string;
  /** Runtime in-memory color remap: source hex → target hex. */
  colors: Record<string, string>;
  /** Lucide icon shown before the animation loads (and on failure). */
  fallback: LucideIcon;
  /**
   * Fraction of the timeline (0–1, default 1) where the icon rests when
   * not animating. Lordicon "wired" icons draw in from a blank frame 0,
   * and some morph afterwards (plus → x, home → buildings) — so the
   * resting frame is the last frame by default, overridden per icon.
   */
  park?: number;
  /**
   * For loop triggers: fraction where the loop starts (default 0). Skips
   * the draw-in segment so the loop cycles only the “alive” part (e.g.
   * the fire flicker, the driving truck) instead of re-drawing each cycle.
   */
  loopFrom?: number;
}

/* Store palette (Tailwind): stone-900 #1c1917 · stone-600 #57534e ·
 * emerald-700 #047857 · emerald-600 #059669 · emerald-300 #6ee7b7 ·
 * orange-950 #431407 · orange-600 #ea580c · amber-500 #f59e0b ·
 * amber-300 #fcd34d · amber-400 #fbbf24 · rose-600 #e11d48 */

export const ANIMATED_ICONS: Record<AnimatedIconName, AnimatedIconSpec> = {
  /* Shopping trolley — light backgrounds (mobile nav, cart empty state). */
  cart: {
    src: "/icons/animated/cart.json",
    colors: {
      "#121331": "#1c1917",
      "#000000": "#1c1917",
      "#08a88a": "#059669",
      "#ffff00": "#f59e0b",
    },
    loopFrom: 0.25,
    fallback: ShoppingCart,
  },
  /* Same trolley, recolored for emerald/dark surfaces (header, pill buttons). */
  "cart-light": {
    src: "/icons/animated/cart.json",
    colors: {
      "#121331": "#ffffff",
      "#000000": "#ffffff",
      "#08a88a": "#6ee7b7",
      "#ffff00": "#fcd34d",
    },
    fallback: ShoppingCart,
  },
  home: {
    src: "/icons/animated/home.json",
    colors: {
      "#121331": "#57534e",
      "#000000": "#57534e",
      "#08a88a": "#059669",
    },
    park: 0.6,
    fallback: Home,
  },
  grid: {
    src: "/icons/animated/grid.json",
    colors: {
      "#121331": "#57534e",
      "#000000": "#57534e",
      "#08a88a": "#059669",
    },
    fallback: LayoutGrid,
  },
  /* Plus that morphs +↔x — used on "Add" buttons (emerald-50 surface).
   * Parks at 30%: the fully drawn +, before the morph to x/minus. */
  plus: {
    src: "/icons/animated/plus.json",
    colors: {
      "#121331": "#065f46",
      "#000000": "#065f46",
      "#08a88a": "#059669",
    },
    park: 0.3,
    fallback: Plus,
  },
  /* Self-drawing checkmark — light backgrounds. */
  check: {
    src: "/icons/animated/check.json",
    colors: {
      "#121331": "#047857",
      "#000000": "#047857",
    },
    fallback: Check,
  },
  "check-white": {
    src: "/icons/animated/check.json",
    colors: {
      "#121331": "#ffffff",
      "#000000": "#ffffff",
    },
    fallback: Check,
  },
  /* Flickering bonfire — Deal of the Day badge (amber pill). */
  fire: {
    src: "/icons/animated/fire.json",
    colors: {
      "#121331": "#431407",
      "#000000": "#431407",
      "#ffff00": "#fbbf24",
      "#08a88a": "#ea580c",
      "#ff0000": "#ea580c",
    },
    loopFrom: 0.3,
    fallback: Flame,
  },
  truck: {
    src: "/icons/animated/truck.json",
    colors: {
      "#121331": "#1c1917",
      "#000000": "#1c1917",
      "#08a88a": "#059669",
      "#ffff00": "#f59e0b",
    },
    loopFrom: 0.6,
    fallback: Truck,
  },
  clock: {
    src: "/icons/animated/clock.json",
    colors: {
      "#121331": "#57534e",
      "#000000": "#57534e",
      "#2ebf00": "#059669",
      "#08a88a": "#059669",
    },
    fallback: Clock,
  },
  /* Shooting stars — festive strip (dark warm festival backgrounds). */
  sparkle: {
    src: "/icons/animated/sparkle.json",
    colors: {
      "#121331": "#fff7ed",
      "#000000": "#fff7ed",
      "#ffff00": "#fcd34d",
      "#ff0000": "#fda4af",
      "#00ff00": "#6ee7b7",
      "#08a88a": "#6ee7b7",
    },
    fallback: Sparkles,
  },
  trash: {
    src: "/icons/animated/trash.json",
    colors: {
      "#121331": "#a8a29e",
      "#000000": "#a8a29e",
      "#08a88a": "#a8a29e",
      "#ff0000": "#e11d48",
    },
    fallback: Trash2,
  },
};

/* ------------------------------------------------------------------ */
/* Runtime recoloring (in-memory only — files on disk stay pristine)   */
/* ------------------------------------------------------------------ */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

/** Lottie floats are rounded — allow a small per-channel tolerance. */
function matchesColor(k: number[], target: Rgb): boolean {
  return (
    Math.abs(k[0] - target.r) <= 0.02 &&
    Math.abs(k[1] - target.g) <= 0.02 &&
    Math.abs(k[2] - target.b) <= 0.02
  );
}

/**
 * Clone the animation data and remap solid fill/stroke colors
 * ({"c":{"a":0,"k":[r,g,b]}} nodes) per the palette. The input object is
 * never mutated; the returned clone is per-instance because lottie-web
 * annotates the data it renders.
 */
export function recolorLottie(
  data: unknown,
  palette: Record<string, string>,
): unknown {
  const clone = structuredClone(data) as Record<string, unknown> | unknown[];
  const rules = Object.entries(palette).map(([from, to]) => ({
    from: hexToRgb(from),
    to: hexToRgb(to),
  }));

  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    const obj = node as Record<string, any>;
    // Lordicon "wired" strokes/fills carry a `cl` (CSS class) reference —
    // without Lordicon's player CSS the stroke would render undefined.
    // Strip it so the SVG writes explicit color attributes instead.
    if (obj.ty === "st" || obj.ty === "fl") {
      delete obj.cl;
    }
    // Mechanism 1 — static color properties {"c":{"a":0,"k":[r,g,b]}}.
    const c = obj.c;
    if (
      c &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      c.a === 0 &&
      Array.isArray(c.k) &&
      c.k.length >= 3 &&
      c.k.every((v: unknown) => typeof v === "number")
    ) {
      const rule = rules.find((r) => matchesColor(c.k, r.from));
      if (rule) {
        c.k[0] = rule.to.r;
        c.k[1] = rule.to.g;
        c.k[2] = rule.to.b;
      }
    }
    // Mechanism 2 — Lordicon control-layer color effects: the wired family
    // drives primary/secondary strokes through expressions that read
    // effect color values ({"ty":2, "v":{"a":0,"k":[r,g,b]}}). Remap those
    // too, otherwise the expressions keep the original palette.
    if (obj.ty === 2 && obj.v && !Array.isArray(obj.v)) {
      const v = obj.v as Record<string, any>;
      if (
        v.a === 0 &&
        Array.isArray(v.k) &&
        v.k.length >= 3 &&
        v.k.every((x: unknown) => typeof x === "number")
      ) {
        const rule = rules.find((r) => matchesColor(v.k, r.from));
        if (rule) {
          v.k[0] = rule.to.r;
          v.k[1] = rule.to.g;
          v.k[2] = rule.to.b;
        }
      }
    }
    for (const key of Object.keys(obj)) {
      if (key !== "c" && key !== "v") walk(obj[key]);
    }
  };

  walk(clone);
  return clone;
}

/* ------------------------------------------------------------------ */
/* Lazy loading with caches (raw JSON per file, recolored per variant) */
/* ------------------------------------------------------------------ */

const rawJsonCache = new Map<string, Promise<unknown>>();
const recoloredCache = new Map<AnimatedIconName, Promise<unknown>>();

/** Fetch (once) + recolor (per variant) an icon's animation data. */
export function getAnimationData(name: AnimatedIconName): Promise<unknown> {
  const existing = recoloredCache.get(name);
  if (existing) return existing;

  const spec = ANIMATED_ICONS[name];
  let raw = rawJsonCache.get(spec.src);
  if (!raw) {
    raw = fetch(spec.src).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load ${spec.src} (${res.status})`);
      }
      return res.json();
    });
    rawJsonCache.set(spec.src, raw);
  }

  const recolored = raw.then((data) => recolorLottie(data, spec.colors));
  recoloredCache.set(name, recolored);
  // A failed entry evicts itself so a later mount can retry.
  recolored.catch(() => recoloredCache.delete(name));
  return recolored;
}
