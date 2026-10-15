"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, IndianRupee, Boxes, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatRelative } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/nav";

const PAYMENT_COLORS: Record<string, string> = {
  Cash: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UPI: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  Card: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  Wallet: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function TodaySalesWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-today"],
    queryFn: () => api.salesToday(),
    refetchInterval: 30_000,
  });
  const setNav = useNav((s) => s.set);

  return (
    <Card className="card-hover relative overflow-hidden border-emerald-500/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today&apos;s Sales</p>
              <p className="text-[11px] text-muted-foreground">{data?.date ? `POS · ${data.date}` : "POS sales"}</p>
            </div>
          </div>
          {data && data.count > 0 && (
            <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> {data.count} sale{data.count > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-muted" />
        ) : !data || data.count === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-6 text-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-foreground">No sales today yet</p>
            <p className="text-xs text-muted-foreground">Use the Point of Sale to record your first sale.</p>
            <button
              onClick={() => setNav("pos")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Open POS <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(data.total)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.itemCount} items · {data.unitsSold} units sold
                </p>
              </div>
            </div>

            {/* Payment breakdown chips */}
            {data.paymentBreakdown?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.paymentBreakdown.map((p: any) => (
                  <span
                    key={p.method}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PAYMENT_COLORS[p.method] || "bg-muted text-muted-foreground"}`}
                  >
                    {p.method} {formatCurrency(p.total, { compact: true })}
                  </span>
                ))}
              </div>
            )}

            {/* Top products today */}
            {data.topProducts?.length > 0 && (
              <div className="mt-3 border-t border-border/60 pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top today</p>
                <div className="space-y-1.5">
                  {data.topProducts.slice(0, 3).map((p: any, i: number) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-600">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium text-foreground">{p.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-muted-foreground">{p.qty} units</span>
                        <span className="font-semibold text-foreground">{formatCurrency(p.revenue, { compact: true })}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent sale */}
            {data.recent?.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                <span>Last sale: {data.recent[0].customerName || "Walk-in"} · {data.recent[0].paymentMethod}</span>
                <span>{formatRelative(data.recent[0].time)}</span>
              </div>
            )}

            <button
              onClick={() => setNav("sales")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              View full analytics <ArrowRight className="h-3 w-3" />
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
