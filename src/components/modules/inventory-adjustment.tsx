"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Package,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
  History,
  IndianRupee,
  Calendar,
  Boxes,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
}

const REASONS = ["Stock-take", "Damaged", "Lost", "Found", "Theft", "Sample/Giveaway", "Correction", "Other"];

export function InventoryAdjustment({ open, onClose }: AdjustmentDialogProps) {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.products.list() });
  const { data: adjustments = [] } = useQuery({ queryKey: ["adjustments"], queryFn: () => api.adjustments.list() });

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newQty, setNewQty] = useState("");
  const [reason, setReason] = useState("Stock-take");
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<"adjust" | "history">("adjust");

  const createMut = useMutation({
    mutationFn: (data: any) => api.adjustments.create(data),
    onSuccess: (_data, vars) => {
      toast.success("Stock adjusted", {
        description: `${vars.productId ? "Updated" : ""} — audit logged`,
      });
      qc.invalidateQueries({ queryKey: ["adjustments"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["restock"] });
      setSelectedId(null);
      setNewQty("");
      setNotes("");
      setReason("Stock-take");
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const filtered = useMemo(() => {
    return products.filter((p: any) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const selected = products.find((p: any) => p.id === selectedId);
  const oldQty = selected?.quantity ?? 0;
  const newQtyNum = Number(newQty) || 0;
  const diff = selected ? newQtyNum - oldQty : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !selected) return;
    if (newQty === "" || newQtyNum < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    createMut.mutate({ productId: selectedId, newQty: newQtyNum, reason, notes: notes || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 bg-gradient-to-br from-teal-600 to-cyan-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Inventory Adjustment</DialogTitle>
                <p className="text-xs text-teal-50">Stock-take with full audit log</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Tabs */}
          <div className="mt-4 flex gap-1">
            <button
              onClick={() => setTab("adjust")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                tab === "adjust" ? "bg-white text-teal-700" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Adjust Stock
            </button>
            <button
              onClick={() => setTab("history")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                tab === "history" ? "bg-white text-teal-700" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Audit History ({adjustments.length})
            </button>
          </div>
        </DialogHeader>

        {tab === "adjust" ? (
          <div className="grid max-h-[60vh] grid-cols-1 gap-0 overflow-hidden md:grid-cols-[280px_1fr]">
            {/* Product picker */}
            <div className="flex flex-col border-r border-border/70">
              <div className="border-b border-border/60 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filtered.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedId(p.id);
                        setNewQty(String(p.quantity));
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                        selectedId === p.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", p.quantity <= p.minStockAlert ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600")}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.quantity} {p.unitType} in stock</p>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">No products found</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Adjustment form */}
            <div className="overflow-y-auto p-5">
              {!selected ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ClipboardCheck className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-foreground">Select a product</p>
                  <p className="text-xs text-muted-foreground">Pick a product from the left to adjust its stock.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                          <Package className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground">{selected.name}</p>
                          <p className="text-xs text-muted-foreground">{selected.brand} · {selected.category}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</p>
                          <p className="text-lg font-bold text-foreground">{oldQty}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Min Alert</p>
                          <p className="text-lg font-bold text-foreground">{selected.minStockAlert}</p>
                        </div>
                        <div className={cn("rounded-lg p-2", diff > 0 ? "bg-emerald-500/10" : diff < 0 ? "bg-rose-500/10" : "bg-muted/50")}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Diff</p>
                          <p className={cn("flex items-center justify-center text-lg font-bold", diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-foreground")}>
                            {diff > 0 ? <ArrowUp className="mr-0.5 h-4 w-4" /> : diff < 0 ? <ArrowDown className="mr-0.5 h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            {Math.abs(diff)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>New Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Reason</Label>
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {REASONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Physical count after monthly audit…"
                    />
                  </div>

                  <div className="rounded-lg bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                    <p className="font-semibold">Audit trail</p>
                    <p>This adjustment will be logged with the old/new quantity, difference, reason & timestamp.</p>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
                    <Button type="submit" disabled={createMut.isPending || diff === 0} className="gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      {diff === 0 ? "No change" : "Apply Adjustment"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="p-5">
              {adjustments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-foreground">No adjustments yet</p>
                  <p className="text-xs text-muted-foreground">Stock-take adjustments will appear here with a full audit trail.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {(adjustments as any[]).map((a: any, i: number) => (
                      <motion.div
                        key={a.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
                      >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", a.diff > 0 ? "bg-emerald-500/10 text-emerald-600" : a.diff < 0 ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground")}>
                          {a.diff > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{a.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.oldQty} → {a.newQty} ({a.diff > 0 ? "+" : ""}{a.diff}) · {a.reason}
                            {a.notes && ` · ${a.notes}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-muted-foreground">{formatRelative(a.date)}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(a.date, { withTime: true })}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
