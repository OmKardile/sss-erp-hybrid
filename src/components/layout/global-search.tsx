"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Users,
  Truck,
  CircleDollarSign,
  CreditCard,
  ShoppingBag,
  BookOpenCheck,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { api } from "@/lib/api";
import { useNav, type ModuleKey } from "@/lib/nav";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: any; tone: string; module: ModuleKey; label: string }> = {
  product: { icon: Package, tone: "text-emerald-600 bg-emerald-500/10", module: "products", label: "Product" },
  customer: { icon: Users, tone: "text-violet-600 bg-violet-500/10", module: "customers", label: "Customer" },
  supplier: { icon: Truck, tone: "text-amber-600 bg-amber-500/10", module: "suppliers", label: "Supplier" },
  income: { icon: CircleDollarSign, tone: "text-emerald-600 bg-emerald-500/10", module: "income", label: "Income" },
  expense: { icon: CreditCard, tone: "text-rose-600 bg-rose-500/10", module: "expenses", label: "Expense" },
  purchase: { icon: ShoppingBag, tone: "text-amber-600 bg-amber-500/10", module: "purchases", label: "Purchase" },
  udhar: { icon: BookOpenCheck, tone: "text-violet-600 bg-violet-500/10", module: "udhar", label: "Udhar" },
};

export function GlobalSearch() {
  const open = useNav((s) => s.searchOpen);
  const setOpen = useNav((s) => s.setSearchOpen);
  const setNav = useNav((s) => s.set);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => api.search(query),
    enabled: query.trim().length >= 1,
  });

  // Global keyboard shortcut: Ctrl+/ or Cmd+/
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen(!useNav.getState().searchOpen);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  // Group results by type
  const grouped = useMemo(() => {
    if (!data?.results) return [];
    const map = new Map<string, any[]>();
    data.results.forEach((r: any) => {
      if (!map.has(r.type)) map.set(r.type, []);
      map.get(r.type)!.push(r);
    });
    return Array.from(map.entries());
  }, [data]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-foreground/40 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, customers, suppliers, transactions…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="scroll-thin max-h-[50vh] overflow-y-auto p-2">
              {query.trim().length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Type to search across all modules…
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Searching…
                </div>
              ) : data?.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <SearchX className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-medium text-foreground">No results for "{query}"</p>
                  <p className="text-xs text-muted-foreground">Try a different search term.</p>
                </div>
              ) : (
                grouped.map(([type, items]) => {
                  const meta = TYPE_META[type] || TYPE_META.product;
                  const Icon = meta.icon;
                  return (
                    <div key={type} className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        {meta.label} ({items.length})
                      </p>
                      {items.map((r: any, idx) => {
                        const itemMeta = TYPE_META[r.type] || TYPE_META.product;
                        const ItemIcon = itemMeta.icon;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              setNav(itemMeta.module);
                              setOpen(false);
                            }}
                            className={cn(
                              "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-muted"
                            )}
                          >
                            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", itemMeta.tone)}>
                              <ItemIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">{r.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
              <span>{data?.total || 0} results</span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">⌘/</kbd>
                Global Search
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
