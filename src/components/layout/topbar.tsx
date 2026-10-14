"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/nav";
import { NAV_ITEMS } from "./nav-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const active = useNav((s) => s.active);
  const setMobile = useNav((s) => s.setMobileNav);
  const qc = useQueryClient();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const item = NAV_ITEMS.find((i) => i.key === active);

  const seedMutation = useMutation({
    mutationFn: () => api.seed(),
    onSuccess: (data) => {
      if (data.seeded) {
        toast.success("Demo data loaded", {
          description: `Added ${data.counts.products} products, ${data.counts.income} income entries & more.`,
        });
      } else {
        toast.info("Database already has data", { description: data.message });
      }
      qc.invalidateQueries();
    },
    onError: (e) => toast.error("Seed failed", { description: String(e) }),
  });

  const refresh = () => {
    qc.invalidateQueries();
    toast.success("Refreshed", { description: "All data reloaded from server." });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobile(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Shubham Super Shopee
            </p>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />
            <p className="hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
              {item?.group}
            </p>
          </div>
          <h2 className="truncate text-base font-bold tracking-tight text-foreground">
            {item?.label ?? "Dashboard"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="hidden gap-2 sm:flex"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">
              {seedMutation.isPending ? "Loading…" : "Load Demo"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
