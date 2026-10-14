"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { useNav } from "@/lib/nav";
import { DashboardView } from "@/components/modules/dashboard-view";
import { ProductsView } from "@/components/modules/products-view";
import { PurchasesView } from "@/components/modules/purchases-view";
import { IncomeView } from "@/components/modules/income-view";
import { ExpensesView } from "@/components/modules/expenses-view";
import { UdharView } from "@/components/modules/udhar-view";
import { CustomersView } from "@/components/modules/customers-view";
import { SuppliersView } from "@/components/modules/suppliers-view";
import { OverviewView } from "@/components/modules/overview-view";
import { ReportsView } from "@/components/modules/reports-view";

const VIEWS = {
  dashboard: DashboardView,
  products: ProductsView,
  purchases: PurchasesView,
  income: IncomeView,
  expenses: ExpensesView,
  udhar: UdharView,
  customers: CustomersView,
  suppliers: SuppliersView,
  overview: OverviewView,
  reports: ReportsView,
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
    </AppShell>
  );
}
