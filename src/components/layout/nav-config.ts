import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBag,
  CircleDollarSign,
  CreditCard,
  BookOpenCheck,
  Users,
  Truck,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import type { ModuleKey } from "@/lib/nav";

export interface NavItem {
  key: ModuleKey;
  label: string;
  short: string;
  icon: LucideIcon;
  group: "Operations" | "Finance" | "Directory" | "Insights" | "System";
  description: string;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    short: "Home",
    icon: LayoutDashboard,
    group: "Operations",
    description: "KPIs, charts & recent activity",
  },
  {
    key: "pos",
    label: "Point of Sale",
    short: "POS",
    icon: ShoppingCart,
    group: "Operations",
    description: "Quick sale, stock decrement & receipt",
    badge: "New",
  },
  {
    key: "products",
    label: "Products & Inventory",
    short: "Stock",
    icon: Package,
    group: "Operations",
    description: "Manage catalogue and stock levels",
  },
  {
    key: "purchases",
    label: "Purchases",
    short: "Buy",
    icon: ShoppingBag,
    group: "Operations",
    description: "Supplier-wise stock purchases",
  },
  {
    key: "income",
    label: "Income",
    short: "In",
    icon: CircleDollarSign,
    group: "Finance",
    description: "Daily sales & revenue entries",
  },
  {
    key: "expenses",
    label: "Expenses",
    short: "Out",
    icon: CreditCard,
    group: "Finance",
    description: "Categorized expense tracking",
  },
  {
    key: "udhar",
    label: "Udhar Ledger",
    short: "Credit",
    icon: BookOpenCheck,
    group: "Finance",
    description: "Customer credit & settlements",
  },
  {
    key: "customers",
    label: "Customers",
    short: "Buyers",
    icon: Users,
    group: "Directory",
    description: "Customer directory & contacts",
  },
  {
    key: "suppliers",
    label: "Suppliers",
    short: "Vendors",
    icon: Truck,
    group: "Directory",
    description: "Supplier directory & contacts",
  },
  {
    key: "overview",
    label: "Yearly Overview",
    short: "Trends",
    icon: BarChart3,
    group: "Insights",
    description: "Month & year-level business trends",
  },
  {
    key: "reports",
    label: "Reports",
    short: "Export",
    icon: FileText,
    group: "Insights",
    description: "Generate & download business reports",
  },
  {
    key: "settings",
    label: "Settings & Backup",
    short: "Config",
    icon: Settings,
    group: "System",
    description: "Backup, restore & data management",
  },
];

export const NAV_GROUPS: NavItem["group"][] = ["Operations", "Finance", "Directory", "Insights", "System"];
