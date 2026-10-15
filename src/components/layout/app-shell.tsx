"use client";

import { Sidebar, MobileNavSheet } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { useNav } from "@/lib/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const mobileNavOpen = useNav((s) => s.mobileNavOpen);
  const setMobile = useNav((s) => s.setMobileNav);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Topbar />
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 gap-0 px-0 lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-[72px] max-h-[calc(100dvh-72px)] overflow-y-auto scroll-thin">
            <Sidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-3 pb-20 pt-3 sm:px-4 sm:pb-8 lg:px-0 lg:pb-8 lg:pt-0">
          {children}
        </main>
      </div>
      <Footer />
      <MobileNavSheet open={mobileNavOpen} onClose={() => setMobile(false)} />

      {/* Mobile bottom navigation bar (Capacitor-friendly) */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  const active = useNav((s) => s.active);
  const setNav = useNav((s) => s.set);
  const setMobile = useNav((s) => s.setMobileNav);

  const quickNav = [
    { key: "dashboard" as const, label: "Home", icon: "🏠" },
    { key: "pos" as const, label: "POS", icon: "🛒" },
    { key: "products" as const, label: "Stock", icon: "📦" },
    { key: "udhar" as const, label: "Udhar", icon: "📒" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-lg lg:hidden safe-area-pb">
      {quickNav.map((item) => (
        <button
          key={item.key}
          onClick={() => setNav(item.key)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
            active === item.key ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
      <button
        onClick={() => setMobile(true)}
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
      >
        <span className="text-lg leading-none">☰</span>
        More
      </button>
    </nav>
  );
}
