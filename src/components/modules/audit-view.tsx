"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  ShoppingBag,
  Package,
  CircleDollarSign,
  CreditCard,
  BookOpenCheck,
  HandCoins,
  ClipboardCheck,
  Filter,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: any; tone: string; bg: string }> = {
  Sale: { icon: ShoppingBag, tone: "text-emerald-600", bg: "bg-emerald-500/10" },
  Purchase: { icon: Package, tone: "text-amber-600", bg: "bg-amber-500/10" },
  Income: { icon: CircleDollarSign, tone: "text-emerald-600", bg: "bg-emerald-500/10" },
  Expense: { icon: CreditCard, tone: "text-rose-600", bg: "bg-rose-500/10" },
  Udhar: { icon: BookOpenCheck, tone: "text-violet-600", bg: "bg-violet-500/10" },
  Payment: { icon: HandCoins, tone: "text-teal-600", bg: "bg-teal-500/10" },
  Adjustment: { icon: ClipboardCheck, tone: "text-cyan-600", bg: "bg-cyan-500/10" },
};

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  adjusted: "Adjusted",
  paid: "Payment",
};

export function AuditView() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api.audit(),
  });
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const events = data?.events || [];
  const counts = data?.counts || {};

  const filtered = useMemo(() => {
    return events.filter((e: any) => {
      const matchType = filter === "ALL" || e.type === filter;
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [events, filter, search]);

  const filterTypes = ["ALL", ...Object.keys(counts).sort((a, b) => (counts[b] || 0) - (counts[a] || 0))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="A unified timeline of every record-creating action across all modules."
        icon={History}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(counts).map(([type, count]: [string, any], i) => {
          const meta = TYPE_META[type] || TYPE_META.Sale;
          const Icon = meta.icon;
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setFilter(filter === type ? "ALL" : type)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition",
                filter === type ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", meta.bg, meta.tone)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{type}</p>
            </motion.button>
          );
        })}
      </div>

      <SectionCard
        title="Activity Timeline"
        description={`${filtered.length} of ${data?.total || 0} events`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="h-8 w-full pl-8 sm:w-48"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {filterTypes.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={filter === t ? "default" : "outline"}
                  onClick={() => setFilter(t)}
                  className="h-8 px-2.5 text-xs"
                >
                  {t === "ALL" ? "All" : t}
                </Button>
              ))}
            </div>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title="No events found"
            description="Try adjusting your filter or search. New sales, purchases, and adjustments will appear here."
          />
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="relative px-2 py-2">
              {/* Timeline line */}
              <div className="pointer-events-none absolute left-7 top-4 bottom-4 w-0.5 bg-border" />
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {filtered.map((e: any, i: number) => {
                    const meta = TYPE_META[e.type] || TYPE_META.Sale;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={e.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: Math.min(i * 0.02, 0.4) }}
                        className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-muted/40"
                      >
                        {/* Timeline dot + icon */}
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card">
                          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", meta.bg)}>
                            <Icon className={cn("h-3.5 w-3.5", meta.tone)} />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                                <Badge variant="secondary" className="shrink-0 text-[10px]">
                                  {ACTION_LABEL[e.action] || e.action}
                                </Badge>
                              </div>
                              <p className="truncate text-xs text-muted-foreground">{e.subtitle}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end">
                              {e.amount != null && e.amount !== 0 && (
                                <p
                                  className={cn(
                                    "text-sm font-semibold",
                                    e.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                  )}
                                >
                                  {e.amount > 0 ? "+" : ""}
                                  {formatCurrency(e.amount, { compact: true })}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground" title={formatDate(e.date, { withTime: true })}>
                                {formatRelative(e.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        )}
      </SectionCard>
    </div>
  );
}
