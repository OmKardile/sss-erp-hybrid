"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ open, message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const colors =
    type === "error"
      ? "bg-rose-600"
      : type === "info"
        ? "bg-slate-900"
        : "bg-emerald-600";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-fade-in-up",
          colors,
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 opacity-80 hover:opacity-100"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
