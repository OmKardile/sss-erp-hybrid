"use client";

// Global motion for this site: runs once on the client, after scroll init and
// before the first page initializes. (Pattern from the /awwwards skill engine.)
//
// Everything here belongs to the concept "Fresh Cart" (DESIGN.md):
//  - the loader counts 0–100% in Space Mono with a lime bar
//  - page transitions wipe three color panels (pop → heat → pine)
//  - the market-cry marquee reacts to scroll velocity
//  - the featured index list shows a floating product photo under the pointer
import { gsap } from "gsap";
import {
  ease,
  onPage,
  setLoaderExit,
  setLoaderFormat,
  setTransition,
  onScroll,
  isTouch,
  prefersReducedMotion,
} from "@/engine";

setLoaderFormat((p) => `${Math.round(p)}%`);

// Loader exit: the lime bar drains, then the sheet lifts away.
setLoaderExit((root) =>
  gsap
    .timeline()
    .to(root.querySelector("[data-loader-out]"), {
      autoAlpha: 0,
      y: -24,
      duration: 0.35,
      ease: ease.soft,
    })
    .to(
      root.querySelector("[data-loader-bar]"),
      { scaleX: 0, duration: 0.4, ease: ease.inOut },
      "<",
    )
    .to(root, { yPercent: -100, duration: 0.9, ease: ease.inOut }, "-=0.05"),
);

// Page transition: three color panels stagger-wipe down, then lift off.
// (Panel 3 ends on top; the enter wipes them away in reverse.)
setTransition({
  leave: (c) => {
    const panels = c.querySelectorAll(".curtain__panel");
    return gsap
      .timeline()
      .set(c, { autoAlpha: 1 })
      .fromTo(
        panels,
        { yPercent: -100 },
        {
          yPercent: 0,
          duration: 0.62,
          ease: ease.inOut,
          stagger: 0.09,
        },
      );
  },
  enter: (c) => {
    const panels = c.querySelectorAll(".curtain__panel");
    return gsap
      .timeline()
      .to(panels, {
        yPercent: 100,
        duration: 0.62,
        ease: ease.inOut,
        stagger: 0.07,
      })
      .set(c, { autoAlpha: 0 })
      .set(panels, { yPercent: -100 });
  },
});

/** Market-cry marquee: seamless loop, sped up and re-directed by scroll velocity. */
function startMarquee() {
  onPage(() => {
    const track = document.querySelector<HTMLElement>(
      "[data-marquee] [data-track]",
    );
    if (!track) return;
    const loop = gsap.to(track, {
      xPercent: -50,
      ease: "none",
      duration: 26,
      repeat: -1,
    });
    const off = onScroll(({ velocity }) => {
      const dir = velocity < 0 ? -1 : 1;
      gsap.to(loop, {
        timeScale: dir * (1 + Math.min(Math.abs(velocity) / 8, 5)),
        duration: 0.4,
        overwrite: true,
      });
    });
    return () => {
      off();
    };
  });
}

/** Featured index list: a product photo follows the pointer over the rows
 *  (desktop). Delegated at the document level — the list mounts late
 *  (products are fetched client-side), so boot-time queries would miss it. */
function startIndexPreview() {
  if (isTouch() || prefersReducedMotion()) return;
  onPage(() => {
    const box = document.querySelector<HTMLElement>(".index-preview");
    if (!box) return;
    const img = box.querySelector("img")!;
    const x = gsap.quickTo(box, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(box, "y", { duration: 0.6, ease: "power3.out" });
    const rot = gsap.quickTo(box, "rotate", {
      duration: 0.8,
      ease: "power3.out",
    });
    let lastX = 0,
      px = 0,
      py = 0,
      inside = false;

    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      x(px);
      y(py);
      rot(gsap.utils.clamp(-10, 10, (px - lastX) * 0.5));
      lastX = px;
    };
    const show = (target: HTMLElement) => {
      const src = target.dataset.preview;
      if (!src) return;
      inside = true;
      if (img.src !== src) img.src = src;
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" });
    };
    const hide = () => {
      inside = false;
      gsap.to(box, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: "expo.out" });
    };
    const over = (e: PointerEvent) => {
      const a = (e.target as HTMLElement).closest?.(
        "[data-index] a[data-preview]",
      ) as HTMLElement | null;
      if (a) show(a);
      else if (inside) hide();
    };

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    const off = onScroll(() => {
      if (inside && !document.elementFromPoint(px, py)?.closest?.("[data-index]"))
        hide();
    });
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      off();
    };
  });
}

export function setupMotion() {
  startMarquee();
  startIndexPreview();
}
