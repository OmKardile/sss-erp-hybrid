// Engine core: page lifecycle. No DOM access at import time (SSR-safe). No GL in this
// project. (Ported from /awwwards skill engine.)
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScroll, resetScroll, startScroll, stopScroll } from "./scroll";
import { initReveals, startRevealObserver } from "./reveal";
import { runLoader } from "./loader";
import { playEnter, playLeave } from "./transition";
import { prefersReducedMotion } from "./env";

export {
  onScroll,
  scrollState,
  scrollToTarget,
  stopScroll,
  startScroll,
} from "./scroll";
export { setTransition } from "./transition";
export { setLoaderFormat, setLoaderExit } from "./loader";
export { ease, isTouch, isMobile, prefersReducedMotion } from "./env";
export { wireNewReveals } from "./reveal";

export type PageFn = (
  page: { intro: gsap.core.Timeline; path: string },
) => void | (() => void);
const pageFns = new Set<PageFn>();
const cleanups: (() => void)[] = [];
let ctx: gsap.Context | null = null;
let intro: gsap.core.Timeline | null = null;
let ready = false;
let booted = false;

/** Run fn on every page load (and now, if a page is ready). Returns an unsubscribe. */
export function onPage(fn: PageFn) {
  pageFns.add(fn);
  if (ready) runPageFn(fn);
  return () => {
    pageFns.delete(fn);
  };
}

function runPageFn(fn: PageFn) {
  ctx?.add(() => {
    const c = fn({ intro: intro!, path: location.pathname });
    if (typeof c === "function") cleanups.push(c);
  });
}

// Flags on <html>. Re-applied on every page because some routers swap root attributes.
export function syncFlags() {
  const h = document.documentElement.classList;
  h.add("js", "is-booted");
  h.toggle("motion", !prefersReducedMotion());
}

function initPage() {
  syncFlags();
  ctx = gsap.context(() => {
    intro = initReveals(document);
  });
  ready = true;
  pageFns.forEach(runPageFn);
  requestAnimationFrame(() => ScrollTrigger.refresh());
  startRevealObserver(); // late-mounted content (client-fetched products)
  // Fonts and late images shift layout AFTER the initial refresh —
  // recompute trigger positions when they settle, or below-fold
  // reveals keep stale start points and never fire.
  if (typeof document !== "undefined" && (document as any).__sssRefreshWired !== true) {
    (document as any).__sssRefreshWired = true;
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    if (document.readyState !== "complete") {
      window.addEventListener(
        "load",
        () => ScrollTrigger.refresh(),
        { once: true },
      );
    }
  }
}

/** First load. `setup` runs once on the client after scroll init and before the first
 *  page: register setTransition, setLoaderFormat, setLoaderExit and driver modules there. */
export async function boot(setup?: () => void) {
  if (booted) return;
  booted = true;
  syncFlags();
  initScroll();
  setup?.();
  stopScroll();
  initPage();
  await runLoader();
  startScroll();
  intro?.play();
}

/** Play the leave animation (resolve when the screen is covered). */
export async function leave() {
  stopScroll();
  await playLeave();
}

/** Tear down the current page: reverts every tween, ScrollTrigger and split. */
export function cleanup() {
  if (!ready) return;
  ready = false;
  cleanups.splice(0).forEach((c) => c());
  ctx?.revert();
  ctx = null;
}

/** Init the new page. `transition: false` for back/forward, where no leave ran. */
export async function enter({
  transition = true,
  scrollTop = true,
}: { transition?: boolean; scrollTop?: boolean } = {}) {
  if (!booted) return;
  cleanup(); // no-op if the adapter already cleaned up
  if (scrollTop) resetScroll();
  initPage();
  if (transition) await playEnter();
  startScroll();
  intro?.play();
}
