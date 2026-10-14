"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Target,
  TrendingUp,
  IndianRupee,
  Calendar,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, monthLabel } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function SalesTargetWidget() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["targets"],
    queryFn: () => api.targets.list(),
    refetchInterval: 30_000,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editMonth, setEditMonth] = useState<string | null>(null);
  const [form, setForm] = useState({ month: "", amount: "" });
  const [deleteMonth, setDeleteMonth] = useState<string | null>(null);

  const setMut = useMutation({
    mutationFn: ({ month, amount }: { month: string; amount: number }) =>
      api.targets.set(month, amount),
    onSuccess: () => {
      toast.success("Target saved");
      qc.invalidateQueries({ queryKey: ["targets"] });
      setModalOpen(false);
      setForm({ month: "", amount: "" });
      setEditMonth(null);
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (month: string) => api.targets.remove(month),
    onSuccess: () => {
      toast.success("Target removed");
      qc.invalidateQueries({ queryKey: ["targets"] });
      setDeleteMonth(null);
    },
  });

  if (isLoading || !data) {
    return (
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const { current, currentActual, currentMonth, targets } = data;

  const openSet = (month?: string, amount?: number) => {
    if (month) {
      setEditMonth(month);
      setForm({ month, amount: String(amount || "") });
    } else {
      setEditMonth(null);
      setForm({ month: currentMonth, amount: "" });
    }
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMut.mutate({ month: form.month, amount: Number(form.amount) || 0 });
  };

  const pct = current?.pct || 0;
  const expectedPace = current?.expectedPace || 0;
  const remaining = current?.remaining || 0;
  const onPace = pct >= expectedPace;
  const achieved = pct >= 100;

  return (
    <>
      <Card className="card-hover relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
        <CardContent className="relative p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Target className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sales Target</p>
                <p className="text-[11px] text-muted-foreground">{monthLabel(currentMonth)} · auto-updates</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openSet()}>
              <Plus className="h-3.5 w-3.5" /> Set
            </Button>
          </div>

          {!current ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-6 text-center">
              <Target className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground">No target for {monthLabel(currentMonth)}</p>
              <p className="text-xs text-muted-foreground">Set a monthly sales goal to track progress.</p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={() => openSet()}>
                <Plus className="h-3.5 w-3.5" /> Set Target
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Achieved</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(currentActual, { compact: true })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Goal</p>
                    <p className="text-lg font-semibold text-muted-foreground">{formatCurrency(current.amount, { compact: true })}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={achieved ? "font-semibold text-emerald-600" : onPace ? "font-medium text-foreground" : "font-medium text-amber-600"}>
                      {pct.toFixed(0)}% achieved
                    </span>
                    <span className="text-muted-foreground">Expected {expectedPace.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${achieved ? "bg-emerald-500" : onPace ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    {/* Pace marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground/40"
                      style={{ left: `${Math.min(100, expectedPace)}%` }}
                      title="Expected pace"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {achieved ? (
                    <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Target achieved!
                    </Badge>
                  ) : onPace ? (
                    <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" /> On pace
                    </Badge>
                  ) : (
                    <Badge className="gap-1 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" /> Behind pace
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {remaining > 0 ? `${formatCurrency(remaining, { compact: true })} to go` : "Goal met"}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Past targets */}
          {targets.length > 1 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Past Targets</p>
              <div className="space-y-1.5">
                {targets.filter((t: any) => t.month !== currentMonth).slice(0, 3).map((t: any, i: number) => (
                  <motion.div
                    key={t.month}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-2 text-xs"
                  >
                    <span className="w-14 font-medium text-foreground">{monthLabel(t.month)}</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${t.pct >= 100 ? "bg-emerald-500" : t.pct >= 50 ? "bg-teal-500" : "bg-rose-500"}`}
                          style={{ width: `${Math.min(100, t.pct)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right font-semibold text-foreground">{t.pct.toFixed(0)}%</span>
                    <button
                      onClick={() => openSet(t.month, t.amount)}
                      className="text-muted-foreground opacity-0 transition hover:text-primary group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeleteMonth(t.month)}
                      className="text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMonth ? "Edit Target" : "Set Sales Target"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Input
                type="month"
                required
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 100000"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={setMut.isPending}>Save Target</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteMonth}
        onOpenChange={(o) => !o && setDeleteMonth(null)}
        title="Remove this target?"
        description="The sales target for this month will be deleted."
        confirmText="Remove"
        onConfirm={() => deleteMonth && deleteMut.mutate(deleteMonth)}
      />
    </>
  );
}
