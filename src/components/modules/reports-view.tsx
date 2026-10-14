"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Boxes,
  BookOpenCheck,
  Users,
  Truck,
  Package,
  Calendar,
  FileSpreadsheet,
  FileJson,
  Printer,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function ReportsView() {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: () => api.reports() });

  const download = (format: "json" | "csv") => {
    if (!data) return;
    let blob: Blob;
    let filename: string;
    const stamp = new Date().toISOString().split("T")[0];
    if (format === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      filename = `sss-erp-report-${stamp}.json`;
    } else {
      const rows: string[][] = [];
      rows.push(["Section", "Field", "Value"]);
      Object.entries(data.summary).forEach(([k, v]) => rows.push(["Summary", k, String(v)]));
      data.products.forEach((p: any) => rows.push(["Product", p.name, `${p.quantity} ${p.unitType} @ ${p.sellingPrice}`]));
      data.income.forEach((i: any) => rows.push(["Income", i.source, String(i.amount)]));
      data.expenses.forEach((e: any) => rows.push(["Expense", e.category, String(e.amount)]));
      data.purchases.forEach((p: any) => rows.push(["Purchase", p.productName, String(p.totalAmount)]));
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      blob = new Blob([csv], { type: "text/csv" });
      filename = `sss-erp-report-${stamp}.csv`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${format.toUpperCase()} report downloaded`, { description: filename });
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download a complete business snapshot."
        icon={FileText}
        actions={
          <div className="flex gap-2 no-print">
            <Button onClick={() => window.print()} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button onClick={() => download("json")} variant="outline" className="gap-2">
              <FileJson className="h-4 w-4" /> JSON
            </Button>
            <Button onClick={() => download("csv")} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>
          </div>
        }
      />

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-6"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryItem icon={IndianRupee} label="Total Income" value={formatCurrency(s.totalIncome, { compact: true })} tone="emerald" />
          <SummaryItem icon={TrendingDown} label="Total Expenses" value={formatCurrency(s.totalExpenses, { compact: true })} tone="rose" />
          <SummaryItem icon={Package} label="Total Purchases" value={formatCurrency(s.totalPurchases, { compact: true })} tone="amber" />
          <SummaryItem icon={s.netProfit >= 0 ? TrendingUp : TrendingDown} label="Net Profit" value={formatCurrency(s.netProfit, { compact: true })} tone={s.netProfit >= 0 ? "emerald" : "rose"} />
          <SummaryItem icon={Boxes} label="Inventory Value" value={formatCurrency(s.inventoryValue, { compact: true })} tone="teal" />
          <SummaryItem icon={BookOpenCheck} label="Outstanding Udhar" value={formatCurrency(s.outstandingUdhar, { compact: true })} tone="violet" />
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" /> Generated {formatDate(data.generatedAt, { withTime: true })}</Badge>
          <span>·</span>
          <span>{s.productCount} products</span>
          <span>·</span>
          <span>{s.customerCount} customers</span>
          <span>·</span>
          <span>{s.supplierCount} suppliers</span>
        </div>
      </motion.div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Products" value={`${s.productCount}`} icon={Package} tone="emerald" />
        <StatCard index={1} title="Customers" value={`${s.customerCount}`} icon={Users} tone="violet" />
        <StatCard index={2} title="Suppliers" value={`${s.supplierCount}`} icon={Truck} tone="amber" />
        <StatCard index={3} title="Low Stock Items" value={`${data.lowStock.length}`} icon={Boxes} tone={data.lowStock.length > 0 ? "rose" : "emerald"} />
      </div>

      {/* Low stock alert list */}
      <SectionCard
        title="Low Stock Alert"
        description={`${data.lowStock.length} products at or below minimum`}
        action={<Button variant="ghost" size="sm" onClick={() => download("csv")} className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>}
      >
        {data.lowStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">All stock levels healthy</p>
            <p className="text-xs text-muted-foreground">No products need restocking right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.lowStock.map((p: any) => (
              <Card key={p.id} className="border-rose-500/20 bg-rose-500/5">
                <CardContent className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand || "No brand"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-600">{p.quantity} {p.unitType}</p>
                    <p className="text-xs text-muted-foreground">min {p.minStockAlert}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Section breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent Income" description="Latest 5 entries" contentClassName="p-0">
          <div className="divide-y divide-border/60">
            {data.income.slice(0, 5).map((i: any) => (
              <div key={i.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{i.source}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(i.date)} · {i.category}</p>
                </div>
                <span className="font-semibold text-emerald-600">+{formatCurrency(i.amount)}</span>
              </div>
            ))}
            {data.income.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No income</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Expenses" description="Latest 5 entries" contentClassName="p-0">
          <div className="divide-y divide-border/60">
            {data.expenses.slice(0, 5).map((e: any) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{e.category}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                </div>
                <span className="font-semibold text-rose-600">−{formatCurrency(e.amount)}</span>
              </div>
            ))}
            {data.expenses.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No expenses</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Purchases" description="Latest 5 entries" contentClassName="p-0">
          <div className="divide-y divide-border/60">
            {data.purchases.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">{p.supplierName} · {formatDate(p.purchaseDate)}</p>
                </div>
                <span className="font-semibold text-amber-600">{formatCurrency(p.totalAmount)}</span>
              </div>
            ))}
            {data.purchases.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No purchases</p>}
          </div>
        </SectionCard>

        <SectionCard title="Outstanding Udhar" description="Unsettled credit entries" contentClassName="p-0">
          <div className="divide-y divide-border/60">
            {data.udhars.filter((u: any) => u.status !== "PAID").slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{u.customerName}</p>
                  <p className="text-xs text-muted-foreground">{u.description} · {formatDate(u.date)}</p>
                </div>
                <span className="font-semibold text-violet-600">{formatCurrency(u.remainingAmount)}</span>
              </div>
            ))}
            {data.udhars.filter((u: any) => u.status !== "PAID").length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No outstanding udhar</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Download CTA */}
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Download full report</p>
              <p className="text-sm text-muted-foreground">Complete snapshot including all products, transactions &amp; ledgers.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => download("json")} variant="outline" className="gap-2">
              <FileJson className="h-4 w-4" /> JSON
            </Button>
            <Button onClick={() => download("csv")} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone: "emerald" | "rose" | "amber" | "teal" | "violet";
}) {
  const toneClass = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    rose: "bg-rose-500/10 text-rose-600",
    amber: "bg-amber-500/10 text-amber-600",
    teal: "bg-teal-500/10 text-teal-600",
    violet: "bg-violet-500/10 text-violet-600",
  }[tone];
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-base font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
