"use client";

import { Sidebar, MobileNavSheet } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { useNav } from "@/lib/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const mobileNavOpen = useNav((s) => s.mobileNavOpen);
  const setMobile = useNav((s) => s.setMobileNav);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar />
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 gap-0 px-0 lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-[88px]">
            <Sidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-0 lg:pb-8 lg:pt-0">
          {children}
        </main>
      </div>
      <Footer />
      <MobileNavSheet open={mobileNavOpen} onClose={() => setMobile(false)} />
    </div>
  );
}
