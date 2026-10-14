"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Package,
  BookOpen,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Boxes,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, monthLabel } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/nav";
import { EmptyState } from "@/components/shared/empty-state";
import { DateRangeSelector } from "@/components/shared/date-range-selector";
import { RecentActivity } from "./recent-activity";
import { TodaySalesWidget } from "./today-sales-widget";
import { ExpiryWidget } from "./expiry-widget";
import { SalesTargetWidget } from "./sales-target-widget";
import { SmartAlertsWidget } from "./smart-alerts-widget";

const PIE_COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#84cc16"];

export function DashboardView() {
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const useRange = !!(rangeFrom || rangeTo);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", rangeFrom, rangeTo],
    queryFn: () => api.dashboard(rangeFrom || undefined, rangeTo || undefined),
  });
  const setNav = useNav((s) => s.set);

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { summary, charts } = data;
  const todayNet = summary.todayIncome - summary.todayExpenses;
  const profitTone = summary.monthlyProfit >= 0 ? "emerald" : "rose";
  const range = summary.range;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-600/10 sm:p-8"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Badge className="border-white/20 bg-white/10 text-emerald-50 backdrop-blur">
              <Activity className="mr-1 h-3 w-3" /> Live overview
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Namaste! Here&apos;s your shop today.
            </h2>
            <p className="mt-1.5 text-sm text-emerald-50/90">
              {formatDate(new Date(), { withTime: true })} · {summary.totalProducts} products in catalogue ·{" "}
              {summary.inventoryCount} units in stock
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                  Today&apos;s net
                </p>
                <p className="text-xl font-bold">{formatCurrency(todayNet)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                  Monthly profit
                </p>
                <p className="text-xl font-bold">{formatCurrency(summary.monthlyProfit)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                  Inventory value
                </p>
                <p className="text-xl font-bold">{formatCurrency(summary.inventoryValue, { compact: true })}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <Button
              onClick={() => setNav("products")}
              variant="secondary"
              className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Package className="h-4 w-4" /> Manage inventory
            </Button>
            <Button
              onClick={() => setNav("udhar")}
              variant="ghost"
              className="gap-2 border border-white/20 text-white hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" /> {summary.pendingUdharCount} pending udhar
            </Button>
          </div>
        </div>

        {/* Date-range selector (top-right of hero) */}
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-xl bg-white/10 p-1 backdrop-blur">
            <DateRangeSelector
              from={rangeFrom}
              to={rangeTo}
              onChange={(f, t) => {
                setRangeFrom(f);
                setRangeTo(t);
              }}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            />
          </div>
          {useRange && range && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-50">
                {range.from || "Start"} → {range.to || "Now"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-emerald-50">Income</span>
                <span className="text-right font-semibold">{formatCurrency(range.income, { compact: true })}</span>
                <span className="text-emerald-50">Expenses</span>
                <span className="text-right font-semibold">{formatCurrency(range.expenses, { compact: true })}</span>
                <span className="text-emerald-50">Purchases</span>
                <span className="text-right font-semibold">{formatCurrency(range.purchases, { compact: true })}</span>
                <span className="text-emerald-50">Profit</span>
                <span className={`text-right font-bold ${range.profit >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
                  {formatCurrency(range.profit, { compact: true })}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-emerald-50">{range.txnCount} transactions in range</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* KPI grid + Today's Sales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          title="Today's Income"
          value={formatCurrency(summary.todayIncome)}
          icon={IndianRupee}
          tone="emerald"
          subtitle="From all income sources"
        />
        <StatCard
          index={1}
          title="Today's Expenses"
          value={formatCurrency(summary.todayExpenses)}
          icon={TrendingDown}
          tone="rose"
          subtitle="Spent today"
        />
        <StatCard
          index={2}
          title="Monthly Profit"
          value={formatCurrency(summary.monthlyProfit)}
          icon={summary.monthlyProfit >= 0 ? TrendingUp : TrendingDown}
          tone={profitTone}
          subtitle="Income − Expenses − Purchases"
        />
        <StatCard
          index={3}
          title="Monthly Purchases"
          value={formatCurrency(summary.monthlyPurchases)}
          icon={ShoppingCart}
          tone="amber"
          subtitle="This month's stock buys"
        />
        <StatCard
          index={4}
          title="Inventory Value"
          value={formatCurrency(summary.inventoryValue, { compact: true })}
          icon={Boxes}
          tone="teal"
          subtitle={`${summary.inventoryCount} units · ${summary.totalProducts} SKUs`}
        />
        <StatCard
          index={5}
          title="Low Stock Alerts"
          value={`${summary.lowStockCount}`}
          icon={AlertTriangle}
          tone="amber"
          subtitle="Products at or below minimum"
        />
        <StatCard
          index={6}
          title="Pending Udhar"
          value={formatCurrency(summary.pendingUdhar, { compact: true })}
          icon={BookOpen}
          tone="violet"
          subtitle={`${summary.pendingUdharCount} unsettled entries`}
        />
        <StatCard
          index={7}
          title="Net Cash Flow"
          value={formatCurrency(charts.cashFlow.net, { compact: true })}
          icon={Wallet}
          tone={charts.cashFlow.net >= 0 ? "emerald" : "rose"}
          subtitle={`Inflow ${formatCurrency(charts.cashFlow.inflow, { compact: true })} · Outflow ${formatCurrency(charts.cashFlow.outflow, { compact: true })}`}
        />
      </div>

      {/* Smart Alerts (prominent, after KPIs) */}
      <SmartAlertsWidget />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Monthly Business Trends"
          description="Income, expenses & purchases (6 months)"
          className="lg:col-span-2"
          contentClassName="p-2 sm:p-4"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyComparison} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={monthLabel}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.02 180)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.02 180)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(Number(v), { compact: true })}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.9 0.01 120)",
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(l) => monthLabel(String(l))}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Expense Distribution"
          description="By category, all-time"
          contentClassName="p-2 sm:p-4"
        >
          <div className="h-72 w-full">
            {charts.expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.expenseDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No expense data yet
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {charts.expenseDistribution.slice(0, 5).map((e: any, i: number) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground">{e.name}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Income — Last 30 Days"
          description="Daily revenue trend"
          className="lg:col-span-2"
          contentClassName="p-2 sm:p-4"
        >
          <div className="h-64 w-full">
            {charts.last30DaysIncome.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.last30DaysIncome} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.substring(8)}
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
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#incomeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No income recorded in the last 30 days
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Top Inventory by Value"
          description="Highest stock-value products"
          contentClassName="p-2 sm:p-4"
        >
          <div className="h-64 w-full">
            {charts.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={charts.topProducts}
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "oklch(0.5 0.02 180)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrency(Number(v), { compact: true })}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "oklch(0.4 0.02 180)" }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                  <Bar dataKey="value" name="Value" fill="#14b8a6" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No products yet
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Quick stats strip + Today's Sales + Recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-4">
          <MiniStat
            label="Cash Inflow"
            value={formatCurrency(charts.cashFlow.inflow, { compact: true })}
            tone="emerald"
            icon={ArrowUpRight}
          />
          <MiniStat
            label="Cash Outflow"
            value={formatCurrency(charts.cashFlow.outflow, { compact: true })}
            tone="rose"
            icon={ArrowDownRight}
          />
          <MiniStat
            label="Avg. Daily Income (30d)"
            value={formatCurrency(
              charts.last30DaysIncome.reduce((s: number, d: any) => s + d.total, 0) /
                Math.max(1, charts.last30DaysIncome.length),
              { compact: true }
            )}
            tone="teal"
            icon={IndianRupee}
          />
          <MiniStat
            label="Inventory Units"
            value={`${summary.inventoryCount}`}
            tone="amber"
            icon={Boxes}
          />
        </div>
        <TodaySalesWidget />
        <RecentActivity />
      </div>

      {/* Expiry tracker + Sales target */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesTargetWidget />
        <ExpiryWidget />
      </div>

      {summary.totalProducts === 0 && (
        <EmptyState
          icon={Package}
          title="Your shop is empty"
          description="Load demo data to explore the ERP, or start adding products to see your dashboard come alive."
        />
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "teal" | "amber";
  icon: any;
}) {
  const toneClass = {
    emerald: "text-emerald-600 bg-emerald-500/10",
    rose: "text-rose-600 bg-rose-500/10",
    teal: "text-teal-600 bg-teal-500/10",
    amber: "text-amber-600 bg-amber-500/10",
  }[tone];
  return (
    <Card className="card-hover">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-lg font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-muted lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
