"use client";

import { Heart, Store } from "lucide-react";

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
            Crafted with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for Bro · Designed &amp; developed by{" "}
            <a
              href="https://omkardile.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/80 underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              Omkar Kardile
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
