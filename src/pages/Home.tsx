import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingBag,
} from 'lucide-react';
import { storage } from '../services/storage';

const modules = [
  {
    title: 'Business Dashboard',
    description: 'See daily performance, inventory value, and spending signals.',
    path: '/dashboard',
    icon: LayoutDashboard,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Products & Inventory',
    description: 'Add items, track stock levels, and spot low-quantity products.',
    path: '/products',
    icon: Package,
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    title: 'Purchase Register',
    description: 'Track supplier bills and purchase history in one place.',
    path: '/purchases',
    icon: ShoppingBag,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Income Book',
    description: 'Record day-wise incoming cash flow from counter sales.',
    path: '/income',
    icon: CircleDollarSign,
    accent: 'from-green-500 to-lime-500',
  },
  {
    title: 'Expense Book',
    description: 'Monitor recurring costs and one-off operating expenses.',
    path: '/expenses',
    icon: CreditCard,
    accent: 'from-rose-500 to-red-500',
  },
  {
    title: 'Udhar Ledger',
    description: 'Manage customer credit, due dates, and payment recovery.',
    path: '/udhar',
    icon: BookOpenCheck,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Yearly Overview',
    description: 'Analyze long-term trends for income, expenses, and profit.',
    path: '/overview',
    icon: BarChart3,
    accent: 'from-indigo-500 to-blue-500',
  },
];

const formatINR = (value: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0)}`;

export default function Home() {
  const summary = storage.getDashboardSummary();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="absolute -top-14 -right-10 h-44 w-44 rounded-full bg-white/10 blur-md" />
        <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-amber-300/20 blur-xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <ReceiptText className="h-4 w-4" />
            Retail ERP Hub
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Shubham Super Shopee</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50 sm:text-base">
            Welcome to your operations command center. Jump to any module from one screen and keep the shop running
            smoothly.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Today Income" value={formatINR(summary.todayIncome)} tone="text-green-700 bg-green-50 border-green-100" />
        <Metric label="Today Expenses" value={formatINR(summary.todayExpenses)} tone="text-rose-700 bg-rose-50 border-rose-100" />
        <Metric label="Monthly Profit" value={formatINR(summary.monthlyProfit)} tone="text-blue-700 bg-blue-50 border-blue-100" />
        <Metric label="Pending Udhar" value={formatINR(summary.pendingUdhar)} tone="text-amber-700 bg-amber-50 border-amber-100" />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-800">Main Navigation</h2>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">All options in one place</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.path}
                to={module.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 text-white ${module.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{module.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                  Open module
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
