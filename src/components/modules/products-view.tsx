"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Boxes,
  Tags,
  PackageCheck,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Product, UnitType } from "@/lib/types";
import { formatCurrency, formatDate, toDateInput } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import { StatCard } from "@/components/shared/stat-card";

const UNIT_TYPES: UnitType[] = ["pcs", "kg", "gm", "box", "litre", "dozen"];
const CATEGORIES = ["Groceries", "Dairy", "Snacks", "Beverages", "Household", "Personal Care", "Stationery", "Other"];

const emptyForm = {
  name: "",
  brand: "",
  category: "Groceries",
  sku: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  unitType: "pcs" as UnitType,
  minStockAlert: "5",
  expiryDate: "",
};

export function ProductsView() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
      toast.success("Product added");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setModalOpen(false);
    },
    onError: (e) => toast.error("Failed to add", { description: String(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.products.update(id, data),
    onSuccess: () => {
      toast.success("Product updated");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setModalOpen(false);
    },
    onError: (e) => toast.error("Failed to update", { description: String(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.products.remove(id),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: (e) => toast.error("Failed to delete", { description: String(e) }),
  });

  const stats = useMemo(() => {
    const totalValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
    const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
    const lowStock = products.filter((p) => p.quantity <= p.minStockAlert).length;
    const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;
    return { totalValue, totalUnits, lowStock, categories };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchStock = stockFilter === "ALL" || p.quantity <= p.minStockAlert;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand || "",
      category: p.category || "Groceries",
      sku: p.sku || "",
      purchasePrice: String(p.purchasePrice),
      sellingPrice: String(p.sellingPrice),
      quantity: String(p.quantity),
      unitType: p.unitType,
      minStockAlert: String(p.minStockAlert),
      expiryDate: p.expiryDate ? toDateInput(p.expiryDate) : "",
    });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      quantity: Number(form.quantity) || 0,
      minStockAlert: Number(form.minStockAlert) || 0,
    };
    if (editing) updateMut.mutate({ id: editing.id, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Inventory"
        description="Manage your catalogue, track stock and get low-stock alerts."
        icon={Package}
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Total Products" value={`${products.length}`} icon={Layers} tone="emerald" />
        <StatCard index={1} title="Units in Stock" value={`${stats.totalUnits}`} icon={Boxes} tone="teal" />
        <StatCard index={2} title="Inventory Value" value={formatCurrency(stats.totalValue, { compact: true })} icon={PackageCheck} tone="amber" />
        <StatCard index={3} title="Low Stock Items" value={`${stats.lowStock}`} icon={AlertTriangle} tone={stats.lowStock > 0 ? "rose" : "emerald"} />
      </div>

      <SectionCard
        title="Product Catalogue"
        description={`${filtered.length} of ${products.length} products`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, brand, SKU…"
                className="h-9 w-full pl-8 sm:w-56"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <Button
              variant={stockFilter === "LOW" ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter((s) => (s === "LOW" ? "ALL" : "LOW"))}
              className="gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Low stock
            </Button>
          </div>
        }
        contentClassName="p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "No products yet" : "No matches"}
            description={
              products.length === 0
                ? "Add your first product to start tracking inventory."
                : "Try adjusting your search or filters."
            }
            action={
              products.length === 0 && (
                <Button onClick={openAdd} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              )
            }
            className="m-5"
          />
        ) : (
          <div className="scroll-thin max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Buy / Sell</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Expiry</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const low = p.quantity <= p.minStockAlert;
                  const margin = p.sellingPrice - p.purchasePrice;
                  const marginPct = p.purchasePrice > 0 ? (margin / p.purchasePrice) * 100 : 0;
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${low ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"}`}>
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.brand || "—"} {p.sku && `· ${p.sku}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.category ? (
                          <Badge variant="secondary" className="gap-1">
                            <Tags className="h-3 w-3" /> {p.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(p.sellingPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          buy {formatCurrency(p.purchasePrice)} · {marginPct.toFixed(0)}% margin
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`text-sm font-semibold ${low ? "text-rose-600" : "text-foreground"}`}>
                            {p.quantity}
                          </span>
                          <span className="text-xs text-muted-foreground">{p.unitType}</span>
                          {low && (
                            <Badge variant="destructive" className="gap-1 px-1.5 py-0 text-[10px]">
                              <AlertTriangle className="h-2.5 w-2.5" /> Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {p.expiryDate ? formatDate(p.expiryDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Add/Edit dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aashirvaad Atta 5kg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. Aashirvaad"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU / Code</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="auto or custom"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Unit Type</Label>
                <Select value={form.unitType} onValueChange={(v) => setForm({ ...form, unitType: v as UnitType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pp">Purchase Price (₹) *</Label>
                <Input
                  id="pp"
                  type="number"
                  step="0.01"
                  required
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp">Selling Price (₹) *</Label>
                <Input
                  id="sp"
                  type="number"
                  step="0.01"
                  required
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  step="0.01"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msa">Min Stock Alert</Label>
                <Input
                  id="msa"
                  type="number"
                  step="0.01"
                  value={form.minStockAlert}
                  onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="exp">Expiry Date (optional)</Label>
                <Input
                  id="exp"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this product?"
        description="This will permanently remove the product from your inventory. This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
