"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function CurrencySelector() {
  const { data } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.currency(),
    staleTime: 300_000,
  });
  const currency = useNav((s) => s.currency);
  const setCurrency = useNav((s) => s.setCurrency);

  const currencies = data?.currencies || {};
  const current = currencies[currency] || { symbol: "₹", name: "Indian Rupee" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="font-semibold">{current.symbol}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">{currency}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Display Currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(currencies).map(([code, info]: [string, any]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setCurrency(code)}
            className={cn(
              "cursor-pointer justify-between text-sm",
              currency === code && "bg-primary/10 font-semibold text-primary"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 font-semibold">{info.symbol}</span>
              <div>
                <p className="font-medium">{code}</p>
                <p className="text-[10px] text-muted-foreground">{info.name}</p>
              </div>
            </div>
            {currency === code && <span className="text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground">
          Base: INR · Rates are static. Display only — all transactions stored in INR.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
