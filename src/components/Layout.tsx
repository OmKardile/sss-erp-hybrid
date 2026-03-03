import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  CircleDollarSign,
  CreditCard,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Main Hub', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Income', path: '/income', icon: CircleDollarSign },
  { name: 'Expenses', path: '/expenses', icon: CreditCard },
  { name: 'Udhar', path: '/udhar', icon: BookOpenCheck },
  { name: 'Overview', path: '/overview', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Shubham Super Shopee</p>
            <p className="text-sm font-semibold text-slate-600">Retail ERP</p>
          </div>
          <button
            onClick={() => setIsMenuOpen((value) => !value)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 w-full bg-slate-950/40"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <nav className="absolute right-0 top-0 h-full w-72 border-l border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Store Navigation</p>
              <p className="mt-1 text-lg font-bold">Shubham Super Shopee</p>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1500px] gap-5 px-3 pb-6 pt-3 sm:px-6 sm:pt-6">
        <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 p-4 text-white">
              <Store className="h-6 w-6" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-emerald-100">Retail ERP</p>
              <h1 className="mt-1 text-xl font-black">Shubham Super Shopee</h1>
            </div>
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="hidden items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm sm:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Store Control Panel</p>
              <p className="text-lg font-bold text-slate-800">Shubham Super Shopee</p>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Offline Ready
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
