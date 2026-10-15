"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock, AlertTriangle, CircleCheck, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/nav";

const STATUS_META = {
  expired: { label: "Expired", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  critical: { label: "≤ 7 days", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  soon: { label: "≤ 30 days", tone: "bg-teal-500/15 text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
  ok: { label: "Fresh", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
};

export function ExpiryWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["expiry"],
    queryFn: () => api.expiry(),
    refetchInterval: 60_000,
  });
  const setNav = useNav((s) => s.set);

  if (isLoading || !data) {
    return (
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const { summary, items } = data;
  // Show only items that need attention (expired + critical + soon), sorted by urgency
  const urgent = items.filter((p: any) => p.status !== "ok").slice(0, 5);

  if (items.length === 0) {
    return null; // No products have expiry dates
  }

  return (
    <Card className="card-hover relative overflow-hidden">
      <CardContent className="relative p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry Tracker</p>
              <p className="text-[11px] text-muted-foreground">{summary.total} products with expiry</p>
            </div>
          </div>
          {(summary.expiredCount > 0 || summary.criticalCount > 0) && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {summary.expiredCount + summary.criticalCount}
            </Badge>
          )}
        </div>

        {/* Summary chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {summary.expiredCount > 0 && (
            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-400">
              {summary.expiredCount} expired
            </span>
          )}
          {summary.criticalCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
              {summary.criticalCount} ≤ 7d
            </span>
          )}
          {summary.soonCount > 0 && (
            <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-400">
              {summary.soonCount} ≤ 30d
            </span>
          )}
          {summary.okCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              {summary.okCount} fresh
            </span>
          )}
        </div>

        {/* Urgent items */}
        {urgent.length > 0 ? (
          <div className="mt-3 border-t border-border/60 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Needs attention</p>
            <div className="space-y-1.5">
              {urgent.map((p: any, i: number) => {
                const meta = STATUS_META[p.status as keyof typeof STATUS_META];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                      <span className="truncate font-medium text-foreground">{p.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {formatDate(p.expiryDate)}
                      </span>
                      <span className={`rounded px-1 py-0.5 text-[10px] font-semibold ${meta.tone}`}>
                        {p.daysLeft < 0 ? `${Math.abs(p.daysLeft)}d ago` : `${p.daysLeft}d`}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/5 p-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CircleCheck className="h-4 w-4" /> All products with expiry dates are fresh.
          </div>
        )}

        {items.length > 5 && (
          <button
            onClick={() => setNav("products")}
            className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            View all {items.length} expiry-tracked products
          </button>
        )}
      </CardContent>
    </Card>
  );
}
