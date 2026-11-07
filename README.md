# Shubham Super Shopee ERP

A modern, full-stack retail ERP built with Next.js 16, TypeScript, Prisma ORM, and Supabase PostgreSQL. Features a companion e-commerce storefront with a separate database.

## Features

### ERP (Admin App)
- **14 modules**: Dashboard, POS, Products, Purchases, Income, Expenses, Udhar (credit ledger), Customers, Suppliers, Sales Analytics, Yearly Overview, Reports, Audit Log, Settings
- **Point of Sale**: Barcode/SKU scan, GST/tax calculation, receipt printing
- **Inventory**: CRUD, restock center, stock-take with audit log, expiry tracking, CSV import
- **Analytics**: Business Health Score, sales targets with auto-suggest, inventory valuation (FIFO/selling/purchase), daily/hourly trends
- **Ledgers**: Customer & supplier statements with running balances
- **Cross-cutting**: Command Palette (⌘K), Global Search (⌘/), multi-currency, date-range filters, backup/restore, dark mode, print/PDF

### E-Commerce Storefront (Customer App)
- Product grid with category filters and search
- Product detail pages with reviews
- Cookie-based shopping cart (no login required)
- Checkout with COD / UPI payment
- Order confirmation with tracking number
- Product sync from ERP

### Mobile Apps (React Native)

Two native Android companions (Expo SDK 58 / RN 0.88.1) under [`react-native/`](react-native/):

- **`react-native/shop-app`** (`com.shubhamsupershopee.shop`) — the customer storefront in your pocket: browse, search, Deal of the Day, cart, coupons, COD/UPI checkout, order history, and one-click English ↔ मराठी.
- **`react-native/erp-app`** (`com.shubhamsupershopee.erp`) — the admin ERP: passkey login, dashboard, POS, products/stock, udhar (credit) ledger, customers, reports.
- **Dual-mode**: LIVE (Settings → point at your deployed web app's API) or DEMO (default — bundled data, fully explorable offline).
- **Ready-to-install APKs** in [`react-native/apk/`](react-native/apk/) — signed release builds, sideload on any Android phone (arm64-v8a / armeabi-v7a); no Play Store needed. Build your own: see [`react-native/README.md`](react-native/README.md).

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Database**: Supabase PostgreSQL (separate projects for ERP & e-commerce)
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Charts**: Recharts
- **Analytics**: Vercel Speed Insights

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase connection string

# Push database schema
npx prisma db push
npx prisma generate

# Start dev server
bun run dev

# Load demo data
curl -X POST http://localhost:3000/api/seed
```

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + Supabase setup instructions.

---

<sub>Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/)</sub>
