"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpenCheck,
  Plus,
  Trash2,
  Search,
  Phone,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  HandCoins,
  User,
  Receipt,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Udhar } from "@/lib/types";
import { formatCurrency, formatDate, todayISO, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

function statusBadge(status: string) {
  if (status === "PAID")
    return <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Settled</Badge>;
  if (status === "PARTIAL")
    return <Badge className="gap-1 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400"><AlertCircle className="h-3 w-3" /> Partial</Badge>;
  return <Badge className="gap-1 bg-rose-500/15 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"><Clock className="h-3 w-3" /> Pending</Badge>;
}

export function UdharView() {
  const qc = useQueryClient();
  const { data: udhar = [] } = useQuery({ queryKey: ["udhar"], queryFn: () => api.udhar.list() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<Udhar | null>(null);
  const [historyOpen, setHistoryOpen] = useState<Udhar | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    description: "",
    amount: "",
    date: todayISO(),
    dueDate: "",
    notes: "",
  });
  const [payForm, setPayForm] = useState({ amount: "", date: todayISO(), notes: "" });

  const createMut = useMutation({
    mutationFn: (data: any) => api.udhar.create(data),
    onSuccess: () => {
      toast.success("Udhar entry created");
      qc.invalidateQueries({ queryKey: ["udhar"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      setAddOpen(false);
      setForm({ customerName: "", phone: "", description: "", amount: "", date: todayISO(), dueDate: "", notes: "" });
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const payMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.udhar.addPayment(id, data),
    onSuccess: () => {
      toast.success("Payment recorded");
      qc.invalidateQueries({ queryKey: ["udhar"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setPayOpen(null);
      setPayForm({ amount: "", date: todayISO(), notes: "" });
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const settleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PAID" | "PENDING" }) =>
      api.udhar.settle(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["udhar"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.udhar.remove(id),
    onSuccess: () => {
      toast.success("Udhar deleted");
      qc.invalidateQueries({ queryKey: ["udhar"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
  });

  const stats = useMemo(() => {
    const total = udhar.reduce((s, u) => s + u.amount, 0);
    const paid = udhar.reduce((s, u) => s + (u.paidAmount || 0), 0);
    const outstanding = udhar.reduce((s, u) => s + (u.remainingAmount || 0), 0);
    const pendingCount = udhar.filter((u) => u.status !== "PAID").length;
    return { total, paid, outstanding, pendingCount, count: udhar.length };
  }, [udhar]);

  const filtered = useMemo(() => {
    return udhar.filter((u) => {
      const matchSearch = !search || u.customerName.toLowerCase().includes(search.toLowerCase()) || u.description.toLowerCase().includes(search.toLowerCase()) || (u.phone || "").includes(search);
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [udhar, search, statusFilter]);

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate || undefined,
    });
  };

  const submitPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payOpen) return;
    payMut.mutate({ id: payOpen.id, data: { ...payForm, amount: Number(payForm.amount) || 0 } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Udhar Ledger"
        description="Track customer credit, record partial payments and settle dues."
        icon={BookOpenCheck}
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Udhar
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Total Credit Given" value={formatCurrency(stats.total, { compact: true })} icon={IndianRupee} tone="violet" />
        <StatCard index={1} title="Collected" value={formatCurrency(stats.paid, { compact: true })} icon={HandCoins} tone="emerald" />
        <StatCard index={2} title="Outstanding" value={formatCurrency(stats.outstanding, { compact: true })} icon={AlertCircle} tone="rose" />
        <StatCard index={3} title="Pending Entries" value={`${stats.pendingCount}`} icon={Clock} tone="amber" />
      </div>

      <SectionCard
        title="Credit Entries"
        description={`${filtered.length} of ${udhar.length} entries`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, phone…"
                className="h-9 w-full pl-8 sm:w-52"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title="No udhar entries"
            description="Create a credit entry when you sell on credit to a customer."
            action={
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New Udhar
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((u, idx) => {
                const pct = u.amount > 0 ? ((u.paidAmount || 0) / u.amount) * 100 : 0;
                const overdue = u.dueDate ? new Date(u.dueDate) < new Date() && u.status !== "PAID" : false;
                return (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                  >
                    <Card className={`card-hover overflow-hidden ${overdue ? "ring-1 ring-rose-500/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{u.customerName}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.description}</p>
                              {u.phone && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /> {u.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          {statusBadge(u.status)}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                            <p className="text-sm font-bold text-foreground">{formatCurrency(u.amount, { compact: true })}</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/10 p-2">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Paid</p>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(u.paidAmount || 0, { compact: true })}</p>
                          </div>
                          <div className="rounded-lg bg-rose-500/10 p-2">
                            <p className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400">Due</p>
                            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{formatCurrency(u.remainingAmount || 0, { compact: true })}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Progress value={pct} className="h-1.5" />
                          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(u.date)}
                            </span>
                            <span>{pct.toFixed(0)}% collected</span>
                            {u.dueDate && (
                              <span className={overdue ? "font-semibold text-rose-600" : ""}>
                                {overdue ? "Overdue · " : "Due "} {formatRelative(u.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {u.status !== "PAID" && (
                            <Button
                              size="sm"
                              className="gap-1.5"
                              onClick={() => {
                                setPayOpen(u);
                                setPayForm({ amount: String(u.remainingAmount || 0), date: todayISO(), notes: "" });
                              }}
                            >
                              <HandCoins className="h-3.5 w-3.5" /> Record Payment
                            </Button>
                          )}
                          {u.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => settleMut.mutate({ id: u.id, status: "PAID" })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Settled
                            </Button>
                          )}
                          {(u.payments?.length ?? 0) > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-muted-foreground"
                              onClick={() => setHistoryOpen(u)}
                            >
                              <Receipt className="h-3.5 w-3.5" /> {u.payments?.length} payment{(u.payments?.length ?? 0) > 1 ? "s" : ""}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto gap-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </SectionCard>

      {/* Add udhar */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Udhar Entry</DialogTitle>
            <DialogDescription>Record credit given to a customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Customer Name *</Label>
                <Input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="e.g. Ramesh Patil" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone (optional)</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly groceries" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>Create Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={!!payOpen} onOpenChange={(o) => !o && setPayOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {payOpen?.customerName} · Outstanding {formatCurrency(payOpen?.remainingAmount || 0)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPay} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payment Amount (₹) *</Label>
              <Input type="number" step="0.01" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="e.g. Cash, UPI…" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayOpen(null)}>Cancel</Button>
              <Button type="submit" disabled={payMut.isPending}>Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment history */}
      <Dialog open={!!historyOpen} onOpenChange={(o) => !o && setHistoryOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>{historyOpen?.customerName} · {historyOpen?.description}</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {historyOpen?.payments?.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                  {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await api.udhar.removePayment(historyOpen.id, p.id);
                    qc.invalidateQueries({ queryKey: ["udhar"] });
                    setHistoryOpen(null);
                    toast.success("Payment removed");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this udhar entry?"
        description="This removes the entry and all its payment records. This cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
