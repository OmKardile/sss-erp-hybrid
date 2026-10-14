"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBag,
  CircleDollarSign,
  CreditCard,
  BookOpenCheck,
  Users,
  Truck,
  BarChart3,
  FileText,
  Settings,
  Sun,
  Moon,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNav, type ModuleKey } from "@/lib/nav";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  group: string;
  run: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const open = useNav((s) => s.paletteOpen);
  const setOpen = useNav((s) => s.setPaletteOpen);
  const togglePalette = useNav((s) => s.togglePalette);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const setNav = useNav((s) => s.set);
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette, setOpen]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const commands = useMemo<Command[]>(() => {
    const navCmds: Command[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.key}`,
      label: item.label,
      hint: item.short,
      icon: item.icon,
      group: "Navigate",
      keywords: `${item.label} ${item.short} ${item.group} ${item.description}`.toLowerCase(),
      run: () => {
        setNav(item.key as ModuleKey);
        setOpen(false);
      },
    }));

    const actionCmds: Command[] = [
      {
        id: "theme-toggle",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: theme === "dark" ? Sun : Moon,
        group: "Actions",
        run: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
      {
        id: "refresh",
        label: "Refresh All Data",
        icon: Search,
        group: "Actions",
        keywords: "reload invalidate query",
        run: () => {
          qc.invalidateQueries();
          toast.success("All data refreshed");
          setOpen(false);
        },
      },
      {
        id: "seed",
        label: "Load Demo Data",
        icon: ShoppingBag,
        group: "Actions",
        keywords: "seed demo sample data",
        run: () => {
          api.seed().then((d) => {
            if (d.seeded) {
              toast.success("Demo data loaded", { description: `${d.counts.products} products & more` });
              qc.invalidateQueries();
            } else {
              toast.info("Database already has data", { description: d.message });
            }
            setOpen(false);
          });
        },
      },
      {
        id: "backup",
        label: "Export Full Backup (JSON)",
        icon: FileText,
        group: "Actions",
        keywords: "export download backup json",
        run: async () => {
          const data = await api.backup.export();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `sss-erp-backup-${new Date().toISOString().split("T")[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Backup downloaded");
          setOpen(false);
        },
      },
      {
        id: "goto-pos-new-sale",
        label: "Start a New Sale (POS)",
        icon: ShoppingCart,
        group: "Quick Actions",
        keywords: "pos sale checkout cart sell",
        run: () => {
          setNav("pos");
          setOpen(false);
        },
      },
      {
        id: "goto-products-add",
        label: "Open Products & Add New",
        icon: Package,
        group: "Quick Actions",
        keywords: "product inventory add new",
        run: () => {
          setNav("products");
          setOpen(false);
        },
      },
    ];

    return [...navCmds, ...actionCmds];
  }, [setNav, theme, setTheme, qc]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      (c.label + " " + (c.keywords || "")).toLowerCase().includes(q)
    );
  }, [commands, query]);

  const onQueryChange = (val: string) => {
    setQuery(val);
    setActiveIdx(0);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const flatList = grouped.flatMap(([, items]) => items);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatList[activeIdx]?.run();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground/40 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="scroll-thin max-h-[360px] overflow-y-auto p-2">
              {flatList.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No commands found</div>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      {group}
                    </p>
                    {items.map((cmd) => {
                      const idx = flatList.indexOf(cmd);
                      const active = idx === activeIdx;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={cmd.run}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition",
                            active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{cmd.label}</span>
                          {cmd.hint && (
                            <span className="text-xs text-muted-foreground">{cmd.hint}</span>
                          )}
                          {active && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">↑</kbd>
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command className="h-3 w-3" /> Command Palette
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
