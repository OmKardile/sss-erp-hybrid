"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calculator,
  Package,
  IndianRupee,
  TrendingUp,
  Layers,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { SectionCard } from "@/components/shared/section-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const METHODS = [
  { key: "purchase", label: "Purchase Price", desc: "Cost basis (default)" },
  { key: "selling", label: "Selling Price", desc: "Retail/market value" },
  { key: "fifo", label: "FIFO", desc: "Oldest purchases first" },
];

export function InventoryValuation() {
  const [method, setMethod] = useState("purchase");
  const { data, isLoading } = useQuery({
    queryKey: ["valuation", method],
    queryFn: () => api.valuation(method),
  });

  return (
    <SectionCard
      title="Inventory Valuation"
      description="Calculate stock value using different accounting methods"
      action={
        <div className="flex flex-wrap gap-1.5">
          {METHODS.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={method === m.key ? "default" : "outline"}
              onClick={() => setMethod(m.key)}
              className="h-8 gap-1.5 text-xs"
            >
              {m.label}
            </Button>
          ))}
        </div>
      }
    >
      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <IndianRupee className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inventory Value</p>
                    <p className="truncate text-xl font-bold text-foreground">{formatCurrency(data.summary.inventoryValue, { compact: true })}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{METHODS.find((m) => m.key === method)?.desc}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Potential Revenue</p>
                    <p className="truncate text-xl font-bold text-foreground">{formatCurrency(data.summary.potentialRevenue, { compact: true })}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">At current selling prices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Calculator className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Potential Profit</p>
                    <p className={cn("truncate text-xl font-bold", data.summary.potentialProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {formatCurrency(data.summary.potentialProfit, { compact: true })}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Revenue − cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Units</p>
                    <p className="truncate text-xl font-bold text-foreground">{data.summary.totalUnits}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{data.summary.productCount} products</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown table */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Product Breakdown</p>
              <Badge variant="secondary">{data.breakdown.length} products</Badge>
            </div>
            <div className="scroll-thin max-h-72 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Avg Price</th>
                    <th className="px-3 py-2 text-right">Value</th>
                    <th className="hidden px-3 py-2 text-right sm:table-cell">Sell Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.breakdown.map((p: any, i: number) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border-t border-border/40 hover:bg-muted/30"
                    >
                      <td className="px-3 py-2">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{p.quantity} {p.unitType}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{formatCurrency(p.avgPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-foreground">{formatCurrency(p.value)}</td>
                      <td className="hidden px-3 py-2 text-right text-muted-foreground sm:table-cell">{formatCurrency(p.sellingValue)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              <span className="font-semibold">{METHODS.find((m) => m.key === method)?.label}:</span>{" "}
              {method === "fifo"
                ? "FIFO assumes the oldest inventory is sold first. Uses purchase history to layer costs."
                : method === "selling"
                ? "Selling price valuation reflects the market value of current stock at retail prices."
                : "Purchase price valuation uses the current purchase price × quantity (weighted average equivalent for flat schema)."}
            </p>
          </div>
        </>
      )}
    </SectionCard>
  );
}
