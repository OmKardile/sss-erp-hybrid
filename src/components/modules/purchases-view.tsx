"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBag, Plus, Trash2, Search, Truck, Calendar, IndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import type { Purchase } from "@/lib/types";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function PurchasesView() {
  const qc = useQueryClient();
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => api.purchases.list(),
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.products.list() });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: () => api.suppliers.list() });

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplierName: "",
    productName: "",
    quantity: "",
    unitPrice: "",
    purchaseDate: todayISO(),
    notes: "",
    autoStock: true,
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.purchases.create(data),
    onSuccess: () => {
      toast.success("Purchase recorded");
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      setModalOpen(false);
      setForm({ supplierName: "", productName: "", quantity: "", unitPrice: "", purchaseDate: todayISO(), notes: "", autoStock: true });
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.purchases.remove(id),
    onSuccess: () => {
      toast.success("Purchase deleted");
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
  });

  const stats = useMemo(() => {
    const total = purchases.reduce((s, p) => s + p.totalAmount, 0);
    const month = new Date().toISOString().substring(0, 7);
    const monthly = purchases
      .filter((p) => p.purchaseDate.toISOString().startsWith(month))
      .reduce((s, p) => s + p.totalAmount, 0);
    const uniqSuppliers = new Set(purchases.map((p) => p.supplierName)).size;
    return { total, monthly, count: purchases.length, uniqSuppliers };
  }, [purchases]);

  const supplierNames = useMemo(() => {
    const set = new Set<string>();
    purchases.forEach((p) => set.add(p.supplierName));
    suppliers.forEach((s) => set.add(s.name));
    return Array.from(set).sort();
  }, [purchases, suppliers]);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        !search ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchSup = supplierFilter === "ALL" || p.supplierName === supplierFilter;
      return matchSearch && matchSup;
    });
  }, [purchases, search, supplierFilter]);

  const total = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      quantity: Number(form.quantity) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      totalAmount: total,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Log supplier-wise stock purchases. Auto-updates matching product stock."
        icon={ShoppingBag}
        actions={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Purchase
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Total Purchases" value={`${stats.count}`} icon={ShoppingBag} tone="emerald" />
        <StatCard index={1} title="Total Spend" value={formatCurrency(stats.total, { compact: true })} icon={IndianRupee} tone="rose" />
        <StatCard index={2} title="This Month" value={formatCurrency(stats.monthly, { compact: true })} icon={Calendar} tone="amber" />
        <StatCard index={3} title="Suppliers Used" value={`${stats.uniqSuppliers}`} icon={Truck} tone="teal" />
      </div>

      <SectionCard
        title="Purchase Ledger"
        description={`${filtered.length} entries`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or supplier…"
                className="h-9 w-full pl-8 sm:w-56"
              />
            </div>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All suppliers</SelectItem>
                {supplierNames.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        contentClassName="p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No purchases recorded"
            description="Log your first stock purchase to keep track of supplier spend."
            action={
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New Purchase
              </Button>
            }
            className="m-5"
          />
        ) : (
          <div className="scroll-thin max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{p.productName}</p>
                      {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Truck className="h-3 w-3" /> {p.supplierName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{p.quantity}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatCurrency(p.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatCurrency(p.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(p.purchaseDate)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record New Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Supplier Name *</Label>
              <Input
                required
                list="suppliers-list"
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                placeholder="e.g. Mahalaxmi Distributors"
              />
              <datalist id="suppliers-list">
                {supplierNames.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input
                required
                list="products-list"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                placeholder="e.g. Aashirvaad Atta 5kg"
              />
              <datalist id="products-list">
                {products.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Restock, bulk order…"
              />
            </div>
            <div className="rounded-xl bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Matching products will get stock auto-incremented.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>Record Purchase</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this purchase?"
        description="This removes the purchase record. Product stock will not be reversed."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
