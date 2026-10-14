import { create } from "zustand";

export type ModuleKey =
  | "dashboard"
  | "pos"
  | "products"
  | "sales"
  | "purchases"
  | "income"
  | "expenses"
  | "udhar"
  | "customers"
  | "suppliers"
  | "overview"
  | "reports"
  | "settings";

interface NavState {
  active: ModuleKey;
  set: (m: ModuleKey) => void;
  mobileNavOpen: boolean;
  setMobileNav: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
}

export const useNav = create<NavState>((set, get) => ({
  active: "dashboard",
  set: (m) => set({ active: m }),
  mobileNavOpen: false,
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  togglePalette: () => set({ paletteOpen: !get().paletteOpen }),
}));
