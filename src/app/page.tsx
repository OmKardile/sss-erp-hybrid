"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { CommandPalette } from "@/components/layout/command-palette";
import { useNav } from "@/lib/nav";
import { DashboardView } from "@/components/modules/dashboard-view";
import { PosView } from "@/components/modules/pos-view";
import { ProductsView } from "@/components/modules/products-view";
import { PurchasesView } from "@/components/modules/purchases-view";
import { IncomeView } from "@/components/modules/income-view";
import { ExpensesView } from "@/components/modules/expenses-view";
import { UdharView } from "@/components/modules/udhar-view";
import { CustomersView } from "@/components/modules/customers-view";
import { SuppliersView } from "@/components/modules/suppliers-view";
import { OverviewView } from "@/components/modules/overview-view";
import { ReportsView } from "@/components/modules/reports-view";
import { SettingsView } from "@/components/modules/settings-view";
import { SalesView } from "@/components/modules/sales-view";
import { AuditView } from "@/components/modules/audit-view";

const VIEWS = {
  dashboard: DashboardView,
  pos: PosView,
  products: ProductsView,
  sales: SalesView,
  purchases: PurchasesView,
  income: IncomeView,
  expenses: ExpensesView,
  udhar: UdharView,
  customers: CustomersView,
  suppliers: SuppliersView,
  overview: OverviewView,
  reports: ReportsView,
  audit: AuditView,
  settings: SettingsView,
} as const;

export default function Home() {
  const active = useNav((s) => s.active);
  const View = VIEWS[active] ?? DashboardView;

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <View />
        </motion.div>
      </AnimatePresence>
      <CommandPalette />
    </AppShell>
  );
}
