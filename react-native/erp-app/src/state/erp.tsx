/**
 * ERP app state — auth (passkey), live API base URL, and a domain facade
 * that routes every operation to either the live ERP API or the in-memory
 * demo dataset (fresh each launch).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErpApi, type SalePayload } from "../lib/api";
import { demoDashboard, freshDemoDb, type DemoDb } from "../lib/demo";
import type {
  Customer,
  DashboardResponse,
  Product,
  Udhar,
} from "../lib/types";

const AUTH_KEY = "sss-erp.auth";
const BASE_KEY = "sss-erp.apiBase";

interface ErpContextValue {
  /** Live mode = base URL set AND passkey saved. Otherwise demo. */
  live: boolean;
  apiBase: string;
  passkey: string;
  setApiBase: (v: string) => void;
  login: (base: string, passkey: string) => Promise<void>;
  logout: () => void;
  api: ErpApi;
  /** Domain operations — live API calls or demo mutations. */
  ops: ErpOps;
}

export interface ErpOps {
  dashboard(): Promise<DashboardResponse>;
  products(): Promise<Product[]>;
  saveProduct(p: Partial<Product> & { id?: string }): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  recordSale(payload: SalePayload): Promise<any>;
  udhar(status?: string): Promise<Udhar[]>;
  createUdhar(data: Partial<Udhar>): Promise<void>;
  settleUdhar(id: string, status: "PAID" | "PENDING" | "PARTIAL"): Promise<void>;
  addUdharPayment(id: string, amount: number, notes?: string): Promise<void>;
  customers(): Promise<Customer[]>;
  createCustomer(data: Partial<Customer>): Promise<void>;
}

const ErpContext = createContext<ErpContextValue | null>(null);

export function useErp(): ErpContextValue {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error("useErp outside ErpProvider");
  return ctx;
}

export function ErpProvider({ children }: { children: React.ReactNode }) {
  const [apiBase, setApiBaseState] = useState("");
  const [passkey, setPasskey] = useState("");
  const [demo, setDemo] = useState<DemoDb>(freshDemoDb);
  /** Always-fresh mirror of `demo` — ops closures read this, never `demo`. */
  const demoRef = useRef(demo);
  demoRef.current = demo;

  useEffect(() => {
    (async () => {
      try {
        const [b, p] = await Promise.all([
          AsyncStorage.getItem(BASE_KEY),
          AsyncStorage.getItem(AUTH_KEY),
        ]);
        if (typeof b === "string") setApiBaseState(b);
        if (typeof p === "string") setPasskey(p);
      } catch {}
    })();
  }, []);

  const setApiBase = useCallback((v: string) => {
    setApiBaseState(v.trim());
    AsyncStorage.setItem(BASE_KEY, v.trim()).catch(() => {});
  }, []);

  const login = useCallback(
    async (base: string, key: string) => {
      const api = new ErpApi(base, key);
      await api.login(key); // throws on bad passkey
      setApiBaseState(base.trim());
      setPasskey(key);
      await Promise.all([
        AsyncStorage.setItem(BASE_KEY, base.trim()),
        AsyncStorage.setItem(AUTH_KEY, key),
      ]);
    },
    [],
  );

  const logout = useCallback(() => {
    setPasskey("");
    setApiBaseState("");
    setDemo(freshDemoDb());
    AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
    AsyncStorage.removeItem(BASE_KEY).catch(() => {});
  }, []);

  const api = useMemo(() => new ErpApi(apiBase, passkey), [apiBase, passkey]);
  const live = api.isLive && !!passkey;

  const ops = useMemo<ErpOps>(() => {
    const db = () => demoRef.current;
    if (live) {
      return {
        dashboard: () => api.dashboard(),
        products: () => api.products(),
        saveProduct: async (p) => {
          if (p.id) await api.updateProduct(p.id, p);
          else await api.createProduct(p);
        },
        deleteProduct: async (id) => {
          await api.removeProduct(id);
        },
        recordSale: (payload) => api.recordSale(payload),
        udhar: (status) => api.udhar(status),
        createUdhar: async (data) => {
          await api.createUdhar(data);
        },
        settleUdhar: async (id, status) => {
          await api.settleUdhar(id, status);
        },
        addUdharPayment: async (id, amount, notes) => {
          await api.addUdharPayment(id, amount, notes);
        },
        customers: () => api.customers(),
        createCustomer: async (data) => {
          await api.createCustomer(data);
        },
      };
    }
    // ---- demo implementation ----
    return {
      dashboard: async () => demoDashboard(db()),
      products: async () => db().products,
      saveProduct: async (p) => {
        setDemo((db) => {
          const products = [...db.products];
          const idx = products.findIndex((x) => x.id === p.id);
          if (idx >= 0) {
            products[idx] = { ...products[idx], ...p } as Product;
          } else {
            products.push({
              id: `demo-${Date.now()}`,
              name: p.name ?? "New product",
              brand: p.brand ?? null,
              category: p.category ?? null,
              sku: p.sku ?? null,
              purchasePrice: p.purchasePrice ?? 0,
              sellingPrice: p.sellingPrice ?? 0,
              quantity: p.quantity ?? 0,
              unitType: p.unitType ?? "pcs",
              minStockAlert: p.minStockAlert ?? 5,
            });
          }
          return { ...db, products };
        });
      },
      deleteProduct: async (id) => {
        setDemo((db) => ({ ...db, products: db.products.filter((p) => p.id !== id) }));
      },
      recordSale: async (payload) => {
        setDemo((db) => {
          const products = db.products.map((p) => {
            const line = payload.items.find((i) => i.productId === p.id);
            return line ? { ...p, quantity: Math.max(0, p.quantity - line.quantity) } : p;
          });
          const subtotal = payload.items.reduce((s, i) => s + i.price * i.quantity, 0);
          const discount = payload.discount ?? 0;
          const total = Math.max(0, subtotal - discount);
          const sale = {
            id: `sale-${Date.now()}`,
            customerName: payload.customerName ?? null,
            paymentMethod: payload.paymentMethod,
            subtotal,
            discount,
            total,
            itemCount: payload.items.reduce((s, i) => s + i.quantity, 0),
            notes: payload.notes ?? null,
            date: new Date().toISOString(),
            items: payload.items.map((i) => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              lineTotal: i.price * i.quantity,
            })),
          };
          return {
            ...db,
            products,
            sales: [sale, ...db.sales],
            income: [
              {
                id: `inc-${Date.now()}`,
                source: "Counter Sales (POS)",
                category: "Sales",
                amount: total,
                date: sale.date,
                notes: payload.notes ?? null,
              },
              ...db.income,
            ],
          };
        });
        return { ok: true };
      },
      udhar: async (status) =>
        db().udhar
          .filter((u) => (status && status !== "ALL" ? u.status === status : true))
          .map((u) => ({
            ...u,
            outstanding: Math.max(
              0,
              u.amount - u.payments.reduce((s, p) => s + p.amount, 0),
            ),
          })),
      createUdhar: async (data) => {
        setDemo((db) => ({
          ...db,
          udhar: [
            {
              id: `udh-${Date.now()}`,
              customerName: data.customerName ?? "Customer",
              phone: data.phone ?? null,
              description: data.description ?? "Credit purchase",
              amount: data.amount ?? 0,
              date: new Date().toISOString(),
              dueDate: data.dueDate ?? null,
              status: "PENDING",
              notes: data.notes ?? null,
              payments: [],
            },
            ...db.udhar,
          ],
        }));
      },
      settleUdhar: async (id, status) => {
        setDemo((db) => ({
          ...db,
          udhar: db.udhar.map((u) => (u.id === id ? { ...u, status } : u)),
        }));
      },
      addUdharPayment: async (id, amount, notes) => {
        setDemo((db) => ({
          ...db,
          udhar: db.udhar.map((u) => {
            if (u.id !== id) return u;
            const payments = [
              ...u.payments,
              { id: `pay-${Date.now()}`, udharId: id, amount, date: new Date().toISOString(), notes: notes ?? null },
            ];
            const paid = payments.reduce((s, p) => s + p.amount, 0);
            return {
              ...u,
              payments,
              status: paid >= u.amount ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING",
            };
          }),
        }));
      },
      customers: async () => db().customers,
      createCustomer: async (data) => {
        setDemo((db) => ({
          ...db,
          customers: [
            {
              id: `cus-${Date.now()}`,
              name: data.name ?? "New customer",
              phone: data.phone ?? null,
              address: data.address ?? null,
            },
            ...db.customers,
          ],
        }));
      },
    };
  }, [live, api]);

  const value = useMemo(
    () => ({ live, apiBase, passkey, setApiBase, login, logout, api, ops }),
    [live, apiBase, passkey, setApiBase, login, logout, api, ops],
  );

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}
