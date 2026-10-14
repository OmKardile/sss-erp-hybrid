import { create } from "zustand";

export type ModuleKey =
  | "dashboard"
  | "products"
  | "purchases"
  | "income"
  | "expenses"
  | "udhar"
  | "customers"
  | "suppliers"
  | "overview"
  | "reports";

interface NavState {
  active: ModuleKey;
  set: (m: ModuleKey) => void;
  mobileNavOpen: boolean;
  setMobileNav: (open: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  active: "dashboard",
  set: (m) => set({ active: m }),
  mobileNavOpen: false,
  setMobileNav: (open) => set({ mobileNavOpen: open }),
}));
