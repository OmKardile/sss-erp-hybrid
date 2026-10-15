"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Truck, Plus, Pencil, Trash2, Search, Phone, MapPin, Calendar, ShoppingBag, IndianRupee, BookOpenCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierLedger } from "./supplier-ledger";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

const empty = { name: "", phone: "", address: "" };

export function SuppliersView() {
  const qc = useQueryClient();
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: () => api.suppliers.list() });
  const { data: purchases = [] } = useQuery({ queryKey: ["purchases"], queryFn: () => api.purchases.list() });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ledgerSupplier, setLedgerSupplier] = useState<Supplier | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  const createMut = useMutation({
    mutationFn: (data: any) => api.suppliers.create(data),
    onSuccess: () => {
      toast.success("Supplier added");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setModalOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.suppliers.update(id, data),
    onSuccess: () => {
      toast.success("Supplier updated");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setModalOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.suppliers.remove(id),
    onSuccess: () => {
      toast.success("Supplier deleted");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleteId(null);
    },
  });

  const supplierStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    purchases.forEach((p) => {
      const cur = map.get(p.supplierName) || { count: 0, total: 0 };
      cur.count += 1;
      cur.total += p.totalAmount;
      map.set(p.supplierName, cur);
    });
    return map;
  }, [purchases]);

  const filtered = useMemo(() => {
    return suppliers.filter(
      (s) =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || "").includes(search) ||
        (s.address || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  const totalSpend = Array.from(supplierStats.values()).reduce((s, v) => s + v.total, 0);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone || "", address: s.address || "" });
    setModalOpen(true);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Vendor directory with linked purchase history."
        icon={Truck}
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard index={0} title="Total Suppliers" value={`${suppliers.length}`} icon={Truck} tone="emerald" />
        <StatCard index={1} title="Active Suppliers" value={`${supplierStats.size}`} icon={ShoppingBag} tone="teal" />
        <StatCard index={2} title="Total Spend" value={formatCurrency(totalSpend, { compact: true })} icon={IndianRupee} tone="amber" />
      </div>

      <SectionCard
        title="Supplier Directory"
        description={`${filtered.length} suppliers`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers…"
              className="h-9 w-full pl-8 sm:w-56"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add suppliers to keep a vendor directory and link purchases."
            action={
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add Supplier
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, idx) => {
              const stat = supplierStats.get(s.name);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="card-hover group h-full">
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">Since {formatDate(s.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm">
                        {s.phone && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" /> {s.phone}
                          </p>
                        )}
                        {s.address && (
                          <p className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s.address}
                          </p>
                        )}
                      </div>
                      {stat ? (
                        <div className="mt-auto flex items-center justify-between rounded-lg bg-muted/50 p-2.5 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <ShoppingBag className="h-3 w-3" /> {stat.count} orders
                          </span>
                          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 text-[10px]">
                            {formatCurrency(stat.total, { compact: true })} spend
                          </Badge>
                        </div>
                      ) : (
                        <div className="mt-auto rounded-lg bg-muted/30 p-2.5 text-center text-xs text-muted-foreground">
                          No purchases yet
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full gap-2 border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                        onClick={() => {
                          setLedgerSupplier(s);
                          setLedgerOpen(true);
                        }}
                      >
                        <BookOpenCheck className="h-3.5 w-3.5" /> View Ledger
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier / firm name" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shop / godown address" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this supplier?"
        description="This removes the supplier from your directory."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />

      <SupplierLedger
        supplier={ledgerSupplier}
        open={ledgerOpen}
        onClose={() => {
          setLedgerOpen(false);
          setLedgerSupplier(null);
        }}
      />
    </div>
  );
}
