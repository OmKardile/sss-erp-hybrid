"use client";

import { useState } from "react";
import { Calendar, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  className?: string;
}

const PRESETS = [
  { label: "Today", get: () => { const d = new Date(); return { from: d.toISOString().split("T")[0], to: d.toISOString().split("T")[0] }; } },
  { label: "Last 7 days", get: () => { const d = new Date(); d.setDate(d.getDate() - 7); return { from: d.toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] }; } },
  { label: "Last 30 days", get: () => { const d = new Date(); d.setDate(d.getDate() - 30); return { from: d.toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] }; } },
  { label: "This month", get: () => { const d = new Date(); return { from: `${d.toISOString().substring(0, 7)}-01`, to: d.toISOString().split("T")[0] }; } },
];

export function DateRangeSelector({ from, to, onChange, className }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);

  const apply = () => {
    onChange(tempFrom, tempTo);
    setOpen(false);
  };

  const clear = () => {
    setTempFrom("");
    setTempTo("");
    onChange("", "");
    setOpen(false);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const { from: f, to: t } = preset.get();
    setTempFrom(f);
    setTempTo(t);
    onChange(f, t);
    setOpen(false);
  };

  const active = !!(from || to);
  const label = active ? `${from || "Start"} → ${to || "Now"}` : "All time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
          {active && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="ml-1 rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3 p-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Date Range</p>
            {active && (
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="space-y-2 border-t border-border pt-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">From</Label>
              <Input type="date" value={tempFrom} onChange={(e) => setTempFrom(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">To</Label>
              <Input type="date" value={tempTo} onChange={(e) => setTempTo(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <Button onClick={apply} size="sm" className="w-full gap-2">
            <Check className="h-3.5 w-3.5" /> Apply Range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
