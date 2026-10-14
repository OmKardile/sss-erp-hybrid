"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Boxes,
  Users,
  Truck,
  BookOpenCheck,
  Calendar,
  Award,
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
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency, monthLabel } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

export function OverviewView() {
  const { data, isLoading } = useQuery({ queryKey: ["overview"], queryFn: () => api.overview() });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const { monthly, yearly, incomeCategories, expenseCategories, udharSummary, topSuppliers, topCustomers, totalInventoryValue, productCount } = data;
  const allTimeProfit = yearly.reduce((s: number, y: any) => s + y.profit, 0);
  const allTimeIncome = yearly.reduce((s: number, y: any) => s + y.income, 0);
  const bestMonth = monthly.length ? [...monthly].sort((a: any, b: any) => b.profit - a.profit)[0] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yearly Overview"
        description="Business trends, category breakdowns and top performers."
        icon={BarChart3}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} title="All-time Income" value={formatCurrency(allTimeIncome, { compact: true })} icon={IndianRupee} tone="emerald" />
        <StatCard index={1} title="Net Profit" value={formatCurrency(allTimeProfit, { compact: true })} icon={allTimeProfit >= 0 ? TrendingUp : TrendingDown} tone={allTimeProfit >= 0 ? "emerald" : "rose"} />
        <StatCard index={2} title="Inventory Value" value={formatCurrency(totalInventoryValue, { compact: true })} icon={Boxes} tone="amber" subtitle={`${productCount} products`} />
        <StatCard index={3} title="Udhar Outstanding" value={formatCurrency(udharSummary.outstanding, { compact: true })} icon={BookOpenCheck} tone="violet" subtitle={`${formatCurrency(udharSummary.settled, { compact: true })} collected`} />
      </div>

      {/* Monthly trend */}
      <SectionCard
        title="Monthly Profit Trend"
        description="Income vs expenses vs purchases over time"
        contentClassName="p-2 sm:p-4"
      >
        <div className="h-80 w-full">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.map((m: any) => ({ ...m, label: monthLabel(m.month) }))} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.5 0.02 180)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.02 180)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(Number(v), { compact: true })} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }} formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet</div>
          )}
        </div>
      </SectionCard>

      {/* Yearly summary + best month */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Yearly Roll-up" description="Annual totals" className="lg:col-span-2" contentClassName="p-0">
          <div className="scroll-thin max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Year</th>
                  <th className="px-5 py-3 text-right">Income</th>
                  <th className="px-5 py-3 text-right">Expenses</th>
                  <th className="px-5 py-3 text-right">Purchases</th>
                  <th className="px-5 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((y: any) => (
                  <tr key={y.year} className="border-t border-border/60">
                    <td className="px-5 py-3 font-semibold text-foreground">{y.year}</td>
                    <td className="px-5 py-3 text-right text-emerald-600">{formatCurrency(y.income, { compact: true })}</td>
                    <td className="px-5 py-3 text-right text-rose-600">{formatCurrency(y.expenses, { compact: true })}</td>
                    <td className="px-5 py-3 text-right text-amber-600">{formatCurrency(y.purchases, { compact: true })}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${y.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrency(y.profit, { compact: true })}
                    </td>
                  </tr>
                ))}
                {yearly.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Best Month" description="Highest profit month">
          {bestMonth ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Award className="h-8 w-8" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{monthLabel(bestMonth.month)}</p>
              <p className="text-sm text-muted-foreground">Top profit month</p>
              <Badge className="mt-3 gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                <TrendingUp className="h-3 w-3" /> {formatCurrency(bestMonth.profit, { compact: true })}
              </Badge>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
          )}
        </SectionCard>
      </div>

      {/* Category breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Income by Category" description="All-time sources" contentClassName="p-2 sm:p-4">
          <div className="h-72 w-full">
            {incomeCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeCategories} cx="50%" cy="50%" outerRadius={88} dataKey="value" paddingAngle={2} stroke="none">
                    {incomeCategories.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }} formatter={(v: any) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No income data</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Expenses by Category" description="All-time spend" contentClassName="p-2 sm:p-4">
          <div className="h-72 w-full">
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 120)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.5 0.02 180)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(Number(v), { compact: true })} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.4 0.02 180)" }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 120)", fontSize: 12 }} formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" name="Expense" fill="#f43f5e" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No expense data</div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Top Suppliers" description="By total purchase value">
          <div className="space-y-3">
            {topSuppliers.length > 0 ? (
              topSuppliers.map((s: any, i: number) => {
                const max = topSuppliers[0].total || 1;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-xs font-bold text-amber-600">{i + 1}</span>
                        <span className="font-medium text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground">· {s.count} orders</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(s.total, { compact: true })}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.total / max) * 100}%` }}
                        transition={{ delay: i * 0.06 + 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No supplier data</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Customers" description="By total credit given">
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((c: any, i: number) => {
                const max = topCustomers[0].total || 1;
                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-xs font-bold text-violet-600">{i + 1}</span>
                        <span className="font-medium text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">· {c.count} entries</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(c.total, { compact: true })}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.total / max) * 100}%` }}
                        transition={{ delay: i * 0.06 + 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No customer data</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Udhar summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Credit</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(udharSummary.total, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Collected</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(udharSummary.settled, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Outstanding</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(udharSummary.outstanding, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
