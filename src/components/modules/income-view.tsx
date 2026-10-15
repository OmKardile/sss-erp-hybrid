"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleDollarSign, Plus, Trash2, Search, IndianRupee, Calendar, TrendingUp, Layers } from "lucide-react";
import { api } from "@/lib/api";
import type { Income } from "@/lib/types";
import { formatCurrency, formatDate, todayISO, monthLabel, isoOf } from "@/lib/format";
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

const CATEGORIES = ["Sales", "Services", "Wholesale", "Refund", "Investment", "Other"];

export function IncomeView() {
  const qc = useQueryClient();
  const { data: income = [] } = useQuery({ queryKey: ["income"], queryFn: () => api.income.list() });

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [datePreset, setDatePreset] = useState<DatePreset>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    source: "",
    category: "Sales",
    amount: "",
    date: todayISO(),
    notes: "",
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.income.create(data),
    onSuccess: () => {
      toast.success("Income added");
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      setModalOpen(false);
      setForm({ source: "", category: "Sales", amount: "", date: todayISO(), notes: "" });
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.income.remove(id),
    onSuccess: () => {
      toast.success("Income deleted");
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
  });

  const stats = useMemo(() => {
    const total = income.reduce((s, i) => s + i.amount, 0);
    const month = new Date().toISOString().substring(0, 7);
    const monthly = income.filter((i) => isoOf(i.date).startsWith(month)).reduce((s, i) => s + i.amount, 0);
    const today = todayISO();
    const todayTotal = income.filter((i) => isoOf(i.date).split("T")[0] === today).reduce((s, i) => s + i.amount, 0);
    const avg = income.length ? total / income.length : 0;
    return { total, monthly, todayTotal, avg, count: income.length };
  }, [income]);

  const filtered = useMemo(() => {
    return income.filter((i) => {
      const matchSearch = !search || i.source.toLowerCase().includes(search.toLowerCase()) || (i.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "ALL" || i.category === catFilter;
      const matchDate = inPreset(i.date, datePreset);
      return matchSearch && matchCat && matchDate;
    });
  }, [income, search, catFilter, datePreset]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({ ...form, amount: Number(form.amount) || 0 });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description="Record daily sales and revenue from all sources."
        icon={CircleDollarSign}
        actions={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Income
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Today's Income" value={formatCurrency(stats.todayTotal)} icon={IndianRupee} tone="emerald" />
        <StatCard index={1} title="This Month" value={formatCurrency(stats.monthly, { compact: true })} icon={Calendar} tone="teal" />
        <StatCard index={2} title="Total Income" value={formatCurrency(stats.total, { compact: true })} icon={TrendingUp} tone="amber" />
        <StatCard index={3} title="Avg per Entry" value={formatCurrency(stats.avg, { compact: true })} icon={Layers} tone="violet" />
      </div>

      <SectionCard
        title="Income Entries"
        description={`${filtered.length} records`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search source or notes…"
                className="h-9 w-full pl-8 sm:w-56"
              />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
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
            icon={CircleDollarSign}
            title="No income recorded"
            description="Add your first income entry to start tracking revenue."
            action={
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Income
              </Button>
            }
            className="m-5"
          />
        ) : (
          <div className="scroll-thin max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{i.source}</p>
                      {i.notes && <p className="text-xs text-muted-foreground">{i.notes}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        {i.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      +{formatCurrency(i.amount)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(i.date)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(i.id)}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Source *</Label>
              <Input
                required
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Counter Sales"
              />
            </div>
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
                placeholder="e.g. UPI payment, bulk order…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>Add Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this income entry?"
        description="This permanently removes the income record."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
