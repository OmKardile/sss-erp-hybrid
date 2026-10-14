"use client";

import { motion } from "framer-motion";
import { Store, Sparkles, X } from "lucide-react";
import { useNav } from "@/lib/nav";
import { NAV_GROUPS, NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const active = useNav((s) => s.active);
  const set = useNav((s) => s.set);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-4 text-white shadow-lg shadow-emerald-600/20">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              Retail ERP
            </p>
            <h1 className="truncate text-base font-bold leading-tight">Shubham Super Shopee</h1>
          </div>
        </div>
        <div className="relative mt-3 flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-emerald-50 backdrop-blur">
          <Sparkles className="h-3 w-3 text-amber-200" />
          Offline-first · Single-shop
        </div>
      </div>

      {/* Nav groups */}
      <nav className="scroll-thin mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          return (
            <div key={group}>
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group}
              </p>
              <div className="mt-1.5 space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        set(item.key);
                        onNavigate?.();
                      }}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3">
        <p className="text-[11px] font-semibold text-foreground">v2.0 · Redesigned</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Built on Next.js 16 + Prisma. Press the seed button to load demo data.
        </p>
      </div>
    </div>
  );
}

export function MobileNavSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-border bg-background p-4 shadow-2xl"
      >
        <div className="mb-3 flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar onNavigate={onClose} />
      </motion.div>
    </div>
  );
}
