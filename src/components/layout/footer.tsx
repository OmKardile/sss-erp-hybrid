"use client";

import { Heart, Store, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background/60">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-4 py-4 text-sm sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-foreground">Shubham Super Shopee ERP</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="text-xs">Retail Operations Suite</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            Crafted with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for single-shop retailers
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Github className="h-3.5 w-3.5" />
            v2.0 Redesign
          </span>
        </div>
      </div>
    </footer>
  );
}
