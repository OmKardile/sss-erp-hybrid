"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: "emerald" | "rose" | "amber" | "teal" | "violet" | "cyan";
  subtitle?: string;
  delta?: number;
  index?: number;
}

const toneMap: Record<string, { bg: string; fg: string; ring: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    fg: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "from-emerald-500/15",
  },
  rose: {
    bg: "bg-rose-500/10",
    fg: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/20",
    glow: "from-rose-500/15",
  },
  amber: {
    bg: "bg-amber-500/10",
    fg: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
    glow: "from-amber-500/15",
  },
  teal: {
    bg: "bg-teal-500/10",
    fg: "text-teal-600 dark:text-teal-400",
    ring: "ring-teal-500/20",
    glow: "from-teal-500/15",
  },
  violet: {
    bg: "bg-violet-500/10",
    fg: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/20",
    glow: "from-violet-500/15",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    fg: "text-cyan-600 dark:text-cyan-400",
    ring: "ring-cyan-500/20",
    glow: "from-cyan-500/15",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "emerald",
  subtitle,
  delta,
  index = 0,
}: StatCardProps) {
  const t = toneMap[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
    >
      <Card className={cn("card-hover relative overflow-hidden ring-1", t.ring)}>
        <div
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl",
            t.glow
          )}
        />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
              {subtitle && <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground" title={subtitle}>{subtitle}</p>}
            </div>
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", t.bg)}>
              <Icon className={cn("h-5 w-5", t.fg)} />
            </div>
          </div>
          {typeof delta === "number" && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                  delta >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}
              >
                {delta >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(delta).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
