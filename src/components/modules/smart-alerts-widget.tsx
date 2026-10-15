"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  PackageX,
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatRelative } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  type: "low-stock" | "out-of-stock" | "overdue-udhar" | "expiring" | "expired";
  title: string;
  subtitle: string;
  action?: string;
  amount?: number;
  daysLeft?: number;
  severity: "critical" | "warning" | "info";
}

const ALERT_META: Record<
  AlertItem["severity"],
  { tone: string; bg: string; dot: string; icon: any }
> = {
  critical: { tone: "text-rose-600", bg: "bg-rose-500/10", dot: "bg-rose-500", icon: AlertTriangle },
  warning: { tone: "text-amber-600", bg: "bg-amber-500/10", dot: "bg-amber-500", icon: CalendarClock },
  info: { tone: "text-violet-600", bg: "bg-violet-500/10", dot: "bg-violet-500", icon: BookOpenCheck },
};

export function SmartAlertsWidget() {
  const { data: restock } = useQuery({ queryKey: ["restock"], queryFn: () => api.restock() });
  const { data: expiry } = useQuery({ queryKey: ["expiry"], queryFn: () => api.expiry() });
  const { data: udhar = [] } = useQuery({ queryKey: ["udhar"], queryFn: () => api.udhar.list() });
  const setNav = useNav((s) => s.set);

  const alerts: AlertItem[] = [];

  // Out-of-stock items
  (restock?.items || []).forEach((p: any) => {
    if (p.severity === "out") {
      alerts.push({
        id: `oos-${p.id}`,
        type: "out-of-stock",
        title: p.name,
        subtitle: `Out of stock · was ${p.minStockAlert} min`,
        action: "Restock",
        amount: p.estRestockCost,
        severity: "critical",
      });
    } else if (p.severity === "critical") {
      alerts.push({
        id: `low-${p.id}`,
        type: "low-stock",
        title: p.name,
        subtitle: `Only ${p.quantity} ${p.unitType} left (min ${p.minStockAlert})`,
        action: "Restock",
        amount: p.estRestockCost,
        severity: "critical",
      });
    }
  });

  // Overdue udhar
  udhar.forEach((u: any) => {
    if (u.status === "PAID") return;
    const overdue = u.dueDate && new Date(u.dueDate) < new Date();
    const dueSoon =
      u.dueDate &&
      new Date(u.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
      new Date(u.dueDate) >= new Date();
    if (overdue) {
      alerts.push({
        id: `udh-${u.id}`,
        type: "overdue-udhar",
        title: u.customerName,
        subtitle: `Overdue by ${formatRelative(u.dueDate)} · ${u.description}`,
        action: "Collect",
        amount: u.remainingAmount || u.amount,
        severity: "critical",
      });
    } else if (dueSoon) {
      alerts.push({
        id: `udh-${u.id}`,
        type: "overdue-udhar",
        title: u.customerName,
        subtitle: `Due ${formatRelative(u.dueDate)} · ${u.description}`,
        action: "Collect",
        amount: u.remainingAmount || u.amount,
        severity: "warning",
      });
    }
  });

  // Expiring soon / expired
  (expiry?.items || []).forEach((p: any) => {
    if (p.status === "expired") {
      alerts.push({
        id: `exp-${p.id}`,
        type: "expired",
        title: p.name,
        subtitle: `Expired ${Math.abs(p.daysLeft)}d ago · ${p.quantity} ${p.unitType} in stock`,
        action: "Remove",
        severity: "critical",
      });
    } else if (p.status === "critical") {
      alerts.push({
        id: `exp-${p.id}`,
        type: "expiring",
        title: p.name,
        subtitle: `Expires in ${p.daysLeft}d · ${p.quantity} ${p.unitType} in stock`,
        action: "Sell fast",
        severity: "warning",
      });
    }
  });

  // Sort: critical first, then warning
  alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const topAlerts = alerts.slice(0, 6);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  const goTo = (type: AlertItem["type"]) => {
    if (type === "out-of-stock" || type === "low-stock") setNav("products");
    else if (type === "overdue-udhar") setNav("udhar");
    else if (type === "expiring" || type === "expired") setNav("products");
  };

  if (alerts.length === 0) {
    return (
      <Card className="card-hover relative overflow-hidden border-emerald-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
        <CardContent className="relative p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Smart Alerts</p>
              <p className="text-[11px] text-muted-foreground">All clear</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 py-5 text-center">
            <CheckCircle2 className="ml-3 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">No alerts right now</p>
              <p className="text-xs text-muted-foreground">Stock levels healthy, no overdue udhar, no expiring items.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <Bell className="h-4.5 w-4.5" />
              {criticalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {criticalCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Smart Alerts</p>
              <p className="text-[11px] text-muted-foreground">
                {criticalCount} critical · {warningCount} warning{warningCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {topAlerts.map((a, i) => {
              const meta = ALERT_META[a.severity];
              const Icon = meta.icon;
              return (
                <motion.button
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  onClick={() => goTo(a.type)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-2.5 text-left transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.bg, meta.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>
                  </div>
                  {a.amount != null && a.amount > 0 && (
                    <span className={cn("shrink-0 text-xs font-semibold", meta.tone)}>
                      {formatCurrency(a.amount, { compact: true })}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {alerts.length > topAlerts.length && (
          <button
            onClick={() => setNav("products")}
            className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            +{alerts.length - topAlerts.length} more alert{alerts.length - topAlerts.length !== 1 ? "s" : ""}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
