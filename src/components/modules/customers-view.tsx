"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Search, Phone, MapPin, User, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
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

export function CustomersView() {
  const qc = useQueryClient();
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => api.customers.list() });
  const { data: udhar = [] } = useQuery({ queryKey: ["udhar"], queryFn: () => api.udhar.list() });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (data: any) => api.customers.create(data),
    onSuccess: () => {
      toast.success("Customer added");
      qc.invalidateQueries({ queryKey: ["customers"] });
      setModalOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error("Failed", { description: String(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.customers.update(id, data),
    onSuccess: () => {
      toast.success("Customer updated");
      qc.invalidateQueries({ queryKey: ["customers"] });
      setModalOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.customers.remove(id),
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["customers"] });
      setDeleteId(null);
    },
  });

  // Compute udhar stats per customer
  const customerStats = useMemo(() => {
    const map = new Map<string, { count: number; outstanding: number }>();
    udhar.forEach((u) => {
      const cur = map.get(u.customerName) || { count: 0, outstanding: 0 };
      cur.count += 1;
      cur.outstanding += u.remainingAmount || 0;
      map.set(u.customerName, cur);
    });
    return map;
  }, [udhar]);

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").includes(search) ||
        (c.address || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const totalOutstanding = Array.from(customerStats.values()).reduce((s, v) => s + v.outstanding, 0);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || "", address: c.address || "" });
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
        title="Customers"
        description="Your customer directory with linked credit activity."
        icon={Users}
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard index={0} title="Total Customers" value={`${customers.length}`} icon={Users} tone="emerald" />
        <StatCard index={1} title="With Active Credit" value={`${customerStats.size}`} icon={User} tone="violet" />
        <StatCard index={2} title="Total Outstanding" value={`₹${totalOutstanding.toLocaleString("en-IN")}`} icon={Calendar} tone="rose" />
      </div>

      <SectionCard
        title="Customer Directory"
        description={`${filtered.length} customers`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="h-9 w-full pl-8 sm:w-56"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add customers to keep a directory and link credit entries."
            action={
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add Customer
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, idx) => {
              const stat = customerStats.get(c.name);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="card-hover group h-full">
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">Since {formatDate(c.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm">
                        {c.phone && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" /> {c.phone}
                          </p>
                        )}
                        {c.address && (
                          <p className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.address}
                          </p>
                        )}
                      </div>
                      {stat && (
                        <div className="mt-auto flex items-center justify-between rounded-lg bg-muted/50 p-2.5 text-xs">
                          <span className="text-muted-foreground">{stat.count} credit entr{stat.count > 1 ? "ies" : "y"}</span>
                          {stat.outstanding > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">₹{stat.outstanding.toLocaleString("en-IN")} due</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 text-[10px]">Clear</Badge>
                          )}
                        </div>
                      )}
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
            <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shop / home address" />
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
        title="Delete this customer?"
        description="This removes the customer from your directory."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
