"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DatePreset = "ALL" | "TODAY" | "7D" | "30D" | "MONTH" | "YEAR";

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "ALL", label: "All time" },
  { key: "TODAY", label: "Today" },
  { key: "7D", label: "Last 7 days" },
  { key: "30D", label: "Last 30 days" },
  { key: "MONTH", label: "This month" },
  { key: "YEAR", label: "This year" },
];

/** Returns start-of-period ISO date prefix matcher. Returns "" for ALL. */
export function datePresetRange(preset: DatePreset): { start: string; end: string } {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  if (preset === "TODAY") return { start: todayStr, end: todayStr };
  if (preset === "7D") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return { start: d.toISOString().split("T")[0], end: todayStr };
  }
  if (preset === "30D") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return { start: d.toISOString().split("T")[0], end: todayStr };
  }
  if (preset === "MONTH") {
    const m = now.toISOString().substring(0, 7);
    return { start: `${m}-01`, end: todayStr };
  }
  if (preset === "YEAR") {
    const y = now.getFullYear();
    return { start: `${y}-01-01`, end: todayStr };
  }
  return { start: "", end: "" };
}

/** Checks if an ISO date string (string or Date) falls in the preset range. */
export function inPreset(date: string | Date | null | undefined, preset: DatePreset): boolean {
  if (preset === "ALL") return true;
  if (!date) return false;
  const iso = typeof date === "string" ? date : date.toISOString();
  const { start, end } = datePresetRange(preset);
  const d = iso.split("T")[0];
  return d >= start && d <= end;
}

interface DateRangeFilterProps {
  value: DatePreset;
  onChange: (p: DatePreset) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const current = DATE_PRESETS.find((p) => p.key === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{current?.label ?? "All time"}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Date Range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DATE_PRESETS.map((p) => (
          <DropdownMenuItem
            key={p.key}
            onClick={() => onChange(p.key)}
            className={cn(
              "cursor-pointer justify-between text-sm",
              value === p.key && "bg-primary/10 font-semibold text-primary"
            )}
          >
            {p.label}
            {value === p.key && <span className="text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
