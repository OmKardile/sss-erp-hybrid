"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import type { AnimationItem } from "lottie-web";
import { cn } from "@/lib/utils";
import {
  ANIMATED_ICONS,
  getAnimationData,
  type AnimatedIconName,
} from "@/lib/animated-icons";

/**
 * AnimatedIcon — Lordicon Lottie animation with a Lucide fallback.
 *
 * - SSR and the first client paint render the Lucide fallback (zero
 *   hydration mismatch); the Lottie instance swaps in after mount.
 * - lottie-web is dynamically imported as its own chunk, so it only loads
 *   on pages that actually use animated icons. The FULL build is required:
 *   Lordicon "wired" icons drive shape data and colors through bodymovin
 *   expressions (the light build renders empty paths).
 * - Triggers: "hover" (play on pointer-enter), "loop" (always on),
 *   "once" (play once when loaded), "none" (parent drives via props).
 * - `playSignal` — bump a number to replay (button clicks).
 * - `playOnEvent` — replay when a window event fires (e.g. the cart
 *   icon celebrating "sss:cart-changed").
 * - prefers-reduced-motion: animations never play; the icon rests on
 *   its first frame (a complete static glyph).
 */

export type AnimatedIconTrigger = "hover" | "loop" | "once" | "none";

interface AnimatedIconProps {
  name: AnimatedIconName;
  /** Square pixel size (default 22). */
  size?: number;
  trigger?: AnimatedIconTrigger;
  /** Playback rate (default 1). */
  speed?: number;
  className?: string;
  /** Bump this number to replay the animation (e.g. on button click). */
  playSignal?: number;
  /** Window event name that replays the icon (e.g. "sss:cart-changed"). */
  playOnEvent?: string;
  /** Overrides the registry fallback icon (SSR / reduced motion). */
  fallback?: LucideIcon;
  /** Accessible label; when absent the icon is decorative (aria-hidden). */
  label?: string;
}

interface LottiePlayer {
  loadAnimation: (params: {
    container: Element;
    renderer: string;
    loop: boolean;
    autoplay: boolean;
    animationData: unknown;
  }) => AnimationItem;
}

/* Reduced-motion via useSyncExternalStore — no setState in effects. */
function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const reducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AnimatedIcon({
  name,
  size = 22,
  trigger = "hover",
  speed = 1,
  className,
  playSignal,
  playOnEvent,
  fallback,
  label,
}: AnimatedIconProps) {
  const spec = ANIMATED_ICONS[name];
  const Fallback = fallback ?? spec.fallback;
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [anim, setAnim] = useState<AnimationItem | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    () => false,
  );

  /* Load the JSON and create the Lottie instance. */
  useEffect(() => {
    let cancelled = false;
    let instance: AnimationItem | null = null;

    (async () => {
      try {
        const [mod, data] = await Promise.all([
          import("lottie-web"),
          getAnimationData(name),
        ]);
        const host = hostRef.current;
        if (cancelled || !host) return;
        const lottie = ((mod as { default?: LottiePlayer }).default ??
          mod) as LottiePlayer;
        instance = lottie.loadAnimation({
          container: host,
          renderer: "svg",
          loop: trigger === "loop",
          autoplay: false,
          // lottie-web annotates the data it renders — instance-local clone.
          animationData: structuredClone(data),
        });
        instance.setSpeed(speed);
        // Lordicon wired icons draw in from a blank frame 0, so the rest
        // state is the spec's park frame (last frame by default, earlier
        // for icons that morph afterwards, e.g. plus → x, home → buildings).
        const parkFrame = Math.max(
          0,
          Math.min(
            instance.totalFrames - 1,
            Math.floor((spec.park ?? 1) * (instance.totalFrames - 1)),
          ),
        );
        if (reducedMotion || trigger === "none" || trigger === "hover") {
          instance.goToAndStop(parkFrame, true);
        } else if (trigger === "loop" && (spec.loopFrom ?? 0) > 0) {
          // Loop only the "alive" segment — skip the draw-in each cycle.
          const startFrame = Math.max(
            0,
            Math.min(
              instance.totalFrames - 1,
              Math.floor(
                (spec.loopFrom ?? 0) * (instance.totalFrames - 1),
              ),
            ),
          );
          instance.playSegments([[startFrame, instance.totalFrames - 1]], true);
        } else {
          // "once" and full loops play the draw-in from the very start.
          instance.goToAndStop(0, true);
          instance.play();
        }
        if (!cancelled) setAnim(instance);
      } catch {
        /* Fetch/render failure — the Lucide fallback simply stays. */
      }
    })();

    return () => {
      cancelled = true;
      instance?.destroy();
      setAnim(null);
    };
  }, [name, trigger, speed, reducedMotion]);

  function replay() {
    if (!anim || reducedMotion) return;
    anim.goToAndStop(0, true);
    anim.play();
  }

  /* Parent-driven replays (playSignal bumps). */
  const firstSignalRef = useRef(true);
  useEffect(() => {
    if (firstSignalRef.current) {
      firstSignalRef.current = false;
      return;
    }
    if (anim && !reducedMotion) {
      anim.goToAndStop(0, true);
      anim.play();
    }
    // Replay is driven explicitly by the parent via playSignal bumps.
  }, [playSignal]);

  /* Event-driven replays (e.g. cart icon on "sss:cart-changed"). */
  useEffect(() => {
    if (!playOnEvent) return;
    const handler = () => {
      if (anim && !reducedMotion) {
        anim.goToAndStop(0, true);
        anim.play();
      }
    };
    window.addEventListener(playOnEvent, handler);
    return () => window.removeEventListener(playOnEvent, handler);
  }, [playOnEvent, anim, reducedMotion]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerEnter={trigger === "hover" ? replay : undefined}
    >
      <span
        ref={hostRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 [&_svg]:h-full [&_svg]:w-full"
      />
      <Fallback size={size} aria-hidden className={cn(anim && "invisible")} />
    </span>
  );
}
