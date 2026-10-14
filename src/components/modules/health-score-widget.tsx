"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  HeartPulse,
  TrendingUp,
  Wallet,
  Package,
  BookOpenCheck,
  Target,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TONE_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-600", ring: "ring-teal-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-600", ring: "ring-rose-500/20" },
};

const DIM_META = [
  { key: "profitability", label: "Profitability", icon: TrendingUp, tone: "emerald" },
  { key: "liquidity", label: "Liquidity", icon: Wallet, tone: "teal" },
  { key: "inventory", label: "Inventory", icon: Package, tone: "amber" },
  { key: "credit", label: "Credit Risk", icon: BookOpenCheck, tone: "violet" },
  { key: "momentum", label: "Momentum", icon: Target, tone: "cyan" },
] as const;

export function HealthScoreWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.health(),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const { score, grade, gradeTone, breakdown } = data;
  const tone = TONE_MAP[gradeTone] || TONE_MAP.emerald;

  return (
    <Card className={cn("card-hover relative overflow-hidden ring-1", tone.ring)}>
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl", tone.bg)} />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone.bg, tone.text)}>
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Health</p>
              <p className="text-[11px] text-muted-foreground">Composite score · auto-updates</p>
            </div>
          </div>
        </div>

        {/* Score + Grade */}
        <div className="mt-4 flex items-center gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className={cn("relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full", tone.bg)}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={tone.text}
                strokeDasharray={2 * Math.PI * 44}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - score / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="relative text-center">
              <p className={cn("text-2xl font-bold", tone.text)}>{score}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">/ 100</p>
            </div>
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-black", tone.text)}>{grade}</span>
              <span className="text-xs text-muted-foreground">grade</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {score >= 75 ? "Excellent — your shop is in great shape!" : score >= 55 ? "Good — some areas to improve." : score >= 35 ? "Fair — needs attention in key areas." : "Critical — immediate action recommended."}
            </p>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="mt-4 space-y-2.5 border-t border-border/60 pt-3">
          {DIM_META.map((dim, i) => {
            const b = breakdown[dim.key];
            if (!b) return null;
            const Icon = dim.icon;
            const dimTone = TONE_MAP[dim.tone] || TONE_MAP.emerald;
            const pct = (b.score / b.max) * 100;
            return (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3.5 w-3.5", dimTone.text)} />
                    <span className="font-medium text-foreground">{dim.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {b.score}/{b.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                    className={cn("h-full rounded-full", dimTone.bg.replace("/10", "/60"))}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <p>Composite of profitability (30), liquidity (20), inventory health (20), credit risk (15), and sales momentum (15).</p>
        </div>
      </CardContent>
    </Card>
  );
}
