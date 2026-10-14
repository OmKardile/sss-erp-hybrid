"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Receipt,
  Award,
  CreditCard,
  Smartphone,
  Banknote,
  Wallet,
  Clock,
  Users,
  Package,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { useNav } from "@/lib/nav";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PAYMENT_ICONS: Record<string, any> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
  Wallet: Wallet,
};
const PAYMENT_COLORS: Record<string, string> = {
  Cash: "#10b981",
  UPI: "#8b5cf6",
  Card: "#06b6d4",
  Wallet: "#f59e0b",
};

export function SalesView() {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-analytics"],
    queryFn: () => api.salesAnalytics(),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const { summary, topProducts, paymentBreakdown, dailyTrend, hourly, topCustomers, recentSales } = data;
  const hasSales = summary.allTimeCount > 0;

  if (!hasSales) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sales Analytics"
          description="Track your best-selling products, daily trends and payment mix."
          icon={TrendingUp}
        />
        <EmptyState
          icon={ShoppingBag}
          title="No sales recorded yet"
          description="Complete sales through the Point of Sale module to see analytics here — top products, daily trends, payment-method breakdown and more."
          action={
            <button
              onClick={() => useNav.getState().set("pos")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingBag className="h-4 w-4" /> Go to Point of Sale
            </button>
          }
        />
      </div>
    );
  }

  const maxDaily = Math.max(...dailyTrend.map((d: any) => d.total), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="Insights from your Point of Sale transactions — top products, trends & payment mix."
        icon={TrendingUp}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="Today's Sales" value={formatCurrency(summary.todayTotal)} icon={IndianRupee} tone="emerald" subtitle={`${summary.todayCount} sale(s)`} />
        <StatCard index={1} title="This Month" value={formatCurrency(summary.monthTotal, { compact: true })} icon={Receipt} tone="teal" subtitle={`${summary.monthCount} sale(s)`} />
        <StatCard index={2} title="All-Time Revenue" value={formatCurrency(summary.allTimeTotal, { compact: true })} icon={TrendingUp} tone="amber" subtitle={`${summary.allTimeCount} total sales`} />
        <StatCard index={3} title="Avg. Sale Value" value={formatCurrency(summary.avgSaleValue)} icon={Sparkles} tone="violet" subtitle="Per transaction" />
      </div>

      {/* Daily trend chart */}
      <SectionCard
        title="Daily Sales Trend"
        description="Revenue over the last 14 days"
        contentClassName="p-2 sm:p-4"
      >
        <div className="h-72 w-full">
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.substring(5)}
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.02 180)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.02 180)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(Number(v), { compact: true })}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }}
                  formatter={(v: any) => formatCurrency(Number(v))}
                  labelFormatter={(l) => formatDate(String(l))}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Sales"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No trend data</div>
          )}
        </div>
      </SectionCard>

      {/* Top products + Payment breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top products */}
        <SectionCard
          title="Top-Selling Products"
          description="By total revenue"
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p: any, i: number) => {
                const max = topProducts[0].revenue || 1;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${i < 3 ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-xs text-muted-foreground">· {p.quantity} units · {p.count} sales</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(p.revenue, { compact: true })}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.revenue / max) * 100}%` }}
                        transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No product data</p>
            )}
          </div>
        </SectionCard>

        {/* Payment breakdown */}
        <SectionCard title="Payment Methods" description="Revenue by payment type">
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44">
              {paymentBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {paymentBreakdown.map((p: any, i: number) => (
                        <Cell key={i} fill={PAYMENT_COLORS[p.method] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }}
                      formatter={(v: any) => formatCurrency(Number(v))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</div>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(summary.allTimeTotal, { compact: true })}</span>
              </div>
            </div>
            <div className="mt-3 w-full space-y-2">
              {paymentBreakdown.map((p: any) => {
                const Icon = PAYMENT_ICONS[p.method] || Wallet;
                const pct = summary.allTimeTotal > 0 ? (p.total / summary.allTimeTotal) * 100 : 0;
                return (
                  <div key={p.method} className="flex items-center gap-2 text-sm">
                    <Icon className="h-3.5 w-3.5" style={{ color: PAYMENT_COLORS[p.method] || "#64748b" }} />
                    <span className="flex-1 text-foreground">{p.method}</span>
                    <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                    <span className="font-semibold text-foreground">{formatCurrency(p.total, { compact: true })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Hourly distribution + Top customers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Sales by Hour (Today)"
          description="When customers buy — 8am to 9pm"
          contentClassName="p-2 sm:p-4"
        >
          <div className="h-60 w-full">
            {hourly.some((h: any) => h.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 180)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0.02 180)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(Number(v), { compact: true })} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                  <Bar dataKey="total" name="Sales" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {hourly.map((h: any, i: number) => (
                      <Cell key={i} fill={h.total > 0 ? "#14b8a6" : "#e2e8f0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" /> No sales yet today
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Customers" description="By total purchase value" icon={Users}>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((c: any, i: number) => {
                const max = topCustomers[0].total || 1;
                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.count} purchase(s)</p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(c.total, { compact: true })}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.total / max) * 100}%` }}
                        transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No named customers yet</p>
                <p className="text-xs text-muted-foreground">Add customer names in POS sales to see them here.</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Recent sales */}
      <SectionCard
        title="Recent Sales"
        description={`Latest ${recentSales.length} transactions`}
        action={<Badge variant="secondary" className="gap-1"><Receipt className="h-3 w-3" /> {summary.allTimeCount} total</Badge>}
        contentClassName="p-0"
      >
        <div className="scroll-thin max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Payment</th>
                <th className="px-5 py-3 text-right">Items</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s: any) => {
                const Icon = PAYMENT_ICONS[s.paymentMethod] || Wallet;
                return (
                  <tr key={s.id} className="border-t border-border/60 transition hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{s.customerName || "Walk-in"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" style={{ color: PAYMENT_COLORS[s.paymentMethod] || "#64748b" }} />
                        {s.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{s.itemCount}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{formatRelative(s.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
