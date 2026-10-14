"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpenCheck,
  Package,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatRelative } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { useNav } from "@/lib/nav";

interface ActivityItem {
  id: string;
  type: "income" | "expense" | "purchase" | "udhar";
  label: string;
  sub: string;
  amount: number;
  date: string;
  tone: string;
  icon: any;
}

export function RecentActivity() {
  const { data: income = [] } = useQuery({ queryKey: ["income"], queryFn: () => api.income.list() });
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses"], queryFn: () => api.expenses.list() });
  const { data: purchases = [] } = useQuery({ queryKey: ["purchases"], queryFn: () => api.purchases.list() });
  const { data: udhar = [] } = useQuery({ queryKey: ["udhar"], queryFn: () => api.udhar.list() });
  const setNav = useNav((s) => s.set);

  const items: ActivityItem[] = [
    ...income.slice(0, 8).map((i) => ({
      id: `inc-${i.id}`,
      type: "income" as const,
      label: i.source,
      sub: i.category,
      amount: i.amount,
      date: i.date as unknown as string,
      tone: "text-emerald-600",
      icon: ArrowDownLeft,
    })),
    ...expenses.slice(0, 8).map((e) => ({
      id: `exp-${e.id}`,
      type: "expense" as const,
      label: e.category,
      sub: "Expense",
      amount: -e.amount,
      date: e.date as unknown as string,
      tone: "text-rose-600",
      icon: ArrowUpRight,
    })),
    ...purchases.slice(0, 8).map((p) => ({
      id: `pur-${p.id}`,
      type: "purchase" as const,
      label: p.productName,
      sub: p.supplierName,
      amount: -p.totalAmount,
      date: p.purchaseDate as unknown as string,
      tone: "text-amber-600",
      icon: ShoppingBag,
    })),
    ...udhar.slice(0, 8).map((u) => ({
      id: `udh-${u.id}`,
      type: "udhar" as const,
      label: u.customerName,
      sub: u.description,
      amount: -u.amount,
      date: u.date as unknown as string,
      tone: "text-violet-600",
      icon: BookOpenCheck,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  const goTo = (type: ActivityItem["type"]) => {
    if (type === "income") setNav("income");
    else if (type === "expense") setNav("expenses");
    else if (type === "purchase") setNav("purchases");
    else setNav("udhar");
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest transactions across modules</p>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="scroll-thin max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No activity yet</p>
          ) : (
            items.map((it, i) => {
              const Icon = it.icon;
              const positive = it.amount >= 0;
              return (
                <motion.button
                  key={it.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => goTo(it.type)}
                  className="flex w-full items-center gap-3 border-b border-border/40 px-5 py-2.5 text-left transition hover:bg-muted/50 last:border-0"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${it.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{it.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{it.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                      {positive ? "+" : "−"}
                      {formatCurrency(Math.abs(it.amount), { compact: true })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatRelative(it.date)}</p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
