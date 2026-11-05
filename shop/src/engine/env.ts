// Engine: media queries + shared easing vocabulary (ported from /awwwards skill).
export const prefersReducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () =>
  matchMedia("(hover: none), (pointer: coarse)").matches;
export const isMobile = () => matchMedia("(max-width: 767px)").matches;

// Shared easing vocabulary. Use these names everywhere; never invent per-component curves.
export const ease = {
  out: "expo.out", // default entrance (crates settle)
  inOut: "expo.inOut", // curtains, the shutter
  soft: "power3.out", // small UI
  spring: "back.out(1.6)", // playful pops, use rarely
} as const;
