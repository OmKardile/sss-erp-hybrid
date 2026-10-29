"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ArrowUp } from "lucide-react";

/**
 * ScrollToTop — floating back-to-top button for the long product grid.
 * Appears after ~1.5 screens of scrolling; sits above the mobile bottom
 * nav on small screens. Reduced-motion users get an instant fade.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 700);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollTop}
          aria-label="Scroll back to top"
          initial={reduce ? false : { opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-stone-800 shadow-[0_12px_32px_rgba(28,25,23,0.2)] backdrop-blur-xl transition-colors hover:bg-white/90 hover:text-stone-950 lg:bottom-6"
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
