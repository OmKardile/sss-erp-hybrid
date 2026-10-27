"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  /** Optional inline action, e.g. "View cart". */
  action?: ToastAction;
  onClose: () => void;
}

/**
 * Toast — animated feedback pill. Slides in from the nearest screen
 * edge (top on mobile, bottom on desktop), with an optional inline
 * action. Auto-dismisses after 2.6s (2.6s + action = 4s).
 * Reduced-motion: instant appear/disappear.
 */
export function Toast({ open, message, type = "success", action, onClose }: ToastProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, action ? 4000 : 2600);
    return () => clearTimeout(t);
  }, [open, action, onClose]);

  const colors =
    type === "error"
      ? "border-white/20 bg-rose-800/85"
      : type === "info"
        ? "border-white/15 bg-stone-900/85"
        : "border-white/20 bg-emerald-900/85";

  const Icon = type === "error" ? AlertCircle : type === "info" ? Info : CheckCircle2;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.5rem)] z-50 flex justify-center px-4 lg:bottom-6 lg:top-auto"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className={cn(
              "pointer-events-auto inline-flex items-center gap-2 rounded-full border py-2.5 pl-4 pr-2.5 text-sm font-medium text-white shadow-2xl shadow-stone-950/30 backdrop-blur-xl",
              colors,
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{message}</span>
            {action && (
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className="ml-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold underline-offset-2 transition-colors hover:bg-white/25"
              >
                {action.label}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full opacity-80 transition-opacity hover:opacity-100"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
