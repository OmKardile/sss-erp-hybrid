"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  PackageX,
  ShoppingCart,
  IndianRupee,
  TrendingDown,
  Zap,
  X,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";

interface RestockItem {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  quantity: number;
  minStockAlert: number;
  unitType: string;
  purchasePrice: number;
  deficit: number;
  suggestedQty: number;
  estRestockCost: number;
  severity: "out" | "critical" | "low";
}

const SEVERITY_META = {
  out: { label: "Out of stock", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  critical: { label: "Critical", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  low: { label: "Low", tone: "bg-teal-500/15 text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
};

export function RestockCenter() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["restock"],
    queryFn: () => api.restock(),
  });

  const [selected, setSelected] = useState<Record<string, { qty: number; supplier: string }>>({});
  const [bulkOpen, setBulkOpen] = useState(false);

  const createPurchaseMut = useMutation({
    mutationFn: (data: any) => api.purchases.create(data),
    onSuccess: () => {
      toast.success("Purchase order created", { description: "Stock will be incremented automatically." });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["restock"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setSelected({});
      setBulkOpen(false);
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  if (isLoading || !data) {
    return (
      <SectionCard title="Restock Center" description="Loading…">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </SectionCard>
    );
  }

  const items = data.items as RestockItem[];
  const { summary } = data;

  if (items.length === 0) {
    return null; // Don't show the panel if everything is well-stocked
  }

  const selectedItems = items.filter((it) => selected[it.id]?.qty > 0);
  const totalCost = selectedItems.reduce((s, it) => s + (selected[it.id]?.qty || 0) * it.purchasePrice, 0);

  const toggleSelect = (it: RestockItem) => {
    setSelected((s) => {
      if (s[it.id]) {
        const next = { ...s };
        delete next[it.id];
        return next;
      }
      return { ...s, [it.id]: { qty: it.suggestedQty, supplier: "" } };
    });
  };

  const updateQty = (id: string, qty: number) =>
    setSelected((s) => ({ ...s, [id]: { ...s[id], qty } }));
  const updateSupplier = (id: string, supplier: string) =>
    setSelected((s) => ({ ...s, [id]: { ...s[id], supplier } }));

  const createBulkOrder = () => {
    if (selectedItems.length === 0) return;
    // Group by supplier (or "Unassigned") and create one purchase per group
    const groups = new Map<string, RestockItem[]>();
    selectedItems.forEach((it) => {
      const sup = selected[it.id]?.supplier || "Unassigned Supplier";
      if (!groups.has(sup)) groups.set(sup, []);
      groups.get(sup)!.push(it);
    });
    const promises = Array.from(groups.entries()).map(([supplier, group]) => {
      const items_data = group.map((it) => ({
        productId: it.id,
        name: it.name,
        price: it.purchasePrice,
        quantity: selected[it.id]?.qty || 0,
      }));
      const total = group.reduce((s, it) => s + (selected[it.id]?.qty || 0) * it.purchasePrice, 0);
      // Create a single purchase per supplier aggregating items
      // (purchases API expects one product per record, so create one purchase per item)
      return Promise.all(
        group.map((it) =>
          api.purchases.create({
            supplierName: supplier,
            productName: it.name,
            quantity: selected[it.id]?.qty || 0,
            unitPrice: it.purchasePrice,
            totalAmount: (selected[it.id]?.qty || 0) * it.purchasePrice,
            purchaseDate: new Date().toISOString().split("T")[0],
            notes: "Auto restock",
            autoStock: true,
          })
        )
      );
    });
    Promise.all(promises).then(() => {
      toast.success(`${selectedItems.length} restock order(s) created`, {
        description: `Total ${formatCurrency(totalCost)} across ${groups.size} supplier(s)`,
      });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["restock"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setSelected({});
      setBulkOpen(false);
    });
  };

  return (
    <SectionCard
      title="Restock Center"
      description={`${summary.lowStockCount} products need restocking · ${summary.outOfStock} out of stock`}
      action={
        selectedItems.length > 0 ? (
          <Button onClick={createBulkOrder} className="gap-2" size="sm">
            <Truck className="h-3.5 w-3.5" />
            Order {selectedItems.length} ({formatCurrency(totalCost, { compact: true })})
          </Button>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <IndianRupee className="h-3 w-3" /> {formatCurrency(summary.totalRestockCost, { compact: true })} est.
          </Badge>
        )
      }
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((it, idx) => {
            const meta = SEVERITY_META[it.severity];
            const isSelected = !!selected[it.id];
            const qty = selected[it.id]?.qty || it.suggestedQty;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"
                  }`}
                  onClick={() => toggleSelect(it)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          <p className="truncate text-sm font-semibold text-foreground">{it.name}</p>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{it.brand || it.category || "—"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-rose-500/5 p-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Current</p>
                        <p className="text-sm font-bold text-rose-600">{it.quantity}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Min</p>
                        <p className="text-sm font-bold text-foreground">{it.minStockAlert}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/5 p-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Suggest</p>
                        <p className="text-sm font-bold text-emerald-600">+{it.suggestedQty}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 border-t border-border/60 pt-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Order Qty</Label>
                            <Input
                              type="number"
                              value={qty}
                              onChange={(e) => updateQty(it.id, Number(e.target.value) || 0)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Supplier</Label>
                            <Input
                              value={selected[it.id]?.supplier || ""}
                              onChange={(e) => updateSupplier(it.id, e.target.value)}
                              placeholder="Optional"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <p className="mt-1.5 text-right text-xs font-medium text-foreground">
                          Cost: {formatCurrency(qty * it.purchasePrice)}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
