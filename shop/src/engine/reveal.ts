// Declarative motion through data attributes (ported from /awwwards skill engine):
//   data-split="lines|words|chars"   masked text reveal (SplitText), on scroll or on intro
//   data-reveal="up|fade|clip|scale"  block reveal
//   data-intro                        play with the page intro instead of on scroll
//   data-delay="0.2"                  extra delay (seconds)
//   data-parallax="0.15"              scrubbed vertical drift (fraction of element height)
// Every effect is skipped under reduced motion; CSS keeps content visible without JS.
// Only put data-split on text that never re-renders on the client.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ease, prefersReducedMotion } from "./env";

gsap.registerPlugin(ScrollTrigger, SplitText);

const durations = { lines: 1.2, words: 1.1, chars: 0.9 } as const;
const staggers = { lines: 0.08, words: 0.035, chars: 0.018 } as const;

// autoSplit re-splits after font load / resize. A text that already revealed must stay
// revealed, so the state lives outside onSplit.
function splitTween(el: HTMLElement, isIntro: boolean) {
  const type = (el.dataset.split || "lines") as keyof typeof durations;
  const delay = parseFloat(el.dataset.delay || "0");
  const s = {
    tween: undefined as gsap.core.Tween | undefined,
    done: false,
    requested: false,
  };
  SplitText.create(el, {
    type: type === "lines" ? "lines" : `lines,${type}`,
    mask: "lines",
    autoSplit: true,
    linesClass: "split-line",
    onSplit(self) {
      gsap.set(el, { visibility: "visible" });
      if (s.done) return;
      const targets =
        type === "lines"
          ? self.lines
          : type === "words"
            ? self.words
            : self.chars;
      s.tween = gsap.from(targets, {
        yPercent: 110,
        rotate: type === "chars" ? 0 : 2,
        duration: durations[type],
        stagger: staggers[type],
        ease: ease.out,
        delay,
        paused: isIntro && !s.requested,
        onComplete: () => {
          s.done = true;
        },
        scrollTrigger: isIntro
          ? undefined
          : { trigger: el, start: "top 88%", once: true },
      });
      return s.tween;
    },
  });
  return () => {
    s.requested = true;
    s.tween?.play();
  };
}

function blockTween(el: HTMLElement, paused: boolean) {
  const kind = el.dataset.reveal || "up";
  const delay = parseFloat(el.dataset.delay || "0");
  const from: gsap.TweenVars =
    kind === "fade"
      ? { autoAlpha: 0 }
      : kind === "clip"
        ? { clipPath: "inset(100% 0% 0% 0%)", autoAlpha: 1 }
        : kind === "scale"
          ? { scale: 1.15, clipPath: "inset(12% 12% 12% 12%)", autoAlpha: 1 }
          : { y: 48, autoAlpha: 0 };
  const to: gsap.TweenVars =
    kind === "clip" || kind === "scale"
      ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
      : {};
  gsap.set(el, { visibility: "visible" });
  return gsap.fromTo(el, from, {
    ...to,
    y: 0,
    autoAlpha: 1,
    duration: kind === "fade" ? 1 : 1.3,
    ease: ease.out,
    delay,
    paused,
    scrollTrigger: paused
      ? undefined
      : { trigger: el, start: "top 90%", once: true },
  });
}

/** Wire every reveal inside `root`. Returns the intro timeline (paused) for the page entrance. */
export function initReveals(root: ParentNode = document) {
  const intro = gsap.timeline({ paused: true });
  if (prefersReducedMotion()) return intro;

  root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    if (el.dataset.sssWired) return;
    el.dataset.sssWired = "1";
    const isIntro = el.hasAttribute("data-intro");
    const play = splitTween(el, isIntro);
    if (isIntro) intro.add(play, 0);
  });
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    if (el.dataset.sssWired) return;
    el.dataset.sssWired = "1";
    const isIntro = el.hasAttribute("data-intro");
    const t = blockTween(el, isIntro);
    if (isIntro) intro.add(() => t.play(), 0);
  });
  root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    if (el.dataset.sssWired) return;
    el.dataset.sssWired = "1";
    const amount = parseFloat(el.dataset.parallax || "0.15");
    gsap.fromTo(
      el,
      { yPercent: -amount * 100 },
      {
        yPercent: amount * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
  return intro;
}

/** Wire only elements that appeared after initial page init (client-fetched
 *  content: product grids, deal sections). Same logic, marked, no double-wires. */
export function wireNewReveals(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  initReveals(root);
}

/** Watch for late-mounted [data-*] content and wire it. This storefront
 *  fetches products client-side, so sections render AFTER boot — without
 *  this, the hidden-until-revealed CSS leaves them invisible forever. */
export function startRevealObserver() {
  if (typeof MutationObserver === "undefined") return;
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (document.querySelector("[data-split]:not([data-sss-wired]), [data-reveal]:not([data-sss-wired]), [data-parallax]:not([data-sss-wired])")) {
        wireNewReveals();
        ScrollTrigger.refresh();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
