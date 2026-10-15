"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, RefreshCw, Command as CommandIcon, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/nav";
import { NAV_ITEMS } from "./nav-config";
import { CurrencySelector } from "./currency-selector";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const active = useNav((s) => s.active);
  const setMobile = useNav((s) => s.setMobileNav);
  const setNav = useNav((s) => s.set);
  const togglePalette = useNav((s) => s.togglePalette);
  const setSearchOpen = useNav((s) => s.setSearchOpen);
  const qc = useQueryClient();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const item = NAV_ITEMS.find((i) => i.key === active);

  const refresh = () => {
    qc.invalidateQueries();
    toast.success("Refreshed", { description: "All data reloaded from server." });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 safe-area-px sm:h-16 sm:gap-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobile(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setNav("dashboard")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm transition hover:scale-105 lg:hidden"
          aria-label="Home"
        >
          <span className="text-sm font-bold">S</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:block">
            Shubham Super Shopee · {item?.group}
          </p>
          <h2 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            {item?.label ?? "Dashboard"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Global search trigger */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Global search"
            className="relative"
          >
            <Search className="h-4 w-4" />
          </Button>
          {/* Command palette trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePalette}
            className="hidden gap-2 md:flex"
            aria-label="Open command palette"
          >
            <CommandIcon className="h-3.5 w-3.5" />
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <CurrencySelector />

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
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            aria-label="Logout"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
