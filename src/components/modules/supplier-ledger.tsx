"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  MapPin,
  Truck,
  IndianRupee,
  ShoppingBag,
  Package,
  TrendingUp,
  Receipt,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SupplierLedgerProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierLedger({ supplier, open, onClose }: SupplierLedgerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["supplier-ledger", supplier?.id],
    queryFn: () => api.suppliers.ledger(supplier!.id),
    enabled: !!supplier && open,
  });

  return (
    <AnimatePresence>
      {open && supplier && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-100">Supplier Ledger</p>
                  <h2 className="text-xl font-bold">{supplier.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-amber-50">
                    {supplier.phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</span>
                    )}
                    {supplier.address && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {supplier.address}</span>
                    )}
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Since {formatDate(supplier.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {isLoading || !data ? (
              <div className="flex flex-1 items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 border-b border-border/70 bg-muted/30 p-4 sm:grid-cols-4">
                  <SummaryMini icon={IndianRupee} label="Total Spend" value={formatCurrency(data.summary.totalSpend, { compact: true })} tone="text-amber-600" />
                  <SummaryMini icon={ShoppingBag} label="Orders" value={`${data.summary.orderCount}`} tone="text-teal-600" />
                  <SummaryMini icon={Package} label="Units Bought" value={`${data.summary.totalUnits}`} tone="text-violet-600" />
                  <SummaryMini icon={TrendingUp} label="Avg Order" value={formatCurrency(data.summary.avgOrderValue, { compact: true })} tone="text-emerald-600" />
                </div>

                {/* Top products bought */}
                {data.topProducts?.length > 0 && (
                  <div className="border-b border-border/70 bg-muted/20 px-4 py-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top Products Bought</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.topProducts.slice(0, 5).map((p: any, i: number) => (
                        <motion.span
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                        >
                          {p.name} · {p.qty} units
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Purchase History</h3>
                      <Badge variant="secondary">{data.transactions.length} orders</Badge>
                    </div>
                    {data.transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Receipt className="h-10 w-10 text-muted-foreground/40" />
                        <p className="mt-2 text-sm font-medium text-foreground">No purchases yet</p>
                        <p className="text-xs text-muted-foreground">This supplier has no purchase records.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.transactions.map((t: any, i: number) => (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.4) }}
                            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{t.product}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(t.date, { withTime: true })} · {t.quantity} units @ {formatCurrency(t.unitPrice)}
                                {t.notes && ` · ${t.notes}`}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-4 text-right">
                              <div className="w-24">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Order Total</p>
                                <p className="text-sm font-semibold text-amber-600">{formatCurrency(t.total)}</p>
                              </div>
                              <Separator orientation="vertical" className="h-8" />
                              <div className="w-28">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cumulative</p>
                                <p className="text-sm font-bold text-foreground">{formatCurrency(t.runningTotal, { compact: true })}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryMini({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
