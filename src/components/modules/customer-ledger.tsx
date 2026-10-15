"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  MapPin,
  User,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  BookOpenCheck,
  ShoppingBag,
  HandCoins,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CustomerLedgerProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

const TXN_META = {
  credit: { icon: BookOpenCheck, tone: "bg-violet-500/10 text-violet-600", label: "Udhar" },
  payment: { icon: HandCoins, tone: "bg-emerald-500/10 text-emerald-600", label: "Payment" },
  sale: { icon: ShoppingBag, tone: "bg-teal-500/10 text-teal-600", label: "Sale" },
};

export function CustomerLedger({ customer, open, onClose }: CustomerLedgerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-ledger", customer?.id],
    queryFn: () => api.customers.ledger(customer!.id),
    enabled: !!customer && open,
  });

  return (
    <AnimatePresence>
      {open && customer && (
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
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-600 p-5 text-white">
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
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-100">Customer Ledger</p>
                  <h2 className="text-xl font-bold">{customer.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-violet-50">
                    {customer.phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                    )}
                    {customer.address && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.address}</span>
                    )}
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Since {formatDate(customer.createdAt)}</span>
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
                  <SummaryMini icon={BookOpenCheck} label="Total Credit" value={formatCurrency(data.summary.totalCreditGiven, { compact: true })} tone="text-violet-600" />
                  <SummaryMini icon={HandCoins} label="Collected" value={formatCurrency(data.summary.totalPaid, { compact: true })} tone="text-emerald-600" />
                  <SummaryMini icon={AlertCircle} label="Outstanding" value={formatCurrency(data.summary.outstanding, { compact: true })} tone={data.summary.outstanding > 0 ? "text-rose-600" : "text-emerald-600"} />
                  <SummaryMini icon={ShoppingBag} label="POS Sales" value={`${data.summary.salesCount}`} tone="text-teal-600" />
                </div>

                {/* Transactions */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
                      <Badge variant="secondary">{data.transactions.length} entries</Badge>
                    </div>
                    {data.transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Receipt className="h-10 w-10 text-muted-foreground/40" />
                        <p className="mt-2 text-sm font-medium text-foreground">No transactions yet</p>
                        <p className="text-xs text-muted-foreground">This customer has no udhar or sales records.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.transactions.map((t: any, i: number) => {
                          const meta = TXN_META[t.type as keyof typeof TXN_META];
                          const Icon = meta.icon;
                          return (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(i * 0.02, 0.4) }}
                              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{t.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(t.date, { withTime: true })} · {meta.label}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-4 text-right">
                                <div className="w-20">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Debit</p>
                                  <p className="text-sm font-medium text-rose-600">{t.debit > 0 ? formatCurrency(t.debit) : "—"}</p>
                                </div>
                                <div className="w-20">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Credit</p>
                                  <p className="text-sm font-medium text-emerald-600">{t.credit > 0 ? formatCurrency(t.credit) : "—"}</p>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="w-24">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                                  <p className={`text-sm font-bold ${t.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                    {formatCurrency(t.balance, { compact: true })}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
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
