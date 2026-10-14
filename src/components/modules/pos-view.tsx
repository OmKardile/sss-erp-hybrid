"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Receipt,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  User,
  Tag,
  CheckCircle2,
  Package,
  ArrowRight,
  ScanLine,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CartItem {
  product: Product;
  qty: number;
}

const PAYMENT_METHODS = [
  { key: "Cash", icon: Banknote, tone: "text-emerald-600 bg-emerald-500/10" },
  { key: "UPI", icon: Smartphone, tone: "text-violet-600 bg-violet-500/10" },
  { key: "Card", icon: CreditCard, tone: "text-cyan-600 bg-cyan-500/10" },
  { key: "Wallet", icon: Wallet, tone: "text-amber-600 bg-amber-500/10" },
];

export function PosView() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState<any | null>(null);
  const [scanInput, setScanInput] = useState("");

  const scanProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const q = scanInput.trim().toLowerCase();
    if (!q) return;
    // Match by SKU (exact, case-insensitive) first, then name (starts with), then name (includes)
    let match: Product | undefined =
      products.find((p) => (p.sku || "").toLowerCase() === q) ||
      products.find((p) => p.name.toLowerCase().startsWith(q)) ||
      products.find((p) => p.name.toLowerCase().includes(q));
    if (!match) {
      toast.error("No product found", { description: `No match for "${scanInput}"` });
      return;
    }
    addToCart(match);
    toast.success(`Added: ${match.name}`, { description: formatCurrency(match.sellingPrice) });
    setScanInput("");
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const addToCart = (p: Product) => {
    if (p.quantity <= 0) {
      toast.error("Out of stock", { description: p.name });
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.product.id === p.id);
      if (existing) {
        if (existing.qty >= p.quantity) {
          toast.error("Stock limit reached", { description: `${p.name}: ${p.quantity} available` });
          return c;
        }
        return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { product: p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => {
          if (i.product.id !== id) return i;
          const newQty = i.qty + delta;
          if (newQty > i.product.quantity) {
            toast.error("Stock limit reached", { description: `${i.product.name}: ${i.product.quantity} available` });
            return i;
          }
          return { ...i, qty: newQty };
        })
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setDiscount("");
    setNotes("");
  };

  const subtotal = cart.reduce((s, i) => s + i.product.sellingPrice * i.qty, 0);
  const discountNum = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountNum);

  const saleMut = useMutation({
    mutationFn: () =>
      api.sale({
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.sellingPrice,
          quantity: i.qty,
        })),
        customerName: customerName || undefined,
        paymentMethod,
        date: todayISO(),
        discount: discountNum,
        notes: notes || undefined,
      }),
    onSuccess: (data) => {
      toast.success("Sale completed!", {
        description: `Total ${formatCurrency(data.receipt.total)} · ${data.receipt.items.length} items`,
      });
      setReceipt(data.receipt);
      clearCart();
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e) => toast.error("Sale failed", { description: String(e) }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale"
        description="Scan or pick products, complete the sale and print a receipt."
        icon={ShoppingCart}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        {/* Product picker */}
        <div className="space-y-4">
          {/* Scan / quick-add bar */}
          <form onSubmit={scanProduct} className="flex items-center gap-2">
            <div className="relative flex-1">
              <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              <input
                autoFocus
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan barcode / type SKU or product name + Enter…"
                className="h-12 w-full rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or brand…"
                className="h-11 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={categoryFilter === "ALL" ? "default" : "outline"}
                onClick={() => setCategoryFilter("ALL")}
                className="h-9"
              >
                All
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={categoryFilter === c ? "default" : "outline"}
                  onClick={() => setCategoryFilter(c)}
                  className="h-9"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Package} title="No products found" description="Try a different search or category." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((p, idx) => {
                const out = p.quantity <= 0;
                const inCart = cart.find((i) => i.product.id === p.id)?.qty || 0;
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={out}
                    onClick={() => addToCart(p)}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-3 text-left transition-shadow hover:shadow-md",
                      out ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40",
                      inCart > 0 && "border-primary ring-1 ring-primary/30"
                    )}
                  >
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-teal-500/10 text-primary">
                      <Package className="h-7 w-7" />
                    </div>
                    {inCart > 0 && (
                      <Badge className="absolute right-1.5 top-1.5 h-5 min-w-5 justify-center px-1 text-[10px]">
                        {inCart}
                      </Badge>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-tight text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.brand || "—"}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{formatCurrency(p.sellingPrice)}</span>
                      <span className={cn("text-[11px]", out ? "text-rose-500" : "text-muted-foreground")}>
                        {out ? "Out" : `${p.quantity} ${p.unitType}`}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart panel */}
        <div className="lg:sticky lg:top-[88px] lg:h-fit">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Current Sale</p>
                  <p className="text-xs text-muted-foreground">{cart.length} item(s)</p>
                </div>
              </div>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="gap-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>

            <ScrollArea className="max-h-[340px]">
              <div className="p-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">Cart is empty</p>
                    <p className="text-xs text-muted-foreground">Tap a product to add it.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.product.sellingPrice)} × {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.product.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.product.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {cart.length > 0 && (
              <div className="border-t border-border/70 p-4">
                {/* Customer + payment */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Customer (optional)</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Walk-in"
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Discount (₹)</Label>
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0"
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Label className="mb-1.5 block text-[11px] text-muted-foreground">Payment Method</Label>
                <div className="mb-3 grid grid-cols-4 gap-1.5">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition",
                          active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded", m.tone)}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {m.key}
                      </button>
                    );
                  })}
                </div>

                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="mb-3 h-8 text-xs"
                />

                {/* Totals */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountNum > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount</span>
                      <span>−{formatCurrency(discountNum)}</span>
                    </div>
                  )}
                  <Separator className="my-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="text-lg font-bold"
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </div>
                </div>

                <Button
                  className="mt-3 w-full gap-2"
                  size="lg"
                  disabled={saleMut.isPending || cart.length === 0}
                  onClick={() => saleMut.mutate()}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Sale · {formatCurrency(total)}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={() => setReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-2xl"
            >
              {/* Receipt header */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-center text-white">
                <CheckCircle2 className="mx-auto h-10 w-10" />
                <p className="mt-2 text-lg font-bold">Sale Complete</p>
                <p className="text-xs text-emerald-50">Shubham Super Shopee</p>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(receipt.date, { withTime: true })}</span>
                  <Badge variant="secondary" className="gap-1">{receipt.paymentMethod}</Badge>
                </div>
                {receipt.customerName && (
                  <p className="mb-2 text-xs text-muted-foreground">Customer: <span className="font-medium text-foreground">{receipt.customerName}</span></p>
                )}

                <div className="mb-3 space-y-1.5 border-y border-dashed border-border py-3">
                  {receipt.items.map((it: any, i: number) => (
                    <div key={i} className="flex items-start justify-between text-sm">
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-medium text-foreground">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(it.price)} × {it.quantity}</p>
                      </div>
                      <span className="font-medium text-foreground">{formatCurrency(it.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(receipt.subtotal)}</span>
                  </div>
                  {receipt.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount</span>
                      <span>−{formatCurrency(receipt.discount)}</span>
                    </div>
                  )}
                  <Separator className="my-1.5" />
                  <div className="flex items-center justify-between text-base font-bold">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatCurrency(receipt.total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => setReceipt(null)}>
                    New Sale <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
