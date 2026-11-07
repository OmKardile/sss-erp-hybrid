# erp-app — SSS ERP (admin)

React Native (Expo 58 / RN 0.88) admin companion for the Shubham Super Shopee
ERP. Ported from the Next.js web ERP (repo root of the hybrid monorepo).

## Screens

- **Login** — passkey against the live ERP (same `sss-erp-auth` cookie as the
  web admin) or one-tap demo mode
- **Dashboard** — today in/out, month income/profit, 14-day income bars,
  inventory value, low-stock count, pending udhar, expense breakdown
- **POS** — product search, bill builder, discount, payment method
  (Cash / UPI / Card / Udhar), record sale → stock decrement + income booking
- **Stock** — inventory list, low-stock filter, add/edit product
- **Udhar** — credit ledger by status, add entry, part-payments, settle/reopen
- **More** → **Customers** (directory + add), **Reports** (monthly comparison
  bars, profit by month, expense categories, top stock), **Settings**

## Data modes

- **DEMO** (default): realistic in-memory dataset (12 products, ~45 days of
  sales, expenses, 3 udhar entries, 5 customers). Mutations (POS sales, udhar
  payments, product edits) work; the dataset resets on app restart.
- **LIVE**: login with your ERP URL + passkey. All operations hit the same
  REST API as the web admin (`/api/auth`, `/api/dashboard`, `/api/products`,
  `/api/sales`, `/api/udhar`, `/api/customers`).

## QA (2026-11-06, Expo Web + headless browser)

Login demo ✓, bad-URL error path ✓, dashboard math (incl. udhar outstanding
₹2,380) ✓, POS sale (UPI, ₹55) → stock decrement (59/198) ✓, product edit
(Tata Salt → ₹30 × 50) ✓, udhar add (Imran ₹850) ✓, part-payment (₹300 →
PARTIAL) ✓, settle (→ PAID) ✓, customer add ✓, reports ✓, settings session
reset ✓.
