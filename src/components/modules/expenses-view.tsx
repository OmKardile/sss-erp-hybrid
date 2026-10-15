"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Search, IndianRupee, Calendar, TrendingDown, Layers } from "lucide-react";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate, todayISO, isoOf } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { DateRangeFilter, inPreset, type DatePreset } from "@/components/shared/date-range-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = ["Rent", "Electricity", "Salaries", "Transport", "Packaging", "Maintenance", "Marketing", "Misc"];

export function ExpensesView() {
  const qc = useQueryClient();
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses"], queryFn: () => api.expenses.list() });

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [datePreset, setDatePreset] = useState<DatePreset>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "Rent",
    amount: "",
    date: todayISO(),
    notes: "",
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.expenses.create(data),
    onSuccess: () => {
      toast.success("Expense added");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      setModalOpen(false);
      setForm({ category: "Rent", amount: "", date: todayISO(), notes: "" });
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.expenses.remove(id),
    onSuccess: () => {
      toast.success("Expense deleted");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
  });

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const month = new Date().toISOString().substring(0, 7);
    const monthly = expenses.filter((e) => isoOf(e.date).startsWith(month)).reduce((s, e) => s + e.amount, 0);
    const today = todayISO();
    const todayTotal = expenses.filter((e) => isoOf(e.date).split("T")[0] === today).reduce((s, e) => s + e.amount, 0);
    const avg = expenses.length ? total / expenses.length : 0;
    return { total, monthly, todayTotal, avg, count: expenses.length };
  }, [expenses]);

  const catTotals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = !search || e.category.toLowerCase().includes(search.toLowerCase()) || (e.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "ALL" || e.category === catFilter;
      const matchDate = inPreset(e.date, datePreset);
      return matchSearch && matchCat && matchDate;
    });
  }, [expenses, search, catFilter, datePreset]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({ ...form, amount: Number(form.amount) || 0 });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track operating costs categorized by type."
        icon={CreditCard}
        actions={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Today's Expenses" value={formatCurrency(stats.todayTotal)} icon={IndianRupee} tone="rose" />
        <StatCard index={1} title="This Month" value={formatCurrency(stats.monthly, { compact: true })} icon={Calendar} tone="amber" />
        <StatCard index={2} title="Total Expenses" value={formatCurrency(stats.total, { compact: true })} icon={TrendingDown} tone="rose" />
        <StatCard index={3} title="Avg per Entry" value={formatCurrency(stats.avg, { compact: true })} icon={Layers} tone="violet" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Expense Entries"
          description={`${filtered.length} records`}
          className="lg:col-span-2"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-9 w-full pl-8 sm:w-40"
                />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateRangeFilter value={datePreset} onChange={setDatePreset} />
            </div>
          }
          contentClassName="p-0"
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No expenses recorded"
              description="Add your first expense to track operating costs."
              action={
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Expense
                </Button>
              }
              className="m-5"
            />
          ) : (
            <div className="scroll-thin max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">{e.category}</Badge>
                        {e.notes && <p className="mt-1 text-xs text-muted-foreground">{e.notes}</p>}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-rose-600">
                        −{formatCurrency(e.amount)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDate(e.date)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(e.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="By Category" description="All-time breakdown">
          <div className="space-y-3">
            {catTotals.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              catTotals.map(([cat, val]) => {
                const pct = stats.total > 0 ? (val / stats.total) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground">{formatCurrency(val)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Paid via bank transfer…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this expense?"
        description="This permanently removes the expense record."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
