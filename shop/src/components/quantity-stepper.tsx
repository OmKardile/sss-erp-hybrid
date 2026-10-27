"use client";

import { useState } from "react";
import { Minus } from "lucide-react";
import { AnimatedIcon } from "@/components/animated-icon";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  onChange,
  size = "md",
  className,
}: QuantityStepperProps) {
  const btn =
    size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const txt = size === "sm" ? "text-xs w-7" : "text-sm w-10";
  const [plusSignal, setPlusSignal] = useState(0);

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => {
    setPlusSignal((s) => s + 1);
    onChange(Math.min(max, value + 1));
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-full text-slate-700 transition",
          "hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("text-center font-semibold text-slate-900", txt)}>
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-full text-slate-700 transition",
          "hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <AnimatedIcon
          name="plus"
          size={size === "sm" ? 14 : 16}
          trigger="hover"
          playSignal={plusSignal}
        />
      </button>
    </div>
  );
}
